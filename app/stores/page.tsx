"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search, StoreIcon } from "lucide-react"
import { storeService, type Store } from "@/lib/db-service"

export default function StoresPage() {
  const [stores, setStores] = useState<Store[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

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

  // useEffect дотор fetchStores функцийг өөрчлөх
  const fetchStores = async () => {
    try {
      setLoading(true)
      const storesData = await storeService.getAllStores()
      setStores(storesData)
    } catch (error) {
      console.error("Дэлгүүрүүдийг авахад алдаа гарлаа:", error)
      // Алдаа гарсан үед setError хийхгүй, loading хэвээр байлгана
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStores()
  }, [])

  // Хайлтын үр дүн
  const filteredStores = stores.filter(
    (store) =>
      store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      store.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      store.description.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // loading үед харуулах дүрс
  if (loading) {
    return renderErrorOrLoading()
  }

  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-background">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">Бүх дэлгүүрүүд</h1>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Монголын шилдэг дэлгүүрүүдийн жагсаалт
            </p>
          </div>
        </div>

        <div className="mx-auto mt-8 max-w-md">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Дэлгүүр хайх..."
              className="w-full pl-8 bg-white/95"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {filteredStores.length === 0 ? (
          <div className="text-center py-10 mt-10">
            <p className="text-muted-foreground">Дэлгүүр олдсонгүй</p>
          </div>
        ) : (
          <div className="mt-10 grid grid-cols-2 gap-2 sm:gap-4 md:gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredStores.map((store, index) => (
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
        )}
      </div>
    </section>
  )
}
