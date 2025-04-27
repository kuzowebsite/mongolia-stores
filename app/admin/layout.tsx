"use client"

import type { ReactNode } from "react"
import {
  LayoutDashboard,
  Store,
  Tag,
  MessageSquare,
  Users,
  Settings,
  LogOut,
  Menu,
  User,
  Database,
  FileSpreadsheet,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { ErrorBoundary } from "react-error-boundary"
import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"

interface AdminLayoutProps {
  children: ReactNode
}

// Fallback component for error boundary
function ErrorFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 py-12 md:px-6">
      <div className="mx-auto max-w-md text-center">
        <h2 className="text-2xl font-bold mb-4">Админ хэсэгт алдаа гарлаа</h2>
        <p className="text-muted-foreground mb-6">
          Уучлаарай, админ хэсгийг ачааллахад алдаа гарлаа. {error?.message || ""}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button onClick={resetErrorBoundary} variant="default">
            Дахин оролдох
          </Button>
          <Button variant="outline" asChild>
            <Link href="/">Нүүр хуудас руу буцах</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  // Нэвтрэх хуудас дээр байгаа эсэхийг шалгах
  const isLoginPage = pathname === "/admin/login"

  useEffect(() => {
    // Хэрэв нэвтрэх хуудас дээр байвал шалгалт хийхгүй
    if (isLoginPage) {
      setIsLoading(false)
      return
    }

    // Хэрэглэгч нэвтэрсэн эсэхийг шалгах
    const checkAuth = () => {
      try {
        // Хэрэглэгчийн мэдээллийг session storage-с авах
        const userJson = sessionStorage.getItem("currentUser")

        // Хэрэглэгч нэвтрээгүй бол
        if (!userJson) {
          console.log("Хэрэглэгч нэвтрээгүй байна, нэвтрэх хуудас руу шилжүүлж байна")
          // Нэвтрэх хуудас руу шилжүүлэх
          router.push("/admin/login")
          return false
        }

        // Хэрэглэгчийн мэдээллийг JSON-с объект болгох
        const user = JSON.parse(userJson)

        // Админ эрхтэй эсэхийг шалгах
        if (user.role !== "admin") {
          console.log("Админ эрх байхгүй байна:", user)
          router.push("/admin/login")
          return false
        }

        console.log("Админ амжилттай нэвтэрлээ:", user)
        return true
      } catch (error) {
        console.error("Нэвтрэлт шалгах үед алдаа гарлаа:", error)
        router.push("/admin/login")
        return false
      }
    }

    const isAuth = checkAuth()
    setIsAuthenticated(isAuth)
    setIsLoading(false)
  }, [router, isLoginPage, pathname])

  // Ачаалж байх үед loading харуулах
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-sm text-muted-foreground">Ачааллаж байна...</p>
        </div>
      </div>
    )
  }

  // Хэрэв нэвтрэх хуудас дээр байвал шууд children буцаах
  if (isLoginPage) {
    return <>{children}</>
  }

  // Хэрэглэгч нэвтрээгүй бол хоосон div буцаах (router.push үйлдэл хийгдэнэ)
  if (!isAuthenticated) {
    return <div></div>
  }

  const navItems = [
    {
      title: "Хянах самбар",
      href: "/admin",
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      title: "Дэлгүүрүүд",
      href: "/admin/stores",
      icon: <Store className="h-5 w-5" />,
    },
    {
      title: "Ангилалууд",
      href: "/admin/categories",
      icon: <Tag className="h-5 w-5" />,
    },
    {
      title: "Сэтгэгдлүүд",
      href: "/admin/reviews",
      icon: <MessageSquare className="h-5 w-5" />,
    },
    {
      title: "Хэрэглэгчид",
      href: "/admin/users",
      icon: <Users className="h-5 w-5" />,
    },
    {
      title: "Тохиргоо",
      href: "/admin/settings",
      icon: <Settings className="h-5 w-5" />,
    },
    {
      title: "Холболтын төлөв",
      href: "/admin/connection",
      icon: <Database className="h-5 w-5" />,
    },
    {
      title: "Өгөгдөл үүсгэх",
      href: "/admin/data-init",
      icon: <FileSpreadsheet className="h-5 w-5" />,
    },
    {
      title: "Профайл",
      href: "/admin/profile",
      icon: <User className="h-5 w-5" />,
    },
  ]

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[240px_1fr] lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-muted/40 md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link href="/admin" className="flex items-center gap-2 font-semibold">
              <Store className="h-6 w-6" />
              <span>МонголШоп Админ</span>
            </Link>
          </div>
          <div className="flex-1 overflow-auto py-2">
            <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
              {navItems.map((item, index) => (
                <Link
                  key={index}
                  href={item.href}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
                >
                  {item.icon}
                  {item.title}
                </Link>
              ))}
              <Separator className="my-2" />
              <Link
                href="/"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
              >
                <LogOut className="h-5 w-5" />
                Гарах
              </Link>
            </nav>
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Цэс нээх</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="pr-0">
              <div className="flex items-center gap-2 font-semibold">
                <Store className="h-6 w-6" />
                <span>МонголШоп Админ</span>
              </div>
              <div className="grid gap-2 py-6">
                {navItems.map((item, index) => (
                  <Link
                    key={index}
                    href={item.href}
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
                  >
                    {item.icon}
                    {item.title}
                  </Link>
                ))}
                <Separator className="my-2" />
                <Link
                  href="/"
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
                >
                  <LogOut className="h-5 w-5" />
                  Гарах
                </Link>
              </div>
            </SheetContent>
          </Sheet>
          <div className="w-full flex-1">
            <h1 className="text-lg font-semibold">Админ хэсэг</h1>
          </div>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          <ErrorBoundary FallbackComponent={ErrorFallback} onReset={() => window.location.reload()}>
            {children}
          </ErrorBoundary>
        </main>
      </div>
    </div>
  )
}
