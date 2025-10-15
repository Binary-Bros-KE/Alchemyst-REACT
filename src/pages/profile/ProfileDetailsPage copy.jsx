"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import {
  FiArrowLeft,
  FiPhone,
  FiMessageCircle,
  FiMapPin,
  FiCheckCircle,
  FiCopy,
  FiCheck,
  FiUser,
  FiHeart,
  FiEye,
  FiCalendar,
  FiGlobe,
} from "react-icons/fi"
import { toast } from "react-hot-toast"
import { useSelector, useDispatch } from "react-redux"
import { Swiper, SwiperSlide } from "swiper/react"
import { Navigation, Pagination, Thumbs, FreeMode } from "swiper/modules"
import "swiper/css"
import "swiper/css/navigation"
import "swiper/css/pagination"
import "swiper/css/thumbs"
import "swiper/css/free-mode"
import ProfileCard from "../../components/ProfileCard"
import { BsWhatsapp } from "react-icons/bs"
import { fetchProfileDetails, fetchSimilarProfiles } from "../../redux/profileDetailsSlice" // Remove clearCurrentProfile

const API_URL = import.meta.env.VITE_API_URL

export default function ProfileDetailsPage() {
  const params = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()

  // Get data from Redux store
  const { currentProfile, similarProfiles, loading, loadingSimilar, profileCache } = useSelector(state => state.profileDetails)

  const [thumbsSwiper, setThumbsSwiper] = useState(null)
  const [copied, setCopied] = useState(false)

  // Use profile from Redux store - FIX: Always check cache first
  const profile = currentProfile || profileCache[params.userId]?.profile

  // Helper component for the diagonal ribbon style
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

  const renderBadges = () => {
    if (!profile) return null;

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

    const sortedBadges = badgeList;

    return (
      <div className="absolute top-0 left-0 w-40 h-40 overflow-hidden z-10 pointer-events-none">
        {sortedBadges.map((badge, index) => (
          <Ribbon
            key={badge.text}
            text={badge.text}
            colorClass={badge.colorClass}
            icon={badge.icon}
            top={index === 0 ? 'top-3 -left-15' : 'top-8 -left-12'}
          />
        ))}
      </div>
    );
  };

  useEffect(() => {
    window.scrollTo(0, 0)
    
    // FIX: Always check cache first, only fetch if truly needed
    const cachedProfile = profileCache[params.userId]
    const isCachedDataStale = !cachedProfile || (Date.now() - cachedProfile.timestamp > 10 * 60 * 1000)

    if (!cachedProfile || isCachedDataStale) {
      // Only fetch if no cache or cache is stale
      dispatch(fetchProfileDetails({
        userType: params.userType,
        userId: params.userId
      }))
    }

    trackView()
  }, [params.userType, params.userId, dispatch, profileCache])

  useEffect(() => {
    if (profile) {
      // Fetch similar profiles
      dispatch(fetchSimilarProfiles({
        profileId: params.userId,
        county: profile.location?.county,
        location: profile.location?.location,
        userType: profile.userType
      }))
    }
  }, [profile, params.userId, dispatch])

  // FIX: Remove the cleanup effect that clears the profile
  // This was causing the "profile not found" issue when navigating back

  const trackView = async () => {
    try {
      await fetch(`${API_URL}/analytics/view`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileId: params.userId }),
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
          profileId: params.userId,
          interactionType: type,
        }),
      })
    } catch (error) {
      console.error("[v0] Failed to track interaction:", error)
    }
  }

  const handleCopyPhone = async () => {
    if (!profile) return;

    try {
      await navigator.clipboard.writeText(profile.contact?.phoneNumber || "")
      setCopied(true)
      toast.success("Phone number copied!")
      setTimeout(() => setCopied(false), 2000)
      trackInteraction("phone_copy")
    } catch (error) {
      toast.error("Failed to copy")
    }
  }

  const handleCall = () => {
    if (!profile) return;

    if (profile.contact?.phoneNumber) {
      window.location.href = `tel:${profile.contact.phoneNumber}`
      trackInteraction("call")
    } else {
      toast.error("Phone number not available")
    }
  }

  const handleWhatsApp = () => {
    if (!profile) return;

    if (profile.contact?.phoneNumber) {
      window.open(`https://wa.me/${profile.contact.phoneNumber}`, "_blank")
      trackInteraction("whatsapp")
    } else {
      toast.error("WhatsApp not available")
    }
  }

  const getPackageBadge = () => {
    if (!profile) return null;

    const packageType = profile.currentPackage?.packageType

    const badges = {
      elite: {
        text: "VIP ELITE",
        gradient: "from-yellow-400 via-orange-500 to-red-500",
        icon: "👑",
      },
      premium: {
        text: "PREMIUM",
        gradient: "from-purple-500 via-pink-500 to-rose-500",
        icon: "⭐",
      },
      basic: {
        text: "BASIC",
        gradient: "from-gray-600 to-gray-700",
        icon: "📌",
      },
    }

    return badges[packageType] || null
  }

  // FIX: Improved loading state - only show loading when truly loading AND no cached data
  if (loading && !profile) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  // FIX: Only show "not found" if we're not loading AND no profile exists
  if (!profile && !loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-neutral-600 mb-4">Profile not found</p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  // If we have a profile (from cache or fetch), render the page
  const isSpa = profile.userType === "spa"
  const allImages = [profile.profileImage, ...(profile.secondaryImages || [])].filter(Boolean)
  const packageBadge = getPackageBadge()


  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-neutral-900 py-4 px-4 sticky top-0 z-40">
        <div className="container mx-auto max-w-7xl flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-white/80 hover:text-white transition-colors max-md:mr-2"
          >
            <FiArrowLeft size={20} className="border border-primary rounded-full ml-4 h-8 w-8 p-1" />
            <span className="hidden sm:inline">Back</span>
          </button>
          <h1 className="text-white font-medium text-lg truncate max-w-xs sm:max-w-md capitalize max-md:flex max-md:flex-col">
            <span className="text-primary font-bold">Alchemyst {profile.userType}s</span> <span className="max-md:hidden">&gt;&gt;</span> Hook up with {profile.username}
          </h1>
          <div className="w-10" /> {/* Spacer for centering */}
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Left Column - Image Gallery */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="">
            {/* Main Image Swiper */}
            <div
              className={`${isSpa ? "aspect-[16/9]" : "aspect-[3/4]"} rounded-xl overflow-hidden shadow-2xl mb-4 relative`}
            >
              {renderBadges()}
              <Swiper
                modules={[Navigation, Pagination, Thumbs]}
                navigation
                pagination={{ clickable: true }}
                thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
                className="h-full"
              >
                {allImages.map((img, index) => (
                  <SwiperSlide key={index}>
                    <img
                      src={img.url || "/placeholder.svg?height=800&width=600"}
                      alt={`${profile.username} - Image ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>

            {/* Thumbnail Swiper */}
            {allImages.length > 1 && (
              <Swiper
                modules={[FreeMode, Thumbs]}
                onSwiper={setThumbsSwiper}
                spaceBetween={10}
                slidesPerView={5}
                freeMode={true}
                watchSlidesProgress={true}
                className="thumbs-swiper"
              >
                {allImages.map((img, index) => (
                  <SwiperSlide key={index}>
                    <div className="aspect-square rounded-lg overflow-hidden cursor-pointer hover:opacity-75 transition-opacity border-2 border-transparent hover:border-primary">
                      <img
                        src={img.url || "/placeholder.svg?height=100&width=100"}
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            )}
          </motion.div>

          {/* Right Column - Profile Info */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="">
            {/* Username and Location */}
            <div>
              <h2 className="text-3xl font-bold text-neutral-900 mb-1 capitalize">{profile.username}</h2>
              <h3 className="font-bold text-primary">{profile.age} Years Old</h3>
              <h4 className="capitalize bg-primary/20 max-w-fit px-4 font-bold border border-primary rounded-lg text-primary my-2">
                {profile.userType}
              </h4>

              <div className="flex items-start gap-2 text-neutral-600 my-4">
                <FiMapPin className="mt-1 flex-shrink-0" size={18} />
                <p className="text-base">
                  {profile.location?.area?.[0] && `${profile.location.area[0]}, `}
                  {profile.location?.location}, {profile.location?.county}
                </p>
              </div>
            </div>

            {/* Personal Details */}
            {!isSpa && (
              <div className="bg-white p-5 rounded-lg border border-neutral-200 shadow-sm">
                <h3 className="text-lg font-bold text-neutral-900 mb-4">Personal Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  {profile.age && (
                    <div>
                      <p className="text-sm text-neutral-500 mb-1 flex items-center gap-1">
                        <FiCalendar size={14} />
                        Age
                      </p>
                      <p className="font-semibold text-neutral-900">{profile.age} years</p>
                    </div>
                  )}
                  {profile.gender && (
                    <div>
                      <p className="text-sm text-neutral-500 mb-1">Gender</p>
                      <p className="font-semibold text-neutral-900 capitalize">{profile.gender}</p>
                    </div>
                  )}
                  {profile.sexualOrientation && (
                    <div>
                      <p className="text-sm text-neutral-500 mb-1">Sexual Orientation</p>
                      <p className="font-semibold text-neutral-900 capitalize">{profile.sexualOrientation}</p>
                    </div>
                  )}
                  {profile.ethnicity && (
                    <div>
                      <p className="text-sm text-neutral-500 mb-1">Ethnicity</p>
                      <p className="font-semibold text-neutral-900 capitalize">{profile.ethnicity}</p>
                    </div>
                  )}
                  {profile.bodyType && (
                    <div>
                      <p className="text-sm text-neutral-500 mb-1">Body Type</p>
                      <p className="font-semibold text-neutral-900 capitalize">{profile.bodyType}</p>
                    </div>
                  )}
                  {profile.breastSize && (
                    <div>
                      <p className="text-sm text-neutral-500 mb-1">Bus</p>
                      <p className="font-semibold text-neutral-900 uppercase">{profile.breastSize}</p>
                    </div>
                  )}
                  {profile.nationality && (
                    <div>
                      <p className="text-sm text-neutral-500 mb-1 flex items-center gap-1">
                        <FiGlobe size={14} />
                        Nationality
                      </p>
                      <p className="font-semibold text-neutral-900 capitalize">{profile.nationality}</p>
                    </div>
                  )}
                  {profile.serviceType && (
                    <div>
                      <p className="text-sm text-neutral-500 mb-1">Service Type</p>
                      <p className="font-semibold text-neutral-900 capitalize">
                        {profile.serviceType === 'both' ? 'Incalls & Outcalls' : profile.serviceType === 'men' ? 'Incalls Only' : 'Outcalls Only'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col "
          >

            {/* About Section */}
            {profile.bio ? (
              <div className="bg-primary/10 p-5 rounded-lg border border-primary">
                <h3 className="text-lg font-bold text-neutral-900 mb-3 flex items-center gap-2">
                  <FiUser />
                  About Me
                </h3>
                <p className="text-neutral-700 leading-relaxed">{profile.bio}</p>
              </div>
            ) : (
              <div className="bg-primary/10 p-5 rounded-lg border border-primary">
                <h3 className="text-lg font-bold text-neutral-900 mb-3 flex items-center gap-2">
                  <FiUser />
                  About Me
                </h3>
                <p className="text-neutral-700 leading-relaxed">
                  Hi, I'm <span className="text-primary font-bold capitalize">{profile.username}</span>,
                  a sexy <span className="text-primary font-bold capitalize">{profile.userType}</span>&nbsp;
                  based in <span className="text-primary font-bold capitalize">{profile.location?.location}.</span>&nbsp;
                  I'm here to provide you with an unforgettable
                  experience. Let's connect and make some amazing memories together!
                </p>
              </div>
            )
            }

            <p className="my-2">To hook up with <span className="text-primary font-bold capitalize">{profile.username}</span> get in touch via the contact details below to arrange a meet-up.</p> 

            {/* Phone Number with Copy */}
            {profile.contact?.phoneNumber && (
              <div className="bg-neutral-50 p-4 rounded-lg border border-neutral-200 my-5">
                <label className="text-sm font-medium text-neutral-600 mb-2 block">Phone Number</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={profile.contact.phoneNumber}
                    readOnly
                    className="flex-1 px-4 py-3 bg-white border border-neutral-300 rounded-lg text-neutral-900 font-medium"
                  />
                  <button
                    onClick={handleCopyPhone}
                    className="p-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all cursor-pointer"
                  >
                    {copied ? <span className=" flex items-center gap-2">Copied <FiCheck size={20} /></span> : <span className=" flex items-center gap-2">Copy<FiCopy size={20} /></span>}
                  </button>
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={handleCall}
                className="flex-1 px-6 py-4 bg-green-500 text-white rounded-lg font-bold hover:bg-green-600 transition-all flex items-center justify-center gap-2 shadow-lg"
              >
                <FiPhone size={20} />
                <span className="hidden sm:inline">Call Now</span>
                <span className="sm:hidden">Call</span>
              </button>

              {profile.contact?.hasWhatsApp && (
                <button
                  onClick={handleWhatsApp}
                  className="flex-1 px-6 py-4 bg-[#25D366] text-white rounded-lg font-bold hover:bg-[#20BA5A] transition-all flex items-center justify-center gap-2 shadow-lg"
                >
                  <BsWhatsapp size={20} />
                  <span className="hidden sm:inline">WhatsApp</span>
                  <span className="sm:hidden">Chat</span>
                </button>
              )}
            </div>
          </motion.div>
        </div>

        {/* Services Section */}
        {profile.services && profile.services.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-8"
          >
            <h2 className="text-2xl font-bold text-neutral-900 mb-6">Services Offered</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {profile.services
                .filter((s) => s.isActive)
                .map((service, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className="bg-white p-5 rounded-lg border border-neutral-200 shadow-sm hover:shadow-md transition-shadow"
                  >
                    {service.image?.url && (
                      <div className="aspect-video rounded-lg overflow-hidden mb-3 h-10 w-10">
                        <img
                          src={service.image.url || "/placeholder.svg"}
                          alt={service.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <h3 className="font-bold text-neutral-900 mb-2 text-lg">{service.name}</h3>
                    {service.description && (
                      <p className="text-sm text-neutral-600 mb-3 line-clamp-2">{service.description}</p>
                    )}
                    <div className="flex items-center justify-between">
                      <div className="text-primary font-bold text-lg">
                        {service.contactForPrice ? (
                          "Contact for price"
                        ) : (
                          <>
                            KSh {service.price}{" "}
                            <span className="text-sm font-normal text-neutral-500">/ {service.pricingUnit}</span>
                          </>
                        )}
                      </div>
                      {service.priceNegotiable && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Negotiable</span>
                      )}
                    </div>
                  </motion.div>
                ))}
            </div>
          </motion.div>
        )}

        {/* Similar Profiles Carousel */}
        {similarProfiles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-12"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-neutral-900">Similar Profiles in {profile.location?.location}</h2>
              <button
                onClick={() => navigate(`/location/${profile.location?.county}/${profile.location?.location}`)}
                className="text-primary font-medium hover:underline"
              >
                View All →
              </button>
            </div>

            <Swiper
              modules={[Navigation, FreeMode]}
              spaceBetween={20}
              slidesPerView={1}
              navigation
              breakpoints={{
                640: { slidesPerView: 2 },
                768: { slidesPerView: 3 },
                1024: { slidesPerView: 4 },
              }}
              className="similar-profiles-swiper"
            >
              {similarProfiles.map((similarProfile) => (
                <SwiperSlide key={similarProfile._id}>
                  <ProfileCard profile={similarProfile} />
                </SwiperSlide>
              ))}
            </Swiper>
          </motion.div>
        )}
      </div>
      {/* Bottom padding to prevent content being hidden by fixed buttons */}
      <div className="h-24" />
    </div>
  )
}
