"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { storeService, categoryService, reviewService, userService, settingsService } from "@/lib/db-service"

// Туршилтын дэлгүүрүүд
const sampleStores = [
  {
    name: "Шангри-Ла Молл",
    category: "Худалдааны төв",
    rating: 4.5,
    reviews: 120,
    image: "/shangri-la-mall-ulaanbaatar-exterior.png",
    description: "Улаанбаатар хотын хамгийн орчин үеийн худалдааны төв",
    address: "Сүхбаатарын талбай, Улаанбаатар",
    phone: "+976 7700 8877",
    hours: "10:00 - 22:00",
    website: "https://shangrila.mn",
    fullDescription:
      "Шангри-Ла Молл нь Улаанбаатар хотын төвд байрлах таван давхар худалдааны төв бөгөөд олон улсын брэндүүд, ресторан, кино театр, тоглоомын төв зэрэг олон төрлийн үйлчилгээг нэг дор үзүүлдэг.",
    services: ["Үнэгүй Wi-Fi", "Хүүхэд харах үйлчилгээ", "Зогсоол", "Хоолны хэсэг"],
    location: {
      lat: 47.9184,
      lng: 106.9176,
    },
  },
  {
    name: "Улсын их дэлгүүр",
    category: "Их дэлгүүр",
    rating: 4.2,
    reviews: 85,
    image: "/ulaanbaatar-state-department-store.png",
    description: "Монголын хамгийн том уламжлалт их дэлгүүр",
    address: "Сүхбаатарын гудамж, Улаанбаатар",
    phone: "+976 1100 2233",
    hours: "09:00 - 21:00",
    website: "https://uiddelguur.mn",
    fullDescription:
      "Улсын их дэлгүүр нь Монголын хамгийн том, хамгийн уламжлалт их дэлгүүр бөгөөд 1921 онд байгуулагдсан. Энэ дэлгүүр нь хувцас, гэр ахуйн бараа, монгол үндэсний бүтээгдэхүүн, бэлэг дурсгалын зүйлс зэрэг олон төрлийн бараа бүтээгдэхүүнийг санал болгодог.",
    services: ["Бэлэг боох үйлчилгээ", "Зогсоол", "Мөнгө солих цэг"],
    location: {
      lat: 47.9137,
      lng: 106.9158,
    },
  },
  {
    name: "Номин Супермаркет",
    category: "Супермаркет",
    rating: 4.0,
    reviews: 65,
    image: "/nomin-supermarket-aisle.png",
    description: "Өргөн хэрэглээний бараа, хүнсний бүтээгдэхүүний дэлгүүр",
    address: "Баянзүрх дүүрэг, Улаанбаатар",
    phone: "+976 7711 4455",
    hours: "08:00 - 23:00",
    website: "https://nomin.mn",
    fullDescription:
      "Номин Супермаркет нь Монголын хамгийн том супермаркетын сүлжээнүүдийн нэг бөгөөд хүнсний бүтээгдэхүүн, өргөн хэрэглээний бараа, гэр ахуйн бараа, цахилгаан хэрэгсэл зэрэг олон төрлийн бараа бүтээгдэхүүнийг нэг дороос худалдан авах боломжийг олгодог.",
    services: ["Хүргэлтийн үйлчилгээ", "Зогсоол", "Талх, нарийн боовны цех"],
    location: {
      lat: 47.9237,
      lng: 106.9315,
    },
  },
  {
    name: "Улаанбаатар Бутик",
    category: "Хувцасны дэлгүүр",
    rating: 4.7,
    reviews: 42,
    image: "/ulaanbaatar-boutique.png",
    description: "Монгол дизайнеруудын бүтээсэн загварлаг хувцас",
    address: "Чингэлтэй дүүрэг, Улаанбаатар",
    phone: "+976 9911 2233",
    hours: "11:00 - 20:00",
    website: "https://ub-boutique.mn",
    fullDescription:
      "Улаанбаатар Бутик нь Монголын залуу дизайнеруудын бүтээсэн загварлаг хувцас, гоёл чимэглэлийг танилцуулдаг дэлгүүр юм. Энэ дэлгүүр нь орчин үеийн загвар, уламжлалт монгол хээ угалз, эсгийн урлалыг хослуулсан онцгой бүтээгдэхүүнүүдийг санал болгодог.",
    services: ["Хувийн зөвлөгөө өгөх үйлчилгээ", "Захиалгаар оёх", "Хувцас засварлах"],
    location: {
      lat: 47.9154,
      lng: 106.9067,
    },
  },
  {
    name: "Модерн Монгол Молл",
    category: "Худалдааны төв",
    rating: 4.3,
    reviews: 78,
    image: "/modern-mongolian-mall.png",
    description: "Орчин үеийн загварлаг худалдааны төв",
    address: "Хан-Уул дүүрэг, Улаанбаатар",
    phone: "+976 7722 8899",
    hours: "10:00 - 22:00",
    website: "https://modernmall.mn",
    fullDescription:
      "Модерн Монгол Молл нь Улаанбаатар хотын шинэ хороололд байрлах орчин үеийн худалдааны төв юм. Энэ худалдааны төв нь олон улсын болон дотоодын брэндүүд, ресторан, кофе шоп, тоглоомын төв зэрэг олон төрлийн үйлчилгээг нэг дор үзүүлдэг.",
    services: ["Үнэгүй Wi-Fi", "Хүүхэд харах үйлчилгээ", "Зогсоол", "Фитнес төв"],
    location: {
      lat: 47.9021,
      lng: 106.9201,
    },
  },
]

