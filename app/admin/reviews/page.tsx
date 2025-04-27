"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Search, Trash2, Check } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { reviewService, storeService, type Review, type Store } from "@/lib/db-service"
import { useToast } from "@/components/ui/use-toast"

export default function AdminReviews() {
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState("")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [reviewToDelete, setReviewToDelete] = useState<{ id: string; storeId: string } | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [stores, setStores] = useState<{ [key: string]: Store }>({})
  const [loading, setLoading] = useState(true)

  // Сэтгэгдэлүүд болон дэлгүүрүүдийг авах
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // Сэтгэгдэлүүдийг авах
        const reviewsData = await reviewService.getAllReviews()
        setReviews(reviewsData)

        // Дэлгүүрүүдийг авах
        const storesData = await storeService.getAllStores()

        // Дэлгүүрүүдийг ID-гаар индекслэх
        const storesMap: { [key: string]: Store } = {}
        storesData.forEach((store) => {
          if (store.id) {
            storesMap[store.id] = store
          }
        })

        setStores(storesMap)
      } catch (error) {
        console.error("Сэтгэгдэлүүдийг авахад алдаа гарлаа:", error)
        toast({
          variant: "destructive",
          title: "Алдаа",
          description: "Сэтгэгдэлүүдийг авахад алдаа гарлаа",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [toast])

  // Хайлтын үр дүн
  const filteredReviews = reviews.filter(
    (review) =>
      review.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.comment.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stores[review.storeId]?.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Сэтгэгдэл устгах
  const handleDeleteClick = (reviewId: string, storeId: string) => {
    setReviewToDelete({ id: reviewId, storeId })
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!reviewToDelete) return

    try {
      await reviewService.deleteReview(reviewToDelete.id, reviewToDelete.storeId)

      // Сэтгэгдэлүүдийн жагсаалтыг шинэчлэх
      setReviews(reviews.filter((review) => review.id !== reviewToDelete.id))

      toast({
        title: "Амжилттай",
        description: "Сэтгэгдэл амжилттай устгагдлаа",
      })
    } catch (error) {
      console.error("Сэтгэгдэл устгахад алдаа гарлаа:", error)
      toast({
        variant: "destructive",
        title: "Алдаа",
        description: "Сэтгэгдэл устгахад алдаа гарлаа",
      })
    } finally {
      setDeleteDialogOpen(false)
      setReviewToDelete(null)
    }
  }

  // Сэтгэгдэл зөвшөөрөх
  const handleApproveReview = async (reviewId: string) => {
    // Энд сэтгэгдэл зөвшөөрөх логик орно
    toast({
      title: "Амжилттай",
      description: "Сэтгэгдэл амжилттай зөвшөөрөгдлөө",
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Сэтгэгдэлүүдийг ачааллаж байна...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Сэтгэгдэлүүд</h1>
        <p className="text-muted-foreground">Бүх сэтгэгдлүүдийн жагсаалт</p>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Сэтгэгдэл хайх..."
            className="w-full pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {filteredReviews.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-muted-foreground">Сэтгэгдэл олдсонгүй</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReviews.map((review) => {
            const store = stores[review.storeId]
            return (
              <Card key={review.id}>
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
                          <Link
                            href={`/admin/stores/${review.storeId}`}
                            className="text-sm text-primary hover:underline"
                          >
                            {store?.name || "Устгагдсан дэлгүүр"}
                          </Link>
                        </div>
                        <div className="flex items-center gap-2">
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
                          <span className="text-sm text-muted-foreground">{review.date}</span>
                        </div>
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">{review.comment}</p>
                      <div className="mt-4 flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 gap-1"
                          onClick={() => handleApproveReview(review.id!)}
                        >
                          <Check className="h-4 w-4 text-green-500" />
                          Зөвшөөрөх
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 gap-1 text-red-500 hover:text-red-500"
                          onClick={() => handleDeleteClick(review.id!, review.storeId)}
                        >
                          <Trash2 className="h-4 w-4" />
                          Устгах
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Сэтгэгдэл устгах</DialogTitle>
            <DialogDescription>
              Та энэ сэтгэгдлийг устгахдаа итгэлтэй байна уу? Энэ үйлдлийг буцаах боломжгүй.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Цуцлах
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Устгах
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
