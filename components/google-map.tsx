"use client"
import { MapPin, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { formatCoordinates, generateMapLink } from "@/lib/map-utils"

interface GoogleMapProps {
  location?: {
    lat: number
    lng: number
  }
  name: string
  mapLink?: string
  apiKey?: string
}

// Google Map компонентыг шинэчилж, зөвхөн текст мэдээлэл харуулах
export default function GoogleMap({ location, name, mapLink }: GoogleMapProps) {
  // Generate Google Maps link from coordinates if mapLink is not provided
  const googleMapsLink = mapLink || (location ? generateMapLink(location.lat, location.lng) : "")

  return (
    <div className="w-full h-full">
      <Card className="h-full">
        <CardContent className="p-4 h-full flex flex-col">
          <div className="text-center mb-4">
            <MapPin className="h-8 w-8 mx-auto mb-2 text-primary" />
            <h3 className="text-lg font-medium">{name}</h3>
            {location && (
              <p className="text-sm text-muted-foreground mt-1">{formatCoordinates(location.lat, location.lng)}</p>
            )}
          </div>

          {/* Зөвхөн текст мэдээлэл харуулах, зураг харуулахгүй */}
          <div className="flex-grow flex items-center justify-center mb-4">
            <div className="text-center">
              <p className="font-medium mb-2">{name}</p>
              {location && (
                <p className="text-sm text-muted-foreground">{formatCoordinates(location.lat, location.lng)}</p>
              )}
              {!location && mapLink && <p className="text-sm text-muted-foreground">Байршлын холбоос бэлэн байна</p>}
            </div>
          </div>

          {googleMapsLink && (
            <Button onClick={() => window.open(googleMapsLink, "_blank", "noopener,noreferrer")} className="w-full">
              <ExternalLink className="mr-2 h-4 w-4" />
              Google Maps-д харах
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
