/**
 * Smart URL utilities that work dynamically without manual mappings
 */

// SEO keywords to append to county/location URLs
const SEO_SUFFIXES = {
  county: ['escorts', 'massage', 'call-girls'],
  location: ['escorts'],
  area: []
}

/**
 * Convert county name to SEO-friendly URL
 * "Nairobi" → "nairobi-escorts-massage-call-girls"
 */
export const countyToUrl = (countyName) => {
  if (!countyName) return ''
  
  const base = countyName
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
  
  const suffix = SEO_SUFFIXES.county.join('-')
  return `${base}-${suffix}`
}

/**
 * Extract county name from SEO URL
 * "nairobi-escorts-massage-call-girls" → "Nairobi"
 * "nairobi" → "Nairobi"
 */
export const urlToCounty = (urlSlug) => {
  if (!urlSlug) return null
  
  // Split by hyphen and get the first part (before SEO keywords)
  const parts = urlSlug.toLowerCase().split('-')
  
  // Remove common SEO keywords
  const seoKeywords = ['escorts', 'massage', 'call', 'girls', 'services', 'spa', 'hot', 'independent']
  const countyParts = parts.filter(part => !seoKeywords.includes(part))
  
  // Take the first part(s) as county name
  // Handle multi-word counties like "Trans Nzoia"
  const countyName = countyParts[0] || parts[0]
  
  // Capitalize first letter
  return countyName.charAt(0).toUpperCase() + countyName.slice(1)
}

/**
 * Convert location name to SEO-friendly URL
 * "South B" → "south-b-escorts"
 * "Westlands" → "westlands-escorts"
 */
export const locationToUrl = (locationName) => {
  if (!locationName) return ''
  
  const base = locationName
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
  
  const suffix = SEO_SUFFIXES.location.join('-')
  return suffix ? `${base}-${suffix}` : base
}

/**
 * Extract location name from SEO URL
 * "south-b-escorts" → "South B"
 * "westlands-escorts" → "Westlands"
 */
export const urlToLocation = (urlSlug) => {
  if (!urlSlug) return null
  
  // Split by hyphen
  const parts = urlSlug.toLowerCase().split('-')
  
  // Remove common SEO keywords from the end
  const seoKeywords = ['escorts', 'massage', 'call', 'girls', 'services', 'spa']
  const locationParts = parts.filter(part => !seoKeywords.includes(part))
  
  // Join remaining parts and capitalize each word
  return locationParts
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

/**
 * Convert area name to URL-friendly slug
 * "Kilimani Area" → "kilimani-area"
 */
export const areaToUrl = (areaName) => {
  if (!areaName) return ''
  
  return areaName
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
}

/**
 * Extract area name from URL slug
 * "kilimani-area" → "Kilimani Area"
 */
export const urlToArea = (urlSlug) => {
  if (!urlSlug) return null
  
  return urlSlug
    .split('-')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

/**
 * Generate full SEO path for navigation
 */
export const generateSeoPath = ({ county, location, area }) => {
  const parts = []
  
  if (county) {
    parts.push(countyToUrl(county))
  }
  
  if (location) {
    parts.push(locationToUrl(location))
  }
  
  if (area) {
    parts.push(areaToUrl(area))
  }
  
  return '/' + parts.join('/')
}

/**
 * Parse SEO path to get actual names
 * "/nairobi-escorts-massage-call-girls/westlands-escorts/kilimani"
 * → { county: "Nairobi", location: "Westlands", area: "Kilimani" }
 */
export const parseSeoPath = (path) => {
  const parts = path.split('/').filter(Boolean)
  
  return {
    county: parts[0] ? urlToCounty(parts[0]) : null,
    location: parts[1] ? urlToLocation(parts[1]) : null,
    area: parts[2] ? urlToArea(parts[2]) : null
  }
}

/**
 * Validate if URL matches actual data (optional - for 404 handling)
 */
export const validateCountyUrl = (urlSlug, countyName) => {
  const extractedCounty = urlToCounty(urlSlug)
  return extractedCounty.toLowerCase() === countyName.toLowerCase()
}