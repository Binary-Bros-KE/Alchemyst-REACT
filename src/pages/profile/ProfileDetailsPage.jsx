"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { FiArrowLeft, FiPhone, FiMessageCircle, FiMapPin, FiCheckCircle, FiDollarSign } from "react-icons/fi"
import { toast } from "react-hot-toast"

const API_URL = process.env.NEXT_PUBLIC_API_URL

export default function ProfileDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)

  useEffect(() => {
    fetchProfile()
    trackView()
  }, [params.id])

  const fetchProfile = async () => {
    try {
      const response = await fetch(`${API_URL}/profile/${params.id}`)
      const data = await response.json()

      if (data.success) {
        setProfile(data.profile)
      } else {
        toast.error("Profile not found")
        router.push("/")
      }
    } catch (error) {
      toast.error("Failed to load profile")
      console.error("[v0] Error fetching profile:", error)
    } finally {
      setLoading(false)
    }
  }

  const trackView = async () => {
    try {
      await fetch(`${API_URL}/analytics/view`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileId: params.id }),
      })
    } catch (error) {
      console.error("[v0] Failed to track view:", error)
    }
  }

  const trackInteraction = async (type) => {
    try {
      await fetch(`${API_URL}/analytics/interaction`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileId: params.id,
          interactionType: type,
        }),
      })
    } catch (error) {
      console.error("[v0] Failed to track interaction:", error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!profile) return null

  const isSpa = profile.userType === "spa"
  const allImages = [profile.profileImage, ...(profile.secondaryImages || [])].filter(Boolean)

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-neutral-900 py-6 px-4">
        <div className="container mx-auto max-w-6xl">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-text-inverse/80 hover:text-text-inverse transition-colors"
          >
            <FiArrowLeft />
            Back
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className={`grid ${isSpa ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1 md:grid-cols-5"} gap-8`}>
          <div className={isSpa ? "" : "md:col-span-2"}>
            <div className={`${isSpa ? "aspect-[16/9]" : "aspect-[3/4]"} rounded-lg overflow-hidden mb-4`}>
              <img
                src={allImages[selectedImage]?.url || "/placeholder.svg"}
                alt={profile.username}
                className="w-full h-full object-cover"
              />
            </div>

            {allImages.length > 1 && (
              <div className="grid grid-cols-5 gap-2">
                {allImages.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 ${
                      selectedImage === index ? "border-primary" : "border-transparent"
                    }`}
                  >
                    <img src={img.url || "/placeholder.svg"} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className={isSpa ? "" : "md:col-span-3"}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">{profile.username}</h1>
                <p className="text-muted-foreground flex items-center gap-2">
                  <FiMapPin />
                  {profile.location?.area?.[0] && `${profile.location.area[0]}, `}
                  {profile.location?.location}, {profile.location?.county}
                </p>
              </div>

              {profile.isProfileVerified && (
                <div className="flex items-center gap-2 px-3 py-1 bg-blue-500 text-white rounded-lg">
                  <FiCheckCircle />
                  Verified
                </div>
              )}
            </div>

            {profile.bio && (
              <div className="mb-6">
                <h2 className="text-xl font-bold text-foreground mb-2">About</h2>
                <p className="text-foreground/80">{profile.bio}</p>
              </div>
            )}

            {!isSpa && (
              <div className="grid grid-cols-2 gap-4 mb-6">
                {profile.personalInfo?.gender && (
                  <div>
                    <p className="text-sm text-muted-foreground">Gender</p>
                    <p className="font-medium text-foreground capitalize">{profile.personalInfo.gender}</p>
                  </div>
                )}
                {profile.personalInfo?.serviceType && (
                  <div>
                    <p className="text-sm text-muted-foreground">Service Type</p>
                    <p className="font-medium text-foreground capitalize">{profile.personalInfo.serviceType}</p>
                  </div>
                )}
              </div>
            )}

            {profile.services && profile.services.length > 0 && (
              <div className="mb-6">
                <h2 className="text-xl font-bold text-foreground mb-4">Services</h2>
                <div className="space-y-3">
                  {profile.services.map((service, index) => (
                    <div key={index} className="p-4 bg-card border border-border rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-bold text-foreground">{service.name}</h3>
                        {service.isActive && (
                          <span className="px-2 py-1 bg-green-500/20 text-green-600 text-xs rounded">Active</span>
                        )}
                      </div>
                      {service.description && <p className="text-sm text-foreground/70 mb-2">{service.description}</p>}
                      <div className="flex items-center gap-2 text-primary font-medium">
                        <FiDollarSign />
                        {service.contactForPrice ? "Contact for price" : `KSh ${service.price} ${service.pricingUnit}`}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-4">
              <button
                onClick={() => {
                  window.location.href = `tel:${profile.contactDetails?.phoneNumber}`
                  trackInteraction("call")
                }}
                className="flex-1 px-6 py-3 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-all flex items-center justify-center gap-2"
              >
                <FiPhone />
                Call Now
              </button>
              {profile.contactDetails?.hasWhatsApp && (
                <button
                  onClick={() => {
                    window.open(`https://wa.me/${profile.contactDetails?.phoneNumber}`, "_blank")
                    trackInteraction("whatsapp")
                  }}
                  className="flex-1 px-6 py-3 bg-[#25D366] text-white rounded-lg font-medium hover:bg-[#20BA5A] transition-all flex items-center justify-center gap-2"
                >
                  <FiMessageCircle />
                  WhatsApp
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
