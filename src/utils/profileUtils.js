/**
 * Get package priority for sorting
 * Elite = 3, Premium = 2, Basic = 1, None = 0
 */
export const getPackagePriority = (profile) => {
  const packageType = profile.currentPackage?.packageType
  const status = profile.currentPackage?.status

  if (status !== "active") return 0

  switch (packageType) {
    case "elite":
      return 3
    case "premium":
      return 2
    case "basic":
      return 1
    default:
      return 0
  }
}

/**
 * Get package display name
 */
export const getPackageDisplayName = (packageType) => {
  switch (packageType) {
    case "elite":
      return "VIP Elite"
    case "premium":
      return "Premium"
    case "basic":
      return "Basic"
    default:
      return null
  }
}

/**
 * Sort profiles by package priority
 * Elite → Premium → Basic
 */
export const sortProfilesByPackage = (profiles) => {
  return [...profiles].sort((a, b) => {
    const priorityA = getPackagePriority(a)
    const priorityB = getPackagePriority(b)
    return priorityB - priorityA
  })
}

/**
 * Group profiles by package tier
 */
export const groupProfilesByPackage = (profiles) => {
  const elite = []
  const premium = []
  const basic = []
  const none = []

  profiles.forEach((profile) => {
    const priority = getPackagePriority(profile)
    switch (priority) {
      case 3:
        elite.push(profile)
        break
      case 2:
        premium.push(profile)
        break
      case 1:
        basic.push(profile)
        break
      default:
        none.push(profile)
    }
  })

  return { elite, premium, basic, none }
}

/**
 * Track profile view
 */
export const trackProfileView = async (profileId) => {
  try {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/analytics/view`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profileId, type: "view" }),
    })
  } catch (error) {
    console.error("[v0] Failed to track view:", error)
  }
}

/**
 * Track profile interaction (click, call, WhatsApp, etc.)
 */
export const trackProfileInteraction = async (profileId, interactionType) => {
  try {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/analytics/interaction`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profileId, type: interactionType }),
    })
  } catch (error) {
    console.error("[v0] Failed to track interaction:", error)
  }
}

/**
 * Format phone number for display
 */
export const formatPhoneNumber = (phone) => {
  if (!phone) return ""
  // Remove any non-digit characters
  const cleaned = phone.replace(/\D/g, "")
  // Format as +254 XXX XXX XXX
  if (cleaned.startsWith("254")) {
    return `+${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6, 9)} ${cleaned.slice(9)}`
  }
  if (cleaned.startsWith("0")) {
    return `+254 ${cleaned.slice(1, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`
  }
  return phone
}

/**
 * Copy text to clipboard
 */
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (error) {
    console.error("[v0] Failed to copy:", error)
    return false
  }
}
