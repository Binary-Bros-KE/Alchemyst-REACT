"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { FiSearch, FiMapPin, FiRefreshCw } from "react-icons/fi"

import { useProfiles } from "../../hooks/useProfiles"
import locationsData from "../../data/counties.json"
import ProfileCard from "../../components/ProfileCard"
import SpaCard from "../../components/SpaCard"
import CategoryButtons from "./components/CategoryButtons"
import PopularAreas from "./components/PopularAreas"
import FilterBar from "../../components/FilterBar"

export default function Home() {
  const navigate = useNavigate()
  const {
    profiles,
    spas,
    loading,
    error,
    updateFilters,
    updateCounty,
    refreshProfiles,
    filters,
    selectedCounty,
    totalProfiles,
    displayedCount,
    lastFetchTime,
    isStale
  } = useProfiles()

  const [searchQuery, setSearchQuery] = useState("")
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)

  // Search suggestions
  const handleSearchChange = (value) => {
    setSearchQuery(value)

    if (value.length < 2) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

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
      navigate(`/${selectedCounty}/${suggestion.value}`)
    } else {
      navigate(`/${selectedCounty}?area=${suggestion.value}`)
    }
  }

  const handleFilterChange = (newFilters) => {
    updateFilters(newFilters)
  }

  const formatLastUpdate = () => {
    if (!lastFetchTime) return "Never"
    const minutes = Math.floor((Date.now() - lastFetchTime) / 60000)
    if (minutes === 0) return "Just now"
    if (minutes === 1) return "1 minute ago"
    if (minutes < 60) return `${minutes} minutes ago`
    return "Over an hour ago"
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-neutral-900 to-background py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-4">
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
                    onChange={(e) => updateCounty(e.target.value)}
                    className="px-4 py-3 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="all">All Counties</option>
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

      {/* Content Section */}
      <div className="container mx-auto px-4 py-4 max-w-7xl">
        {/* Refresh Button and Status */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <button
              onClick={refreshProfiles}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Refresh profiles data"
            >
              <FiRefreshCw className={`${loading ? 'animate-spin' : ''}`} />
              <span className="text-sm">Refresh</span>
            </button>
            
            <div className="text-sm text-muted-foreground">
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  Loading profiles...
                </span>
              ) : (
                <span>
                  Last updated: {formatLastUpdate()}
                  {isStale && <span className="text-orange-500 ml-2">(Data may be stale)</span>}
                </span>
              )}
            </div>
          </div>

          {totalProfiles > 0 && (
            <div className="text-sm text-muted-foreground">
              {displayedCount} of {totalProfiles} profiles
            </div>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700">{error}</p>
            <button
              onClick={refreshProfiles}
              className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
            >
              Try again
            </button>
          </div>
        )}

        <CategoryButtons onCategorySelect={(category) => handleFilterChange({ ...filters, userType: category })} />

        {selectedCounty && selectedCounty !== "all" && <PopularAreas county={selectedCounty} />}

        <FilterBar filters={filters} onFilterChange={handleFilterChange} />

        {/* Spas Section */}
        {spas.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-foreground">Featured Spas & Businesses</h2>
              <button
                onClick={() => navigate(`/${selectedCounty}?type=spa`)}
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

        {/* Profiles Section */}
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-6">
            Available Now {selectedCounty !== "all" ? `in ${selectedCounty}` : ""}
            {profiles.length > 0 && (
              <span className="text-lg text-muted-foreground font-normal ml-2">
                ({profiles.length} {profiles.length === 1 ? 'profile' : 'profiles'})
              </span>
            )}
          </h2>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="aspect-[3/4] bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
          ) : profiles.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground text-lg">
                {totalProfiles === 0 
                  ? "No profiles available. Check back later!" 
                  : "No profiles found. Try adjusting your filters."}
              </p>
              {totalProfiles > 0 && displayedCount === 0 && (
                <button
                  onClick={() => updateFilters({ userType: 'all', gender: 'all', bodyType: 'all', breastSize: 'all' })}
                  className="mt-4 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 max-md:gap-2">
              {profiles.map((profile) => (
                <ProfileCard key={profile._id} profile={profile} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}