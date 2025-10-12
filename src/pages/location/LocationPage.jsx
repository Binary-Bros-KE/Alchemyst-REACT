"use client"

import { useState, useEffect } from "react"
import { useParams, useSearchParams, useRouter } from "next/navigation"
import { FiArrowLeft } from "react-icons/fi"
import { toast } from "react-hot-toast"
import ProfileCard from "../../../../components/home/ProfileCard"
import SpaCard from "../../../../components/home/SpaCard"
import FilterBar from "../../../../components/home/FilterBar"

const API_URL = process.env.NEXT_PUBLIC_API_URL

export default function LocationPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()

  const county = params.county
  const location = params.location
  const area = searchParams.get("area")
  const type = searchParams.get("type")

  const [profiles, setProfiles] = useState({ elite: [], premium: [], basic: [] })
  const [spas, setSpas] = useState({ elite: [], premium: [], basic: [] })
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [filters, setFilters] = useState({
    gender: "all",
    bodyType: "all",
    breastSize: "all",
  })

  useEffect(() => {
    fetchProfiles()
  }, [page, filters, county, location, area])

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - 500 &&
        !loading &&
        hasMore
      ) {
        setPage((prev) => prev + 1)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [loading, hasMore])

  const fetchProfiles = async () => {
    try {
      setLoading(true)
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: "20",
        county,
        location,
        ...(area && { area }),
        ...(type && { userType: type }),
        ...(filters.gender !== "all" && { gender: filters.gender }),
        ...(filters.bodyType !== "all" && { bodyType: filters.bodyType }),
        ...(filters.breastSize !== "all" && { breastSize: filters.breastSize }),
      })

      const response = await fetch(`${API_URL}/profiles/location?${queryParams}`)
      const data = await response.json()

      if (data.success) {
        const newProfiles = { elite: [], premium: [], basic: [] }
        const newSpas = { elite: [], premium: [], basic: [] }

        data.profiles.forEach((profile) => {
          const activePackage = profile.purchasedPackages?.find((p) => p.isActive)
          const tier = activePackage?.packageType || "basic"

          if (profile.userType === "spa") {
            newSpas[tier].push(profile)
          } else {
            newProfiles[tier].push(profile)
          }
        })

        if (page === 1) {
          setProfiles(newProfiles)
          setSpas(newSpas)
        } else {
          setProfiles((prev) => ({
            elite: [...prev.elite, ...newProfiles.elite],
            premium: [...prev.premium, ...newProfiles.premium],
            basic: [...prev.basic, ...newProfiles.basic],
          }))
          setSpas((prev) => ({
            elite: [...prev.elite, ...newSpas.elite],
            premium: [...prev.premium, ...newSpas.premium],
            basic: [...prev.basic, ...newSpas.basic],
          }))
        }

        setHasMore(data.profiles.length === 20)
      }
    } catch (error) {
      toast.error("Failed to load profiles")
      console.error("[v0] Error fetching profiles:", error)
    } finally {
      setLoading(false)
    }
  }

  const renderProfileSection = (tier, tierProfiles, title, description) => {
    if (tierProfiles.length === 0) return null

    return (
      <div className="mb-12">
        <div className="bg-gradient-to-r from-primary/20 to-transparent p-6 rounded-lg mb-6">
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
        <div className="bg-gradient-to-r from-primary/20 to-transparent p-6 rounded-lg mb-6">
          <h2 className="text-2xl font-bold text-foreground mb-2">{title}</h2>
          <p className="text-muted-foreground">{description}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tierSpas.map((spa) => (
            <SpaCard key={spa._id} profile={spa} />
          ))}
        </div>
      </div>
    )
  }

  const totalProfiles = profiles.elite.length + profiles.premium.length + profiles.basic.length
  const totalSpas = spas.elite.length + spas.premium.length + spas.basic.length

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-to-b from-neutral-900 to-background py-12 px-4">
        <div className="container mx-auto max-w-7xl">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-text-inverse/80 hover:text-text-inverse mb-6 transition-colors"
          >
            <FiArrowLeft />
            Back
          </button>

          <h1 className="text-4xl font-bold text-text-inverse mb-2">{area ? `${area}, ${location}` : location}</h1>
          <p className="text-lg text-text-inverse/70">{county} County</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <FilterBar filters={filters} onFilterChange={setFilters} />

        {loading && page === 1 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="aspect-[3/4] bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        ) : totalProfiles === 0 && totalSpas === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-lg">No profiles found in this location.</p>
          </div>
        ) : (
          <>
            {type === "spa" || !type ? (
              <>
                {renderSpaSection(
                  "elite",
                  spas.elite,
                  "VIP Businesses",
                  "Premium verified businesses with priority placement and exclusive features",
                )}
                {renderSpaSection(
                  "premium",
                  spas.premium,
                  "Premium Businesses",
                  "Featured businesses with enhanced visibility",
                )}
                {renderSpaSection("basic", spas.basic, "Standard Businesses", "Quality verified businesses")}
              </>
            ) : null}

            {type !== "spa" ? (
              <>
                {renderProfileSection(
                  "elite",
                  profiles.elite,
                  "VIP Profiles",
                  "Premium verified profiles with priority placement, boosted visibility, and exclusive features",
                )}
                {renderProfileSection(
                  "premium",
                  profiles.premium,
                  "Premium Profiles",
                  "Featured profiles with enhanced visibility and priority in search results",
                )}
                {renderProfileSection("basic", profiles.basic, "Standard Profiles", "Quality verified profiles")}
              </>
            ) : null}

            {loading && page > 1 && (
              <div className="flex justify-center py-8">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            )}

            {!hasMore && (totalProfiles > 0 || totalSpas > 0) && (
              <p className="text-center text-muted-foreground py-8">You've reached the end of the list</p>
            )}
          </>
        )}
      </div>
    </div>
  )
}
