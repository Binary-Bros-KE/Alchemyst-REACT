import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { FiPhone, FiMessageCircle, FiMapPin, FiCheckCircle, FiCopy } from "react-icons/fi"
import { useState } from "react"
import { BsWhatsapp } from "react-icons/bs"

const API_URL = import.meta.env.VITE_API_URL

export default function SpaCard({ profile }) {
  const navigate = useNavigate()
  const [copied, setCopied] = useState(false)
  const [showBio, setShowBio] = useState(false)

  const Ribbon = ({ text, colorClass, icon, top }) => (
    <div
      className={`absolute transform -rotate-45 text-center text-white text-[8px] font-bold shadow-lg ${colorClass} ${top} w-40`}
    >
      <span className="inline-flex items-center gap-1.5 py-1 text-[8px] uppercase tracking-wider">
        {icon}
        {text}
      </span>
    </div>
  );

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

  const handleCall = (e) => {
    e.stopPropagation()
    window.location.href = `tel:${profile.contact?.phoneNumber}`
    trackInteraction("call")
  }

  const handleWhatsApp = (e) => {
    e.stopPropagation()
    window.open(`https://wa.me/${profile.contact?.phoneNumber}`, "_blank")
    trackInteraction("whatsapp")
  }

  const handleViewProfile = () => {
    trackInteraction("profile_view")
    navigate(`/profile/${profile.userType}/${profile._id}`)
  }

  const handleCopyPhone = async (e) => {
    e.stopPropagation()
    try {
      const input = document.createElement('input');
      input.style.position = 'fixed';
      input.style.opacity = 0;
      input.value = profile.contact?.phoneNumber || "";
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);

      setCopied(true)
      toast.success("Phone number copied!")
      setTimeout(() => setCopied(false), 2000)

      trackInteraction("phone_copy")
    } catch (error) {
      toast.error("Failed to copy")
    }
  }



  const renderBadges = () => {
    const packageType = profile.currentPackage?.packageType;
    const isPackageActive = profile.currentPackage?.status === 'active';
    const isVerified = profile.verification?.profileVerified;

    const badgeList = [];

    // Check for package badge
    if (packageType && isPackageActive) {
      const packageInfo = {
        elite: { text: "VIP", colorClass: "bg-gradient-to-r from-yellow-400 to-orange-500" },
        premium: { text: "Premium", colorClass: "bg-gradient-to-r from-purple-500 to-pink-500" },
        basic: { text: "Regular", colorClass: "bg-neutral-600" },
      }[packageType];

      if (packageInfo) {
        badgeList.push(packageInfo);
      }
    }

    // Check for verification badge
    if (isVerified) {
      badgeList.push({
        text: 'Verified',
        colorClass: 'bg-blue-500',
        icon: <FiCheckCircle size={12} />,
      });
    }

    if (badgeList.length === 0) return null;

    // Reverse the list to ensure 'VIP' or other package badges appear on top
    const sortedBadges = badgeList;

    return (
      <div className="absolute top-0 left-0 w-40 h-40 overflow-hidden z-10 pointer-events-none">
        {sortedBadges.map((badge, index) => (
          <Ribbon
            key={badge.text}
            text={badge.text}
            colorClass={badge.colorClass}
            icon={badge.icon}
            top={index === 0 ? 'top-3 -left-15' : 'top-8 -left-12'} // Stagger the ribbons if there are multiple
          />
        ))}
      </div>
    );
  };


  return (
    <motion.div
      className="bg-card rounded-lg overflow-hidden shadow-lg cursor-pointer group border-2 border-primary/50 relative"
      onClick={handleViewProfile}
      onMouseEnter={() => setShowBio(true)}
      onMouseLeave={() => setShowBio(false)}
    >
      {renderBadges()}
      <div className="relative">
        <div className="aspect-[16/9] relative overflow-hidden relative">
          <img
            src={profile.profileImage?.url || "/placeholder.svg?height=400&width=700"}
            alt={profile.username}
            className="w-full h-full object-cover transition-transform duration-300"
          />

          {showBio && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 bg-black/60 p-4 flex flex-col justify-center items-center text-center"
            >
              <div className="flex flex-wrap items-center justify-center mb-2">
                {profile.services && profile.services.slice(0, 6).map((service) => (
                  <span className="bg-blue-400 text-white rounded-lg m-1 text-sm px-2 ">{service.name}</span>
                ))}
              </div>
              <button className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-all cursor-pointer text-sm">
                View Full Profile
              </button>
            </motion.div>
          )}
        </div>

        <div className="grid grid-cols-5 gap-1 absolute -bottom-15 justify-center items-center w-full">
          {profile.secondaryImages?.slice(0, 5).map((img, index) => (
            <img
              key={index}
              src={img.url}
              alt={`Secondary ${index + 1}`}
              className="h-24 w-full object-cover rounded-lg shadow-md border-2"
            />
          ))}
        </div>
      </div>


      <div className="p-4 mt-14">
        <h3 className="text-xl font-bold text-foreground mb-2 capitalize text-rimary">{profile.username}</h3>
        <p className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
          <FiMapPin />
          {profile.location?.county}, {profile.location?.location}
        </p>
        <div className="text-xs text-blue-600/50 font-bold flex items-center gap-2 mb-2">
          <div className="h-2 w-2 bg-blue-600/50 rounded-full"></div> {profile.serviceType === 'both' ? 'Incalls & Outcalls' : profile.serviceType === 'incall' ? 'Incalls Only' : 'Outcalls Only'}
        </div>

        {profile.bio && <p className="text-sm text-foreground/80 mb-2 line-clamp-2">{profile.bio}</p>}

        {profile.contact?.phoneNumber && (
          <div className="flex items-center gap-2 max-w-full mb-2">
            <input
              type="text"
              value={profile.contact.phoneNumber}
              readOnly
              className="flex-1 px-2 py-1 text-sm bg-background border border-border rounded text-foreground max-w-[85%] max-md:max-w-[78%] truncate"
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

        <div className="flex gap-2 max-md:gap-1">
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
