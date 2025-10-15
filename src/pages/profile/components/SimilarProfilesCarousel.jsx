"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { FiCheckCircle, FiMapPin, FiChevronLeft, FiChevronRight } from "react-icons/fi"


const API_URL = import.meta.env.VITE_API_URL

// Similar Profiles Carousel Component
const SimilarProfilesCarousel = ({ currentProfile }) => {
  const [profiles, setProfiles] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetchSimilarProfiles()
  }, [currentProfile])

  const fetchSimilarProfiles = async () => {
    try {
      const response = await fetch(
        `${API_URL}/profiles/similar/${currentProfile._id}?userType=${currentProfile.userType}&county=${currentProfile.location?.county}&location=${currentProfile.location?.location}`
      )
      const data = await response.json()
      
      if (data.success) {
        setProfiles(data.data || [])
      }
    } catch (error) {
      console.error("Failed to fetch similar profiles:", error)
    } finally {
      setLoading(false)
    }
  }

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % Math.max(1, profiles.length))
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + profiles.length) % Math.max(1, profiles.length))
  }

  if (loading || profiles.length === 0) return null

  const visibleProfiles = profiles.slice(currentIndex, currentIndex + 4)
  if (visibleProfiles.length < 4 && profiles.length >= 4) {
    visibleProfiles.push(...profiles.slice(0, 4 - visibleProfiles.length))
  }

  return (
    <div className="mt-16 bg-gradient-to-b from-neutral-900 to-black py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
          <div className="w-1 h-8 bg-pink-500 rounded"></div>
          Similar Profiles Nearby
        </h2>
        
        <div className="relative">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {visibleProfiles.map((profile, idx) => (
              <motion.div
                key={profile._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-neutral-800 rounded-xl overflow-hidden cursor-pointer hover:scale-105 transition-transform duration-300 group"
                onClick={() => navigate(`/${profile.userType}/${profile._id}`)}
              >
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={profile.profileImage?.url || "https://placehold.co/300x400/232323/FFF?text=Profile"}
                    alt={profile.username}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  {profile.verification?.profileVerified && (
                    <div className="absolute top-3 right-3 bg-blue-500 p-1.5 rounded-full">
                      <FiCheckCircle className="text-white" size={16} />
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="text-white font-bold text-lg mb-1">{profile.username}</h3>
                  <p className="text-gray-400 text-sm flex items-center gap-1">
                    <FiMapPin size={14} />
                    {profile.location?.location}, {profile.location?.county}
                  </p>
                  {profile.age && (
                    <p className="text-pink-400 text-sm mt-2">{profile.age} years old</p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          {profiles.length > 4 && (
            <>
              <button
                onClick={prevSlide}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-pink-500 hover:bg-pink-600 text-white p-3 rounded-full shadow-lg transition-all z-10"
              >
                <FiChevronLeft size={24} />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-pink-500 hover:bg-pink-600 text-white p-3 rounded-full shadow-lg transition-all z-10"
              >
                <FiChevronRight size={24} />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default SimilarProfilesCarousel()