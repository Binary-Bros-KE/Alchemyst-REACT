"use client"

import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { FiSearch, FiMapPin } from "react-icons/fi"
import { toast } from "react-hot-toast"
import locationsData from "../../data/counties.json"
import ProfileCard from "./components/ProfileCard"
import SpaCard from "./components/SpaCard"
import CategoryButtons from "./components/CategoryButtons"
import PopularAreas from "./components/PopularAreas"
import FilterBar from "./components/FilterBar"

const API_URL = import.meta.env.VITE_API_URL

export default function Home() {
  const navigate = useNavigate()
  const [selectedCounty, setSelectedCounty] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)

  const [profiles, setProfiles] = useState([])
  const [spas, setSpas] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const fetchingRef = useRef(false)
  const [filters, setFilters] = useState({
    userType: "all", // all, escort, masseuse, of-model
    gender: "all", // all, female, trans
    bodyType: "all",
    breastSize: "all",
  })

  // Replace the scroll effect with:
  useEffect(() => {
    const handleScroll = () => {
      // More strict conditions to prevent unnecessary calls
      const scrolledToBottom =
        window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - 500

      if (scrolledToBottom && !loading && hasMore) {
        setPage((prev) => prev + 1)
      }
    }

    // Only add listener if there's more to load
    if (hasMore && !loading) {
      window.addEventListener("scroll", handleScroll)
      return () => window.removeEventListener("scroll", handleScroll)
    }
  }, [loading, hasMore])

  // Change fetchProfiles to accept page parameter
  const fetchProfiles = async (pageNum = page) => {
    if (fetchingRef.current) {
      console.log('Fetch already in progress, skipping...')
      return
    }

    try {
      fetchingRef.current = true
      setLoading(true)
      const queryParams = new URLSearchParams({
        page: pageNum.toString(),
        limit: "20",
        ...(selectedCounty !== "all" && { county: selectedCounty }), // Only add if not "all"
        ...(filters.userType !== "all" && { userType: filters.userType }),
        ...(filters.gender !== "all" && { gender: filters.gender }),
        ...(filters.bodyType !== "all" && { bodyType: filters.bodyType }),
        ...(filters.breastSize !== "all" && { breastSize: filters.breastSize }),
      })

      const response = await fetch(`${API_URL}/profiles?${queryParams}`, {
        headers: { "Content-Type": "application/json" },
      })

      const data = await response.json()
      console.log(`data`, data);

      if (data.success && data.profiles) {
        const newSpas = data.profiles.filter((p) => p.userType === "spa")
        const newProfiles = data.profiles.filter((p) => p.userType !== "spa")

        if (pageNum === 1) { // Use pageNum instead of page
          setProfiles(newProfiles)
          setSpas(newSpas)
        } else {
          setProfiles((prev) => [...prev, ...newProfiles])
          setSpas((prev) => [...prev, ...newSpas])
        }

        setHasMore(data.pagination?.hasMore ?? false)
      } else {
        setHasMore(false)
      }
    } catch (error) {
      toast.error("Failed to load profiles")
      console.error("[v0] Error fetching profiles:", error)
      setHasMore(false)
    } finally {
      setLoading(false)
      fetchingRef.current = false
    }
  }

  // Then the useEffect becomes:
  useEffect(() => {
    fetchProfiles(page)
  }, [page, filters, selectedCounty])



