"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Menu } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { settingsService, type SiteSettings } from "@/lib/db-service"

export function MobileNav() {
  const [open, setOpen] = useState(false)
  const [settings, setSettings] = useState<SiteSettings | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Тохиргоог авах
  const loadSettings = async () => {
    try {
      setIsLoading(true)
      const siteSettings = await settingsService.getOrCreateSettings()
      console.log("Мобайл цэс: Тохиргоо амжилттай авлаа", siteSettings)
      setSettings(siteSettings)
    } catch (error) {
      console.error("Мобайл цэс: Тохиргоо авахад алдаа гарлаа:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadSettings()
  }, [])

  // Логоны URL эсвэл default лого
  const logoUrl = settings?.logoUrl || settings?.logo || "/shopping-bag-icon.png"
  // Сайтын нэр эсвэл default нэр
  const siteName = settings?.siteName || "МонголШоп"

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Цэс нээх</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[80%] sm:w-[350px]">
        <div className="flex flex-col gap-6 px-2 py-4">
          <div className="flex items-center gap-2">
            <Image
              src={logoUrl || "/placeholder.svg"}
              alt={siteName}
              width={32}
              height={32}
              className="rounded"
              priority
            />
            <span className="text-xl font-bold">{siteName}</span>
          </div>
          <nav className="flex flex-col gap-4">
            <Link
              href="/"
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent"
              onClick={() => setOpen(false)}
            >
              Нүүр
            </Link>
            <Link
              href="/stores"
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent"
              onClick={() => setOpen(false)}
            >
              Дэлгүүрүүд
            </Link>
            <Link
              href="/categories"
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent"
              onClick={() => setOpen(false)}
            >
              Ангилал
            </Link>
            <Link
              href="/ratings"
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent"
              onClick={() => setOpen(false)}
            >
              Үнэлгээ
            </Link>
            <Link
              href="/about"
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent"
              onClick={() => setOpen(false)}
            >
              Тухай
            </Link>
          </nav>
          <div className="flex flex-col gap-2">
            <Button variant="outline" className="w-full" onClick={() => setOpen(false)}>
              Нэвтрэх
            </Button>
            <Button className="w-full" onClick={() => setOpen(false)}>
              Бүртгүүлэх
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
