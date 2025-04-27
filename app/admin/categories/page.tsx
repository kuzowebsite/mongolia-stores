"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { PlusCircle, Search, Edit, Trash2, Store } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { categoryService, storeService, imageToBase64, type Category } from "@/lib/db-service"

export default function AdminCategories() {
  const { toast } = useToast()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [categoryToEdit, setCategoryToEdit] = useState<string | null>(null)
  const [newCategoryName, setNewCategoryName] = useState("")
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [newCategory, setNewCategory] = useState("")
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [categoryImage, setCategoryImage] = useState<string | null>(null)
  const [categoryDescription, setCategoryDescription] = useState("")

  // Ангилалуудыг авах
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesData = await categoryService.getAllCategories()

        // Ангилал бүрт хамаарах дэлгүүрийн тоог тооцоолох
        for (const category of categoriesData) {
          try {
            const stores = await storeService.getStoresByCategory(category.name)
            category.storeCount = stores.length
          } catch (error) {
            console.error(`${category.name} ангилалын дэлгүүрүүдийг авахад алдаа гарлаа:`, error)
            category.storeCount = 0 // Алдаа гарвал 0 гэж тооцох
          }
        }

        setCategories(categoriesData)
      } catch (error) {
        console.error("Ангилалуудыг авахад алдаа гарлаа:", error)
        toast({
          variant: "destructive",
          title: "Алдаа",
          description: "Ангилалуудыг авахад алдаа гарлаа",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [toast])

  // Хайлтын үр дүн
  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Ангилал устгах
  const handleDeleteClick = (category: Category) => {
    setCategoryToDelete(category.id || null)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!categoryToDelete) return

    try {
      await categoryService.deleteCategory(categoryToDelete)
      setCategories(categories.filter((c) => c.id !== categoryToDelete))
      setSuccessMessage("Ангилал амжилттай устгагдлаа")
      setTimeout(() => setSuccessMessage(null), 3000)
      toast({
        title: "Амжилттай",
        description: "Ангилал амжилттай устгагдлаа",
      })
    } catch (error) {
      console.error("Ангилал устгахад алдаа гарлаа:", error)
      toast({
        variant: "destructive",
        title: "Алдаа",
        description: "Ангилал устгахад алдаа гарлаа",
      })
    } finally {
      setDeleteDialogOpen(false)
      setCategoryToDelete(null)
    }
  }

  // Ангилал засах
  const handleEditClick = (category: Category) => {
    setCategoryToEdit(category.id || null)
    setNewCategoryName(category.name)
    setCategoryDescription(category.description || "")
    setCategoryImage(category.image || null)
    setEditDialogOpen(true)
  }

  const handleEditConfirm = async () => {
    if (!categoryToEdit || !newCategoryName.trim()) return

    try {
      const updatedCategory: Partial<Category> = {
        name: newCategoryName.trim(),
        description: categoryDescription.trim() || undefined,
        image: categoryImage || undefined,
      }

      await categoryService.updateCategory(categoryToEdit, updatedCategory)

      // Ангилалын жагсаалтыг шинэчлэх
      setCategories(categories.map((c) => (c.id === categoryToEdit ? { ...c, ...updatedCategory } : c)))

      setSuccessMessage("Ангилал амжилттай шинэчлэгдлээ")
      setTimeout(() => setSuccessMessage(null), 3000)
      toast({
        title: "Амжилттай",
        description: "Ангилал амжилттай шинэчлэгдлээ",
      })
    } catch (error) {
      console.error("Ангилал засахад алдаа гарлаа:", error)
      toast({
        variant: "destructive",
        title: "Алдаа",
        description: "Ангилал засахад алдаа гарлаа",
      })
    } finally {
      setEditDialogOpen(false)
      setCategoryToEdit(null)
      setNewCategoryName("")
      setCategoryDescription("")
      setCategoryImage(null)
    }
  }

  // Шинэ ангилал нэмэх
  const handleAddClick = () => {
    setNewCategory("")
    setCategoryDescription("")
    setCategoryImage(null)
    setAddDialogOpen(true)
  }

  const handleAddConfirm = async () => {
    if (!newCategory.trim()) return

    try {
      // Шинэ ангилал үүсгэх
      const newCategoryData: Category = {
        name: newCategory.trim(),
        description: categoryDescription.trim() || undefined,
        image: categoryImage || undefined,
        storeCount: 0,
      }

      const categoryId = await categoryService.addCategory(newCategoryData)

      // Ангилалын жагсаалтыг шинэчлэх
      const newCategoryWithId: Category = {
        id: categoryId,
        ...newCategoryData,
      }

      setCategories([...categories, newCategoryWithId])
      setSuccessMessage("Шинэ ангилал амжилттай нэмэгдлээ")
      setTimeout(() => setSuccessMessage(null), 3000)
      toast({
        title: "Амжилттай",
        description: "Шинэ ангилал амжилттай нэмэгдлээ",
      })
    } catch (error) {
      console.error("Ангилал нэмэхэд алдаа гарлаа:", error)
      toast({
        variant: "destructive",
        title: "Алдаа",
        description: "Ангилал нэмэхэд алдаа гарлаа",
      })
    } finally {
      setAddDialogOpen(false)
      setNewCategory("")
      setCategoryDescription("")
      setCategoryImage(null)
    }
  }

  // Зураг оруулах
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean) => {
    const files = e.target.files
    if (files && files.length > 0) {
      try {
        const file = files[0]
        const base64Image = await imageToBase64(file)

        if (isEdit) {
          setCategoryImage(base64Image)
        } else {
          setCategoryImage(base64Image)
        }
      } catch (error) {
        console.error("Зураг хөрвүүлэхэд алдаа гарлаа:", error)
        toast({
          variant: "destructive",
          title: "Алдаа",
          description: "Зураг хөрвүүлэхэд алдаа гарлаа",
        })
      }
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Ангилалуудыг ачааллаж байна...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Ангилалууд</h1>
          <p className="text-muted-foreground">Дэлгүүрийн ангилалуудыг удирдах</p>
        </div>
        <Button onClick={handleAddClick}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Шинэ ангилал
        </Button>
      </div>

      {successMessage && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-600">{successMessage}</AlertDescription>
        </Alert>
      )}

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Ангилал хайх..."
            className="w-full pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {filteredCategories.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-muted-foreground">Ангилал олдсонгүй</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredCategories.map((category) => {
            const storeCount = category.storeCount || 0

            return (
              <Card key={category.id}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-lg font-medium">{category.name}</CardTitle>
                  <Badge variant="outline" className="ml-2">
                    {storeCount} дэлгүүр
                  </Badge>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <Store className="h-4 w-4 text-muted-foreground mr-2" />
                      <span className="text-sm text-muted-foreground">
                        {storeCount === 0
                          ? "Дэлгүүр байхгүй"
                          : storeCount === 1
                            ? "1 дэлгүүр"
                            : `${storeCount} дэлгүүр`}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 px-2"
                        onClick={() => handleEditClick(category)}
                      >
                        <Edit className="h-4 w-4" />
                        <span className="sr-only md:not-sr-only md:ml-2">Засах</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 px-2 text-red-500 hover:text-red-500"
                        onClick={() => handleDeleteClick(category)}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only md:not-sr-only md:ml-2">Устгах</span>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Ангилал устгах диалог */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ангилал устгах</DialogTitle>
            <DialogDescription>
              Та энэ ангилалыг устгахдаа итгэлтэй байна уу? Энэ үйлдлийг буцаах боломжгүй.
              {categoryToDelete && categories.find((c) => c.id === categoryToDelete)?.storeCount! > 0 && (
                <p className="mt-2 text-red-500 font-medium">
                  Анхааруулга: Энэ ангилалд {categories.find((c) => c.id === categoryToDelete)?.storeCount} дэлгүүр
                  хамаарч байна.
                </p>
              )}
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

      {/* Ангилал засах диалог */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ангилал засах</DialogTitle>
            <DialogDescription>Ангилалын мэдээллийг шинэчлэх</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="category-name">Ангилалын нэр</Label>
              <Input id="category-name" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category-description">Тайлбар</Label>
              <Input
                id="category-description"
                value={categoryDescription}
                onChange={(e) => setCategoryDescription(e.target.value)}
                placeholder="Ангилалын тайлбар"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category-image">Зураг</Label>
              <div className="flex items-center gap-4">
                <Input id="category-image" type="file" accept="image/*" onChange={(e) => handleImageUpload(e, true)} />
                {categoryImage && (
                  <div className="h-12 w-12 overflow-hidden rounded-md border">
                    <img
                      src={categoryImage || "/placeholder.svg"}
                      alt="Category"
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Цуцлах
            </Button>
            <Button onClick={handleEditConfirm} disabled={!newCategoryName.trim()}>
              Хадгалах
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Шинэ ангилал нэмэх диалог */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Шинэ ангилал нэмэх</DialogTitle>
            <DialogDescription>Шинэ ангилалын мэдээллийг оруулна уу</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="new-category">Ангилалын нэр</Label>
              <Input
                id="new-category"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="Ангилалын нэр"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-category-description">Тайлбар</Label>
              <Input
                id="new-category-description"
                value={categoryDescription}
                onChange={(e) => setCategoryDescription(e.target.value)}
                placeholder="Ангилалын тайлбар"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-category-image">Зураг</Label>
              <div className="flex items-center gap-4">
                <Input
                  id="new-category-image"
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, false)}
                />
                {categoryImage && (
                  <div className="h-12 w-12 overflow-hidden rounded-md border">
                    <img
                      src={categoryImage || "/placeholder.svg"}
                      alt="Category"
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
              Цуцлах
            </Button>
            <Button
              onClick={handleAddConfirm}
              disabled={!newCategory.trim() || categories.some((c) => c.name === newCategory.trim())}
            >
              Нэмэх
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
