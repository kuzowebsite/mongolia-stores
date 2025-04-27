"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { reviewService, type Review } from "@/lib/db-service"
import { useToast } from "@/components/ui/use-toast"

export default function EditReviewPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [review, setReview] = useState<Review | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const [rating, setRating] = useState<number>(5)
  const [comment, setComment] = useState<string>("")

  useEffect(() => {
    const fetchReview = async () => {
      try {
        setIsLoading(true)

        // Хэрэглэгчийн мэдээллийг session storage-с авах
        const userStr = sessionStorage.getItem("currentUser")
        if (!userStr) {
          // Хэрэглэгч нэвтрээгүй бол нэвтрэх хуудас руу шилжүүлэх
          router.push("/login")
          return
        }

        // Бүх сэтгэгдлүүдийг авах
        const allReviews = await reviewService.getAllReviews()

        // ID-гаар сэтгэгдлийг олох
        const foundReview = allReviews.find((r) => r.id === params.id)

        if (!foundReview) {
          toast({
            variant: "destructive",
            title: "Алдаа гарлаа",
            description: "Сэтгэгдэл олдсонгүй.",
          })
          router.push("/profile/reviews")
          return
        }

        // Хэрэглэгчийн өөрийн сэтгэгдэл мөн эсэхийг шалгах
        const user = JSON.parse(userStr)
        if (foundReview.name !== user.name) {
          toast({
            variant: "destructive",
            title: "Зөвшөөрөлгүй",
            description: "Та зөвхөн өөрийн сэтгэгдлийг засах боломжтой.",
          })
          router.push("/profile/reviews")
          return
        }

        setReview(foundReview)
        setRating(foundReview.rating)
        setComment(foundReview.comment)
      } catch (error) {
        console.error("Сэтгэгдэл авахад алдаа гарлаа:", error)
        toast({
          variant: "destructive",
          title: "Алдаа гарлаа",
          description: "Сэтгэгдэл ачааллахад алдаа гарлаа. Дахин оролдоно уу.",
        })
        router.push("/profile/reviews")
      } finally {
        setIsLoading(false)
      }
    }

    fetchReview()
  }, [params.id, router, toast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!review) return

    try {
      setIsSaving(true)

      // Сэтгэгдлийг шинэчлэх
      // Энд бид шинэ сэтгэгдэл үүсгэж хуучныг устгах замаар шинэчилнэ
      // Учир нь одоогийн API-д шинэчлэх функц байхгүй

      const updatedReview: Review = {
        ...review,
        rating,
        comment,
      }

      // Хуучин сэтгэгдлийг устгах
      await reviewService.deleteReview(review.id!, review.storeId)

      // Шинэ сэтгэгдэл нэмэх
      await reviewService.addReview(updatedReview)

      toast({
        title: "Амжилттай хадгаллаа",
        description: "Сэтгэгдэл амжилттай шинэчлэгдлээ.",
      })

      router.push("/profile/reviews")
    } catch (error) {
      console.error("Сэтгэгдэл шинэчлэхэд алдаа гарлаа:", error)
      toast({
        variant: "destructive",
        title: "Алдаа гарлаа",
        description: "Сэтгэгдэл шинэчлэхэд алдаа гарлаа. Дахин оролдоно уу.",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container py-10">
        <div className="flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Сэтгэгдлийг ачааллаж байна...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!review) {
    return (
      <div className="container py-10">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Сэтгэгдэл олдсонгүй</h1>
          <Button asChild>
            <Link href="/profile/reviews">Буцах</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container max-w-2xl py-10">
      <div className="mb-6">
        <Link
          href="/profile/reviews"
          className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
          Сэтгэгдлүүд рүү буцах
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Сэтгэгдэл засах</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="store">Дэлгүүр</Label>
              <Input id="store" value={review.store} disabled />
            </div>

            <div>
              <Label htmlFor="rating">Үнэлгээ</Label>
              <Select value={rating.toString()} onValueChange={(value) => setRating(Number.parseInt(value))}>
                <SelectTrigger>
                  <SelectValue placeholder="Үнэлгээ сонгох" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 - Маш муу</SelectItem>
                  <SelectItem value="2">2 - Муу</SelectItem>
                  <SelectItem value="3">3 - Дунд зэрэг</SelectItem>
                  <SelectItem value="4">4 - Сайн</SelectItem>
                  <SelectItem value="5">5 - Маш сайн</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="comment">Сэтгэгдэл</Label>
              <Textarea
                id="comment"
                placeholder="Таны сэтгэгдэл..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={5}
                required
              />
            </div>

            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={() => router.push("/profile/reviews")}>
                Цуцлах
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "Хадгалж байна..." : "Хадгалах"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
