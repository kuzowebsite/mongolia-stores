"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { PlusCircle, Search, Edit, Trash2, MoreHorizontal, Store } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { storeService, type Store as StoreType } from "@/lib/db-service"
import { useToast } from "@/components/ui/use-toast"

export default function AdminStores() {
  const [searchQuery, setSearchQuery] = useState("")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [storeToDelete, setStoreToDelete] = useState<string | null>(null)
  const [stores, setStores] = useState<StoreType[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  // Дэлгүүрүүдийг авах
  useEffect(() => {
    const fetchStores = async () => {
      try {
        const storesData = await storeService.getAllStores()
        setStores(storesData)
      } catch (error) {
        console.error("Дэлгүүрүүдийг авахад алдаа гарлаа:", error)
        toast({
          variant: "destructive",
          title: "Алдаа",
          description: "Дэлгүүрүүдийг авахад алдаа гарлаа",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchStores()
  }, [toast])

  // Хайлтын үр дүн
  const filteredStores = stores.filter(
    (store) =>
      store.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      store.category?.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Дэлгүүр устгах
  const handleDeleteClick = (storeId: string) => {
    setStoreToDelete(storeId)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!storeToDelete) return

    try {
      await storeService.deleteStore(storeToDelete)
      setStores(stores.filter((store) => store.id !== storeToDelete))
      toast({
        title: "Амжилттай",
        description: "Дэлгүүр амжилттай устгагдлаа",
      })
    } catch (error) {
      console.error("Дэлгүүр устгахад алдаа гарлаа:", error)
      toast({
        variant: "destructive",
        title: "Алдаа",
        description: "Дэлгүүр устгахад алдаа гарлаа",
      })
    } finally {
      setDeleteDialogOpen(false)
      setStoreToDelete(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Дэлгүүрүүдийг ачааллаж байна...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Дэлгүүрүүд</h1>
          <p className="text-muted-foreground">Бүх дэлгүүрүүдийн жагсаалт</p>
        </div>
        <Link href="/admin/stores/new">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Шинэ дэлгүүр
          </Button>
        </Link>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Дэлгүүр хайх..."
            className="w-full pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {filteredStores.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-muted-foreground">Дэлгүүр олдсонгүй</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredStores.map((store) => (
            <Card key={store.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="relative h-48">
                  {store.image ? (
                    <Image
                      src={store.image || "/placeholder.svg"}
                      alt={store.name}
                      fill
                      className="object-cover"
                      width={500}
                      height={500}
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-muted">
                      <Store className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}
                  <div className="absolute right-2 top-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="bg-black/20 hover:bg-black/40 text-white rounded-full"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Үйлдлүүд</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/stores/${store.id}`}>Дэлгэрэнгүй</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/stores/${store.id}/edit`}>
                            <Edit className="mr-2 h-4 w-4" />
                            Засах
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600 focus:text-red-600"
                          onClick={() => handleDeleteClick(store.id!)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Устгах
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                <div className="p-4">
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
                  <div className="mt-4 flex justify-end">
                    <Link href={`/admin/stores/${store.id}`}>
                      <Button variant="outline" size="sm">
                        Дэлгэрэнгүй
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Дэлгүүр устгах</DialogTitle>
            <DialogDescription>
              Та энэ дэлгүүрийг устгахдаа итгэлтэй байна уу? Энэ үйлдлийг буцаах боломжгүй.
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