// Туршилтын ангилалууд
const sampleCategories = [
  {
    name: "Худалдааны төв",
    description: "Олон төрлийн дэлгүүр, үйлчилгээг нэг дор үзүүлдэг том барилга",
    image: "/shangri-la-mall-ulaanbaatar-exterior.png",
    storeCount: 2,
  },
  {
    name: "Их дэлгүүр",
    description: "Олон төрлийн бараа бүтээгдэхүүнийг нэг дор худалдаалдаг том дэлгүүр",
    image: "/ulaanbaatar-state-department-store.png",
    storeCount: 1,
  },
  {
    name: "Супермаркет",
    description: "Хүнсний болон өргөн хэрэглээний бараа бүтээгдэхүүн худалдаалдаг дэлгүүр",
    image: "/nomin-supermarket-aisle.png",
    storeCount: 1,
  },
  {
    name: "Хувцасны дэлгүүр",
    description: "Хувцас, гутал, гоёл чимэглэл худалдаалдаг дэлгүүр",
    image: "/ulaanbaatar-boutique.png",
    storeCount: 1,
  },
]

// Туршилтын сэтгэгдэлүүд
const sampleReviews = [
  {
    name: "Болд Баатар",
    store: "Шангри-Ла Молл",
    storeId: "", // Дэлгүүр үүсгэсний дараа ID-г оноох
    rating: 5,
    comment: "Маш сайхан худалдааны төв. Олон төрлийн дэлгүүр, ресторан байдаг. Цэвэрхэн, тухтай.",
    date: "2023-05-15",
  },
  {
    name: "Сараа Дорж",
    store: "Улсын их дэлгүүр",
    storeId: "", // Дэлгүүр үүсгэсний дараа ID-г оноох
    rating: 4,
    comment: "Уламжлалт их дэлгүүр, олон төрлийн бараа бүтээгдэхүүн байдаг. Гэхдээ зарим үед хүн их байдаг.",
    date: "2023-06-20",
  },
  {
    name: "Бат-Эрдэнэ Лхагва",
    store: "Номин Супермаркет",
    storeId: "", // Дэлгүүр үүсгэсний дараа ID-г оноох
    rating: 4,
    comment: "Үнэ хямд, олон төрлийн бараа бүтээгдэхүүнтэй. Ажилчид эелдэг, үйлчилгээ сайн.",
    date: "2023-07-10",
  },
  {
    name: "Оюунаа Ганбат",
    store: "Улаанбаатар Бутик",
    storeId: "", // Дэлгүүр үүсгэсний дараа ID-г оноох
    rating: 5,
    comment: "Монгол дизайнеруудын бүтээсэн гоё хувцас байдаг. Үнэ өндөр ч чанартай.",
    date: "2023-08-05",
  },
  {
    name: "Төмөр Очир",
    store: "Модерн Монгол Молл",
    storeId: "", // Дэлгүүр үүсгэсний дараа ID-г оноох
    rating: 4,
    comment: "Шинэ, орчин үеийн худалдааны төв. Зогсоол том, дэлгүүр олон. Гэхдээ хотын төвөөс арай хол.",
    date: "2023-09-12",
  },
]

