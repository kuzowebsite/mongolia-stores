/**
 * Google Maps холбоосоос координатуудыг ялгах функц
 * Дэмжигдэх форматууд:
 * - https://www.google.com/maps?q=47.9184676,106.9177016
 * - https://www.google.com/maps/@47.9184676,106.9177016,15z
 * - https://goo.gl/maps/AbCdEfGhIjKl
 * - 47.9184676, 106.9177016 (шууд координатууд)
 */
export function extractCoordinatesFromMapLink(link: string): { lat: number; lng: number } | null {
  // Хэрэв оролт хоосон бол null буцаах
  if (!link || link.trim() === "") {
    return null
  }

  // Шууд координатууд оруулсан эсэхийг шалгах (жишээ: "47.9184676, 106.9177016")
  const directCoordinatesRegex = /^(-?\d+(\.\d+)?),\s*(-?\d+(\.\d+)?)$/
  const directMatch = link.match(directCoordinatesRegex)
  if (directMatch) {
    const lat = Number.parseFloat(directMatch[1])
    const lng = Number.parseFloat(directMatch[3])
    if (isValidCoordinates(lat, lng)) {
      return { lat, lng }
    }
  }

  // Google Maps ?q= параметртэй холбоос (жишээ: https://www.google.com/maps?q=47.9184676,106.9177016)
  const qParamRegex = /[?&]q=(-?\d+(\.\d+)?),(-?\d+(\.\d+)?)/
  const qMatch = link.match(qParamRegex)
  if (qMatch) {
    const lat = Number.parseFloat(qMatch[1])
    const lng = Number.parseFloat(qMatch[3])
    if (isValidCoordinates(lat, lng)) {
      return { lat, lng }
    }
  }

  // Google Maps @ форматтай холбоос (жишээ: https://www.google.com/maps/@47.9184676,106.9177016,15z)
  const atSymbolRegex = /@(-?\d+(\.\d+)?),(-?\d+(\.\d+)?)/
  const atMatch = link.match(atSymbolRegex)
  if (atMatch) {
    const lat = Number.parseFloat(atMatch[1])
    const lng = Number.parseFloat(atMatch[3])
    if (isValidCoordinates(lat, lng)) {
      return { lat, lng }
    }
  }

  // Google Maps search параметртэй холбоос (жишээ: https://www.google.com/maps/search/?api=1&query=47.9184676,106.9177016)
  const searchParamRegex = /[?&]query=(-?\d+(\.\d+)?),(-?\d+(\.\d+)?)/
  const searchMatch = link.match(searchParamRegex)
  if (searchMatch) {
    const lat = Number.parseFloat(searchMatch[1])
    const lng = Number.parseFloat(searchMatch[3])
    if (isValidCoordinates(lat, lng)) {
      return { lat, lng }
    }
  }

  // Бусад форматууд дэмжигдэхгүй
  return null
}

/**
 * Координатуудаас Google Maps холбоос үүсгэх
 */
export function generateMapLink(lat: number, lng: number): string {
  if (!isValidCoordinates(lat, lng)) {
    console.warn("Invalid coordinates for map link:", { lat, lng })
    return ""
  }

  // Ensure coordinates are properly formatted with fixed precision
  const formattedLat = Number.parseFloat(lat.toFixed(6))
  const formattedLng = Number.parseFloat(lng.toFixed(6))

  // Use the most reliable format for Google Maps
  return `https://www.google.com/maps?q=${formattedLat},${formattedLng}`
}

/**
 * Координатууд хүчинтэй эсэхийг шалгах
 */
export function isValidCoordinates(lat: number, lng: number): boolean {
  return (
    !isNaN(lat) &&
    !isNaN(lng) &&
    lat >= -90 &&
    lat <= 90 && // Өргөрөг -90-өөс 90 хооронд байх ёстой
    lng >= -180 &&
    lng <= 180 // Уртраг -180-аас 180 хооронд байх ёстой
  )
}

/**
 * Координатуудыг хэвлэх форматтай болгох
 */
export function formatCoordinates(lat: number, lng: number): string {
  if (!isValidCoordinates(lat, lng)) {
    return "Буруу координатууд"
  }
  // Координатуудыг 6 орны нарийвчлалтай харуулах
  return `${lat.toFixed(6)}, ${lng.toFixed(6)}`
}

/**
 * Координатуудыг шалгаж, хэрэв буруу бол засах
 * Зарим тохиолдолд lat/lng солигдсон байж болно
 */
