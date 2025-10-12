import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { FiPhone, FiMessageCircle, FiMapPin } from "react-icons/fi"

const API_URL = import.meta.env.VITE_API_URL

export default function SpaCard({ profile }) {
  const navigate = useNavigate()

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

  const handleViewProfile = () => {
    trackInteraction("profile_view")
    navigate(`/profile/${profile._id}`)
  }

  return (
    <motion.div
      className="bg-card rounded-lg overflow-hidden shadow-lg cursor-pointer group"
      onClick={handleViewProfile}
    >
      <div className="aspect-[16/9] relative overflow-hidden">
        <img
          src={profile.profileImage?.url || "/placeholder.svg?height=400&width=700"}
          alt={profile.username}
          className="w-full h-full object-cover transition-transform duration-300"
        />

        <div className="absolute top-3 left-3">
          {profile.purchasedPackages?.find((p) => p.isActive)?.packageType === "elite" && (
            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-sm font-bold px-3 py-1 rounded">
              VIP Business
            </div>
          )}
        </div>
      </div>

      <div className="p-4">
        <h3 className="text-xl font-bold text-foreground mb-2 capitalize">{profile.username}</h3>
        <p className="text-sm text-muted-foreground mb-3 flex items-center gap-2">
          <FiMapPin />
          {profile.location?.county}, {profile.location?.location}
        </p>

        {profile.bio && <p className="text-sm text-foreground/80 mb-4 line-clamp-2">{profile.bio}</p>}

        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation()
              window.location.href = `tel:${profile.contactDetails?.phoneNumber}`
              trackInteraction("call")
            }}
            className="flex-1 px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
          >
            <FiPhone />
            Call
          </button>
          {profile.contactDetails?.hasWhatsApp && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                window.open(`https://wa.me/${profile.contactDetails?.phoneNumber}`, "_blank")
                trackInteraction("whatsapp")
              }}
              className="flex-1 px-4 py-2 bg-[#25D366] text-white rounded-lg font-medium hover:bg-[#20BA5A] transition-all flex items-center justify-center gap-2"
            >
              <FiMessageCircle />
              WhatsApp
            </button>
          )}
        </div>
      </div>
    </motion.div>
  )
}
