"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate, useLocation } from "react-router-dom"
import { FiArrowLeft } from "react-icons/fi"
import { toast } from "react-hot-toast"
import { useSelector, useDispatch } from "react-redux"
import ProfileCard from "../../components/ProfileCard"
import SpaCard from "../../components/SpaCard"
import FilterBar from "../../components/FilterBar"
import { fetchInitialProfiles, applyFilters } from "../../redux/profilesSlice"

const API_URL = import.meta.env.VITE_API_URL

export default function LocationPage() {
  const params = useParams()
  const locationHook = useLocation()
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const { county, location, area } = params

  // Get data from Redux store - updated to match new structure
  const { allProfiles, filteredProfiles, filteredSpas, loading } = useSelector(state => state.profiles)
  
  const [locationsList, setLocationsList] = useState([])
  const [areasList, setAreasList] = useState([])
  const [packageProfiles, setPackageProfiles] = useState({ elite: [], premium: [], basic: [] })
  const [packageSpas, setPackageSpas] = useState({ elite: [], premium: [], basic: [] })

  useEffect(() => {
    // If no profiles loaded yet, fetch initial data
    if (allProfiles.length === 0) {
      dispatch(fetchInitialProfiles())
    }
  }, [dispatch, allProfiles.length])

  useEffect(() => {
    if (allProfiles.length > 0) {
      filterProfiles()
      extractLocationsAndAreas()
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
      navigate(`/${county}`)
    } else {
      navigate(`/${county}/${loc}`)
    }
  }

  const handleAreaClick = (areaName) => {
    if (areaName === 'all') {
      navigate(`/${county}/${location}`)
    } else {
      navigate(`/${county}/${location}/${areaName}`)
    }
  }

  const renderProfileSection = (tier, tierProfiles, title, description) => {
    if (tierProfiles.length === 0) return null

    return (
      <div className="mb-12">
        <div className={`p-6 rounded-lg mb-6 border-l-4 ${tier === 'elite' ? 'bg-yellow-50 border-yellow-400' :
          tier === 'premium' ? 'bg-purple-50 border-purple-400' :
            'bg-gray-50 border-gray-400'
          }`}>
          <h2 className="text-2xl font-bold text-foreground mb-2">{title}</h2>
          <p className="text-muted-foreground">{description}</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {tierProfiles.map((profile) => (
            <ProfileCard key={profile._id} profile={profile} />
          ))}
        </div>
      </div>
    )
  }

  const renderSpaSection = (tier, tierSpas, title, description) => {
    if (tierSpas.length === 0) return null

    return (
      <div className="mb-12">
        <div className={`p-6 rounded-lg mb-6 border-l-4 ${tier === 'elite' ? 'bg-yellow-50 border-yellow-400' :
          tier === 'premium' ? 'bg-purple-50 border-purple-400' :
            'bg-gray-50 border-gray-400'
          }`}>
          <h2 className="text-2xl font-bold text-foreground mb-2">{title}</h2>
          <p className="text-muted-foreground">{description}</p>
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

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-to-b from-neutral-900 to-background py-10 px-4">
        <div className="container mx-auto max-w-7xl">
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
                  className="px-4 py-1 text-sm rounded-full border border-border bg-white text-foreground hover:bg-gray-50 transition-all"
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
        {/* IMPROVED LOADING STATE - Only show loading when truly loading AND no data */}
        {loading && allProfiles.length === 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="aspect-[3/4] bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        ) : totalProfiles === 0 && totalSpas === 0 ? (
          <div className="text-center py-10">
            <p className="text-muted-foreground text-lg">
              {allProfiles.length === 0 ? "Loading profiles..." : "No profiles found in this location."}
            </p>
            {allProfiles.length > 0 && (
              <button
                onClick={() => navigate(-1)}
                className="mt-4 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all"
              >
                Go Back
              </button>
            )}
          </div>
        ) : (
          <>
            {/* VIP Spas */}
            {renderSpaSection(
              "elite",
              packageSpas.elite,
              "⭐ VIP BUSINESSES",
              "Premium verified businesses with priority placement and exclusive features"
            )}

            {/* VIP Profiles */}
            {renderProfileSection(
              "elite",
              packageProfiles.elite,
              "⭐ VIP PROFILES",
              "Premium verified profiles with priority placement, boosted visibility, and exclusive features"
            )}

            {/* Premium Spas */}
            {renderSpaSection(
              "premium",
              packageSpas.premium,
              "✨ PREMIUM BUSINESSES",
              "Featured businesses with enhanced visibility"
            )}

            {/* Premium Profiles */}
            {renderProfileSection(
              "premium",
              packageProfiles.premium,
              "✨ PREMIUM PROFILES",
              "Featured profiles with enhanced visibility and priority in search results"
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
              packageSpas.basic,
              packageSpas.elite.length === 0 && packageSpas.premium.length === 0
                ? "BUSINESSES"
                : "STANDARD BUSINESSES",
              "Quality verified businesses"
            )}

            {/* Basic Profiles */}
            {renderProfileSection(
              "basic",
              packageProfiles.basic,
              packageProfiles.elite.length === 0 && packageProfiles.premium.length === 0
                ? "PROFILES"
                : "STANDARD PROFILES",
              "Quality verified profiles"
            )}
          </>
        )}
      </div>
    </div>
  )
}