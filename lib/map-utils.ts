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
    return ""
  }
  // Google Maps-ийн q параметр ашиглан байршлыг илүү нарийвчлан заах
  return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
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

// Add this function to the existing file
export function getEmbedUrlFromMapLink(mapLink: string): string | null {
  try {
    if (!mapLink) return null

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
