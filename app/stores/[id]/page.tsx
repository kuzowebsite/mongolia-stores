"use client"

import { useState, useEffect } from "react"
import { notFound } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { ChevronLeft, Star, MapPin, Phone, Clock, Globe, Tag, ExternalLink } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import ReviewForm from "@/components/review-form"
import { storeService, reviewService, type Store, type Review } from "@/lib/db-service"

export default function StorePage({ params }: { params: { id: string } }) {
  const [store, setStore] = useState<Store | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const storeData = await storeService.getStoreById(params.id)

        if (!storeData) {
          notFound()
        }

        setStore(storeData)

        // Дэлгүүрийн сэтгэгдлүүдийг авах
        const reviewsData = await reviewService.getReviewsByStoreId(params.id)
        setReviews(reviewsData)
      } catch (error) {
        console.error("Дэлгүүрийн мэдээлэл авахад алдаа гарлаа:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [params.id])

  const handleReviewAdded = async () => {
    // Шинэ сэтгэгдэл нэмэгдсэний дараа сэтгэгдлүүдийг дахин авах
    const reviewsData = await reviewService.getReviewsByStoreId(params.id)
    setReviews(reviewsData)
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-4 px-4 sm:py-8 sm:px-0">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Дэлгүүрийн мэдээллийг ачааллаж байна...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!store) {
    return notFound()
  }

  const handleImageClick = (index: number) => {
    setActiveImageIndex(index)
  }

  const mainImage = store.image || "/corner-grocery.png"
  const galleryImages = store.gallery || []
  const allImages = [mainImage, ...galleryImages]

  return (
    <div className="container mx-auto py-4 px-4 sm:py-8 sm:px-0">
      <div className="mb-4 sm:mb-6">
        <Link
          href="/stores"
          className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
          Бүх дэлгүүрүүд рүү буцах
        </Link>
      </div>

      {/* Гар утасны хэмжээнд харагдах мэдээллийн хураангуй */}
      <div className="md:hidden mb-6">
        <h1 className="text-2xl font-bold tracking-tight">{store.name}</h1>
        <div className="flex items-center gap-2 mt-2">
          <Badge variant="secondary">{store.category}</Badge>
          {store.rating && (
            <div className="flex items-center gap-1 text-sm">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="font-medium">{store.rating}</span>
              <span className="text-muted-foreground">({store.reviews || 0})</span>
            </div>
          )}
        </div>

        {/* Гар утасны хэмжээнд харагдах товчнууд - Газрын зураг товчлуурыг арилгасан */}
        <div className="flex gap-2 mt-4">
          <Button size="sm" className="flex-1" asChild>
            <a href={`tel:${store.phone}`}>
              <Phone className="mr-2 h-4 w-4" />
              Залгах
            </a>
          </Button>

          {store.website && (
            <Button size="sm" variant="outline" className="flex-1" asChild>
              <a
                href={store.website.startsWith("http") ? store.website : `https://${store.website}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Globe className="mr-2 h-4 w-4" />
                Вэбсайт
              </a>
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
        <div className="md:col-span-2">
          {/* Том дэлгэцэнд харагдах гарчиг */}
          <div className="hidden md:block mb-6">
            <h1 className="text-3xl font-bold tracking-tight">{store.name}</h1>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="secondary">{store.category}</Badge>
              {store.rating && (
                <div className="flex items-center gap-1 text-sm">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{store.rating}</span>
                  <span className="text-muted-foreground">({store.reviews || 0} сэтгэгдэл)</span>
                </div>
              )}
            </div>
            <p className="mt-3 text-muted-foreground">{store.description}</p>
          </div>

          <div className="mb-6">
            <div className="relative aspect-video overflow-hidden rounded-lg">
              <Image
                src={allImages[activeImageIndex] || "/placeholder.svg?height=400&width=600&query=store"}
                alt={store.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 66vw"
                priority
              />
            </div>

            {allImages.length > 1 && (
              <div className="flex gap-2 mt-4 overflow-x-auto pb-2 scrollbar-hide">
                {allImages.map((image, index) => (
                  <div
                    key={index}
                    className={`relative h-16 w-16 sm:h-20 sm:w-20 flex-shrink-0 overflow-hidden rounded-md cursor-pointer border-2 ${
                      index === activeImageIndex ? "border-primary" : "border-transparent"
                    }`}
                    onClick={() => handleImageClick(index)}
                  >
                    <Image
                      src={image || "/placeholder.svg"}
                      alt={`${store.name} ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Гар утасны хэмжээнд харагдах тайлбар */}
          <div className="md:hidden mb-4">
            <p className="text-muted-foreground">{store.description}</p>
          </div>

          {/* Таб сонголтууд */}
          <div className="mb-6">
            <div className="flex w-full bg-gray-100 rounded-md overflow-hidden overflow-x-auto scrollbar-hide">
              <button
                onClick={() => setActiveTab("overview")}
                className={`flex-1 py-3 px-3 sm:px-4 text-center font-medium text-xs sm:text-sm whitespace-nowrap ${
                  activeTab === "overview" ? "bg-white" : "hover:bg-gray-200"
                }`}
              >
                Тухай
              </button>
              <button
                onClick={() => setActiveTab("reviews")}
                className={`flex-1 py-3 px-3 sm:px-4 text-center font-medium text-xs sm:text-sm whitespace-nowrap ${
                  activeTab === "reviews" ? "bg-white" : "hover:bg-gray-200"
                }`}
              >
                Сэтгэгдлүүд ({reviews.length})
              </button>
              <button
                onClick={() => setActiveTab("gallery")}
                className={`flex-1 py-3 px-3 sm:px-4 text-center font-medium text-xs sm:text-sm whitespace-nowrap ${
                  activeTab === "gallery" ? "bg-white" : "hover:bg-gray-200"
                }`}
              >
                Зургууд
              </button>
              <button
                onClick={() => setActiveTab("location")}
                className={`flex-1 py-3 px-3 sm:px-4 text-center font-medium text-xs sm:text-sm whitespace-nowrap ${
                  activeTab === "location" ? "bg-white" : "hover:bg-gray-200"
                }`}
              >
                Байршил
              </button>
            </div>

            <div className="mt-4 sm:mt-6">
              {activeTab === "overview" && (
                <div>
                  <div className="grid grid-cols-1 gap-4 sm:gap-6">
                    <Card>
                      <CardContent className="p-4 sm:p-6">
                        <h3 className="text-lg font-medium mb-4">Үйлчилгээнүүд</h3>
                        {store.services && store.services.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {store.services.map((service, index) => (
                              <Badge key={index} variant="outline">
                                {service}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <p className="text-muted-foreground">Үйлчилгээний мэдээлэл байхгүй байна.</p>
                        )}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4 sm:p-6">
                        <h3 className="text-lg font-medium mb-4">Дэлгэрэнгүй мэдээлэл</h3>
                        {store.fullDescription ? (
                          <div className="prose max-w-none">
                            <p>{store.fullDescription}</p>
                          </div>
                        ) : (
                          <p className="text-muted-foreground">Дэлгэрэнгүй мэдээлэл байхгүй байна.</p>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

              {activeTab === "reviews" && (
                <div>
                  <Card className="mb-4 sm:mb-6">
                    <CardContent className="p-4 sm:p-6">
                      <h3 className="text-lg font-medium mb-4">Сэтгэгдэл үлдээх</h3>
                      <ReviewForm storeId={store.id!} storeName={store.name} onReviewAdded={handleReviewAdded} />
                    </CardContent>
                  </Card>

                  <h3 className="text-lg font-medium mb-4">Сэтгэгдлүүд ({reviews.length})</h3>
                  {reviews.length > 0 ? (
                    <div className="space-y-4">
                      {reviews.map((review) => (
                        <Card key={review.id}>
                          <CardContent className="p-4 sm:p-6">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium">{review.name}</p>
                                <p className="text-sm text-muted-foreground">{review.date}</p>
                              </div>
                              <div className="flex items-center gap-1">
                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                <span className="font-medium">{review.rating}</span>
                              </div>
                            </div>
                            <Separator className="my-4" />
                            <p>{review.comment}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">Одоогоор сэтгэгдэл байхгүй байна.</p>
                  )}
                </div>
              )}

              {activeTab === "gallery" && (
                <div>
                  <h3 className="text-lg font-medium mb-4">Зургууд</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4">
                    {allImages.length > 0 ? (
                      allImages.map((image, index) => (
                        <div
                          key={index}
                          className="relative aspect-square rounded-lg overflow-hidden cursor-pointer"
                          onClick={() => setActiveImageIndex(index)}
                        >
                          <Image
                            src={image || "/placeholder.svg"}
                            alt={`${store.name} ${index + 1}`}
                            fill
                            className="object-cover hover:scale-105 transition-transform"
                            sizes="(max-width: 768px) 50vw, 33vw"
                          />
                        </div>
                      ))
                    ) : (
                      <p className="text-muted-foreground col-span-3">Зураг байхгүй байна.</p>
                    )}
                  </div>
                </div>
              )}

              {activeTab === "location" && (
                <div>
                  <h3 className="text-lg font-medium mb-4">Байршил</h3>
                  {store.location || store.mapLink ? (
                    <>
                      {/* Зураг хэсгийг арилгаж, зөвхөн хаяг харуулах */}
                      <Card>
                        <CardContent className="p-4 sm:p-6">
                          <div className="flex items-start gap-3">
                            <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                            <div>
                              <p className="font-medium">Хаяг</p>
                              <p className="text-muted-foreground">{store.address}</p>
                            </div>
                          </div>

                          {store.location && (
                            <div className="flex items-start gap-3 mt-4">
                              <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                              <div>
                                <p className="font-medium">Координат</p>
                                <p className="text-muted-foreground">
                                  {store.location.lat}, {store.location.lng}
                                </p>
                              </div>
                            </div>
                          )}

                          {store.mapLink && (
                            <Button
                              variant="outline"
                              className="mt-4 w-full"
                              onClick={() => window.open(store.mapLink, "_blank", "noopener,noreferrer")}
                            >
                              <ExternalLink className="mr-2 h-4 w-4" />
                              Google Maps-д харах
                            </Button>
                          )}
                        </CardContent>
                      </Card>
                    </>
                  ) : (
                    <p className="text-muted-foreground">Байршлын мэдээлэл байхгүй байна.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Том дэлгэцэнд харагдах мэдээллийн хэсэг */}
        <div className="hidden md:block">
          <Card className="sticky top-6">
            <CardContent className="p-6">
              <h3 className="text-lg font-medium mb-4">Холбоо барих</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">Хаяг</p>
                    <p className="text-muted-foreground">{store.address}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">Утас</p>
                    <p className="text-muted-foreground">{store.phone}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">Ажиллах цаг</p>
                    <p className="text-muted-foreground">{store.hours}</p>
                  </div>
                </div>
                {store.website && (
                  <div className="flex items-start gap-3">
                    <Globe className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">Вэбсайт</p>
                      <a
                        href={store.website.startsWith("http") ? store.website : `https://${store.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {store.website}
                      </a>
                    </div>
                  </div>
                )}
              </div>

              <Separator className="my-6" />

              <h3 className="text-lg font-medium mb-4">Ангилал</h3>
              <div className="flex items-center gap-2">
                <Tag className="h-5 w-5 text-muted-foreground" />
                <Link href={`/categories/${store.category}`}>
                  <Badge variant="secondary">{store.category}</Badge>
                </Link>
              </div>

              {store.services && store.services.length > 0 && (
                <>
                  <Separator className="my-6" />
                  <h3 className="text-lg font-medium mb-4">Үйлчилгээнүүд</h3>
                  <div className="flex flex-wrap gap-2">
                    {store.services.map((service, index) => (
                      <Badge key={index} variant="outline">
                        {service}
                      </Badge>
                    ))}
                  </div>
                </>
              )}

              <Separator className="my-6" />

              <div className="space-y-4">
                <Button className="w-full" asChild>
                  <a href={`tel:${store.phone}`}>
                    <Phone className="mr-2 h-4 w-4" />
                    Залгах
                  </a>
                </Button>

                {/* Газрын зураг товчлуурыг арилгасан */}

                {store.website && (
                  <Button variant="outline" className="w-full" asChild>
                    <a
                      href={store.website.startsWith("http") ? store.website : `https://${store.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Globe className="mr-2 h-4 w-4" />
                      Вэбсайт
                    </a>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
