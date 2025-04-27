"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Upload, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { userService, type User, imageToBase64 } from "@/lib/db-service"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function ProfilePage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [user, setUser] = useState<User | null>(null)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [avatar, setAvatar] = useState<string | undefined>(undefined)
  const [previewAvatar, setPreviewAvatar] = useState<string | undefined>(undefined)

  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)

  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Хэрэглэгчийн мэдээллийг session storage-с авах
    const getUserFromSession = () => {
      if (typeof window !== "undefined") {
        const userStr = sessionStorage.getItem("currentUser")
        if (userStr) {
          try {
            const userData = JSON.parse(userStr)
            setUser(userData)
            setName(userData.name || "")
            setEmail(userData.email || "")
            setPhone(userData.phone || "")
            setAvatar(userData.avatar || undefined)
            setPreviewAvatar(userData.avatar || undefined)
          } catch (e) {
            console.error("Хэрэглэгчийн мэдээлэл уншихад алдаа гарлаа:", e)
            router.push("/login")
          }
        } else {
          // Хэрэглэгч нэвтрээгүй бол нэвтрэх хуудас руу шилжүүлэх
          router.push("/login")
        }
      }
    }

    getUserFromSession()
  }, [router])

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setLoading(true)

    try {
      if (!user || !user.id) {
        setError("Хэрэглэгчийн мэдээлэл олдсонгүй")
        setLoading(false)
        return
      }

      // Хэрэглэгчийн мэдээллийг шинэчлэх
      const updatedUserData = {
        name,
        email,
        phone,
        avatar: previewAvatar, // Шинэ аватар зургийг хадгалах
      }

      const success = await userService.updateUser(user.id, updatedUserData)

      if (!success) {
        throw new Error("Хэрэглэгчийн мэдээлэл шинэчлэхэд алдаа гарлаа")
      }

      // Шинэчилсэн мэдээллийг авах
      const updatedUser = await userService.getUserById(user.id)

      if (!updatedUser) {
        throw new Error("Шинэчилсэн хэрэглэгчийн мэдээлэл авахад алдаа гарлаа")
      }

      // Session storage-д хэрэглэгчийн мэдээллийг шинэчлэх
      sessionStorage.setItem("currentUser", JSON.stringify(updatedUser))
      setUser(updatedUser)
      setSuccess("Хэрэглэгчийн мэдээлэл амжилттай шинэчлэгдлээ")

      // Хадгалсны дараа storage event trigger хийх
      window.dispatchEvent(new Event("storage"))
    } catch (err) {
      console.error("Хэрэглэгчийн мэдээлэл шинэчлэхэд алдаа гарлаа:", err)
      setError("Хэрэглэгчийн мэдээлэл шинэчлэхэд алдаа гарлаа. Өгөгдлийн сантай холбогдох боломжгүй байна.")
    } finally {
      setLoading(false)
    }
  }

  // Нууц үг солих функцийг сайжруулах
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setLoading(true)

    try {
      // Энгийн шалгалт
      if (!currentPassword || !newPassword || !confirmPassword) {
        setError("Бүх талбарыг бөглөнө үү")
        setLoading(false)
        return
      }

      if (newPassword !== confirmPassword) {
        setError("Шинэ нууц үг таарахгүй байна")
        setLoading(false)
        return
      }

      if (!user || !user.id) {
        setError("Хэрэглэгчийн мэдээлэл олдсонгүй")
        setLoading(false)
        return
      }

      // Одоогийн нууц үгийг шалгах
      // Оффлайн горимд байвал жишээ өгөгдөл ашиглах
      let isValidPassword = false

      if (userService.isOfflineMode && userService.isOfflineMode()) {
        // Оффлайн горимд хялбар шалгалт хийх
        isValidPassword = true
      } else {
        // Одоогийн нууц үгийг шалгах
        const checkUser = await userService.authenticateUser(user.email, currentPassword)
        isValidPassword = !!checkUser
      }

      if (!isValidPassword) {
        setError("Одоогийн нууц үг буруу байна")
        setLoading(false)
        return
      }

      console.log("Нууц үг солих гэж байна, шинэ нууц үг:", newPassword)

      // Нууц үг солих - шууд password талбарт хадгалах
      const updateData = {
        password: newPassword,
      }

      console.log("Шинэчлэх өгөгдөл:", JSON.stringify(updateData))

      // Шууд password талбарт хадгалах
      const success = await userService.updatePassword(user.id, newPassword)

      if (!success) {
        throw new Error("Нууц үг солиход алдаа гарлаа")
      }

      // Хэрэв амжилттай бол хэрэглэгчийн мэдээллийг шинэчлэх
      const updatedUser = await userService.getUserById(user.id)
      if (updatedUser) {
        // Session storage-д хэрэглэгчийн мэдээллийг шинэчлэх
        sessionStorage.setItem("currentUser", JSON.stringify(updatedUser))
        setUser(updatedUser)
      }

      setSuccess("Нууц үг амжилттай солигдлоо")
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (err) {
      console.error("Нууц үг солиход алдаа гарлаа:", err)
      setError("Нууц үг солиход алдаа гарлаа. Өгөгдлийн сантай холбогдох боломжгүй байна.")
    } finally {
      setLoading(false)
    }
  }

  const handleAvatarClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      // Зөвхөн зураг файл зөвшөөрөх
      if (!file.type.startsWith("image/")) {
        setError("Зөвхөн зураг файл оруулна уу")
        return
      }

      // Файлын хэмжээг шалгах (5MB-с бага байх)
      if (file.size > 5 * 1024 * 1024) {
        setError("Зургийн хэмжээ 5MB-с бага байх ёстой")
        return
      }

      // Зургийг base64 болгох
      const base64Image = await imageToBase64(file)
      setPreviewAvatar(base64Image)
    } catch (err) {
      console.error("Зураг оруулахад алдаа гарлаа:", err)
      setError("Зураг оруулахад алдаа гарлаа")
    }
  }

  const handleRemoveAvatar = () => {
    setPreviewAvatar(undefined)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  if (!user) {
    return (
      <div className="container py-10">
        <div className="flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Ачааллаж байна...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container max-w-3xl py-10">
      <h1 className="text-3xl font-bold mb-6">Хэрэглэгчийн профайл</h1>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="profile">Профайл</TabsTrigger>
          <TabsTrigger value="password">Нууц үг</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Профайл мэдээлэл</CardTitle>
              <CardDescription>Хэрэглэгчийн мэдээллээ шинэчлэх</CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              {success && (
                <Alert className="mb-4 bg-green-50 text-green-600 border-green-200">
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                {/* Профайл зураг оруулах хэсэг */}
                <div className="flex flex-col items-center space-y-4 mb-6">
                  <div className="relative">
                    <Avatar className="h-24 w-24 cursor-pointer" onClick={handleAvatarClick}>
                      {previewAvatar ? (
                        <AvatarImage src={previewAvatar || "/placeholder.svg"} alt={name} />
                      ) : (
                        <AvatarFallback className="text-2xl">{name?.charAt(0)}</AvatarFallback>
                      )}
                    </Avatar>
                    {previewAvatar && (
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                        onClick={handleRemoveAvatar}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                  <div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleAvatarChange}
                      accept="image/*"
                      className="hidden"
                    />
                    <Button type="button" variant="outline" size="sm" onClick={handleAvatarClick}>
                      <Upload className="h-4 w-4 mr-2" />
                      Зураг оруулах
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Зөвлөмж: 300x300 цэгийн нягтралтай JPG, PNG зураг (хамгийн ихдээ 5MB)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">Нэр</Label>
                  <Input
                    id="name"
                    placeholder="Таны нэр"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">И-мэйл</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Утасны дугаар</Label>
                  <Input
                    id="phone"
                    placeholder="Утасны дугаар"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Хадгалж байна..." : "Хадгалах"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="password">
          <Card>
            <CardHeader>
              <CardTitle>Нууц үг солих</CardTitle>
              <CardDescription>Нууц үгээ солих</CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              {success && (
                <Alert className="mb-4 bg-green-50 text-green-600 border-green-200">
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Одоогийн нууц үг</Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showCurrentPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    >
                      {showCurrentPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className="sr-only">{showCurrentPassword ? "Нууц үг нуух" : "Нууц үг харуулах"}</span>
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">Шинэ нууц үг</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className="sr-only">{showNewPassword ? "Нууц үг нуух" : "Нууц үг харуулах"}</span>
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Шинэ нууц үг баталгаажуулах</Label>
                  <Input
                    id="confirmPassword"
                    type={showNewPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Хадгалж байна..." : "Нууц үг солих"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
