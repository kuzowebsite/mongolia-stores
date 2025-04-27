"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { User, LogOut, Settings, Star, Shield } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MobileNav } from "@/components/mobile-nav"
import { settingsService, type SiteSettings } from "@/lib/db-service"

export function SiteHeader() {
  const [isClient, setIsClient] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [settings, setSettings] = useState<SiteSettings | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Хэрэглэгчийн мэдээллийг session storage-с авах
  const getCurrentUser = () => {
    try {
      const userJson = sessionStorage.getItem("currentUser")
      if (userJson) {
        return JSON.parse(userJson)
      }
      return null
    } catch (error) {
      console.error("Хэрэглэгчийн мэдээлэл авахад алдаа гарлаа:", error)
      return null
    }
  }

  // Системээс гарах
  const handleLogout = () => {
    try {
      sessionStorage.removeItem("currentUser")
      setCurrentUser(null)
      // Нүүр хуудас руу шилжүүлэх
      window.location.href = "/"
    } catch (error) {
      console.error("Системээс гарахад алдаа гарлаа:", error)
    }
  }

  // Тохиргоог авах
  const loadSettings = async () => {
    try {
      setIsLoading(true)
      const siteSettings = await settingsService.getOrCreateSettings()
      setSettings(siteSettings)
    } catch (error) {
      console.error("Тохиргоо авахад алдаа гарлаа:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    setIsClient(true)
    setCurrentUser(getCurrentUser())
    loadSettings()

    // Хэрэглэгчийн нэвтрэлтийг хянах
    const handleStorageChange = () => {
      setCurrentUser(getCurrentUser())
    }

    window.addEventListener("storage", handleStorageChange)
    return () => {
      window.removeEventListener("storage", handleStorageChange)
    }
  }, [])

  // Логоны URL эсвэл default лого
  const logoUrl = settings?.logoUrl || settings?.logo || "/shopping-bag-icon.png"
  // Сайтын нэр эсвэл default нэр
  const siteName = settings?.siteName || "МонголШоп"

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            {logoUrl && (
              <div className="relative h-8 w-8 overflow-hidden">
                <Image
                  src={logoUrl || "/placeholder.svg"}
                  alt={siteName}
                  width={32}
                  height={32}
                  className="object-contain"
                  priority
                />
              </div>
            )}
            <span className="text-xl font-bold">{siteName}</span>
          </Link>
        </div>
        <nav className="hidden md:flex gap-6">
          <Link href="/" className="text-sm font-medium hover:underline underline-offset-4">
            Нүүр
          </Link>
          <Link href="/stores" className="text-sm font-medium hover:underline underline-offset-4">
            Дэлгүүрүүд
          </Link>
          <Link href="/categories" className="text-sm font-medium hover:underline underline-offset-4">
            Ангилалууд
          </Link>
          <Link href="/ratings" className="text-sm font-medium hover:underline underline-offset-4">
            Үнэлгээнүүд
          </Link>
          <Link href="/about" className="text-sm font-medium hover:underline underline-offset-4">
            Бидний тухай
          </Link>
        </nav>
        <div className="flex items-center gap-4">
          {isClient && currentUser ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    {currentUser.avatar ? (
                      <AvatarImage src={currentUser.avatar || "/placeholder.svg"} alt={currentUser.name} />
                    ) : (
                      <AvatarFallback>{currentUser.name?.charAt(0)}</AvatarFallback>
                    )}
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{currentUser.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">{currentUser.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="flex items-center">
                    <User className="mr-2 h-4 w-4" />
                    <span>Профайл</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/profile/reviews" className="flex items-center">
                    <Star className="mr-2 h-4 w-4" />
                    <span>Миний сэтгэгдлүүд</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/profile/settings" className="flex items-center">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Тохиргоо</span>
                  </Link>
                </DropdownMenuItem>
                {currentUser.role === "admin" && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin" className="flex items-center">
                      <Shield className="mr-2 h-4 w-4" />
                      <span>Админ хэсэг</span>
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="flex items-center cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Гарах</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden md:inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
              >
                Нэвтрэх
              </Link>
              <Link
                href="/register"
                className="hidden md:inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
              >
                Бүртгүүлэх
              </Link>
            </>
          )}
          <MobileNav />
        </div>
      </div>
    </header>
  )
}
