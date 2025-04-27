"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { User, Mail, Phone, Shield, Calendar, LogOut } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { userService, type User as UserType } from "@/lib/db-service"

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<UserType | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "",
  })

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true)

        // Session storage-с хэрэглэгчийн мэдээллийг авах
        const storedUser = sessionStorage.getItem("currentUser")

        if (!storedUser) {
          // Хэрэглэгч нэвтрээгүй бол login хуудас руу шилжүүлэх
          router.push("/admin/login")
          return
        }

        const userData = JSON.parse(storedUser) as UserType

        // Хэрэв хэрэглэгч админ биш бол login хуудас руу шилжүүлэх
        if (userData.role !== "admin") {
          router.push("/admin/login")
          return
        }

        setUser(userData)

        // Form-д хэрэглэгчийн мэдээллийг оноох
        setFormData({
          name: userData.name || "",
          email: userData.email || "",
          phone: userData.phone || "",
          role: userData.role || "",
        })
      } catch (err) {
        console.error("Хэрэглэгчийн мэдээлэл авахад алдаа гарлаа:", err)
        setError("Хэрэглэгчийн мэдээлэл авахад алдаа гарлаа")
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    try {
      if (!user || !user.id) {
        setError("Хэрэглэгчийн мэдээлэл олдсонгүй")
        return
      }

      // Хэрэглэгчийн мэдээллийг шинэчлэх
      const success = await userService.updateUser(user.id, {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
      })

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
    } catch (err) {
      console.error("Хэрэглэгчийн мэдээлэл шинэчлэхэд алдаа гарлаа:", err)
      setError("Хэрэглэгчийн мэдээлэл шинэчлэхэд алдаа гарлаа. Өгөгдлийн сантай холбогдох боломжгүй байна.")
    }
  }

  const handleLogout = () => {
    // Session storage-с хэрэглэгчийн мэдээллийг устгах
    sessionStorage.removeItem("currentUser")
    // Login хуудас руу шилжүүлэх
    router.push("/admin/login")
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Хэрэглэгчийн мэдээллийг ачааллаж байна...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-muted-foreground">Хэрэглэгчийн мэдээлэл олдсонгүй</p>
          <Button className="mt-4" onClick={() => router.push("/admin/login")}>
            Нэвтрэх хуудас руу буцах
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Хэрэглэгчийн профайл</h1>
        <Button variant="outline" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Гарах
        </Button>
      </div>

      <Tabs defaultValue="profile">
        <TabsList className="mb-4">
          <TabsTrigger value="profile">Профайл</TabsTrigger>
          <TabsTrigger value="security">Аюулгүй байдал</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Хэрэглэгчийн мэдээлэл</CardTitle>
                <CardDescription>Хэрэглэгчийн хувийн мэдээллийг шинэчлэх</CardDescription>
              </CardHeader>
              <CardContent>
                {error && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                {success && (
                  <Alert className="mb-4 border-green-500 text-green-500">
                    <AlertDescription>{success}</AlertDescription>
                  </Alert>
                )}
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Нэр</Label>
                    <div className="relative">
                      <User className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="name"
                        name="name"
                        placeholder="Нэр"
                        className="pl-8"
                        value={formData.name}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">И-мэйл</Label>
                    <div className="relative">
                      <Mail className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="И-мэйл"
                        className="pl-8"
                        value={formData.email}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Утас</Label>
                    <div className="relative">
                      <Phone className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        name="phone"
                        placeholder="Утас"
                        className="pl-8"
                        value={formData.phone || ""}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full">
                    Хадгалах
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Хэрэглэгчийн дэлгэрэнгүй</CardTitle>
                <CardDescription>Хэрэглэгчийн бусад мэдээлэл</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center p-3 border rounded-md">
                  <Shield className="h-5 w-5 mr-3 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Эрх</p>
                    <p className="text-sm text-muted-foreground">{user.role}</p>
                  </div>
                </div>
                <div className="flex items-center p-3 border rounded-md">
                  <Calendar className="h-5 w-5 mr-3 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Бүртгүүлсэн огноо</p>
                    <p className="text-sm text-muted-foreground">{user.createdAt}</p>
                  </div>
                </div>
                <div className="flex items-center p-3 border rounded-md">
                  <User className="h-5 w-5 mr-3 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Төлөв</p>
                    <p className="text-sm text-muted-foreground">{user.status}</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <p className="text-xs text-muted-foreground">Хэрэглэгчийн ID: {user.id}</p>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Нууц үг солих</CardTitle>
              <CardDescription>Аюулгүй байдлын үүднээс нууц үгээ тогтмол солих нь зүйтэй</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Одоогийн нууц үг</Label>
                  <Input id="current-password" type="password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password">Шинэ нууц үг</Label>
                  <Input id="new-password" type="password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Шинэ нууц үг давтах</Label>
                  <Input id="confirm-password" type="password" />
                </div>
                <Button type="submit" className="w-full">
                  Нууц үг солих
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
