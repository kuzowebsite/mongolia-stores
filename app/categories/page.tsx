"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { categoryService, storeService, type Category, type Store } from "@/lib/db-service"
import { StoreIcon } from "lucide-react"

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [stores, setStores] = useState<{ [key: string]: Store[] }>({})
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

      // Ангилалуудыг авах
      const categoriesData = await categoryService.getAllCategories()
      setCategories(categoriesData)

      // Дэлгүүрүүдийг авах
      const storesData = await storeService.getAllStores()

      // Ангилал бүрээр дэлгүүрүүдийг бүлэглэх
      const storesByCategory: { [key: string]: Store[] } = {}
      categoriesData.forEach((category) => {
        storesByCategory[category.name] = storesData.filter((store) => store.category === category.name)
      })

      setStores(storesByCategory)
    } catch (error) {
      console.error("Ангилалуудыг авахад алдаа гарлаа:", error)
      // Алдаа гарсан үед loading хэвээр байлгана
    } finally {
      setLoading(false)
    }
  }

  // Ангилалууд болон дэлгүүрүүдийг авах
  useEffect(() => {
    fetchData()
  }, [])

  // loading үед харуулах дүрс
  if (loading) {
    return renderErrorOrLoading()
  }

  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-background">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">Ангилал</h1>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Дэлгүүрүүдийг ангилалаар нь харах
            </p>
          </div>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-2 sm:gap-4 md:gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {categories.length === 0 ? (
            <div className="col-span-full text-center py-10">
              <p className="text-muted-foreground">Ангилал олдсонгүй</p>
            </div>
          ) : (
            categories.map((category, index) => {
              const categoryStores = stores[category.name] || []
              const topStore = categoryStores.length > 0 ? categoryStores[0] : null

              return (
                <Card key={index} className="overflow-hidden">
                  <CardHeader className="p-0">
                    {topStore?.image ? (
                      <Image
                        src={topStore.image || "/placeholder.svg"}
                        alt={category.name}
                        width={400}
                        height={300}
                        className="h-48 w-full object-cover transition-all hover:scale-105"
                      />
                    ) : category.image ? (
                      <Image
                        src={category.image || "/placeholder.svg"}
                        alt={category.name}
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
                      <h3 className="font-semibold text-xs sm:text-base truncate">{category.name}</h3>
                      <Badge variant="outline" className="hidden sm:flex">
                        {category.storeCount || categoryStores.length} дэлгүүр
                      </Badge>
                    </div>
                    <p className="mt-2 text-xs sm:text-sm text-muted-foreground line-clamp-1 sm:line-clamp-2 hidden sm:block">
                      {category.description || getDefaultCategoryDescription(category.name)}
                    </p>
                  </CardContent>
                  <CardFooter className="p-2 pt-0 sm:p-4 sm:pt-0">
                    <Link href={`/categories/${encodeURIComponent(category.name)}`} className="w-full">
                      <Button variant="outline" className="w-full text-xs sm:text-sm h-8 sm:h-10">
                        Дэлгүүрүүдийг харах
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              )
            })
          )}
        </div>
      </div>
    </section>
  )
}

// Ангилалын тайлбар байхгүй бол анхны тайлбар
function getDefaultCategoryDescription(categoryName: string): string {
  switch (categoryName) {
    case "Худалдааны төв":
      return "Олон төрлийн брэндүүд, дэлгүүрүүд нэг дор"
    case "Супермаркет":
      return "Өргөн хэрэглээний бараа, хүнсний бүтээгдэхүүн"
    case "Хувцас":
      return "Загварлаг хувцас, гутал, гоёл чимэглэл"
    case "Цахилгаан бараа":
      return "Цахилгаан хэрэгсэл, техник, компьютер"
    default:
      return `${categoryName} ангилалын дэлгүүрүүд`
  }
}
