"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Eye, EyeOff } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { userService } from "@/lib/db-service"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  // Буцах URL-ийг session storage-с авах
  useEffect(() => {
    if (typeof window !== "undefined") {
      const redirect = sessionStorage.getItem("redirectAfterLogin")
      if (redirect) {
        setRedirectUrl(redirect)
      }
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Энгийн шалгалт
      if (!email || !password) {
        setError("И-мэйл хаяг болон нууц үгээ оруулна уу")
        setLoading(false)
        return
      }

      // Хэрэглэгчийн нэвтрэлтийг өгөгдлийн сангаас шалгах
      const user = await userService.authenticateUser(email, password)

      if (user) {
        // Хэрэглэгчийн мэдээллийг session storage-д хадгалах
        sessionStorage.setItem("currentUser", JSON.stringify(user))

        // Консолд хэвлэж шалгах
        console.log("User logged in:", user)
        console.log("Session storage after login:", sessionStorage.getItem("currentUser"))

        toast({
          title: "Амжилттай нэвтэрлээ",
          description: `Тавтай морил, ${user.name}!`,
        })

        // Буцах URL-ийг арилгах
        if (redirectUrl) {
          sessionStorage.removeItem("redirectAfterLogin")
          router.push(redirectUrl)
          // Хуудсыг дахин ачаалах
          window.location.href = redirectUrl
        } else {
          // Нүүр хуудас руу шилжүүлэх
          router.push("/")
          // Хуудсыг дахин ачаалах
          window.location.href = "/"
        }
      } else {
        // Буруу мэдээлэл оруулсан тохиолдолд
        setError("И-мэйл хаяг эсвэл нууц үг буруу байна")
      }
    } catch (err) {
      console.error("Нэвтрэх үед алдаа гарлаа:", err)
      setError("Нэвтрэх үед алдаа гарлаа. Өгөгдлийн сантай холбогдох боломжгүй байна.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Нэвтрэх</CardTitle>
          <CardDescription>Системд нэвтрэхийн тулд мэдээллээ оруулна уу.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Имэйл</Label>
              <Input
                id="email"
                type="email"
                placeholder="имэйл@жишээ.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Нууц үг</Label>
                <Link href="/forgot-password" className="text-sm text-primary hover:underline">
                  Нууц үгээ мартсан?
                </Link>
              </div>
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
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Нэвтэрч байна..." : "Нэвтрэх"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col items-center space-y-2">
          <div className="text-sm text-muted-foreground">
            Бүртгэлгүй юу?{" "}
            <Link href="/register" className="text-primary hover:underline">
              Бүртгүүлэх
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
