"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { ConnectionStatus } from "@/components/connection-status"
import { Toaster } from "@/components/toaster"
import { SiteHeader } from "@/components/site-header"

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [isClient, setIsClient] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const pathname = usePathname()

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

  useEffect(() => {
    setIsClient(true)
    setCurrentUser(getCurrentUser())

    // Хэрэглэгчийн нэвтрэлтийг хянах
    const handleStorageChange = () => {
      setCurrentUser(getCurrentUser())
    }

    window.addEventListener("storage", handleStorageChange)
    return () => {
      window.removeEventListener("storage", handleStorageChange)
    }
  }, [])

  // Админ хэсэгт байгаа эсэхийг шалгах
  const isAdminSection = pathname?.startsWith("/admin")

  // Админ хэсэгт байгаа бол толгой, хөл хэсгийг харуулахгүй
  if (isAdminSection) {
    return (
      <>
        {children}
        <Toaster />
      </>
    )
  }

  return (
    <>
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            &copy; {new Date().getFullYear()} Бүх эрх хуулиар хамгаалагдсан.
          </p>
          <ConnectionStatus />
        </div>
      </footer>
      <Toaster />
    </>
  )
}
