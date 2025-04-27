"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Eye, EyeOff, AlertCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { userService } from "@/lib/db-service"

export default function AdminRegisterPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setLoading(true)

    try {
      // Энгийн шалгалт
      if (!name || !email || !password || !confirmPassword) {
        setError("Бүх талбарыг бөглөнө үү")
        setLoading(false)
        return
      }

      // Нууц үг шалгах
      if (password !== confirmPassword) {
        setError("Нууц үг таарахгүй байна")
        setLoading(false)
        return
      }

      // Нууц үгийн урт шалгах
      if (password.length < 6) {
        setError("Нууц үг хамгийн багадаа 6 тэмдэгт байх ёстой")
        setLoading(false)
        return
      }

      // И-мэйл хаяг давхардсан эсэхийг шалгах
      const existingUser = await userService.getUserByEmail(email)
      if (existingUser) {
        setError("Энэ и-мэйл хаягтай хэрэглэгч бүртгэлтэй байна")
        setLoading(false)
        return
      }

      // Админ хэрэглэгч үүсгэх
      const newUser = {
        name,
        email,
        password,
        role: "admin",
        status: "active",
        createdAt: new Date().toISOString(),
      }

      const userId = await userService.createUser(newUser)

      if (userId) {
        setSuccess("Админ хэрэглэгч амжилттай үүслээ! Одоо нэвтэрч болно.")

        // Хэрэглэгчийн мэдээллийг session storage-д хадгалах (нууц үггүйгээр)
        const { password: _, ...userWithoutPassword } = newUser
        sessionStorage.setItem(
          "currentUser",
          JSON.stringify({
            id: userId,
            ...userWithoutPassword,
          }),
        )

        // 2 секундын дараа админ хэсэг рүү шилжүүлэх
        setTimeout(() => {
          router.push("/admin")
        }, 2000)
      } else {
        setError("Хэрэглэгч үүсгэхэд алдаа гарлаа")
      }
    } catch (err) {
      console.error("Бүртгэх үед алдаа гарлаа:", err)
      setError("Бүртгэх үед алдаа гарлаа. Өгөгдлийн сантай холбогдох боломжгүй байна.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/40">
      <div className="w-full max-w-md p-4">
        <Card className="w-full">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Админ бүртгэх</CardTitle>
            <CardDescription className="text-center">
              Энэ хуудас нь түр зуурын хэрэглэлтэд зориулагдсан. Админ хэрэглэгч үүсгэсний дараа устгана уу.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {success && (
              <Alert className="mb-4 bg-green-50 text-green-800 border-green-200">
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Нэр</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Админ нэр"
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
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Нууц үг</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className="sr-only">{showPassword ? "Нууц үг нуух" : "Нууц үг харуулах"}</span>
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Нууц үг баталгаажуулах</Label>
                <Input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Бүртгэж байна..." : "Админ бүртгэх"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <div className="text-sm text-center">
              <Link href="/admin/login" className="text-primary hover:underline">
                Нэвтрэх хуудас руу буцах
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
