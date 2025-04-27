"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { User, ArrowLeft, Save, Trash2, UserCircle, Eye, EyeOff } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"
import { userService } from "@/lib/db-service"

export default function EditUserPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [newPassword, setNewPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  // Хэрэглэгчийн мэдээллийг авах
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await userService.getUserById(params.id)
        if (userData) {
          setUser(userData)
        } else {
          toast({
            title: "Алдаа",
            description: "Хэрэглэгч олдсонгүй",
            variant: "destructive",
          })
          router.push("/admin/users")
        }
      } catch (error) {
        toast({
          title: "Алдаа",
          description: "Хэрэглэгчийн мэдээллийг авахад алдаа гарлаа",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchUser()
  }, [params.id, router, toast])

  // Хэрэглэгчийн мэдээллийг шинэчлэх
  const handleUpdateUser = async () => {
    setIsSaving(true)
    try {
      // Шинэчлэх өгөгдөл бэлтгэх
      const updatedUserData: any = { ...user }

      // Хэрэв шинэ нууц үг оруулсан бол нэмэх
      if (newPassword.trim()) {
        console.log("Шинэ нууц үг оруулсан:", newPassword.trim())

        // Шууд password талбарт хадгалах
        const passwordSuccess = await userService.updatePassword(params.id, newPassword.trim())

        if (!passwordSuccess) {
          throw new Error("Нууц үг шинэчлэхэд алдаа гарлаа")
        }

        // newPassword талбарыг устгах
        delete updatedUserData.newPassword
      }

      // Нууц үгийг хасах (шинэчлэхэд шаардлагагүй)
      delete updatedUserData.password

      console.log("Шинэчлэх өгөгдөл:", JSON.stringify(updatedUserData))

      // Хэрэглэгчийн мэдээллийг шинэчлэх
      const success = await userService.updateUser(params.id, updatedUserData)

      if (!success) {
        throw new Error("Хэрэглэгчийн мэдээллийг шинэчлэхэд алдаа гарлаа")
      }

      // Шинэчилсэн хэрэглэгчийн мэдээллийг авах
      const updatedUser = await userService.getUserById(params.id)
      if (!updatedUser) {
        console.warn("Шинэчилсэн хэрэглэгчийн мэдээлэл авахад алдаа гарлаа")
      } else {
        // Хэрэглэгчийн мэдээллийг шинэчлэх
        setUser(updatedUser)
      }

      toast({
        title: "Амжилттай",
        description: "Хэрэглэгчийн мэдээлэл амжилттай шинэчлэгдлээ",
      })

      // Нууц үг солигдсон бол мэдэгдэл харуулах
      if (newPassword.trim()) {
        toast({
          title: "Нууц үг солигдлоо",
          description: "Хэрэглэгчийн нууц үг амжилттай солигдлоо",
        })
        setNewPassword("")
      }
    } catch (error) {
      console.error("Хэрэглэгчийн мэдээллийг шинэчлэхэд алдаа гарлаа:", error)
      toast({
        title: "Алдаа",
        description: "Хэрэглэгчийн мэдээллийг шинэчлэхэд алдаа гарлаа",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Хэрэглэгчийг устгах
  const handleDeleteUser = async () => {
    if (!window.confirm("Та энэ хэрэглэгчийг устгахдаа итгэлтэй байна уу?")) {
      return
    }

    setIsDeleting(true)
    try {
      await userService.deleteUser(params.id)
      toast({
        title: "Амжилттай",
        description: "Хэрэглэгч амжилттай устгагдлаа",
      })
      router.push("/admin/users")
    } catch (error) {
      toast({
        title: "Алдаа",
        description: "Хэрэглэгчийг устгахад алдаа гарлаа",
        variant: "destructive",
      })
      setIsDeleting(false)
    }
  }

  // Талбарын утгыг шинэчлэх
  const handleInputChange = (field: string, value: any) => {
    setUser((prev: any) => ({
      ...prev,
      [field]: value,
    }))
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh]">
        <h2 className="text-xl font-semibold mb-2">Хэрэглэгч олдсонгүй</h2>
        <Button variant="outline" onClick={() => router.push("/admin/users")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Буцах
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Хэрэглэгч засах</h1>
          <p className="text-muted-foreground">Хэрэглэгчийн мэдээллийг засах, шинэчлэх</p>
        </div>
        <Button variant="outline" onClick={() => router.push("/admin/users")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Буцах
        </Button>
      </div>

      <Separator />

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Үндсэн мэдээлэл
            </CardTitle>
            <CardDescription>Хэрэглэгчийн үндсэн мэдээллийг засах</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Нэр</Label>
              <Input id="name" value={user.name || ""} onChange={(e) => handleInputChange("name", e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">И-мэйл</Label>
              <Input
                id="email"
                type="email"
                value={user.email || ""}
                onChange={(e) => handleInputChange("email", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Утасны дугаар</Label>
              <Input id="phone" value={user.phone || ""} onChange={(e) => handleInputChange("phone", e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Эрх</Label>
              <Select value={user.role || "user"} onValueChange={(value) => handleInputChange("role", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Эрх сонгох" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">Хэрэглэгч</SelectItem>
                  <SelectItem value="admin">Админ</SelectItem>
                  <SelectItem value="editor">Редактор</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={user.status !== "inactive"}
                onCheckedChange={(checked) => handleInputChange("status", checked ? "active" : "inactive")}
              />
              <Label htmlFor="isActive">Идэвхтэй</Label>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCircle className="h-5 w-5" />
              Нэмэлт мэдээлэл
            </CardTitle>
            <CardDescription>Хэрэглэгчийн нэмэлт мэдээллийг засах</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="avatar">Профайл зураг (URL)</Label>
              <Input
                id="avatar"
                value={user.avatar || ""}
                onChange={(e) => handleInputChange("avatar", e.target.value)}
              />
              {user.avatar && (
                <div className="mt-2 flex justify-center">
                  <div className="relative h-24 w-24 overflow-hidden rounded-full border">
                    <img
                      src={user.avatar || "/placeholder.svg"}
                      alt={user.name}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        ;(e.target as HTMLImageElement).src = "/vibrant-street-market.png"
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Хаяг</Label>
              <Input
                id="address"
                value={user.address || ""}
                onChange={(e) => handleInputChange("address", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Тайлбар</Label>
              <Input id="bio" value={user.bio || ""} onChange={(e) => handleInputChange("bio", e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">Шинэ нууц үг (хоосон үлдээвэл өөрчлөгдөхгүй)</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between">
        <Button variant="destructive" onClick={handleDeleteUser} disabled={isDeleting || isSaving}>
          {isDeleting ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
          ) : (
            <Trash2 className="mr-2 h-4 w-4" />
          )}
          Устгах
        </Button>

        <Button onClick={handleUpdateUser} disabled={isSaving || isDeleting}>
          {isSaving ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Хадгалах
        </Button>
      </div>
    </div>
  )
}
