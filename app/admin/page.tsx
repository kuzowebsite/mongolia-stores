"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Store, MessageSquare, Users, TrendingUp, ArrowUpRight, AlertTriangle } from "lucide-react"

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { storeService, reviewService, userService, type Store as StoreType, type Review } from "@/lib/db-service"
import { useToast } from "@/components/ui/use-toast"
import { ConnectionStatus } from "@/components/connection-status"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { getConnectionStatus } from "@/lib/firebase"

export default function AdminDashboard() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState({
    storeCount: 0,
    reviewCount: 0,
    userCount: 0,
    averageRating: 0,
    newStoresThisMonth: 0,
    newReviewsThisMonth: 0,
    newUsersThisMonth: 0,
    ratingChangeThisMonth: 0,
  })
  const [topRatedStores, setTopRatedStores] = useState<StoreType[]>([])
  const [latestReviews, setLatestReviews] = useState<Review[]>([])
  const [storeMap, setStoreMap] = useState<{ [key: string]: StoreType }>({})

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
      setError(null)

      // Холболтын төлөвийг шалгах
      const connectionStatus = getConnectionStatus()
      if (connectionStatus.isOfflineMode) {
        console.log("Оффлайн горимд ажиллаж байна, жишээ өгөгдлийг харуулна")
      }

      // Дэлгүүрүүдийг авах
      const stores = await storeService.getAllStores()

      // Дэлгүүрүүдийг ID-гаар индекслэх
      const storesById: { [key: string]: StoreType } = {}
      stores.forEach((store) => {
        if (store.id) {
          storesById[store.id] = store
        }
      })
      setStoreMap(storesById)

      // Сэтгэгдлүүдийг авах
      const reviews = await reviewService.getAllReviews()

      // Хэрэглэгчдийг авах
      const users = await userService.getAllUsers()

      // Дундаж үнэлгээг тооцоолох
      const totalRating = stores.reduce((sum, store) => sum + (store.rating || 0), 0)
      const averageRating = stores.length > 0 ? totalRating / stores.length : 0

      // Энэ сарын шинэ дэлгүүр, сэтгэгдэл, хэрэглэгчдийг тооцоолох
      const now = new Date()
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime()

      const newStoresThisMonth = stores.filter((store) => store.createdAt && store.createdAt >= firstDayOfMonth).length

      const newReviewsThisMonth = reviews.filter(
        (review) => review.createdAt && review.createdAt >= firstDayOfMonth,
      ).length

      const newUsersThisMonth = users.filter((user) => {
        const createdAt = user.createdAt ? new Date(user.createdAt).getTime() : 0
        return createdAt >= firstDayOfMonth
      }).length

      // Үнэлгээний өөрчлөлтийг тооцоолох (жишээ: +0.2)
      const ratingChangeThisMonth = 0.2

      // Статистик мэдээллийг шинэчлэх
      setStats({
        storeCount: stores.length,
        reviewCount: reviews.length,
        userCount: users.length,
        averageRating: Number.parseFloat(averageRating.toFixed(1)),
        newStoresThisMonth,
        newReviewsThisMonth,
        newUsersThisMonth,
        ratingChangeThisMonth,
      })

      // Шилдэг дэлгүүрүүдийг эрэмбэлэх (үнэлгээгээр)
      const sortedStores = [...stores].sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 5)
      setTopRatedStores(sortedStores)

      // Сүүлийн сэтгэгдлүүдийг эрэмбэлэх (огноогоор)
      const sortedReviews = [...reviews]
        .sort((a, b) => {
          const dateA = a.createdAt || new Date(a.date).getTime()
          const dateB = b.createdAt || new Date(b.date).getTime()
          return dateB - dateA
        })
        .slice(0, 5)
      setLatestReviews(sortedReviews)
    } catch (error: any) {
      console.error("Мэдээлэл авахад алдаа гарлаа:", error)
      setError(error?.message || "Өгөгдөл авахад алдаа гарлаа. Дахин оролдоно уу.")

      // Алдаа гарсан ч жишээ өгөгдлийг харуулах
      try {
        // Жишээ өгөгдлийг харуулах
        const stores = await storeService.getAllStores()
        const reviews = await reviewService.getAllReviews()

        // Шилдэг дэлгүүрүүдийг эрэмбэлэх
        const sortedStores = [...stores].sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 5)
        setTopRatedStores(sortedStores)

        // Сүүлийн сэтгэгдлүүдийг эрэмбэлэх
        const sortedReviews = [...reviews]
          .sort((a, b) => {
            const dateA = a.createdAt || new Date(a.date).getTime()
            const dateB = b.createdAt || new Date(b.date).getTime()
            return dateB - dateA
          })
          .slice(0, 5)
        setLatestReviews(sortedReviews)

        // Дэлгүүрүүдийг ID-гаар индекслэх
        const storesById: { [key: string]: StoreType } = {}
        stores.forEach((store) => {
          if (store.id) {
            storesById[store.id] = store
          }
        })
        setStoreMap(storesById)
      } catch (fallbackError) {
        console.error("Жишээ өгөгдөл харуулахад алдаа гарлаа:", fallbackError)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [toast])

  // Хэрэв алдаа гарсан бол алдааны мессеж харуулах
  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Хянах самбар</h1>
          <p className="text-muted-foreground">Системийн ерөнхий статистик болон мэдээлэл</p>
        </div>

        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Алдаа гарлаа</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>

        <div className="flex gap-4">
          <Button onClick={fetchData} variant="default">
            Дахин оролдох
          </Button>
          <Link href="/">
            <Button variant="outline">Нүүр хуудас руу буцах</Button>
          </Link>
        </div>

        <ConnectionStatus />

        {/* Алдаа гарсан ч өгөгдөл байвал харуулах */}
        {topRatedStores.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Шилдэг дэлгүүрүүд</h2>
            <div className="rounded-md border">
              <div className="grid grid-cols-5 border-b px-4 py-3 font-medium">
                <div>Дэлгүүр</div>
                <div>Ангилал</div>
                <div className="text-center">Үнэлгээ</div>
                <div className="text-center">Сэтгэгдэл</div>
                <div className="text-right">Үйлдэл</div>
              </div>
              {topRatedStores.map((store) => (
                <div key={store.id} className="grid grid-cols-5 items-center px-4 py-3">
                  <div className="font-medium">{store.name}</div>
                  <div className="text-muted-foreground">{store.category}</div>
                  <div className="flex justify-center">
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
                    <span className="ml-2 text-sm text-muted-foreground">{store.rating || 0}</span>
                  </div>
                  <div className="text-center text-muted-foreground">{store.reviews || 0}</div>
                  <div className="flex justify-end">
                    <Link href={`/admin/stores/${store.id}`}>
                      <Button variant="ghost" size="sm">
                        Харах
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  // loading үед харуулах дүрс
  if (loading) {
    return renderErrorOrLoading()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Хянах самбар</h1>
        <p className="text-muted-foreground">Системийн ерөнхий статистик болон мэдээлэл</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Нийт дэлгүүр</CardTitle>
            <Store className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.storeCount}</div>
            <p className="text-xs text-muted-foreground">+{stats.newStoresThisMonth} энэ сард</p>
          </CardContent>
          <CardFooter>
            <Link href="/admin/stores" className="text-xs text-blue-500 flex items-center">
              Дэлгэрэнгүй харах
              <ArrowUpRight className="ml-1 h-3 w-3" />
            </Link>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Нийт сэтгэгдэл</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.reviewCount}</div>
            <p className="text-xs text-muted-foreground">+{stats.newReviewsThisMonth} энэ сард</p>
          </CardContent>
          <CardFooter>
            <Link href="/admin/reviews" className="text-xs text-blue-500 flex items-center">
              Дэлгэрэнгүй харах
              <ArrowUpRight className="ml-1 h-3 w-3" />
            </Link>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Нийт хэрэглэгч</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.userCount}</div>
            <p className="text-xs text-muted-foreground">+{stats.newUsersThisMonth} энэ сард</p>
          </CardContent>
          <CardFooter>
            <Link href="/admin/users" className="text-xs text-blue-500 flex items-center">
              Дэлгэрэнгүй харах
              <ArrowUpRight className="ml-1 h-3 w-3" />
            </Link>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Дундаж үнэлгээ</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageRating}</div>
            <p className="text-xs text-muted-foreground">+{stats.ratingChangeThisMonth} энэ сард</p>
          </CardContent>
          <CardFooter>
            <Link href="/admin/stores" className="text-xs text-blue-500 flex items-center">
              Дэлгэрэнгүй харах
              <ArrowUpRight className="ml-1 h-3 w-3" />
            </Link>
          </CardFooter>
        </Card>
      </div>

      <Tabs defaultValue="top-stores">
        <TabsList>
          <TabsTrigger value="top-stores">Шилдэг дэлгүүрүүд</TabsTrigger>
          <TabsTrigger value="latest-reviews">Сүүлийн сэтгэгдлүүд</TabsTrigger>
        </TabsList>

        <TabsContent value="top-stores" className="space-y-4">
          <div className="rounded-md border">
            <div className="grid grid-cols-5 border-b px-4 py-3 font-medium">
              <div>Дэлгүүр</div>
              <div>Ангилал</div>
              <div className="text-center">Үнэлгээ</div>
              <div className="text-center">Сэтгэгдэл</div>
              <div className="text-right">Үйлдэл</div>
            </div>
            {topRatedStores.length === 0 ? (
              <div className="px-4 py-3 text-center text-muted-foreground">Дэлгүүр олдсонгүй</div>
            ) : (
              topRatedStores.map((store) => (
                <div key={store.id} className="grid grid-cols-5 items-center px-4 py-3">
                  <div className="font-medium">{store.name}</div>
                  <div className="text-muted-foreground">{store.category}</div>
                  <div className="flex justify-center">
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
                    <span className="ml-2 text-sm text-muted-foreground">{store.rating || 0}</span>
                  </div>
                  <div className="text-center text-muted-foreground">{store.reviews || 0}</div>
                  <div className="flex justify-end">
                    <Link href={`/admin/stores/${store.id}`}>
                      <Button variant="ghost" size="sm">
                        Харах
                      </Button>
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="flex justify-end">
            <Link href="/admin/stores">
              <Button variant="outline">Бүх дэлгүүрүүдийг харах</Button>
            </Link>
          </div>
        </TabsContent>

        <TabsContent value="latest-reviews" className="space-y-4">
          <div className="rounded-md border">
            <div className="grid grid-cols-5 border-b px-4 py-3 font-medium">
              <div>Хэрэглэгч</div>
              <div>Дэлгүүр</div>
              <div className="text-center">Үнэлгээ</div>
              <div>Огноо</div>
              <div className="text-right">Үйлдэл</div>
            </div>
            {latestReviews.length === 0 ? (
              <div className="px-4 py-3 text-center text-muted-foreground">Сэтгэгдэл олдсонгүй</div>
            ) : (
              latestReviews.map((review) => {
                const store = storeMap[review.storeId]
                return (
                  <div key={review.id} className="grid grid-cols-5 items-center px-4 py-3">
                    <div className="font-medium">{review.name}</div>
                    <div className="text-muted-foreground">{store?.name || "Устгагдсан дэлгүүр"}</div>
                    <div className="flex justify-center">
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
                    <div className="text-muted-foreground">{review.date}</div>
                    <div className="flex justify-end">
                      <Link href="/admin/reviews">
                        <Button variant="ghost" size="sm">
                          Харах
                        </Button>
                      </Link>
                    </div>
                  </div>
                )
              })
            )}
          </div>
          <div className="flex justify-end">
            <Link href="/admin/reviews">
              <Button variant="outline">Бүх сэтгэгдлүүдийг харах</Button>
            </Link>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
