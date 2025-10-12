"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { FiPhone, FiMessageCircle, FiCopy, FiCheckCircle } from "react-icons/fi"
import { toast } from "react-hot-toast"
import { BiLocationPlus } from "react-icons/bi"
import { BsWhatsapp } from "react-icons/bs"

const API_URL = import.meta.env.VITE_API_URL

export default function ProfileCard({ profile }) {
  const navigate = useNavigate()
  const [showBio, setShowBio] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleCopyPhone = async (e) => {
    e.stopPropagation()
    try {
      await navigator.clipboard.writeText(profile.contact?.phoneNumber || "") // Changed
      setCopied(true)
      toast.success("Phone number copied!")
      setTimeout(() => setCopied(false), 2000)

      trackInteraction("phone_copy")
    } catch (error) {
      toast.error("Failed to copy")
    }
  }

  const handleCall = (e) => {
    e.stopPropagation()
    window.location.href = `tel:${profile.contact?.phoneNumber}` // Changed
    trackInteraction("call")
  }

  const handleWhatsApp = (e) => {
    e.stopPropagation()
    window.open(`https://wa.me/${profile.contact?.phoneNumber}`, "_blank") // Changed
    trackInteraction("whatsapp")
  }

  const handleViewProfile = () => {
    trackInteraction("profile_view")
    navigate(`/profile/${profile._id}`)
  }

  const trackInteraction = async (type) => {
    try {
      await fetch(`${API_URL}/analytics/interaction`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileId: profile._id,
          interactionType: type,
        }),
      })
    } catch (error) {
      console.error("[v0] Failed to track interaction:", error)
    }
  }

  const getPackageBadge = () => {
    const packageType = profile.currentPackage?.packageType
    const isActive = profile.currentPackage?.status === 'active'

    if (!packageType || !isActive) return null

    const badges = {
      elite: { text: "VIP", color: "bg-gradient-to-r from-yellow-400 to-orange-500" },
      premium: { text: "Premium", color: "bg-gradient-to-r from-purple-500 to-pink-500" },
      basic: { text: "Basic", color: "bg-neutral-600" },
    }

    const badge = badges[packageType]
    return badge ? (
      <div className={`${badge.color} text-white text-xs font-bold px-2 py-1 rounded`}>{badge.text}</div>
    ) : null
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative bg-card rounded-lg overflow-hidden shadow-lg cursor-pointer group border border-primary/20"
      onClick={handleViewProfile}
      onMouseEnter={() => setShowBio(true)}
      onMouseLeave={() => setShowBio(false)}
    >
      <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
        {getPackageBadge()}
        {profile.verification?.profileVerified && (
          <div className="bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
            <FiCheckCircle size={12} />
            Verified
          </div>
        )}
      </div>

      <div className="aspect-[3/4] relative overflow-hidden">
        <img
          src={profile.profileImage?.url || "/placeholder.svg?height=400&width=300"}
          alt={profile.username}
          className="w-full h-full object-cover"
        />

        {showBio && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-black/60 p-4 flex flex-col justify-center items-center"
          >
            {profile.bio && (
              <p className="text-white text-sm line-clamp-6 mb-4 text-center">{profile.bio}</p>
            )}
            {!profile.bio && (
              <p className="text-white/70 text-sm mb-4 italic">No bio available</p>
            )}
            <button className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-all cursor-pointer">
              View Full Profile
            </button>
          </motion.div>
        )}
      </div>

      <div className="bg-white p-3 space-y-2">
        <h3 className="font-bold text-primary capitalize truncate">{profile.username}</h3>
        <p className="text-sm text-muted-foreground truncate flex items-center gap-1">
          <BiLocationPlus size={12} />
          {profile.location?.county}, {profile.location?.location}
        </p>

        {profile.contact?.phoneNumber && (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={profile.contact.phoneNumber} // Changed
              readOnly
              className="flex-1 px-2 py-1 text-sm bg-background border border-border rounded text-foreground"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              onClick={handleCopyPhone}
              className="p-1.5 bg-primary text-white rounded hover:bg-primary/90 transition-all"
            >
              {copied ? <FiCheckCircle size={16} /> : <FiCopy size={16} />}
            </button>
          </div>
        )}

        <div className="flex gap-2">
          <button
            onClick={handleCall}
            className="flex-1 px-3 py-2 bg-gray-400 text-white rounded font-medium hover:bg-gray-600 transition-all flex items-center justify-center gap-1 text-sm cursor-pointer"
          >
            <FiPhone size={14} />
            Call
          </button>
          {profile.contact?.hasWhatsApp && (
            <button
              onClick={handleWhatsApp}
              className="flex-1 px-3 py-2 bg-[#25D366] text-white rounded font-medium hover:bg-[#20BA5A] transition-all flex items-center justify-center gap-1 text-sm cursor-pointer"
            >
              <BsWhatsapp size={14} />
              Chat
            </button>
          )}
        </div>
      </div>
    </motion.div>
  )
}
