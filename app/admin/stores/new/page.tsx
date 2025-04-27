"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ChevronLeft, Upload, Plus, X, MapPin, ExternalLink } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/components/ui/use-toast"
import { storeService, categoryService, imageToBase64, type Store, type Category } from "@/lib/db-service"
import { extractCoordinatesFromMapLink, isValidCoordinates, generateMapLink } from "@/lib/map-utils"

export default function NewStore() {
  const router = useRouter()
  const { toast: setToast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [services, setServices] = useState<string[]>([])
  const [newService, setNewService] = useState("")
  const [previewImages, setPreviewImages] = useState<string[]>([])
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([])
  const [formError, setFormError] = useState<string | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [newCategory, setNewCategory] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [showAddCategory, setShowAddCategory] = useState(false)
  const [mapLink, setMapLink] = useState("")
  const [mapLinkError, setMapLinkError] = useState<string | null>(null)
  const [formData, setFormData] = useState<Partial<Store>>({
    name: "",
    category: "",
    description: "",
    fullDescription: "",
    address: "",
    phone: "",
    hours: "",
    website: "",
    services: [],
    location: {
      lat: 47.9184676,
      lng: 106.9177016,
    },
  })

  // Ангилалуудыг авах
  useState(() => {
    const fetchCategories = async () => {
      try {
        const categoriesData = await categoryService.getAllCategories()
        setCategories(categoriesData)
      } catch (error) {
        console.error("Ангилалуудыг авахад алдаа гарлаа:", error)
      }
    }

    fetchCategories()
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    setFormData({ ...formData, [id]: value })
  }

  const handleMapLinkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const link = e.target.value
    setMapLink(link)
    setMapLinkError(null)

    if (!link) return

    const coordinates = extractCoordinatesFromMapLink(link)
    if (coordinates) {
      setFormData({
        ...formData,
        location: coordinates,
      })
    } else {
      setMapLinkError("Буруу холбоос. Google Maps-ийн холбоос оруулна уу.")
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Хэрэв байршлын холбоос оруулсан бол координатуудыг ялгаж авах
      let locationData = null
      if (formData.mapLink) {
        const extractedCoordinates = extractCoordinatesFromMapLink(formData.mapLink)
        if (extractedCoordinates) {
          locationData = extractedCoordinates
        }
      }

      // Хэрэв координатууд оруулсан бол шууд ашиглах
      if (formData.latitude && formData.longitude) {
        locationData = {
          lat: Number.parseFloat(formData.latitude),
          lng: Number.parseFloat(formData.longitude),
        }
      }

      // Хэрэв координатууд байгаа бол mapLink-ийг шинэчлэх
      let mapLinkToSave = formData.mapLink
      if (locationData && isValidCoordinates(locationData.lat, locationData.lng)) {
        // Хэрэв mapLink байхгүй эсвэл хоосон бол шинээр үүсгэх
        if (!mapLinkToSave || mapLinkToSave.trim() === "") {
          mapLinkToSave = generateMapLink(locationData.lat, locationData.lng)
        }
      }

      // Дэлгүүрийн мэдээллийг үүсгэх
      const newStore: Store = {
        ...formData,
        location: locationData,
        mapLink: mapLinkToSave,
        rating: Number.parseFloat(formData.rating as string) || 0,
        reviews: Number.parseInt(formData.reviews as string) || 0,
        services: formData.services || [],
        gallery: formData.gallery || [],
      }

      await storeService.addStore(newStore)
      setToast({
        title: "Амжилттай",
        description: "Шинэ дэлгүүр амжилттай нэмэгдлээ",
        variant: "success",
      })

      // Дэлгүүрийн жагсаалт руу буцах
      router.push("/admin/stores")
    } catch (error) {
      console.error("Дэлгүүр нэмэхэд алдаа гарлаа:", error)
      setToast({
        title: "Алдаа гарлаа",
        description: "Шинэ дэлгүүр нэмэхэд алдаа гарлаа. Дахин оролдоно уу.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAddService = () => {
    if (newService.trim() && !services.includes(newService.trim())) {
      setServices([...services, newService.trim()])
      setNewService("")
    }
  }

  const handleRemoveService = (service: string) => {
    setServices(services.filter((s) => s !== service))
  }

  const handleAddCategory = async () => {
    if (newCategory.trim() && !categories.some((c) => c.name === newCategory.trim())) {
      try {
        // Шинэ ангилал үүсгэх
        const newCategoryData: Category = {
          name: newCategory.trim(),
          storeCount: 0,
        }

        const categoryId = await categoryService.addCategory(newCategoryData)

        // Ангилалын жагсаалтыг шинэчлэх
        const newCategoryWithId: Category = {
          id: categoryId,
          ...newCategoryData,
        }

        setCategories([...categories, newCategoryWithId])
        setSelectedCategory(newCategory.trim())
        setNewCategory("")
        setShowAddCategory(false)

        setToast({
          title: "Амжилттай",
          description: "Шинэ ангилал амжилттай нэмэгдлээ",
        })
      } catch (error) {
        console.error("Ангилал нэмэхэд алдаа гарлаа:", error)
        setToast({
          variant: "destructive",
          title: "Алдаа",
          description: "Ангилал нэмэхэд алдаа гарлаа",
        })
      }
    }
  }

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      try {
        const file = files[0]
        const base64Image = await imageToBase64(file)
        setPreviewImages([base64Image])
      } catch (error) {
        console.error("Зураг хөрвүүлэхэд алдаа гарлаа:", error)
      }
    }
  }

  const handleGalleryChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      try {
        const newPreviews: string[] = []
        for (let i = 0; i < files.length; i++) {
          const file = files[i]
          const base64Image = await imageToBase64(file)
          newPreviews.push(base64Image)
        }
        setGalleryPreviews([...galleryPreviews, ...newPreviews])
      } catch (error) {
        console.error("Зураг хөрвүүлэхэд алдаа гарлаа:", error)
      }
    }
  }

  const removeGalleryImage = (index: number) => {
    setGalleryPreviews(galleryPreviews.filter((_, i) => i !== index))
  }

  const openGoogleMaps = () => {
    window.open("https://www.google.com/maps", "_blank")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Link
          href="/admin/stores"
          className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
          Дэлгүүрүүд рүү буцах
        </Link>
      </div>

      <div>
        <h1 className="text-3xl font-bold tracking-tight">Шинэ дэлгүүр нэмэх</h1>
        <p className="text-muted-foreground">Шинэ дэлгүүрийн мэдээллийг оруулна уу</p>
      </div>

      {formError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <Card>
          <CardContent className="p-6">
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-medium">Үндсэн мэдээлэл</h3>
                <p className="text-sm text-muted-foreground">Дэлгүүрийн үндсэн мэдээллийг оруулна уу</p>
                <Separator className="my-4" />
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Дэлгүүрийн нэр</Label>
                    <Input
                      id="name"
                      placeholder="Дэлгүүрийн нэр"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Ангилал</Label>
                    {!showAddCategory ? (
                      <div className="flex gap-2">
                        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                          <SelectTrigger id="category" className="flex-1">
                            <SelectValue placeholder="Ангилал сонгох" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category.id} value={category.name}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setShowAddCategory(true)}
                          className="whitespace-nowrap"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Шинэ ангилал
                        </Button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <Input
                          placeholder="Шинэ ангилал"
                          value={newCategory}
                          onChange={(e) => setNewCategory(e.target.value)}
                          className="flex-1"
                        />
                        <Button type="button" onClick={handleAddCategory}>
                          Нэмэх
                        </Button>
                        <Button type="button" variant="outline" onClick={() => setShowAddCategory(false)}>
                          Цуцлах
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="description">Товч тайлбар</Label>
                    <Textarea
                      id="description"
                      placeholder="Дэлгүүрийн товч тайлбар"
                      rows={2}
                      value={formData.description}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="fullDescription">Дэлгэрэнгүй тайлбар</Label>
                    <Textarea
                      id="fullDescription"
                      placeholder="Дэлгүүрийн дэлгэрэнгүй тайлбар"
                      rows={4}
                      value={formData.fullDescription}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium">Холбоо барих мэдээлэл</h3>
                <p className="text-sm text-muted-foreground">Дэлгүүрийн холбоо барих мэдээллийг оруулна уу</p>
                <Separator className="my-4" />
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="address">Хаяг</Label>
                    <Input
                      id="address"
                      placeholder="Дэлгүүрийн хаяг"
                      value={formData.address}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Утас</Label>
                    <Input
                      id="phone"
                      placeholder="Утасны дугаар"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="hours">Ажиллах цаг</Label>
                    <Input
                      id="hours"
                      placeholder="Жишээ: 10:00-22:00"
                      value={formData.hours}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="website">Вэбсайт</Label>
                    <Input
                      id="website"
                      placeholder="https://example.com"
                      value={formData.website}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium">Үйлчилгээнүүд</h3>
                <p className="text-sm text-muted-foreground">Дэлгүүрийн үйлчилгээнүүдийг оруулна уу</p>
                <Separator className="my-4" />
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {services.map((service, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        {service}
                        <button
                          type="button"
                          onClick={() => handleRemoveService(service)}
                          className="ml-1 rounded-full hover:bg-muted p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Шинэ үйлчилгээ"
                      value={newService}
                      onChange={(e) => setNewService(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault()
                          handleAddService()
                        }
                      }}
                    />
                    <Button type="button" onClick={handleAddService} variant="outline">
                      <Plus className="h-4 w-4 mr-2" />
                      Нэмэх
                    </Button>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium">Зураг</h3>
                <p className="text-sm text-muted-foreground">
                  Дэлгүүрийн үндсэн зураг болон зургийн цомгийг оруулна уу
                </p>
                <Separator className="my-4" />
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="image">Үндсэн зураг</Label>
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <div className="flex items-center justify-center w-full">
                          <label
                            htmlFor="image"
                            className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/30 hover:bg-muted/50"
                          >
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                              <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                              <p className="mb-2 text-sm text-muted-foreground">
                                <span className="font-semibold">Зураг сонгох</span> эсвэл чирж оруулах
                              </p>
                              <p className="text-xs text-muted-foreground">PNG, JPG (MAX. 2MB)</p>
                            </div>
                            <Input
                              id="image"
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={handleImageChange}
                            />
                          </label>
                        </div>
                      </div>
                      {previewImages.length > 0 && (
                        <div className="relative h-32 w-32 overflow-hidden rounded-lg border">
                          <img
                            src={previewImages[0] || "/placeholder.svg"}
                            alt="Preview"
                            className="h-full w-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => setPreviewImages([])}
                            className="absolute top-1 right-1 rounded-full bg-black/50 p-1 text-white hover:bg-black/70"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gallery">Зургийн цомог</Label>
                    <div className="flex items-center justify-center w-full">
                      <label
                        htmlFor="gallery"
                        className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/30 hover:bg-muted/50"
                      >
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                          <p className="mb-2 text-sm text-muted-foreground">
                            <span className="font-semibold">Зураг сонгох</span> эсвэл чирж оруулах
                          </p>
                          <p className="text-xs text-muted-foreground">PNG, JPG (MAX. 2MB)</p>
                        </div>
                        <Input
                          id="gallery"
                          type="file"
                          accept="image/*"
                          multiple
                          className="hidden"
                          onChange={handleGalleryChange}
                        />
                      </label>
                    </div>

                    {galleryPreviews.length > 0 && (
                      <div className="grid grid-cols-3 gap-2 mt-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
                        {galleryPreviews.map((preview, index) => (
                          <div key={index} className="relative h-20 w-20 overflow-hidden rounded-lg border">
                            <img
                              src={preview || "/placeholder.svg"}
                              alt={`Gallery ${index + 1}`}
                              className="h-full w-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => removeGalleryImage(index)}
                              className="absolute top-1 right-1 rounded-full bg-black/50 p-1 text-white hover:bg-black/70"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium">Байршил</h3>
                <p className="text-sm text-muted-foreground">Дэлгүүрийн байршлын мэдээллийг оруулна уу</p>
                <Separator className="my-4" />
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="mapLink">Google Maps холбоос</Label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Input
                          id="mapLink"
                          placeholder="https://www.google.com/maps?q=47.9184676,106.9177016"
                          value={mapLink}
                          onChange={handleMapLinkChange}
                          className={mapLinkError ? "border-red-500" : ""}
                        />
                        <MapPin className="absolute right-3 top-2.5 h-5 w-5 text-muted-foreground" />
                      </div>
                      <Button type="button" variant="outline" onClick={openGoogleMaps}>
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Google Maps нээх
                      </Button>
                    </div>
                    {mapLinkError && <p className="text-sm text-red-500 mt-1">{mapLinkError}</p>}
                    {formData.location && isValidCoordinates(formData.location.lat, formData.location.lng) && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Координатууд: {formData.location.lat}, {formData.location.lng}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-2">
                      Зөвлөмж: Google Maps дээр дэлгүүрийн байршлыг олоод, хаягийн мөрөөс холбоосыг хуулж тавина уу.
                      Эсвэл шууд координатуудыг оруулж болно (жишээ: 47.9184676, 106.9177016)
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Link href="/admin/stores">
            <Button variant="outline" type="button">
              Цуцлах
            </Button>
          </Link>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Хадгалж байна..." : "Хадгалах"}
          </Button>
        </div>
      </form>
    </div>
  )
}
