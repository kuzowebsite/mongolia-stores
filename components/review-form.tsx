"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Star } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { reviewService } from "@/lib/db-service"

interface ReviewFormProps {
  storeId: string
  storeName: string
  onReviewAdded: () => void
}

export default function ReviewForm({ storeId, storeName, onReviewAdded }: ReviewFormProps) {
  const router = useRouter()
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState("")
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)

  // Хэрэглэгчийн мэдээллийг session storage-с авах
  useState(() => {
    if (typeof window !== "undefined") {
      const userStr = sessionStorage.getItem("currentUser")
      if (userStr) {
        try {
          const user = JSON.parse(userStr)
          setCurrentUser(user)
        } catch (e) {
          console.error("Хэрэглэгчийн мэдээлэл уншихад алдаа гарлаа:", e)
        }
      }
    }
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Хэрэглэгч нэвтрээгүй бол нэвтрэх хуудас руу шилжүүлэх
    if (!currentUser) {
      // Буцаж ирэх URL-ийг session storage-д хадгалах
      sessionStorage.setItem("redirectAfterLogin", `/stores/${storeId}`)
      router.push("/login")
      return
    }

    // Шалгалт
    if (rating === 0) {
      setError("Үнэлгээ өгнө үү")
      return
    }

    if (!comment.trim()) {
      setError("Сэтгэгдэл бичнэ үү")
      return
    }

    setIsSubmitting(true)

    try {
      // Шинэ сэтгэгдэл үүсгэх
      const newReview = {
        name: currentUser.name,
        store: storeName,
        storeId: storeId,
        rating: rating,
        comment: comment,
        date: new Date().toISOString().split("T")[0], // YYYY-MM-DD формат
      }

      await reviewService.addReview(newReview)

      // Форм цэвэрлэх
      setRating(0)
      setComment("")

      // Эцэг компонентэд мэдэгдэх
      onReviewAdded()
    } catch (error) {
      console.error("Сэтгэгдэл нэмэхэд алдаа гарлаа:", error)
      setError("Сэтгэгдэл нэмэхэд алдаа гарлаа. Дахин оролдоно уу.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Хэрэв хэрэглэгч нэвтрээгүй бол нэвтрэх хэсэг харуулах
  if (!currentUser) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Сэтгэгдэл үлдээх</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Сэтгэгдэл үлдээхийн тулд та эхлээд нэвтрэх шаардлагатай.</p>
        </CardContent>
        <CardFooter>
          <Button
            onClick={() => {
              // Буцаж ирэх URL-ийг session storage-д хадгалах
              sessionStorage.setItem("redirectAfterLogin", `/stores/${storeId}`)
              router.push("/login")
            }}
          >
            Нэвтрэх
          </Button>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Сэтгэгдэл үлдээх</CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <div className="flex items-center mb-2">
              <span className="mr-2">Үнэлгээ:</span>
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-6 w-6 cursor-pointer ${
                      star <= (hoverRating || rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                    }`}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                  />
                ))}
              </div>
            </div>
            <Textarea
              placeholder="Таны сэтгэгдэл..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              className="w-full"
            />
          </div>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Илгээж байна..." : "Сэтгэгдэл үлдээх"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
