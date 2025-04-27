"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Eye, EyeOff } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { userService } from "@/lib/db-service"

export default function RegisterPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      // Энгийн шалгалт
      if (!name || !email || !password || !confirmPassword) {
        setError("Бүх талбарыг бөглөнө үү")
        setLoading(false)
        return
      }

      if (password !== confirmPassword) {
        setError("Нууц үг таарахгүй байна")
        setLoading(false)
        return
      }

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

      // Шинэ хэрэглэгч үүсгэх
      const newUser = {
        name,
        email,
        password,
        role: "user",
        status: "active",
        createdAt: new Date().toISOString(),
      }

      const userId = await userService.createUser(newUser)

      if (userId) {
        // Хэрэглэгчийн мэдээллийг session storage-д хадгалах
        // Нууц үгийг хадгалахгүй байх
        const { password: _, ...userWithoutPassword } = newUser
        sessionStorage.setItem("currentUser", JSON.stringify({ ...userWithoutPassword, id: userId }))

        // Амжилттай бүртгүүлсэн бол нүүр хуудас руу шилжүүлэх
        router.push("/")
      } else {
        setError("Бүртгүүлэх үед алдаа гарлаа. Дахин оролдоно уу.")
      }
    } catch (err) {
      console.error("Бүртгүүлэх үед алдаа гарлаа:", err)
      setError("Бүртгүүлэх үед алдаа гарлаа. Дахин оролдоно уу.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container max-w-md py-10">
      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Бүртгүүлэх</CardTitle>
          <CardDescription className="text-center">
            Шинэ хэрэглэгч үүсгэхийн тулд доорх мэдээллийг оруулна уу
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Нэр</Label>
              <Input
                id="name"
                type="text"
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
              {loading ? "Бүртгүүлж байна..." : "Бүртгүүлэх"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <div className="text-center text-sm">
            Бүртгэлтэй юу?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Нэвтрэх
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
