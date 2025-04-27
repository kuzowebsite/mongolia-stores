"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Search, RefreshCcw, AlertCircle } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { StoreIcon } from "lucide-react"
import {
  storeService,
  reviewService,
  settingsService,
  type Store,
  type Review,
  type SiteSettings,
} from "@/lib/db-service"

export default function Home() {
  const [stores, setStores] = useState<Store[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [settings, setSettings] = useState<SiteSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [error, setError] = useState<string | null>(null)

  // Хуудасны алдааны компонентийг өөрчлөх - алдаа гарсан үед ачааллаж байна гэж харуулах
  const renderErrorOrLoading = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Өгөгдөл ачааллаж байна, түр хүлээнэ үү...</p>
            <p className="mt-2 text-xs text-muted-foreground">
              Хэрэв өгөгдлийн сантай холбогдох боломжгүй бол жишээ өгөгдлийг харуулна.
            </p>
          </div>
        </div>
      )
    }

    if (error) {
      return (
        <div className="container px-4 py-12 md:px-6">
          <div className="mx-auto max-w-md">
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Алдаа гарлаа</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <div className="text-center">
              <Button onClick={fetchData} className="mb-4">
                <RefreshCcw className="mr-2 h-4 w-4" />
                Дахин оролдох
              </Button>
            </div>
          </div>
        </div>
      )
    }

    return null
  }

  // useEffect дотор fetchData функцийг өөрчлөх
  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Тохиргоог авах
      const settingsData = await settingsService.getOrCreateSettings()
      setSettings(settingsData)

      // Дэлгүүрүүдийг авах
      const storesData = await storeService.getAllStores()
      setStores(storesData)

      // Сэтгэгдлүүдийг авах
      const reviewsData = await reviewService.getAllReviews()
      setReviews(reviewsData)
    } catch (error: any) {
      console.error("Мэдээлэл авахад алдаа гарлаа:", error)
      setError(error?.message || "Өгөгдөл авахад алдаа гарлаа")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()

    // Сүлжээний холболт өөрчлөгдөх үед дахин холбогдох
    const handleOnline = () => {
      console.log("Сүлжээний холболт сэргэлээ, өгөгдөл дахин ачааллаж байна...")
      fetchData()
    }

    window.addEventListener("online", handleOnline)

    return () => {
      window.removeEventListener("online", handleOnline)
    }
  }, [])

  // Хайлтын үр дүн
  const filteredStores =
    searchQuery.trim() === ""
      ? stores
      : stores.filter(
          (store) =>
            store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            store.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
            store.description.toLowerCase().includes(searchQuery.toLowerCase()),
        )

  // Дэлгүүрүүдийг үнэлгээгээр эрэмбэлэх
  const sortedStores = [...filteredStores].sort((a, b) => (b.rating || 0) - (a.rating || 0))

  // Сүүлийн сэтгэгдлүүдийг огноогоор эрэмбэлэх
  const sortedReviews = [...reviews]
    .sort((a, b) => {
      const dateA = a.createdAt || new Date(a.date).getTime()
      const dateB = b.createdAt || new Date(b.date).getTime()
      return dateB - dateA
    })
    .slice(0, 6)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // Хайлт хийх үед энд хэрэгжүүлэх логик
    console.log("Хайлт:", searchQuery)
  }

  // Хэрэв loading эсвэл error үед харуулах дүрс
  if (loading || error) {
    return renderErrorOrLoading()
  }

  return (
    <>
      <section className="w-full py-8 md:py-12 lg:py-24 bg-gradient-to-b from-muted/50 to-background">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <h1 className="text-2xl font-bold tracking-tighter sm:text-4xl xl:text-5xl/none">
                  {settings?.siteName || "Монголын шилдэг дэлгүүрүүд нэг дор"}
                </h1>
                <p className="max-w-[600px] text-sm text-muted-foreground md:text-base lg:text-xl">
                  {settings?.siteDescription ||
                    "Хамгийн шилдэг дэлгүүрүүдийн мэдээлэл, үнэлгээ болон сэтгэгдэлүүдийг нэг дороос харах боломжтой."}
                </p>
              </div>
              <form onSubmit={handleSearch} className="flex flex-col gap-2 min-[400px]:flex-row">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Дэлгүүр хайх..."
                    className="w-full pl-8 bg-white/95"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button type="submit">Хайх</Button>
              </form>
            </div>
            <Image
              src="/modern-mongolian-mall.png"
              width={800}
              height={550}
              alt="Монголын дэлгүүрүүд"
              className="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full lg:order-last"
            />
          </div>
        </div>
      </section>

      {settings?.showFeaturedStores !== false && (
        <section className="w-full py-12 md:py-24 lg:py-32 bg-background">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">Онцлох дэлгүүрүүд</div>
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                  Хамгийн их үнэлгээтэй дэлгүүрүүд
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Хэрэглэгчдийн хамгийн их үнэлгээ авсан шилдэг дэлгүүрүүдийг танилцуулж байна.
                </p>
              </div>
            </div>

            <Tabs defaultValue="all" className="mt-8">
              <div className="overflow-x-auto pb-2 -mx-4 px-4">
                <div className="min-w-max inline-flex">
                  <TabsList className="flex">
                    <TabsTrigger value="all" className="min-w-[100px]">
                      Бүгд
                    </TabsTrigger>
                    <TabsTrigger value="shopping" className="min-w-[140px]">
                      Худалдааны төв
                    </TabsTrigger>
                    <TabsTrigger value="supermarket" className="min-w-[140px]">
                      Супермаркет
                    </TabsTrigger>
                    <TabsTrigger value="clothing" className="min-w-[100px]">
                      Хувцас
                    </TabsTrigger>
                    <TabsTrigger value="electronics" className="min-w-[140px]">
                      Цахилгаан бараа
                    </TabsTrigger>
                  </TabsList>
                </div>
              </div>

              <TabsContent value="all" className="mt-6">
                <div className="mt-10 grid grid-cols-2 gap-2 sm:gap-4 md:gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {sortedStores.length === 0 ? (
                    <div className="col-span-full text-center py-10">
                      <p className="text-muted-foreground">Дэлгүүр олдсонгүй</p>
                    </div>
                  ) : (
                    sortedStores.slice(0, 8).map((store, index) => (
                      <Card key={index} className="overflow-hidden">
                        <CardHeader className="p-0">
                          {store.image ? (
                            <Image
                              src={store.image || "/placeholder.svg"}
                              alt={store.name}
                              width={400}
                              height={300}
                              className="h-48 w-full object-cover transition-all hover:scale-105"
                            />
                          ) : (
                            <div className="h-48 w-full flex items-center justify-center bg-muted">
                              <StoreIcon className="h-12 w-12 text-muted-foreground" />
                            </div>
                          )}
                        </CardHeader>
                        <CardContent className="p-2 sm:p-4">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-xs sm:text-base truncate">{store.name}</h3>
                            <Badge variant="outline" className="hidden sm:flex">
                              {store.category}
                            </Badge>
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
                            <span className="ml-2 text-xs sm:text-sm text-muted-foreground">
                              {store.rating || 0} ({store.reviews || 0} сэтгэгдэл)
                            </span>
                          </div>
                          <p className="mt-2 text-xs sm:text-sm text-muted-foreground line-clamp-1 sm:line-clamp-2 hidden sm:block">
                            {store.description}
                          </p>
                        </CardContent>
                        <CardFooter className="p-2 pt-0 sm:p-4 sm:pt-0">
                          <Link href={`/stores/${store.id}`} className="w-full">
                            <Button variant="outline" className="w-full text-xs sm:text-sm h-8 sm:h-10">
                              Дэлгэрэнгүй
                            </Button>
                          </Link>
                        </CardFooter>
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>

              {["shopping", "supermarket", "clothing", "electronics"].map((tab) => (
                <TabsContent key={tab} value={tab} className="mt-6">
                  <div className="grid grid-cols-2 gap-2 sm:gap-4 md:gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {sortedStores
                      .filter((store) => {
                        if (tab === "shopping") return store.category === "Худалдааны төв"
                        if (tab === "supermarket") return store.category === "Супермаркет"
                        if (tab === "clothing") return store.category === "Хувцас"
                        if (tab === "electronics") return store.category === "Цахилгаан бараа"
                        return false
                      })
                      .slice(0, 8)
                      .map((store, index) => (
                        <Card key={index} className="overflow-hidden">
                          <CardHeader className="p-0">
                            {store.image ? (
                              <Image
                                src={store.image || "/placeholder.svg"}
                                alt={store.name}
                                width={400}
                                height={300}
                                className="h-48 w-full object-cover transition-all hover:scale-105"
                              />
                            ) : (
                              <div className="h-48 w-full flex items-center justify-center bg-muted">
                                <StoreIcon className="h-12 w-12 text-muted-foreground" />
                              </div>
                            )}
                          </CardHeader>
                          <CardContent className="p-2 sm:p-4">
                            <div className="flex items-center justify-between">
                              <h3 className="font-semibold text-xs sm:text-base truncate">{store.name}</h3>
                              <Badge variant="outline" className="hidden sm:flex">
                                {store.category}
                              </Badge>
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
                              <span className="ml-2 text-xs sm:text-sm text-muted-foreground">
                                {store.rating || 0} ({store.reviews || 0} сэтгэгдэл)
                              </span>
                            </div>
                            <p className="mt-2 text-xs sm:text-sm text-muted-foreground line-clamp-1 sm:line-clamp-2 hidden sm:block">
                              {store.description}
                            </p>
                          </CardContent>
                          <CardFooter className="p-2 pt-0 sm:p-4 sm:pt-0">
                            <Link href={`/stores/${store.id}`} className="w-full">
                              <Button variant="outline" className="w-full text-xs sm:text-sm h-8 sm:h-10">
                                Дэлгэрэнгүй
                              </Button>
                            </Link>
                          </CardFooter>
                        </Card>
                      ))}
                  </div>
                </TabsContent>
              ))}
            </Tabs>

            <div className="mt-12 flex justify-center">
              <Link href="/stores">
                <Button variant="outline" size="lg">
                  Бүх дэлгүүрүүдийг харах
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {settings?.showLatestReviews !== false && (
        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/50">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">Сүүлийн үеийн сэтгэгдэлүүд</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Хэрэглэгчдийн сүүлийн үеийн сэтгэгдэлүүдийг уншаарай.
                </p>
              </div>
            </div>

            <div className="mx-auto mt-8 grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {sortedReviews.length === 0 ? (
                <div className="col-span-full text-center py-10">
                  <p className="text-muted-foreground">Сэтгэгдэл олдсонгүй</p>
                </div>
              ) : (
                sortedReviews.map((review, index) => {
                  const store = stores.find((s) => s.id === review.storeId)
                  return (
                    <Card key={index} className="h-full">
                      <CardHeader>
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
                            <Link href={`/stores/${review.storeId}`}>
                              <p className="text-sm text-muted-foreground hover:underline">
                                {store?.name || "Устгагдсан дэлгүүр"}
                              </p>
                            </Link>
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
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">{review.comment}</p>
                      </CardContent>
                      <CardFooter>
                        <p className="text-xs text-muted-foreground">{review.date}</p>
                      </CardFooter>
                    </Card>
                  )
                })
              )}
            </div>

            <div className="mt-12 flex justify-center">
              <Link href="/ratings">
                <Button variant="outline" size="lg">
                  Бүх сэтгэгдэлүүдийг харах
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {settings?.showNewsletter !== false && (
        <section className="w-full py-12 md:py-24 lg:py-32 bg-background">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">Бидэнтэй нэгдээрэй</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Шинэ дэлгүүрүүд, хямдрал, урамшууллын талаар хамгийн түрүүнд мэдээлэл авахыг хүсвэл бүртгүүлээрэй.
                </p>
              </div>
              <div className="w-full max-w-sm space-y-2">
                <div className="flex space-x-2">
                  <Input placeholder="И-мэйл хаяг" type="email" />
                  <Button type="submit">Бүртгүүлэх</Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Бүртгүүлснээр та бидний{" "}
                  <Link href="#" className="underline underline-offset-2">
                    Үйлчилгээний нөхцөл
                  </Link>
                  -ийг хүлээн зөвшөөрч байна.
                </p>
              </div>
            </div>
          </div>
        </section>
      )}
    </>
  )
}
