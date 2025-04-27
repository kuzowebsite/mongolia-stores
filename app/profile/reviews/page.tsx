"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ChevronLeft, Star, Edit, Trash2, AlertCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { reviewService, type Review } from "@/lib/db-service"
import { useToast } from "@/components/ui/use-toast"

export default function UserReviewsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [reviews, setReviews] = useState<Review[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deleteReviewId, setDeleteReviewId] = useState<string | null>(null)
  const [deleteStoreId, setDeleteStoreId] = useState<string | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  useEffect(() => {
    const fetchUserReviews = async () => {
      try {
        setIsLoading(true)

        // Хэрэглэгчийн мэдээллийг session storage-с авах
        const userStr = sessionStorage.getItem("currentUser")
        if (!userStr) {
          // Хэрэглэгч нэвтрээгүй бол нэвтрэх хуудас руу шилжүүлэх
          router.push("/login")
          return
        }

        const user = JSON.parse(userStr)

        // Бүх сэтгэгдлүүдийг авах
        const allReviews = await reviewService.getAllReviews()

        // Зөвхөн тухайн хэрэглэгчийн сэтгэгдлүүдийг шүүх
        // Энд хэрэглэгчийн нэр эсвэл ID-гаар шүүж болно
        const userReviews = allReviews.filter((review) => review.name === user.name)

        setReviews(userReviews)
      } catch (error) {
        console.error("Хэрэглэгчийн сэтгэгдлүүдийг авахад алдаа гарлаа:", error)
        toast({
          variant: "destructive",
          title: "Алдаа гарлаа",
          description: "Сэтгэгдлүүдийг ачааллахад алдаа гарлаа. Дахин оролдоно уу.",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserReviews()
  }, [router, toast])

  const handleDeleteClick = (reviewId: string, storeId: string) => {
    setDeleteReviewId(reviewId)
    setDeleteStoreId(storeId)
    setIsDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!deleteReviewId || !deleteStoreId) return

    try {
      const success = await reviewService.deleteReview(deleteReviewId, deleteStoreId)

      if (success) {
        // Сэтгэгдлүүдийн жагсаалтаас устгасан сэтгэгдлийг хасах
        setReviews(reviews.filter((review) => review.id !== deleteReviewId))

        toast({
          title: "Амжилттай устгалаа",
          description: "Сэтгэгдэл амжилттай устгагдлаа.",
        })
      } else {
        toast({
          variant: "destructive",
          title: "Алдаа гарлаа",
          description: "Сэтгэгдэл устгахад алдаа гарлаа. Дахин оролдоно уу.",
        })
      }
    } catch (error) {
      console.error("Сэтгэгдэл устгахад алдаа гарлаа:", error)
      toast({
        variant: "destructive",
        title: "Алдаа гарлаа",
        description: "Сэтгэгдэл устгахад алдаа гарлаа. Дахин оролдоно уу.",
      })
    } finally {
      setIsDeleteDialogOpen(false)
      setDeleteReviewId(null)
      setDeleteStoreId(null)
    }
  }

  const handleEditClick = (reviewId: string) => {
    // Сэтгэгдэл засах хуудас руу шилжүүлэх
    router.push(`/profile/reviews/edit/${reviewId}`)
  }

  if (isLoading) {
    return (
      <div className="container py-10">
        <div className="flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Сэтгэгдлүүдийг ачааллаж байна...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container max-w-4xl py-10">
      <div className="mb-6">
        <Link
          href="/profile"
          className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
          Профайл руу буцах
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-6">Миний сэтгэгдлүүд</h1>

      {reviews.length > 0 ? (
        <div className="space-y-4">
          {reviews.map((review) => (
            <Card key={review.id}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <Link href={`/stores/${review.storeId}`} className="font-medium hover:underline">
                      {review.store}
                    </Link>
                    <p className="text-sm text-muted-foreground">{review.date}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{review.rating}</span>
                  </div>
                </div>
                <Separator className="my-4" />
                <p>{review.comment}</p>
                <div className="flex justify-end gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditClick(review.id!)}
                    className="flex items-center gap-1"
                  >
                    <Edit className="h-4 w-4" />
                    Засах
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteClick(review.id!, review.storeId)}
                    className="flex items-center gap-1"
                  >
                    <Trash2 className="h-4 w-4" />
                    Устгах
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <AlertCircle className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Сэтгэгдэл байхгүй байна</h3>
          <p className="text-muted-foreground mb-6">Та одоогоор ямар ч сэтгэгдэл үлдээгээгүй байна.</p>
          <Button asChild>
            <Link href="/stores">Дэлгүүрүүд үзэх</Link>
          </Button>
        </div>
      )}

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Сэтгэгдэл устгах</AlertDialogTitle>
            <AlertDialogDescription>
              Та энэ сэтгэгдлийг устгахдаа итгэлтэй байна уу? Энэ үйлдлийг буцаах боломжгүй.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Цуцлах</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>Устгах</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
