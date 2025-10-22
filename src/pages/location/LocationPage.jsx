"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate, useLocation } from "react-router-dom"
import { FiArrowLeft } from "react-icons/fi"
import { useSelector, useDispatch } from "react-redux"
import ProfileCard from "../../components/ProfileCard"
import SpaCard from "../../components/SpaCard"
import { IoStarOutline } from "react-icons/io5"
import { MdOutlineLocalFireDepartment } from "react-icons/md"
import { LuLeaf, LuSearchCheck, LuSpade } from "react-icons/lu"
import { CgGirl } from "react-icons/cg"
import { GiCurlyMask, GiDualityMask, GiSelfLove } from "react-icons/gi"
import locationsData from "../../data/counties.json"
import { generateSeoPath, urlToArea, urlToCounty, urlToLocation } from "../../utils/urlHelpers"

const API_URL = import.meta.env.VITE_API_URL

export default function LocationPage() {
  const params = useParams()
  const locationHook = useLocation()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [bgImage, setBgImage] = useState('https://res.cloudinary.com/dowxcmeyy/image/upload/v1760969542/alchemyst-escorts_e0cdbo.png')

  // ✅ Smart parsing - no manual mappings needed!
  const county = urlToCounty(params.county)
  const location = params.location ? urlToLocation(params.location) : null
  const area = params.area ? urlToArea(params.area) : null

  console.log('📍 Parsed URL:', { 
    raw: params, 
    parsed: { county, location, area } 
  })

  // Update background image based on county
  useEffect(() => {
    const countyData = locationsData.find(
      c => c.name.toLowerCase() === county?.toLowerCase()
    )
    setBgImage(countyData?.coverImage || 'https://res.cloudinary.com/dowxcmeyy/image/upload/v1760969542/alchemyst-escorts_e0cdbo.png')
  }, [county])

  // Get data from Redux store - updated to match new structure
  const { allProfiles, filteredProfiles, filteredSpas, loading } = useSelector(state => state.profiles)

  const [locationsList, setLocationsList] = useState([])
  const [areasList, setAreasList] = useState([])
  const [packageProfiles, setPackageProfiles] = useState({ elite: [], premium: [], basic: [] })
  const [packageSpas, setPackageSpas] = useState({ elite: [], premium: [], basic: [] })
  const [localLoading, setLocalLoading] = useState(false)

  // REMOVED: The initial fetch useEffect - data should already be in Redux from useProfiles hook
  useEffect(() => {
    window.scrollTo(0, 0)

    if (allProfiles.length > 0) {
      setLocalLoading(true)
      // Use setTimeout to ensure UI doesn't flash during quick filtering
      const timer = setTimeout(() => {
        filterProfiles()
        extractLocationsAndAreas()
        setLocalLoading(false)
      }, 50)

      return () => clearTimeout(timer)
    }
  }, [allProfiles, county, location, area])

  const filterProfiles = () => {
    let filtered = allProfiles

    // Filter by county (should always be applied)
    filtered = filtered.filter(profile =>
      profile.location?.county?.toLowerCase() === county?.toLowerCase()
    )

    // Filter by location if provided
    if (location && location !== 'all') {
      filtered = filtered.filter(profile =>
        profile.location?.location?.toLowerCase() === location?.toLowerCase()
      )
    }

    // Filter by area if provided
    if (area && area !== 'all') {
      filtered = filtered.filter(profile =>
        profile.location?.area?.some(a =>
          a?.toLowerCase() === area?.toLowerCase()
        )
      )
    }

    // Separate into packages and user types
    const newProfiles = { elite: [], premium: [], basic: [] }
    const newSpas = { elite: [], premium: [], basic: [] }

    filtered.forEach((profile) => {
      const activePackage = profile.currentPackage?.status === 'active' ? profile.currentPackage :
        profile.purchasedPackages?.find((p) => p.status === 'active')
      const tier = activePackage?.packageType || "basic"

      if (profile.userType === "spa") {
        newSpas[tier].push(profile)
      } else {
        newProfiles[tier].push(profile)
      }
    })

    setPackageProfiles(newProfiles)
    setPackageSpas(newSpas)
  }

  const extractLocationsAndAreas = () => {
    // Get unique locations for this county
    const locations = [...new Set(
      allProfiles
        .filter(profile => profile.location?.county?.toLowerCase() === county?.toLowerCase())
        .map(profile => profile.location?.location)
        .filter(Boolean)
    )].sort()

    setLocationsList(locations)

    // Get unique areas for current location
    if (location && location !== 'all') {
      const areas = [...new Set(
        allProfiles
          .filter(profile =>
            profile.location?.county?.toLowerCase() === county?.toLowerCase() &&
            profile.location?.location?.toLowerCase() === location?.toLowerCase()
          )
          .flatMap(profile => profile.location?.area || [])
          .filter(Boolean)
      )].sort()

      setAreasList(areas)
    } else {
      setAreasList([])
    }
  }

  // Rest of your component remains the same...
  const handleLocationClick = (loc) => {
    if (loc === 'all') {
      const path = generateSeoPath({ county })
      navigate(path)
    } else {
      const path = generateSeoPath({ county, location: loc })
      navigate(path)
    }
  }

  const handleAreaClick = (areaName) => {
    if (areaName === 'all') {
      const path = generateSeoPath({ county, location })
      navigate(path)
    } else {
      const path = generateSeoPath({ county, location, area: areaName })
      navigate(path)
    }
  }

  const renderProfileSection = (tier, icon, tierProfiles, title, description) => {
    if (tierProfiles.length === 0) return null

    return (
      <div className="mb-12">
        <div className={`p-6 max-md:p-2 rounded-lg mb-6 border-l-4 ${tier === 'elite' ? 'bg-yellow-50 border-yellow-400' :
          tier === 'premium' ? 'bg-purple-50 border-purple-400' :
            'bg-gray-50 border-gray-400'
          }`}>
          <div className={`flex items-center gap-2 mb-2 ${tier === 'elite' ? 'text-yellow-400' :
            tier === 'premium' ? 'text-purple-400' : 'text-gray-400'
            }`}>
            <span>{icon}</span>
            <h2 className="text-2xl max-md:text-sm font-bold text-foreground">{title}</h2>
          </div>
          <p className="text-muted-foreground max-md:text-xs">{description}</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {tierProfiles.map((profile) => (
            <ProfileCard key={profile._id} profile={profile} />
          ))}
        </div>
      </div>
    )
  }

  const renderSpaSection = (tier, icon, tierSpas, title, description) => {
    if (tierSpas.length === 0) return null

    return (
      <div className="mb-12">
        <div className={`p-6 max-md:p-2 rounded-lg mb-6 border-l-4 ${tier === 'elite' ? 'bg-yellow-50 border-yellow-400' :
          tier === 'premium' ? 'bg-purple-50 border-purple-400' :
            'bg-gray-50 border-gray-400'
          }`}>
          <div className={`flex items-center gap-2 mb-2 ${tier === 'elite' ? 'text-yellow-400' :
            tier === 'premium' ? 'text-purple-400' : 'text-gray-400'
            }`}>
            <span>{icon}</span>
            <h2 className="text-2xl max-md:text-sm font-bold text-foreground">{title}</h2>
          </div>
          <p className="text-muted-foreground max-md:text-xs">{description}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {tierSpas.map((spa) => (
            <SpaCard key={spa._id} profile={spa} />
          ))}
        </div>
      </div>
    )
  }

  const totalProfiles = packageProfiles.elite.length + packageProfiles.premium.length + packageProfiles.basic.length
  const totalSpas = packageSpas.elite.length + packageSpas.premium.length + packageSpas.basic.length

  const getPageTitle = () => {
    if (area) return `${area} Area`
    if (location) return `${location} Location`
    return `${county} County`
  }

  const getPageSubtitle = () => {
    if (area) return `Location: ${location}, County: ${county}`
    if (location) return `County: ${county}`
    return `Browse all locations in ${county} County`
  }

  // NEW: Tight loading state logic
  const showLoading = (loading && allProfiles.length === 0) || localLoading
  const showNoResults = !showLoading && allProfiles.length > 0 && totalProfiles === 0 && totalSpas === 0
  const showContent = !showLoading && !showNoResults

  return (
    <div className="min-h-screen bg-background">
      <div
        className="bg-cover bg-center py-10 px-4 relative"
        style={{ backgroundImage: `url('${bgImage}')` }}
      >
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="relative container mx-auto max-w-7xl z-10">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-text-inverse/80 hover:text-text-inverse mb-6 transition-colors"
          >
            <FiArrowLeft />
            Back
          </button>

          <h1 className="text-4xl font-bold text-text-inverse mb-2 capitalize">{getPageTitle()}</h1>
          <p className="text-lg text-text-inverse/70 capitalize">{getPageSubtitle()}</p>
        </div>

      </div>

      {/* Location Navigation */}
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {locationsList.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">
              {location ? 'Other Locations' : 'Browse by Location'}
            </h3>
            <div className="flex flex-wrap gap-2">
              {locationsList.map((loc) => (
                <button
                  key={loc}
                  onClick={() => handleLocationClick(loc)}
                  className={`px-4 py-1 rounded-full border transition-all text-sm cursor-pointer ${location === loc
                    ? 'bg-primary text-white border-primary'
                    : 'bg-white text-foreground border-border hover:bg-gray-50'
                    }`}
                >
                  {loc}
                </button>
              ))}
              {location && (
                <button
                  onClick={() => handleLocationClick('all')}
                  className="px-4 py-1 text-sm rounded-full border border-border bg-white text-foreground hover:bg-gray-50 transition-all cursor-pointer"
                >
                  All Locations
                </button>
              )}
            </div>
          </div>
        )}

        {areasList.length > 0 && (
          <div className="mb-0">
            <h3 className="text-lg font-semibold mb-4">
              {area ? 'Other Areas' : 'Browse by Area'}
            </h3>
            <div className="flex flex-wrap gap-2">
              {areasList.map((areaName) => (
                <button
                  key={areaName}
                  onClick={() => handleAreaClick(areaName)}
                  className={`px-4 py-1 rounded-full border transition-all text-sm cursor-pointer ${area === areaName
                    ? 'bg-primary text-white border-primary'
                    : 'bg-white text-foreground border-border hover:bg-gray-50'
                    }`}
                >
                  {areaName}
                </button>
              ))}
              {area && (
                <button
                  onClick={() => handleAreaClick('all')}
                  className="px-4 py-1 text-sm rounded-full border border-border bg-white text-foreground hover:bg-gray-50 transition-all"
                >
                  All Areas
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="container mx-auto px-4 py-4 max-w-7xl">
        {/* TIGHT LOADING STATE - Only show loading when truly loading AND no cached data */}
        {showLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="aspect-[3/4] bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        ) : showNoResults ? (
          <div className="text-center py-10">
            <p className="text-muted-foreground text-lg">
              No profiles found in this location.
            </p>
            <button
              onClick={() => navigate(-1)}
              className="mt-4 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all"
            >
              Go Back
            </button>
          </div>
        ) : showContent && (
          <>
            {/* VIP Spas */}
            {renderSpaSection(
              "elite",
              <IoStarOutline size={30} />,
              packageSpas.elite,
              "VIP LUXURY SPAS & PARLORS",
              `Step into ultimate luxury with ${area || location || county}'s most exclusive adult entertainment venues. These premium spas offer VIP treatment, elite services, and complete discretion for the discerning client.`
            )}

            {/* VIP Profiles */}
            {renderProfileSection(
              "elite",
              <MdOutlineLocalFireDepartment size={30} />,
              packageProfiles.elite,
              "VIP ESCORTS & MODELS",
              `These are the sexiest call girls, escorts, masseuses and OF models in ${area || location || county}. Step into a world of pleasure - these girls are guaranteed to satisfy your desires. With verified profiles, expect no surprises, just premium service.`
            )}

            {/* Premium Spas */}
            {renderSpaSection(
              "premium",
              <LuLeaf size={30} />,
              packageSpas.premium,
              "PREMIUM RELAXATION SPOTS",
              `Discover ${area || location || county}'s finest massage parlors and adult spas. These establishments offer professional services, clean facilities, and experienced staff for your complete satisfaction.`
            )}

            {/* Premium Profiles */}
            {renderProfileSection(
              "premium",
              <CgGirl size={30} />,
              packageProfiles.premium,
              "FEATURED INDEPENDENT MODELS",
              `Meet ${area || location || county}'s most sought-after independent escorts and models. These verified professionals offer premium companionship services with complete discretion and professional approach.`
            )}

            {/* Clear separation for regular profiles */}
            {(packageProfiles.elite.length > 0 || packageProfiles.premium.length > 0) &&
              packageProfiles.basic.length > 0 && (
                <div className="my-8 border-t border-border pt-8">
                  <h2 className="text-xl font-bold text-center text-muted-foreground mb-4">
                    REGULAR PROFILES
                  </h2>
                </div>
              )}

            {/* Basic Spas */}
            {renderSpaSection(
              "basic",
              <LuSpade size={30} />,
              packageSpas.basic,
              packageSpas.elite.length === 0 && packageSpas.premium.length === 0
                ? "QUALITY SPAS & MASSAGE CENTERS"
                : "QUALITY SPAS & MASSAGE CENTERS",
              `Reliable and affordable spa services in ${area || location || county}. These establishments provide quality massage and adult entertainment services with verified credentials and customer satisfaction.`
            )}

            {/* Basic Profiles */}
            {renderProfileSection(
              "basic",
              <GiSelfLove size={30} />,
              packageProfiles.basic,
              packageProfiles.elite.length === 0 && packageProfiles.premium.length === 0
                ? "LOCAL INDEPENDENT SERVICE PROVIDERS"
                : "LOCAL INDEPENDENT SERVICE PROVIDERS",
              `Browse through ${area || location || county}'s diverse selection of independent escorts, masseuses, and models. All profiles are verified to ensure safe and genuine connections.`
            )}
          </>
        )}

        <div className="border-t border-border">
        </div>


        {/* Comprehensive SEO Content Section */}
          <div className="container mx-auto px-4 pt-10 max-w-7xl max-md:px-2">
            <div className="bg-white rounded-2xl py-8 max-md:py-0">
              <div className="prose prose-lg max-w-none text-gray-700">
                <h2 className="text-3xl font-bold text-gray-900 mb-6 max-md:text-lg">
                  Find the Best Escorts, Call Girls & Adult Services in <span className="capitalize">{location || county}</span>
                </h2>

                <p className="text-xl leading-relaxed mb-6 max-md:text-sm">
                  Welcome to Alchemyst's exclusive directory of premium adult entertainment in <strong className="capitalize">{location || county}</strong>.
                  Whether you're looking for <strong>sexy escorts</strong>, <strong>professional masseuses</strong>,
                  <strong> exclusive OF-models</strong>, or <strong>luxurious spas</strong>, we've curated the finest selection
                  of verified service providers in the area.
                </p>

                <h3 className="text-2xl font-semibold text-gray-900 mt-8 mb-4 max-md:text-lg max-md:mt-4 max-md:mb-4">
                  Premium Adult Entertainment in <span className="capitalize">{location || county}</span>
                </h3>

                <p className="leading-relaxed mb-6">
                  <span className="capitalize">{location ? `${location}, ${county}` : county}</span>  is known for its vibrant nightlife and adult entertainment scene.
                  Our platform connects you with <strong>verified independent models</strong>, <strong>professional escorts</strong>,
                  and <strong>reputable spas</strong> who prioritize your satisfaction and discretion. Unlike other platforms,
                  Alchemyst ensures all profiles are genuine with <strong>no hook-up fees</strong> and direct communication.
                </p>

                <div className="grid md:grid-cols-2 gap-8 my-8">
                  <div className="bg-blue-50 p-6 rounded-lg border border-blue-200 max-md:p-4">
                    <h4 className="text-xl font-semibold text-blue-900 mb-4 flex items-center gap-2 max-md:text-lg">
                      <GiCurlyMask />
                      What to Expect in <span className="capitalize">{location || county}</span>
                    </h4>
                    <ul className="space-y-3 text-blue-800">
                      <li className="flex items-start gap-3">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                        <span><strong>Verified Profiles</strong> - All models and spas are thoroughly verified</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                        <span><strong>Direct Contact</strong> - No middlemen, communicate directly</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                        <span><strong>Complete Discretion</strong> - Your privacy is our priority</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                        <span><strong>Competitive Rates</strong> - Fair pricing with no hidden costs</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-purple-50 p-6 rounded-lg border border-purple-200 max-md:p-4">
                    <h4 className="text-xl font-semibold text-purple-900 mb-4 flex items-center gap-2 max-md:text-lg">
                      <GiDualityMask />
                      Popular Services
                    </h4>
                    <ul className="space-y-3 text-purple-800">
                      <li className="flex items-start gap-3">
                        <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></span>
                        <span><strong>Escort Services</strong> - Premium companionship</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></span>
                        <span><strong>Therapeutic Massage</strong> - Professional bodywork</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></span>
                        <span><strong>Spa Experiences</strong> - Luxury adult entertainment</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></span>
                        <span><strong>OF-Model Content</strong> - Exclusive digital experiences</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <h3 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">
                  How to Connect with {location || county} Service Providers
                </h3>

                <p className="leading-relaxed mb-6">
                  Getting in touch with our verified escorts, masseuses, and spas in <strong className="capitalize">{location || county}</strong> is simple and straightforward.
                  Browse through our carefully curated profiles, check availability, and contact directly via phone or WhatsApp.
                  All our providers offer flexible scheduling for incalls and outcalls, ensuring you get the service you want when you want it.
                </p>

                <div className="bg-gradient-to-r from-primary to-purple-600 rounded-2xl p-8 text-white my-8 max-md:p-4">
                  <h4 className="text-2xl font-bold mb-4 text-center">
                    Join {location || county}'s Premier Adult Entertainment Community
                  </h4>
                  <p className="text-lg text-center mb-6 opacity-90 max-md:text-sm">
                    Whether you're a service provider looking to reach more clients in {location || county}&nbsp;
                    or someone seeking premium adult entertainment, Alchemyst offers the perfect platform
                    for discreet, professional connections.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                      onClick={() => navigate('/signup')}
                      className="px-8 py-3 bg-white text-primary font-bold rounded-lg hover:bg-gray-100 transition-all shadow-lg cursor-pointer"
                    >
                      Find Services in {location || county}
                    </button>
                    <button
                      onClick={() => navigate('/signup?type=provider')}
                      className="px-8 py-3 border-2 border-white text-white font-bold rounded-lg hover:bg-white hover:text-primary transition-all cursor-pointer"
                    >
                      List Your Services
                    </button>
                  </div>
                </div>

                <div className="mt-8 p-6 bg-gray-100 rounded-lg border-l-4 border-primary">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <LuSearchCheck />
                    Popular Searches in {location || county}:
                  </h4>
                  <div className="flex flex-wrap gap-2 text-sm">
                    <span className="bg-white px-3 py-1 rounded-full border">escorts {location || county}</span>
                    <span className="bg-white px-3 py-1 rounded-full border">call girls {location || county}</span>
                    <span className="bg-white px-3 py-1 rounded-full border">massage services {location || county}</span>
                    <span className="bg-white px-3 py-1 rounded-full border">spas {location || county}</span>
                    <span className="bg-white px-3 py-1 rounded-full border">of-models {location || county}</span>
                    <span className="bg-white px-3 py-1 rounded-full border">adult entertainment {location || county}</span>
                    <span className="bg-white px-3 py-1 rounded-full border">independent models {location || county}</span>
                    <span className="bg-white px-3 py-1 rounded-full border">hookup {location || county}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
      </div>
    </div>
  )
}