export function normalizeCoordinates(coords: { lat: number; lng: number }): { lat: number; lng: number } {
  if (!coords || typeof coords.lat !== "number" || typeof coords.lng !== "number") {
    console.warn("Invalid coordinates object:", coords)
    // Default to a central location in Ulaanbaatar if coordinates are invalid
    return { lat: 47.9184676, lng: 106.9177016 }
  }

  // Check if coordinates are valid
  if (!isValidCoordinates(coords.lat, coords.lng)) {
    // Check if they're swapped
    if (isValidCoordinates(coords.lng, coords.lat)) {
      console.log("Coordinates appear to be swapped, fixing:", coords)
      return { lat: coords.lng, lng: coords.lat }
    } else {
      console.warn("Invalid coordinates, cannot normalize:", coords)
      // Default to a central location in Ulaanbaatar
      return { lat: 47.9184676, lng: 106.9177016 }
    }
  }

  // Ensure coordinates have proper precision
  return {
    lat: Number.parseFloat(coords.lat.toFixed(6)),
    lng: Number.parseFloat(coords.lng.toFixed(6)),
  }
}

/**
 * Газрын зургийн холбоосоос embed URL үүсгэх
 */
export function getEmbedUrlFromMapLink(mapLink: string): string | null {
  try {
    if (!mapLink) return null

    // Extract coordinates from mapLink if possible
    const coordinates = extractCoordinatesFromMapLink(mapLink)
    if (coordinates) {
      // Normalize coordinates in case they're swapped
      const normalizedCoords = normalizeCoordinates(coordinates)
      return `https://www.google.com/maps/embed/v1/place?key=&q=${normalizedCoords.lat},${normalizedCoords.lng}`
    }

    // Try to convert a regular Google Maps URL to an embed URL
    if (mapLink.includes("maps.google.com") || mapLink.includes("google.com/maps")) {
      // Check if it's already an embed URL
      if (mapLink.includes("google.com/maps/embed")) {
        return mapLink
      }

      // Extract the location part from the URL
      let embedUrl = ""

      if (mapLink.includes("?q=")) {
        // Format: https://maps.google.com/?q=...
        const queryPart = mapLink.split("?q=")[1]
        embedUrl = `https://www.google.com/maps/embed/v1/place?key=&q=${queryPart}`
      } else if (mapLink.includes("/place/")) {
        // Format: https://www.google.com/maps/place/...
        const placePart = mapLink.split("/place/")[1]
        embedUrl = `https://www.google.com/maps/embed/v1/place?key=&q=${placePart}`
      } else if (mapLink.includes("/@")) {
        // Format: https://www.google.com/maps/@...
        const parts = mapLink.split("/@")[1].split(",")
        if (parts.length >= 2) {
          const lat = parts[0]
          const lng = parts[1].split("/")[0]
          embedUrl = `https://www.google.com/maps/embed/v1/view?key=&center=${lat},${lng}&zoom=15`
        }
      }

      return embedUrl || null
    }

    return null
  } catch (error) {
    console.error("Error parsing Google Maps URL:", error)
    return null
  }
}

/**
 * Монгол улсын нийслэл Улаанбаатар хотын төвийн координат
 */
export const DEFAULT_COORDINATES = {
  lat: 47.9184676,
  lng: 106.9177016,
}

/**
 * Координатуудыг шалгаж, хэрэв буруу бол анхны утгыг буцаах
 */
export function validateCoordinates(coords: { lat?: number; lng?: number } | undefined | null): {
  lat: number
  lng: number
} {
  if (!coords) {
    return DEFAULT_COORDINATES
  }

  const lat = typeof coords.lat === "number" ? coords.lat : DEFAULT_COORDINATES.lat
  const lng = typeof coords.lng === "number" ? coords.lng : DEFAULT_COORDINATES.lng

  if (!isValidCoordinates(lat, lng)) {
    // Try swapped coordinates
    if (isValidCoordinates(lng, lat)) {
      return { lat: lng, lng: lat }
    }
    return DEFAULT_COORDINATES
  }

  return { lat, lng }
}

/**
 * Координатуудаас Google Maps холбоос үүсгэх (сайжруулсан)
 */
export function createGoogleMapsUrl(
  location: { lat?: number; lng?: number } | undefined | null,
  mapLink?: string,
): string {
  // If we have a valid mapLink and no location, use the mapLink
  if (mapLink && (!location || !location.lat || !location.lng)) {
    // Try to extract coordinates from the mapLink
    const extractedCoords = extractCoordinatesFromMapLink(mapLink)
    if (extractedCoords) {
      const normalized = normalizeCoordinates(extractedCoords)
      console.log("Using coordinates extracted from mapLink:", normalized)
      return generateMapLink(normalized.lat, normalized.lng)
    }

    // If we couldn't extract coordinates but have a mapLink, use it
    if (mapLink.includes("maps.google.com") || mapLink.includes("google.com/maps")) {
      console.log("Using original mapLink:", mapLink)
      return mapLink
    }
  }

  // If we have location coordinates, use them
  if (location && (typeof location.lat === "number" || typeof location.lng === "number")) {
    const validCoords = validateCoordinates(location)
    console.log("Using validated location coordinates:", validCoords)
    return generateMapLink(validCoords.lat, validCoords.lng)
  }

  // Default to central Ulaanbaatar
  console.log("No valid coordinates found, using default location")
  return generateMapLink(DEFAULT_COORDINATES.lat, DEFAULT_COORDINATES.lng)
}
