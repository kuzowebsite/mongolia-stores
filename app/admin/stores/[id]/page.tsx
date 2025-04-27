"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { notFound, useRouter } from "next/navigation"
import { ChevronLeft, Edit, MapPin, Phone, Clock, Globe } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import GoogleMap from "@/components/google-map"
import { storeService, reviewService, type Store, type Review } from "@/lib/db-service"
import { useToast } from "@/components/ui/use-toast"

export default function AdminStorePage({ params }: { params: { id: string } }) {
  const { toast } = useToast()
  const router = useRouter()
  const [store, setStore] = useState<Store | null>(null)
  const [storeReviews, setStoreReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // If we're trying to access the "new" route, redirect to the new store page
    if (params.id === "new") {
      router.push("/admin/stores/new")
      return
    }

    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Дэлгүүрийн мэдээлэл авах
        const storeData = await storeService.getStoreById(params.id)
        if (!storeData) {
          setError(`Дэлгүүр олдсонгүй (ID: ${params.id})`)
          return
        }

        setStore(storeData)

        // Дэлгүүрийн сэтгэгдэлүүдийг авах
        const reviewsData = await reviewService.getReviewsByStoreId(params.id)
        setStoreReviews(reviewsData)
      } catch (error) {
        console.error("Дэлгүүрийн мэдээлэл авахад алдаа гарлаа:", error)
        setError("Дэлгүүрийн мэдээлэл авахад алдаа гарлаа")
        toast({
          variant: "destructive",
          title: "Алдаа",
          description: `Дэлгүүрийн мэдээлэл авахад алдаа гарлаа: ${error instanceof Error ? error.message : "Unknown error"}`,
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [params.id, toast, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Дэлгүүрийн мэдээллийг ачааллаж байна...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-destructive mb-2">Алдаа</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <div className="flex gap-4">
            <Button onClick={() => router.push("/admin/stores")}>Дэлгүүрүүд рүү буцах</Button>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Дахин оролдох
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (!store) {
    return notFound()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link
            href="/admin/stores"
            className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="h-4 w-4" />
            Дэлгүүрүүд рүү буцах
          </Link>
        </div>
        <Link href={`/admin/stores/${store.id}/edit`}>
          <Button>
            <Edit className="mr-2 h-4 w-4" />
            Засах
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-2 lg:gap-12">
        <div className="space-y-4">
          <div className="overflow-hidden rounded-lg">
            {store.image ? (
              <Image
                src={store.image || "/placeholder.svg"}
                alt={store.name}
                width={800}
                height={500}
                className="aspect-video w-full object-cover"
              />
            ) : (
              <div className="aspect-video w-full bg-muted flex items-center justify-center">
                <p className="text-muted-foreground">Зураг байхгүй</p>
              </div>
            )}
          </div>
          <div className="grid grid-cols-3 gap-2">
            {store.gallery?.map((img, i) => (
              <div key={i} className="overflow-hidden rounded-lg">
                <Image
                  src={img || "/placeholder.svg"}
                  alt={`${store.name} gallery ${i + 1}`}
                  width={300}
                  height={200}
                  className="aspect-square h-full w-full object-cover transition-all hover:scale-105"
                />
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold">{store.name}</h1>
              <Badge variant="outline">{store.category}</Badge>
            </div>
            <div className="flex items-center">
              <div className="flex">
                {Array(5)
                  .fill(0)
                  .map((_, i) => (
                    <svg
                      key={i}
                      className={`h-5 w-5 ${i < Math.floor(store.rating || 0) ? "text-yellow-400 fill-yellow-400" : "text-gray-300 fill-gray-300"}`}
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                    </svg>
                  ))}
              </div>
              <span className="ml-2 text-sm text-muted-foreground">
                {store.rating || 0} ({store.reviews || 0} сэтгэгдэл)
              </span>
            </div>
          </div>

          <p className="text-muted-foreground">{store.description}</p>

          <div className="grid gap-3">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>{store.address}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{store.phone}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>{store.hours}</span>
            </div>
            {store.website && (
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <a
                  href={store.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  {store.website.replace(/^https?:\/\//, "")}
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-12">
        <Tabs defaultValue="about">
          <TabsList className="w-full justify-start overflow-x-auto">
            <TabsTrigger value="about">Тухай</TabsTrigger>
            <TabsTrigger value="reviews">Сэтгэгдэлүүд ({storeReviews.length})</TabsTrigger>
            <TabsTrigger value="photos">Зургууд</TabsTrigger>
            <TabsTrigger value="location">Байршил</TabsTrigger>
          </TabsList>
          <TabsContent value="about" className="mt-6 space-y-6">
            <div>
              <h2 className="text-xl font-semibold">Дэлгүүрийн тухай</h2>
              <div className="mt-4 space-y-4">
                <p>{store.fullDescription || store.description}</p>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold">Үйлчилгээнүүд</h2>
              <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {store.services?.map((service, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="rounded-full bg-primary/10 p-1">
                      <svg className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-sm">{service}</span>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="reviews" className="mt-6">
            <div className="space-y-6">
              {storeReviews.length > 0 ? (
                storeReviews.map((review, index) => (
                  <Card key={index}>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="rounded-full bg-primary/10 p-2">
                          <Image
                            src="/diverse-avatars.png"
                            alt={review.name}
                            width={40}
                            height={40}
                            className="rounded-full"
                          />
                        </div>
                        <div>
                          <h3 className="font-semibold">{review.name}</h3>
                          <p className="text-xs text-muted-foreground">{review.date}</p>
                        </div>
                        <div className="ml-auto flex">
                          {Array(5)
                            .fill(0)
                            .map((_, i) => (
                              <svg
                                key={i}
                                className={`h-4 w-4 ${i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300 fill-gray-300"}`}
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                              >
                                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                              </svg>
                            ))}
                        </div>
                      </div>
                      <p className="mt-4 text-sm text-muted-foreground">{review.comment}</p>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <p className="text-center text-muted-foreground">Одоогоор сэтгэгдэл алга байна.</p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="photos" className="mt-6">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
              {store.gallery?.map((img, i) => (
                <div key={i} className="overflow-hidden rounded-lg">
                  <Image
                    src={img || "/placeholder.svg"}
                    alt={`${store.name} gallery ${i + 1}`}
                    width={300}
                    height={300}
                    className="aspect-square h-full w-full object-cover transition-all hover:scale-105"
                  />
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="location" className="mt-6">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Байршил</h2>
              <p className="text-muted-foreground">{store.address}</p>

              <div className="h-[400px] w-full overflow-hidden rounded-lg border">
                <GoogleMap location={store.location || { lat: 47.9184676, lng: 106.9177016 }} name={store.name} />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
