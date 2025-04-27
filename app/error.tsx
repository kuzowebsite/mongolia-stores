"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Алдаа гарлаа:", error)
  }, [error])

  // Determine if we're in the admin section
  const isAdminPage = typeof window !== "undefined" && window.location.pathname.startsWith("/admin")

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 py-12 md:px-6">
      <div className="mx-auto max-w-md text-center">
        <h2 className="text-2xl font-bold mb-4">Алдаа гарлаа</h2>
        <p className="text-muted-foreground mb-6">Уучлаарай, хуудсыг ачааллахад алдаа гарлаа. {error?.message || ""}</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button onClick={() => reset()} variant="default">
            Дахин оролдох
          </Button>
          {isAdminPage ? (
            <Button variant="outline" asChild>
              <Link href="/admin">Админ нүүр хуудас руу буцах</Link>
            </Button>
          ) : (
            <Button variant="outline" asChild>
              <Link href="/">Нүүр хуудас руу буцах</Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