const handleSearchChange = (value) => {
  setSearchQuery(value)

  if (value.length < 2) {
    setSuggestions([])
    setShowSuggestions(false)
    return
  }

  // Add this check
  if (selectedCounty === "all") {
    setSuggestions([])
    setShowSuggestions(false)
    return
  }

  const county = locationsData.find((c) => c.name === selectedCounty)
  if (!county) return

    const normalizedQuery = value.toLowerCase().replace(/\s+/g, "")
    const matches = []

    county.sub_counties.forEach((location) => {
      const normalizedLocation = location.toLowerCase().replace(/\s+/g, "")
      if (normalizedLocation.includes(normalizedQuery)) {
        matches.push({ type: "location", value: location })
      }
    })

    if (county.popular_areas) {
      county.popular_areas.forEach((area) => {
        const normalizedArea = area.toLowerCase().replace(/\s+/g, "")
        if (normalizedArea.includes(normalizedQuery)) {
          matches.push({ type: "area", value: area })
        }
      })
    }

    setSuggestions(matches.slice(0, 8))
    setShowSuggestions(matches.length > 0)
  }

  const handleSuggestionClick = (suggestion) => {
    if (suggestion.type === "location") {
      navigate(`/location/${selectedCounty}/${suggestion.value}`)
    } else {
      navigate(`/location/${selectedCounty}?area=${suggestion.value}`)
    }
  }

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters)
    setPage(1)
    setProfiles([])
    setSpas([])
    setHasMore(true) // Add this - reset hasMore when filters change
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-to-b from-neutral-900 to-background py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-text-inverse mb-4">Home of independent escorts</h1>
            <p className="text-lg text-text-inverse/70">
              Listing thousands of independent adult entertainers. Escorts, massage, and much more.
            </p>
          </motion.div>

          <div className="bg-card rounded-2xl p-6 shadow-xl">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <div className="flex gap-2">
                  <select
                    value={selectedCounty}
                    onChange={(e) => {
                      setSelectedCounty(e.target.value)
                      setPage(1)
                      setProfiles([])
                      setSpas([])
                      setHasMore(true)
                    }}
                    className="px-4 py-3 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="all">All Counties</option> {/* Add this */}
                    {locationsData.map((county) => (
                      <option key={county.code} value={county.name}>
                        {county.name}
                      </option>
                    ))}
                  </select>

                  <div className="flex-1 relative">
                    <FiMapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search by location or area..."
                      value={searchQuery}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                      onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                      className="w-full pl-12 pr-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />

                    {showSuggestions && suggestions.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-lg shadow-xl z-50 max-h-64 overflow-y-auto">
                        {suggestions.map((suggestion, index) => (
                          <button
                            key={index}
                            onClick={() => handleSuggestionClick(suggestion)}
                            className="w-full px-4 py-3 text-left hover:bg-muted transition-colors flex items-center gap-2"
                          >
                            <FiMapPin className="text-primary" />
                            <span className="text-foreground">{suggestion.value}</span>
                            <span className="text-xs text-muted-foreground ml-auto">
                              {suggestion.type === "location" ? "Location" : "Area"}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  if (searchQuery) {
                    handleSearchChange(searchQuery)
                  }
                }}
                className="px-8 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
              >
                <FiSearch />
                Search
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <CategoryButtons onCategorySelect={(category) => handleFilterChange({ ...filters, userType: category })} />

        {selectedCounty !== "all" && <PopularAreas county={selectedCounty} />}

        <FilterBar filters={filters} onFilterChange={handleFilterChange} />

        {spas.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-foreground">Featured Spas & Businesses</h2>
              <button
                onClick={() => navigate(`/location/${selectedCounty}?type=spa`)}
                className="text-primary hover:text-primary/80 font-medium"
              >
                See all →
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {spas.slice(0, 4).map((spa) => (
                <SpaCard key={spa._id} profile={spa} />
              ))}
            </div>
          </div>
        )}

        <div>
          <h2 className="text-2xl font-bold text-foreground mb-6">
            Available Now {selectedCounty !== "all" ? `in ${selectedCounty}` : ""}
          </h2>

          {loading && page === 1 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="aspect-[3/4] bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
          ) : profiles.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground text-lg">No profiles found. Try adjusting your filters.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {profiles.map((profile) => (
                  <ProfileCard key={profile._id} profile={profile} />
                ))}
              </div>

              {loading && page > 1 && (
                <div className="flex justify-center py-8">
                  <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              )}

              {!hasMore && profiles.length > 0 && (
                <p className="text-center text-muted-foreground py-8">You've reached the end of the list</p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
