"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { FiMapPin, FiSearch } from "react-icons/fi"
import { searchLocations, getAllCounties } from "../../utils/locationUtils"

export default function LocationSearch() {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [county, setCounty] = useState("Nairobi")
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const searchRef = useRef(null)

  const counties = getAllCounties()

  // Handle search input
  useEffect(() => {
    if (query.length >= 2) {
      const results = searchLocations(query)
      setSuggestions(results)
      setShowSuggestions(true)
    } else {
      setSuggestions([])
      setShowSuggestions(false)
    }
  }, [query])

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Handle location selection
  const handleLocationSelect = (location) => {
    setQuery(location.displayName)
    setShowSuggestions(false)

    // Redirect to location page
    const params = new URLSearchParams()
    params.set("county", location.county)
    if (location.location) params.set("location", location.location)
    if (location.area) params.set("area", location.area)

    router.push(`/browse?${params.toString()}`)
  }

  // Handle search button click
  const handleSearch = () => {
    if (query) {
      const params = new URLSearchParams()
      params.set("county", county)
      params.set("search", query)
      router.push(`/browse?${params.toString()}`)
    } else {
      const params = new URLSearchParams()
      params.set("county", county)
      router.push(`/browse?${params.toString()}`)
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row gap-3">
        {/* County Dropdown */}
        <div className="relative">
          <select
            value={county}
            onChange={(e) => setCounty(e.target.value)}
            className="w-full md:w-48 h-14 px-4 pr-10 bg-white border-2 border-gray-200 rounded-xl text-gray-900 font-medium focus:outline-none focus:border-pink-500 transition-colors appearance-none cursor-pointer"
          >
            {counties.map((c) => (
              <option key={c.code} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
          <FiMapPin className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
        </div>

        {/* Location Search Input */}
        <div ref={searchRef} className="relative flex-1">
          <div className="relative">
            <FiMapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => query.length >= 2 && setShowSuggestions(true)}
              placeholder="Search by area or location..."
              className="w-full h-14 pl-12 pr-4 bg-white border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-pink-500 transition-colors"
            />
          </div>

          {/* Suggestions Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute z-50 w-full mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-xl max-h-80 overflow-y-auto">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleLocationSelect(suggestion)}
                  className="w-full px-4 py-3 text-left hover:bg-pink-50 transition-colors flex items-center gap-3 border-b border-gray-100 last:border-0"
                >
                  <FiMapPin className="text-pink-500 flex-shrink-0" size={18} />
                  <div>
                    <div className="font-medium text-gray-900">{suggestion.name}</div>
                    <div className="text-sm text-gray-500">{suggestion.county}</div>
                  </div>
                  <span className="ml-auto text-xs font-medium text-pink-500 uppercase">{suggestion.type}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Search Button */}
        <button
          onClick={handleSearch}
          className="h-14 px-8 bg-pink-500 hover:bg-pink-600 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
        >
          <FiSearch size={20} />
          <span className="hidden md:inline">Search</span>
        </button>
      </div>
    </div>
  )
}
