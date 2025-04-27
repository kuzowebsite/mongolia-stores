"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { storeService, reviewService, type Store, type Review } from "@/lib/db-service"
import { StoreIcon } from "lucide-react"

export default function RatingsPage() {
  const [stores, setStores] = useState<Store[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)

  // Хуудасны алдааны компонентийг өөрчлөх - алдаа гарсан үед ачааллаж байна гэж харуулах
  const renderErrorOrLoading = () => {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Өгөгдлийн сантай холбогдож байна, түр хүлээнэ үү...</p>
        </div>
      </div>
    )
  }

  // fetchData функцийг өөрчлөх
  const fetchData = async () => {
    try {
      setLoading(true)

      // Дэлгүүрүүдийг авах
      const storesData = await storeService.getAllStores()
      setStores(storesData)

      // Сэтгэгдлүүдийг авах
      const reviewsData = await reviewService.getAllReviews()
      setReviews(reviewsData)
    } catch (error) {
      console.error("Мэдээлэл авахад алдаа гарлаа:", error)
      // Алдаа гарсан үед loading хэвээр байлгана
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Дэлгүүрүүдийг үнэлгээгээр эрэмбэлэх
  const sortedStores = [...stores].sort((a, b) => (b.rating || 0) - (a.rating || 0))

  // Сэтгэгдлүүдийг огноогоор эрэмбэлэх
  const sortedReviews = [...reviews].sort((a, b) => {
    const dateA = a.createdAt || new Date(a.date).getTime()
    const dateB = b.createdAt || new Date(b.date).getTime()
    return dateB - dateA
  })

  // loading үед харуулах дүрс
  if (loading) {
    return renderErrorOrLoading()
  }

  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-background">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">Үнэлгээ & Сэтгэгдэлүүд</h1>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Хэрэглэгчдийн үнэлгээ болон сэтгэгдэлүүд
            </p>
          </div>
        </div>

        <Tabs defaultValue="top-rated" className="mt-8">
          <div className="flex justify-center overflow-x-auto pb-2">
            <TabsList>
              <TabsTrigger value="top-rated">Шилдэг үнэлгээтэй</TabsTrigger>
              <TabsTrigger value="recent-reviews">Сүүлийн сэтгэгдэлүүд</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="top-rated" className="mt-6">
            {sortedStores.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-muted-foreground">Дэлгүүр олдсонгүй</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {sortedStores.map((store, index) => (
                  <Link href={`/stores/${store.id}`} key={index} className="block">
                    <Card className="h-full overflow-hidden transition-all hover:shadow-md">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="h-16 w-16 overflow-hidden rounded-lg">
                            {store.image ? (
                              <Image
                                src={store.image || "/placeholder.svg"}
                                alt={store.name}
                                width={64}
                                height={64}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center bg-muted">
                                <StoreIcon className="h-6 w-6 text-muted-foreground" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h3 className="font-semibold">{store.name}</h3>
                              <Badge variant="outline">{store.category}</Badge>
                            </div>
                            <div className="mt-2 flex items-center">
                              <div className="flex">
                                {Array(5)
                                  .fill(0)
                                  .map((_, i) => (
                                    <svg
                                      key={i}
                                      className={`h-4 w-4 ${i < Math.floor(store.rating || 0) ? "text-yellow-400 fill-yellow-400" : "text-gray-300 fill-gray-300"}`}
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
                            <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{store.description}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="recent-reviews" className="mt-6">
            {sortedReviews.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-muted-foreground">Сэтгэгдэл олдсонгүй</p>
              </div>
            ) : (
              <div className="grid gap-6">
                {sortedReviews.map((review, index) => {
                  const store = stores.find((s) => s.id === review.storeId)

                  return (
                    <Card key={index}>
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="rounded-full bg-primary/10 p-2">
                            <Image
                              src="/diverse-avatars.png"
                              alt={review.name}
                              width={40}
                              height={40}
                              className="rounded-full"
                            />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <div>
                                <h3 className="font-semibold">{review.name}</h3>
                                <Link href={`/stores/${review.storeId}`}>
                                  <p className="text-sm text-primary hover:underline">
                                    {store?.name || "Устгагдсан дэлгүүр"}
                                  </p>
                                </Link>
                              </div>
                              <div className="flex">
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
                            <p className="mt-2 text-sm text-muted-foreground">{review.comment}</p>
                            <p className="mt-2 text-xs text-muted-foreground">{review.date}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </section>
  )
}
