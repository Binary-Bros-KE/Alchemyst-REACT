import locationsData from "../data/locations.json"

/**
 * Normalize a string for fuzzy matching
 * Removes extra spaces, converts to lowercase, removes special characters
 */
export const normalizeString = (str) => {
  if (!str) return ""
  return str
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "") // Remove all spaces
    .replace(/[^a-z0-9]/g, "") // Remove special characters
}

/**
 * Check if two location strings match (fuzzy matching)
 * Handles variations like "southb", "south b", " south b "
 */
export const locationsMatch = (location1, location2) => {
  const normalized1 = normalizeString(location1)
  const normalized2 = normalizeString(location2)

  return normalized1 === normalized2 || normalized1.includes(normalized2) || normalized2.includes(normalized1)
}

/**
 * Search locations based on query
 * Returns matching counties and sub_counties
 */
export const searchLocations = (query) => {
  if (!query || query.length < 2) return []

  const normalizedQuery = normalizeString(query)
  const results = []

  locationsData.forEach((county) => {
    // Check if county name matches
    if (normalizeString(county.name).includes(normalizedQuery)) {
      results.push({
        type: "county",
        name: county.name,
        displayName: county.name,
        county: county.name,
      })
    }

    // Check sub_counties
    county.sub_counties.forEach((subCounty) => {
      if (normalizeString(subCounty).includes(normalizedQuery)) {
        results.push({
          type: "location",
          name: subCounty,
          displayName: `${subCounty}, ${county.name}`,
          county: county.name,
          location: subCounty,
        })
      }
    })

    // Check popular areas if they exist (for Nairobi)
    if (county.popular_areas) {
      county.popular_areas.forEach((area) => {
        if (normalizeString(area).includes(normalizedQuery)) {
          results.push({
            type: "area",
            name: area,
            displayName: `${area}, ${county.name}`,
            county: county.name,
            area: area,
          })
        }
      })
    }
  })

  return results.slice(0, 10) // Limit to 10 results
}

/**
 * Get all counties
 */
export const getAllCounties = () => {
  return locationsData.map((county) => ({
    name: county.name,
    capital: county.capital,
    code: county.code,
  }))
}

/**
 * Get sub_counties for a specific county
 */
export const getSubCounties = (countyName) => {
  const county = locationsData.find((c) => normalizeString(c.name) === normalizeString(countyName))
  return county ? county.sub_counties : []
}

/**
 * Get popular areas for a county (if available)
 */
export const getPopularAreas = (countyName) => {
  const county = locationsData.find((c) => normalizeString(c.name) === normalizeString(countyName))
  return county?.popular_areas || []
}

/**
 * Filter profiles by location with fuzzy matching
 */
export const filterProfilesByLocation = (profiles, searchLocation) => {
  if (!searchLocation) return profiles

  return profiles.filter((profile) => {
    const { county, location, area } = profile.location || {}

    // Check county match
    if (locationsMatch(county, searchLocation)) return true

    // Check location (sub_county) match
    if (locationsMatch(location, searchLocation)) return true

    // Check area match (array)
    if (area && Array.isArray(area)) {
      return area.some((a) => locationsMatch(a, searchLocation))
    }

    return false
  })
}

/**
 * Sort profiles by area priority
 * Profiles with matching area appear first
 */
export const sortProfilesByAreaPriority = (profiles, priorityArea) => {
  if (!priorityArea) return profiles

  return [...profiles].sort((a, b) => {
    const aHasArea = a.location?.area?.some((area) => locationsMatch(area, priorityArea))
    const bHasArea = b.location?.area?.some((area) => locationsMatch(area, priorityArea))

    if (aHasArea && !bHasArea) return -1
    if (!aHasArea && bHasArea) return 1
    return 0
  })
}
