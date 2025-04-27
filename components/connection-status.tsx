"use client"

import { useState, useEffect } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { getConnectionStatus, reconnectToDatabase } from "@/lib/firebase"
import { RefreshCcw, Wifi, WifiOff, AlertCircle, CheckCircle2 } from "lucide-react"

export function ConnectionStatus() {
  const [status, setStatus] = useState(getConnectionStatus())
  const [reconnecting, setReconnecting] = useState(false)
  const [isAdminPage, setIsAdminPage] = useState(false)

  useEffect(() => {
    // Админ хэсэг эсэхийг шалгах
    const checkIfAdminPage = () => {
      const isAdmin = typeof window !== "undefined" && window.location.pathname.startsWith("/admin")
      return isAdmin
    }

    const updateAdminPageState = () => {
      setIsAdminPage(checkIfAdminPage())
    }

    updateAdminPageState()

    // URL өөрчлөгдөх үед дахин шалгах
    const handleRouteChange = () => {
      updateAdminPageState()
    }

    window.addEventListener("popstate", handleRouteChange)

    return () => {
      window.removeEventListener("popstate", handleRouteChange)
    }
  }, [])

  useEffect(() => {
    // Холболтын төлөвийг тогтмол шинэчлэх
    const intervalId = setInterval(() => {
      setStatus(getConnectionStatus())
    }, 5000)

    // Сүлжээний холболт өөрчлөгдөх үед дахин холбогдох
    const handleOnline = () => {
      handleReconnect()
    }

    window.addEventListener("online", handleOnline)

    return () => {
      clearInterval(intervalId)
      window.removeEventListener("online", handleOnline)
    }
  }, [])

  const handleReconnect = async () => {
    setReconnecting(true)
    try {
      await reconnectToDatabase()
      // Холболтын төлөвийг шинэчлэх
      setStatus(getConnectionStatus())
    } catch (error) {
      console.error("Дахин холбогдоход алдаа гарлаа:", error)
    } finally {
      setReconnecting(false)
    }
  }

  // Хэрэв админ хэсэг биш бол харуулахгүй
  if (!isAdminPage) {
    return null
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          {status.isConnected ? (
            <Wifi className="h-5 w-5 mr-2 text-green-500" />
          ) : (
            <WifiOff className="h-5 w-5 mr-2 text-red-500" />
          )}
          Өгөгдлийн сангийн холболтын төлөв
        </CardTitle>
        <CardDescription>
          {status.isConnected ? "Өгөгдлийн сантай амжилттай холбогдсон байна." : "Өгөгдлийн сантай холбогдоогүй байна."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {status.isConnected ? (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <AlertTitle>Холболт амжилттай</AlertTitle>
            <AlertDescription>
              Өгөгдлийн сантай амжилттай холбогдсон байна. Бүх функцууд хэвийн ажиллах боломжтой.
            </AlertDescription>
          </Alert>
        ) : (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Холболт амжилтгүй</AlertTitle>
            <AlertDescription>
              <p>
                Өгөгдлийн сантай холбогдох боломжгүй байна.{" "}
                {status.isOfflineMode ? "Оффлайн горимд ажиллаж байна." : ""}
              </p>
              {status.lastError && <p className="text-xs mt-1">Алдааны мэдээлэл: {status.lastError}</p>}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={handleReconnect} disabled={reconnecting || status.isConnected} className="w-full">
          {reconnecting ? (
            <>
              <RefreshCcw className="mr-2 h-4 w-4 animate-spin" />
              Дахин холбогдож байна...
            </>
          ) : (
            <>
              <RefreshCcw className="mr-2 h-4 w-4" />
              Дахин холбогдох
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