// Туршилтын хэрэглэгчид
const sampleUsers = [
  {
    name: "Админ Хэрэглэгч",
    email: "admin@example.com",
    password: "admin123", // Нууц үг нэмэх
    role: "admin",
    status: "active",
    phone: "+976 9911 2233",
    createdAt: "2023-01-01T00:00:00.000Z",
  },
  {
    name: "Энгийн Хэрэглэгч",
    email: "user@example.com",
    password: "password123", // Нууц үг нэмэх
    role: "user",
    status: "active",
    phone: "+976 9922 3344",
    createdAt: "2023-01-02T00:00:00.000Z",
  },
  {
    name: "Болд Баатар",
    email: "bold@example.com",
    password: "password123", // Нууц үг нэмэх
    role: "user",
    status: "active",
    phone: "+976 9933 4455",
    createdAt: "2023-01-03T00:00:00.000Z",
  },
  {
    name: "Сараа Дорж",
    email: "saraa@example.com",
    password: "password123", // Нууц үг нэмэх
    role: "user",
    status: "active",
    phone: "+976 9944 5566",
    createdAt: "2023-01-04T00:00:00.000Z",
  },
]

// Туршилтын тохиргоо
const sampleSettings = {
  siteName: "МонголШоп",
  siteUrl: "https://mongolshop.mn",
  siteDescription: "Монголын шилдэг дэлгүүрүүдийн мэдээлэл, үнэлгээ болон сэтгэгдэлүүдийг нэг дороос харах вэбсайт",
  contactEmail: "info@mongolshop.mn",
  contactPhone: "+976 9911 2233",
  showFeaturedStores: true,
  showLatestReviews: true,
  showNewsletter: true,
  darkMode: false,
  animations: true,
}

export default function InitDataComponent() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [storeIds, setStoreIds] = useState<Record<string, string>>({})

  const initializeData = async () => {
    setLoading(true)
    setError("")
    setSuccess("")

    try {
      // Тохиргоо үүсгэх
      await settingsService.saveSettings(sampleSettings)

      // Ангилалууд үүсгэх
      for (const category of sampleCategories) {
        await categoryService.addCategory(category)
      }

      // Дэлгүүрүүд үүсгэх
      const newStoreIds: Record<string, string> = {}
      for (const store of sampleStores) {
        const storeId = await storeService.addStore(store)
        if (storeId) {
          newStoreIds[store.name] = storeId
        }
      }
      setStoreIds(newStoreIds)

      // Сэтгэгдэлүүд үүсгэх
      for (const review of sampleReviews) {
        const storeId = newStoreIds[review.store]
        if (storeId) {
          await reviewService.addReview({
            ...review,
            storeId,
          })
        }
      }

      // Хэрэглэгчид үүсгэх
      for (const user of sampleUsers) {
        await userService.createUser(user)
      }

      // Ангилалын дэлгүүрийн тоог шинэчлэх
      await categoryService.updateAllCategoryStoreCounts()

      setSuccess("Туршилтын өгөгдөл амжилттай үүслээ!")
    } catch (error) {
      console.error("Өгөгдөл үүсгэхэд алдаа гарлаа:", error)
      setError("Өгөгдөл үүсгэхэд алдаа гарлаа. Өгөгдлийн сантай холбогдох боломжгүй байна.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8">
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Туршилтын өгөгдөл үүсгэх</CardTitle>
          <CardDescription>
            Энэ хэсэг нь туршилтын өгөгдөл үүсгэх зориулалттай. Бодит төслийн хувьд энэ хэсгийг устгана уу.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {success && (
            <Alert className="mb-4 bg-green-50 text-green-800 border-green-200">
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-4">
            <div className="text-sm">
              <p>Дараах туршилтын өгөгдөл үүсгэгдэнэ:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>5 дэлгүүр</li>
                <li>4 ангилал</li>
                <li>5 сэтгэгдэл</li>
                <li>4 хэрэглэгч (1 админ, 3 энгийн)</li>
                <li>Сайтын тохиргоо</li>
              </ul>
            </div>
            <div className="text-sm">
              <p className="font-medium">Нэвтрэх мэдээлэл:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>
                  <span className="font-medium">Админ:</span> admin@example.com / admin123
                </li>
                <li>
                  <span className="font-medium">Хэрэглэгч:</span> user@example.com / password123
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={initializeData} disabled={loading} className="w-full">
            {loading ? "Өгөгдөл үүсгэж байна..." : "Туршилтын өгөгдөл үүсгэх"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
