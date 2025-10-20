"use client"

import { useState, useEffect, useCallback } from "react"
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
import { IoIosPhonePortrait } from "react-icons/io";
import { toast } from "react-hot-toast"
import { useSelector, useDispatch } from "react-redux"
import { Swiper, SwiperSlide } from "swiper/react"
import { Navigation, Pagination, Thumbs, FreeMode, Autoplay } from "swiper/modules"
import "swiper/css"
import "swiper/css/navigation"
import "swiper/css/pagination"
import "swiper/css/thumbs"
import "swiper/css/free-mode"
import "swiper/css/autoplay"
import ProfileCard from "../../components/ProfileCard"
import SpaCard from "../../components/SpaCard"
import { BsWhatsapp } from "react-icons/bs"
import { fetchProfileDetails } from "../../redux/profileDetailsSlice"

const API_URL = import.meta.env.VITE_API_URL

export default function ProfileDetailsPage() {
  const params = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()

  // Get data from Redux store
  const { currentProfile, loading, profileCache } = useSelector(state => state.profileDetails)
  const { allProfiles } = useSelector(state => state.profiles)

  const [thumbsSwiper, setThumbsSwiper] = useState(null)
  const [copied, setCopied] = useState(false)
  const [similarProfiles, setSimilarProfiles] = useState([])
  const [similarSpas, setSimilarSpas] = useState([])
  const [loadingSimilar, setLoadingSimilar] = useState(false)

  // Enhanced profile lookup with better params response
  const profile = currentProfile ||
    profileCache[params.userId]?.profile ||
    allProfiles.find(p => p._id === params.userId)

  useEffect(() => {
    trackView()
  }, []);

  // Enhanced useEffect for params changes
  useEffect(() => {
    window.scrollTo(0, 0)

    const cachedProfile = profileCache[params.userId] || allProfiles.find(p => p._id === params.userId)
    const isCachedDataStale = !cachedProfile || (cachedProfile.timestamp && Date.now() - cachedProfile.timestamp > 10 * 60 * 1000)

    if (!cachedProfile || isCachedDataStale) {
      dispatch(fetchProfileDetails({
        userType: params.userType,
        userId: params.userId
      }))
    }

  }, [params.userType, params.userId, dispatch, profileCache, allProfiles])

  // Enhanced similar profiles logic
  useEffect(() => {
    if (profile) {
      findSimilarProfiles()
    }
  }, [profile, params.userId, allProfiles])

  // NEW: Enhanced similar profiles finding using Redux data
  const findSimilarProfiles = useCallback(() => {
    if (!profile || !allProfiles.length) return

    setLoadingSimilar(true)

    const currentProfileId = profile._id
    const targetCount = 10
    const similar = []
    const similarSpa = []

    // Filter out current profile
    const availableProfiles = allProfiles.filter(p => p._id !== currentProfileId)

    // Phase 1: Same area (most relevant)
    const sameAreaProfiles = availableProfiles.filter(p =>
      p.location?.area?.some(area =>
        profile.location?.area?.some(profileArea =>
          profileArea.toLowerCase() === area.toLowerCase()
        )
      ) && p.userType !== "spa"
    )

    const sameAreaSpas = availableProfiles.filter(p =>
      p.location?.area?.some(area =>
        profile.location?.area?.some(profileArea =>
          profileArea.toLowerCase() === area.toLowerCase()
        )
      ) && p.userType === "spa"
    )

    similar.push(...sameAreaProfiles.slice(0, targetCount))
    similarSpa.push(...sameAreaSpas.slice(0, 4)) // Limit spas to 4

    // Phase 2: Same location if we need more profiles
    if (similar.length < targetCount && profile.location?.location) {
      const sameLocationProfiles = availableProfiles.filter(p =>
        p.location?.location?.toLowerCase() === profile.location?.location?.toLowerCase() &&
        p.userType !== "spa" &&
        !similar.some(sp => sp._id === p._id)
      )
      similar.push(...sameLocationProfiles.slice(0, targetCount - similar.length))
    }

    // Phase 3: Same county if we still need more profiles
    if (similar.length < targetCount && profile.location?.county) {
      const sameCountyProfiles = availableProfiles.filter(p =>
        p.location?.county?.toLowerCase() === profile.location?.county?.toLowerCase() &&
        p.userType !== "spa" &&
        !similar.some(sp => sp._id === p._id)
      )
      similar.push(...sameCountyProfiles.slice(0, targetCount - similar.length))
    }

    // For spas, only check area and location (not county - too far)
    if (similarSpa.length < 4 && profile.location?.location) {
      const sameLocationSpas = availableProfiles.filter(p =>
        p.location?.location?.toLowerCase() === profile.location?.location?.toLowerCase() &&
        p.userType === "spa" &&
        !similarSpa.some(sp => sp._id === p._id)
      )
      similarSpa.push(...sameLocationSpas.slice(0, 4 - similarSpa.length))
    }

    setSimilarProfiles(similar)
    setSimilarSpas(similarSpa)
    setLoadingSimilar(false)
  }, [profile, allProfiles])

  // Rest of your functions remain the same (trackView, handleCopyPhone, etc.)
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

  // NEW: SEO-optimized content generator
  const generateSEOCopy = () => {
    if (!profile) return "";

    const { username, userType, location, age, services, bio, verification, currentPackage, providesEroticServices } = profile;
    const county = location?.county || "Nairobi";
    const area = location?.area?.[0] || location?.location || "the area";
    const locationString = `${area}, ${county}`;

    // Base service definitions
    const serviceTypes = {
      escort: {
        title: "Escort",
        keywords: ["escorts", "call girls", "companionship", "dating", "hookups", "sexy girls", "female escorts"],
        description: "premium escort services",
        synonyms: ["companion", "call girl", "escort service"]
      },
      masseuse: {
        title: "Masseuse",
        keywords: providesEroticServices
          ? ["massage", "bodywork", "relaxation", "therapeutic massage", "erotic massage", "sensual massage"]
          : ["massage", "bodywork", "relaxation", "therapeutic massage", "deep tissue", "sports massage"],
        description: providesEroticServices
          ? "professional erotic and sensual massage services"
          : "professional therapeutic and wellness massage services",
        synonyms: providesEroticServices
          ? ["massage therapist", "bodywork specialist", "sensual masseuse"]
          : ["massage therapist", "wellness specialist", "spa masseuse"]
      },
      "of-model": {
        title: "OnlyFans Model",
        keywords: ["OnlyFans", "content creation", "premium content", "online modeling", "adult content"],
        description: "exclusive OnlyFans content",
        synonyms: ["content creator", "online model"]
      },
      spa: {
        title: "Spa",
        keywords: ["spa services", "massage parlor", "adult entertainment", "relaxation center", "wellness spa"],
        description: "luxurious spa and wellness experiences",
        synonyms: ["massage parlor", "wellness center"]
      }
    };

    const serviceInfo = serviceTypes[userType] || {
      title: "Entertainment",
      keywords: ["adult services", "entertainment"],
      description: "premium adult entertainment services",
      synonyms: ["service provider"]
    };

    // Verification & trust badges
    const verificationBadges = [];
    if (verification?.profileVerified) verificationBadges.push("Verified Profile");
    if (verification?.backgroundCheck) verificationBadges.push("Background Verified");
    if (currentPackage?.status === "active") verificationBadges.push("Premium Member");

    const serviceList = services?.length ? services.map(s => s.name).join(", ") : "customized services";

    // Trust indicator rendering
    const renderTrustIndicators = () => {
      const list = [];

      if (verification?.profileVerified)
        list.push(`
        <li class="flex items-center gap-2">
          <span class="w-2 h-2 rounded-full ${profile.userType === "masseuse" ? "bg-blue-500" : profile.userType === "of-model" ? "bg-fuchsia-500" : "bg-primary"}"></span>
          <span>Verified profile with complete background check</span>
        </li>
      `);

      if (currentPackage?.status === "active")
        list.push(`
        <li class="flex items-center gap-2">
          <span class="w-2 h-2 rounded-full ${profile.userType === "masseuse" ? "bg-blue-500" : profile.userType === "of-model" ? "bg-fuchsia-500" : "bg-primary"}"></span>
          <span>Premium ${userType} offering top-rated services</span>
        </li>
      `);

      list.push(`
      <li class="flex items-center gap-2">
        <span class="w-2 h-2 rounded-full ${profile.userType === "masseuse" ? "bg-blue-500" : profile.userType === "of-model" ? "bg-fuchsia-500" : "bg-primary"}"></span>
        <span>Professional and discreet services in ${area}</span>
      </li>
    `);

      list.push(`
      <li class="flex items-center gap-2">
        <span class="w-2 h-2 rounded-full ${profile.userType === "masseuse" ? "bg-blue-500" : profile.userType === "of-model" ? "bg-fuchsia-500" : "bg-primary"}"></span>
        <span>Flexible scheduling for your convenience</span>
      </li>
    `);

      return list.join("");
    };

    // Adjusted service section for masseuse profiles
    const serviceParagraph =
      userType === "masseuse"
        ? providesEroticServices
          ? `
        <p class="text-lg">
          <strong>${username}</strong> provides both <strong>therapeutic and sensual massage</strong> experiences, 
          combining relaxation with intimacy in a professional and safe environment. 
          Enjoy a personalized experience in ${locationString}, designed to meet your specific preferences 
          while maintaining complete confidentiality.
        </p>`
          : `
        <p class="text-lg">
          <strong>${username}</strong> specializes in <strong>professional, non-erotic massage therapy</strong> 
          focused on wellness, relaxation, and physical rejuvenation. 
          Perfect for clients seeking deep tissue, Swedish, or sports massage sessions in ${locationString}.
        </p>`
        : `
        <p class="text-lg">
          Offering services in <strong>${serviceList}</strong>, ${username} provides customized experiences 
          tailored to your specific desires. Whether you're looking for companionship, 
          relaxation, or exclusive entertainment, you'll find satisfaction with this professional ${serviceInfo.title.toLowerCase()}.
        </p>`;

    return `
  <div class="seo-content space-y-6 text-gray-700 leading-relaxed text-left">
    <h1 class="text-2xl font-bold text-gray-900 mb-4 capitalize">
      ${username} – ${serviceInfo.title} in ${locationString} | Alchemyst ${serviceInfo.title}s
    </h1>

    <p class="text-lg">
      Meet <strong>${username}</strong>, a dedicated ${serviceInfo.title.toLowerCase()} based in 
      <strong>${area}, ${county}</strong>. 
      ${age ? `At ${age} years old,` : "This professional"} ${userType === "masseuse" && !providesEroticServices ? "offers therapeutic wellness sessions" : `provides ${serviceInfo.description}`} 
      for clients seeking high-quality, confidential, and professional service.
    </p>

    ${bio ? `<p>${bio}</p>` : ""}

    ${serviceParagraph}

    <h2 class="text-xl font-semibold text-gray-900 mt-8 mb-4 capitalize">
      Best ${serviceInfo.title} Services in ${county} – ${area} Area
    </h2>

    <p>
      Searching for <strong>${serviceInfo.keywords[0]} in ${area}</strong> or 
      <strong>${serviceInfo.synonyms[0]} in ${county}</strong>? 
      ${username} stands out among local ${serviceInfo.title.toLowerCase()}s 
      for professionalism, reliability, and client satisfaction. 
      ${area} is known for quality wellness and entertainment services — and ${username} delivers the best experience possible.
    </p>

    <h3 class="text-xl font-semibold text-gray-900 mt-8 mb-4">Why Choose ${username}?</h3>
    <ul class="space-y-3 ml-4">
      ${renderTrustIndicators()}
      ${services?.length ? `
        <li class="flex items-center gap-2">
          <span class="min-w-2 min-h-2 rounded-full ${profile.userType === "masseuse" ? "bg-blue-500" : profile.userType === "of-model" ? "bg-fuchsia-500" : "bg-primary"}"></span>
          <span>Specialized services including ${serviceList}</span>
        </li>` : ""}
      <li class="flex items-center gap-2">
        <span class="w-2 h-2 rounded-full ${profile.userType === "masseuse" ? "bg-blue-500" : profile.userType === "of-model" ? "bg-fuchsia-500" : "bg-primary"}"></span>
        <span>Competitive rates with transparent pricing</span>
      </li>
    </ul>

   <!-- Call to Action with Keywords -->
      <div class="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg border-l-4 mt-6 ${profile.userType === "masseuse" ? "border-blue-500" : profile.userType === "of-model" ? "border-fuchsia-500" : "border-primary"}">
        <h4 class="font-semibold text-gray-900 mb-3 text-lg">
          Ready to Experience Premium ${serviceInfo.title} Services?
        </h4>
        <p class="text-gray-800 mb-4">
          Contact <strong>${username}</strong> today for the best ${serviceInfo.description} in <strong>${locationString}</strong>. 
          Easy booking, professional service, and complete discretion guaranteed.
        </p>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <strong class="${profile.userType === "masseuse" ? "text-blue-600" : profile.userType === "of-model" ? "text-fuchsia-600" : "text-primary"}">Quick Contact Info:</strong>
            <div class="mt-2 space-y-3">
              ${profile.contact?.phoneNumber ? `<div className="flex items-center ">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true" role="img" class="w-5 h-5 inline">
  <path stroke-linecap="round" stroke-linejoin="round" d="M22 16.92v3a2 2 0 0 1-2.18 2 19.86 19.86 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.86 19.86 0 0 1 2.08 4.18 2 2 0 0 1 4 2h3a2 2 0 0 1 2 1.72c.12.9.36 1.76.72 2.57a2 2 0 0 1-.45 2.11L9.91 9.91a12.06 12.06 0 0 0 6 6l1.5-1.5a2 2 0 0 1 2.11-.45c.81.36 1.67.6 2.57.72A2 2 0 0 1 22 16.92z"/>
  </svg>&nbsp;
 <span> Phone: ${profile.contact.phoneNumber}</span>
 </div>` : ''}
              ${profile.contact?.hasWhatsApp ? `<div>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true" role="img" class="w-5 h-5 inline">
  <path stroke-linecap="round" stroke-linejoin="round" d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
</svg>&nbsp;

                WhatsApp: Available for quick booking
                </div>` : ''}
              <div>
               <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true" role="img" class="w-5 h-5 inline">
  <path stroke-linecap="round" stroke-linejoin="round" d="M12 11.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z"/>
  <path stroke-linecap="round" stroke-linejoin="round" d="M12 21s8-5.5 8-11a8 8 0 1 0-16 0c0 5.5 8 11 8 11z"/>
</svg>&nbsp;
 
              Location: ${locationString}
              </div>
              <div>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true" role="img" class="w-5 h-5 inline">
  <path stroke-linecap="round" stroke-linejoin="round" d="M12 17.3l6.18 3.73-1.64-7.03L21 9.24l-7.19-.61L12 2 10.19 8.63 3 9.24l5.46 4.76L6.82 21z"/>
</svg>&nbsp;
 
              Service Type: ${userType.charAt(0).toUpperCase() + userType.slice(1)}
              </div>
            </div>
          </div>
          <div>
            <strong class="${profile.userType === "masseuse" ? "text-blue-600" : profile.userType === "of-model" ? "text-fuchsia-600" : "text-primary"}">Service Details:</strong>
            <div class="mt-2 space-y-3">
              ${age ? `<div>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true" role="img" class="w-5 h-5 inline">
  <rect x="3" y="5" width="18" height="16" rx="2" ry="2" stroke-linecap="round" stroke-linejoin="round"/>
  <path stroke-linecap="round" stroke-linejoin="round" d="M16 3v4M8 3v4M3 11h18"/>
</svg> &nbsp;

                 Age: ${age} years</div>` : ''}
              <div>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true" role="img" class="w-5 h-5 inline">
  <circle cx="12" cy="12" r="9" stroke-linecap="round" stroke-linejoin="round"/>
  <path stroke-linecap="round" stroke-linejoin="round" d="M12 7v6l4 2"/>
</svg>&nbsp;

               Availability: Flexible scheduling
               </div>
              <div>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true" role="img" class="w-5 h-5 inline">
  <rect x="2" y="7" width="20" height="13" rx="2" ry="2" stroke-linecap="round" stroke-linejoin="round"/>
  <path stroke-linecap="round" stroke-linejoin="round" d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
</svg>&nbsp;

               Service Area: ${locationString} and surrounding areas</div>
              ${verificationBadges.length > 0 ? `<div>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true" role="img" class="w-5 h-5 inline">
  <path stroke-linecap="round" stroke-linejoin="round" d="M12 2l7 4v6c0 5-3.58 9.74-7 10-3.42-.26-7-5-7-10V6l7-4z"/>
</svg>&nbsp;

                 Status: ${verificationBadges.join(', ')}</div>` : ''}
            </div>
          </div>
        </div>
      </div>

    <div class="mt-6 p-4 bg-gray-100 rounded-lg">
      <p class="text-sm text-gray-600">
        <strong>Popular Searches:</strong> 
        ${serviceInfo.keywords.slice(0, 3).map(kw => `${kw} in ${area}, ${kw} in ${county}`).join(", ")} | 
        best ${serviceInfo.title.toLowerCase()}s ${locationString} | 
        ${providesEroticServices ? "sensual massage" : "wellness massage"} ${area}
      </p>
    </div>
  </div>`;
  };





  const generateSchemaMarkup = () => {
    if (!profile) return null;

    const schema = {
      "@context": "https://schema.org",
      "@type": profile.userType === 'spa' ? 'HealthAndBeautyBusiness' : 'AdultEntertainment',
      "name": profile.username,
      "description": `Premium ${profile.userType} services in ${profile.location?.area?.[0] || profile.location?.location}, ${profile.location?.county}`,
      "url": window.location.href,
      "image": profile.profileImage?.url ? [profile.profileImage.url] : [],
      "address": {
        "@type": "PostalAddress",
        "addressLocality": profile.location?.location,
        "addressRegion": profile.location?.county,
        "addressCountry": "KE"
      }
    };

    if (profile.services && profile.services.length > 0) {
      schema.makesOffer = profile.services.map(service => ({
        "@type": "Offer",
        "name": service.name,
        "description": service.description,
        "price": service.contactForPrice ? "0" : service.price.toString(),
        "priceCurrency": "KES"
      }));
    }

    return JSON.stringify(schema);
  };

  // Loading and not found states remain the same...
  const hasCachedData = profileCache[params.userId] || allProfiles.find(p => p._id === params.userId)

  if (loading && !hasCachedData) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

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

  const isSpa = profile.userType === "spa"
  const allImages = [profile.profileImage, ...(profile.secondaryImages || [])].filter(Boolean)

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-neutral-900 py-4 px-4 z-40">
        <div className="container mx-auto max-w-7xl flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-white/80 hover:text-white transition-colors max-md:mr-2 cursor-pointer"
          >
            <FiArrowLeft size={20} className={`border rounded-full ml-4 h-8 w-8 p-1 ${profile.userType === "masseuse" ? "text-blue-500 bg-blue-500/10 border-blue-500" : profile.userType === "of-model" ? "text-fuchsia-500 bg-fuchsia-500/10 border-fuchsia-500" : "text-primary bg-primary/10 border-primary"}`} />
            <span className="hidden sm:inline">Back</span>
          </button>
          <h1 className="text-white font-medium text-lg truncate max-w-xs sm:max-w-md flex gap-2 max-md:gap-0 capitalize max-md:flex max-md:flex-col">
            <span className={`font-bold ${profile.userType === "masseuse" ? "text-blue-500" : profile.userType === "of-model" ? "text-fuchsia-500" : "text-primary"}`}>Alchemyst {profile.userType}s </span>
            <span className="max-md:hidden capitalize">&gt;&gt;&nbsp;</span>
            <span className="flex items-center">
              {!isSpa && <span>Hook up with</span>}&nbsp;
              {profile.username}
            </span>
          </h1>
          <div className="w-10" /> {/* Spacer for centering */}
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Left Column - Image Gallery */}
          {isSpa ?
            (
              <div className="col-span-2">
                <div className="aspect-[16/9] rounded-xl overflow-hidden shadow-2xl mb-4 relative">
                  {renderBadges()}
                  <img
                    src={profile.profileImage.url}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Username and Location */}
                <div>
                  <h2 className="text-5xl font-bold text-neutral-900 mb-1 capitalize max-md:text-4xl">{profile.username}</h2>
                  <h4 className="capitalize max-w-fit px-4 font-bold border border-primary rounded-lg my-2">
                    {profile.userType}
                  </h4>

                  <div className="flex items-start gap-2 text-primary font-bold my-4">
                    <FiMapPin className="mt-1 flex-shrink-0 text-primary font-bold" size={20} />
                    <p className="text-base text-xl capitalize">
                      {profile.location?.area?.[0] && `${profile.location.area[0]}, `}
                      {profile.location?.location}, {profile.location?.county}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-xl">
                    Service Type: <div className="h-3 w-3  bg-blue-500 rounded-full"></div>
                    <h4 className="text-xl text-blue-500 font-bold">{profile.serviceType === 'both' ? 'Incalls & Outcalls' : profile.serviceType === 'incall' ? 'Incalls Only' : 'Outcalls Only'}</h4>
                  </div>
                </div>
              </div>
            ) : (
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
            )}

          {/* Right Column - Profile Info */}
          {!isSpa && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="">
              {/* Username and Location */}
              <div>
                <h2 className="text-3xl font-bold text-neutral-900 mb-1 capitalize">{profile.username}</h2>
                <h3 className={`font-bold ${profile.userType === "masseuse" ? "text-blue-500" : profile.userType === "of-model" ? "text-fuchsia-500" : "text-primary"}`}>{profile.age} Years Old</h3>
                <h4 className={`capitalize max-w-fit px-4 font-bold border rounded-lg my-2 ${profile.userType === "masseuse" ? "text-blue-500 bg-blue-500/10 border-blue-500" : profile.userType === "of-model" ? "text-fuchsia-500 bg-fuchsia-500/10 border-fuchsia-500" : "text-primary bg-primary/10 border-primary"}`}>
                  {profile.userType}
                </h4>

                <div className="flex items-start gap-2 text-neutral-600 my-4">
                  <FiMapPin className="mt-1 flex-shrink-0 font-semibold" size={20} />
                  <p className="text-base capitalize text-xl font-semibold">
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
                        <p className="text-sm text-neutral-500 mb-1">Bust</p>
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
                          {profile.serviceType === 'both' ? 'Incalls & Outcalls' : profile.serviceType === 'incall' ? 'Incalls Only' : 'Outcalls Only'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Erotic Services Indicator */}
              {profile?.userType === "masseuse" && (
                <motion.div
                  className={`mt-4 p-3 rounded-lg border text-sm flex items-center gap-2 ${profile?.providesEroticServices
                    ? "border-rose-300 bg-rose-50 text-rose-700"
                    : "border-emerald-300 bg-emerald-50 text-emerald-700"
                    }`}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {profile?.providesEroticServices ? (
                    <>
                      <FiHeart className="text-rose-500" size={40} />
                      <span>
                        <strong>This masseuse provides erotic and sensual massage services as well.</strong>
                        &nbsp;Please communicate your preferences respectfully.
                      </span>
                    </>
                  ) : (
                    <>
                      <FiUser className="text-emerald-500" size={40} />
                      <span>
                        <strong>This masseuse offers professional, non-erotic massage services only.</strong>
                        &nbsp;Kindly keep all interactions respectful.
                      </span>
                    </>
                  )}
                </motion.div>
              )}

            </motion.div>
          )}


          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col "
          >
            {profile.bio ? (
              isSpa ? (
                // --- SPA DESCRIPTION ---
                <div className="bg-blue-100 p-5 rounded-lg border border-blue-400">
                  <h3 className="text-lg font-bold text-neutral-900 mb-3 flex items-center gap-2">
                    <FiUser />
                    About Our Spa
                  </h3>
                  <p className="text-neutral-700 leading-relaxed">
                    {profile.bio}
                  </p>
                </div>
              ) : (
                // --- REGULAR PROFILE DESCRIPTION (has bio) ---
                <div className={`p-5 rounded-lg border ${profile.userType === "masseuse" ? "text-blue-500 bg-blue-500/10 border-blue-500" : profile.userType === "of-model" ? "text-fuchsia-500 bg-fuchsia-500/10 border-fuchsia-500" : "text-primary bg-primary/10 border-primary"}`}>
                  <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                    <FiUser />
                    About Me
                  </h3>
                  <p className="text-neutral-700 leading-relaxed">
                    {profile.bio}
                  </p>
                </div>
              )
            ) : (
              // --- NO BIO AVAILABLE ---
              <div className={`p-5 rounded-lg border ${profile.userType === "masseuse" ? "text-blue-500 bg-blue-500/10 border-blue-500" : profile.userType === "of-model" ? "text-fuchsia-500 bg-fuchsia-500/10 border-fuchsia-500" : "text-primary bg-primary/10 border-primary"}`}>
                <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                  <FiUser />
                  About Me
                </h3>
                <p className="text-neutral-700 leading-relaxed">
                  {isSpa ? (
                    <>
                      Welcome to <span className="text-primary font-bold capitalize">{profile.username}</span>, a luxurious&nbsp;
                      <span className="text-primary font-bold capitalize">{profile.userType}</span>&nbsp;
                      located in <span className="text-primary font-bold capitalize">{profile.location?.location}</span>.&nbsp;
                      Step in for an indulgent experience that relaxes your body and revives your soul.
                    </>
                  ) : (
                    <>
                      Hi, I'm <span className={`font-bold capitalize ${profile.userType === "masseuse" ? "text-blue-500" : profile.userType === "of-model" ? "text-fuchsia-500" : "text-primary"}`}>{profile.username}</span>, a&nbsp;
                      <span className={`font-bold capitalize ${profile.userType === "masseuse" ? "text-blue-500" : profile.userType === "of-model" ? "text-fuchsia-500" : "text-primary"}`}>{profile.userType}</span>&nbsp;
                      based in <span className={`font-bold capitalize ${profile.userType === "masseuse" ? "text-blue-500" : profile.userType === "of-model" ? "text-fuchsia-500" : "text-primary"}`}>{profile.location?.location}</span>.&nbsp;
                      I'm here to provide you with an unforgettable experience — let's connect and make amazing memories together!
                    </>
                  )}
                </p>
              </div>
            )}

            {isSpa ?
              <p className="my-2">For More Info about <span className={`font-bold capitalize ${profile.userType === "masseuse" ? "text-blue-500" : profile.userType === "of-model" ? "text-fuchsia-500" : "text-primary"}`}>{profile.username}</span> get in touch via the contact details below to arrange a meet-up.</p>
              :
              <p className="my-2">To hook up with <span className={`font-bold capitalize ${profile.userType === "masseuse" ? "text-blue-500" : profile.userType === "of-model" ? "text-fuchsia-500" : "text-primary"}`}>{profile.username}</span> get in touch via the contact details below to arrange a meet-up.</p>
            }

            {/* Phone Number with Copy */}
            {profile.contact?.phoneNumber && (
              <div className="bg-neutral-50 p-4 rounded-lg border border-neutral-200 my-2">
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
                    className={`p-3 text-white rounded-lg hover:bg-primary/90 transition-all cursor-pointer ${profile.userType === "masseuse" ? "text-blue-500 bg-blue-500 border-blue-500" : profile.userType === "of-model" ? "text-fuchsia-500 bg-fuchsia-500 border-fuchsia-500" : "text-primary bg-primary border-primary"}`}
                  >
                    {copied ? <span className=" flex items-center gap-2">Copied <FiCheck size={20} /></span> : <span className=" flex items-center gap-2">Copy<FiCopy size={20} /></span>}
                  </button>
                </div>
              </div>
            )}

            {profile.contact?.secondaryPhone && (
              <div className="bg-neutral-50 p-4 rounded-lg border border-neutral-200 my-2">
                <label className="text-sm font-medium text-neutral-600 mb-2 block">Secondary Number</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={profile.contact.secondaryPhone}
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
        {
          profile.services && profile.services.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-8"
            >
              <h2 className="text-4xl font-bold text-neutral-900 mb-6 max-md:text-3xl">
                <span className={`${profile.userType === "masseuse" ? "bg-[url('/graphic/scratch-massuse.png')]" : profile.userType === "of-model" ? "bg-[url('/graphic/scratch-of.png')]" : "bg-[url('/graphic/scratch.png')]"} bg-contain bg-center bg-no-repeat text-white px-6 py-2`}>Services</span> Offered
              </h2>
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
                        <div className={`font-bold text-lg ${profile.userType === "masseuse" ? "text-blue-600" : profile.userType === "of-model" ? "text-fuchsia-600" : "text-primary"}`}>
                          {service.contactForPrice ? (
                            <span className="">Contact for price</span>
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
          )
        }


        {
          profile.secondaryImages && isSpa &&
          <div className="mt-10">
            <h4 className="text-4xl font-bold">
              Meet Our <span className="bg-[url('/graphic/scratch.png')] bg-contain bg-center bg-no-repeat text-white px-10 py-2">Girls</span>
            </h4>

            <div className="grid grid-cols-5 my-6 gap-4 max-md:grid-cols-2">
              {profile.secondaryImages.map((image, index) => (
                <img key={index} src={image.url} className="aspect-[3/4] rounded-md" />
              ))}
            </div>
          </div>
        }


        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-16 py-8 px-4 max-md:px-2 max-md:mt-10"
        >
          <div
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: generateSEOCopy() }}
          />
        </motion.div>

        {/* Similar Profiles Carousel */}
        {
          similarSpas.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-12"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-4xl font-bold text-neutral-900">
                  Spas & Parlors in<span className={`${profile.userType === "masseuse" ? "bg-[url('/graphic/scratch-massuse.png')]" : profile.userType === "of-model" ? "bg-[url('/graphic/scratch-of.png')]" : "bg-[url('/graphic/scratch.png')]"} bg-contain bg-center bg-no-repeat text-white px-6 py-2`}>{profile.location?.area?.[0] || profile.location?.location}</span>
                </h2>
                <button
                  onClick={() => navigate(`/location/${profile.location?.county}?type=spa`)}
                  className="text-primary font-medium hover:underline"
                >
                  View All →
                </button>
              </div>

              <Swiper
                modules={[Navigation, FreeMode, Autoplay]}
                spaceBetween={20}
                slidesPerView={1}
                navigation
                autoplay={{
                  delay: 3500,
                  disableOnInteraction: false,
                  pauseOnMouseEnter: true,
                }}
                loop={similarSpas.length > 4}
                freeMode={true}
                breakpoints={{
                  640: { slidesPerView: 2 },
                  768: { slidesPerView: 3 },
                  1024: { slidesPerView: 3 },
                }}
                className="similar-spas-swiper"
              >
                {similarSpas.map((spa) => (
                  <SwiperSlide key={spa._id}>
                    <SpaCard profile={spa} />
                  </SwiperSlide>
                ))}
              </Swiper>
            </motion.div>
          )
        }



        {similarProfiles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-12"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-4xl font-bold text-neutral-900 max-md:text-2xl">
                Similar {profile.userType === 'spa' ? 'Profiles' : 'Profiles'} in <span className={`${profile.userType === "masseuse" ? "bg-[url('/graphic/scratch-massuse.png')]" : profile.userType === "of-model" ? "bg-[url('/graphic/scratch-of.png')]" : "bg-[url('/graphic/scratch.png')]"} bg-contain bg-center bg-no-repeat text-white px-6 py-2`}>{profile.location?.location}</span>
              </h2>
              <button
                onClick={() => navigate(`/location/${profile.location?.county}/${profile.location?.location}`)}
                className="text-primary font-medium hover:underline"
              >
                View All →
              </button>
            </div>

            <Swiper
              modules={[Navigation, FreeMode, Autoplay]}
              spaceBetween={10}
              slidesPerView={1}
              navigation
              autoplay={{
                delay: 3000,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
              }}
              loop={similarProfiles.length > 4}
              freeMode={true}
              breakpoints={{
                640: { slidesPerView: 2 },
                768: { slidesPerView: 3 },
                1024: { slidesPerView: 4 },
                1280: { slidesPerView: 5 },
              }}
              className="similar-profiles-swiper"
            >
              {similarProfiles.map((similarProfile) => (
                <SwiperSlide key={similarProfile._id}>
                  <ProfileCard profile={similarProfile} imgHght={"max-md:h-80"} />
                </SwiperSlide>
              ))}
            </Swiper>
          </motion.div>
        )}


        {/* Sign Up CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-16 bg-gradient-to-r from-primary to-purple-600 rounded-2xl p-8 text-center text-white"
        >
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold mb-4">
              {profile.userType === 'spa' ? 'Own a Spa?' : 'Are you an Escort?'}
            </h2>
            <p className="text-lg mb-6 opacity-90">
              Join Alchemyst today and reach thousands of clients in {profile.location?.county || 'your area'}.
              {profile.userType === 'spa'
                ? ' List your spa business and get more customers.'
                : ' Create your profile and start earning more.'
              }
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={() => navigate('/register')}
                className="px-8 py-3 bg-white text-primary font-bold rounded-lg hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Sign Up Free
              </button>
              <button
                onClick={() => navigate('/register')}
                className="px-8 py-3 border-2 border-white text-white font-bold rounded-lg hover:bg-white hover:text-primary transition-all duration-300"
              >
                Learn More
              </button>
            </div>
            <p className="text-sm mt-4 opacity-80">
              ✓ Free profile creation ✓ Premium visibility options ✓ Secure messaging
            </p>
          </div>
        </motion.div>
      </div >

      {
        typeof window !== 'undefined' && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: generateSchemaMarkup() }}
          />
        )
      }
    </div >
  )
}
