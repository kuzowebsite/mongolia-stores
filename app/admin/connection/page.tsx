"use client"

import { useState, useEffect } from "react"
import { Database, RefreshCw, Wifi, WifiOff, AlertTriangle, CheckCircle2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { getConnectionStatus } from "@/lib/firebase"
import { useToast } from "@/components/ui/use-toast"

export default function ConnectionStatusPage() {
  const { toast } = useToast()
  const [connectionStatus, setConnectionStatus] = useState<any>({
    isConnected: false,
    isOfflineMode: true,
    lastAttempt: null,
    error: null,
  })
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    fetchConnectionStatus()
  }, [])

  const fetchConnectionStatus = async () => {
    try {
      const status = getConnectionStatus()
      setConnectionStatus(status)
    } catch (error) {
      console.error("Холболтын төлөв авахад алдаа гарлаа:", error)
    }
  }

  const handleRefreshConnection = async () => {
    setIsRefreshing(true)
    try {
      // Холболтыг дахин шалгах
      await fetchConnectionStatus()
      toast({
        title: "Амжилттай",
        description: "Холболтын төлөв шинэчлэгдлээ",
      })
    } catch (error) {
      toast({
        title: "Алдаа",
        description: "Холболтын төлөв шинэчлэхэд алдаа гарлаа",
        variant: "destructive",
      })
    } finally {
      setIsRefreshing(false)
    }
  }

  const formatDate = (timestamp: number | null) => {
    if (!timestamp) return "Тодорхойгүй"
    return new Date(timestamp).toLocaleString("mn-MN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Холболтын төлөв</h1>
          <p className="text-muted-foreground">Өгөгдлийн сангийн холболтын төлөв</p>
        </div>
        <Button onClick={handleRefreshConnection} disabled={isRefreshing}>
          {isRefreshing ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
          ) : (
            <RefreshCw className="mr-2 h-4 w-4" />
          )}
          Шинэчлэх
        </Button>
      </div>

      <Separator />

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Өгөгдлийн сангийн холболт
            </CardTitle>
            <CardDescription>Firebase өгөгдлийн сангийн холболтын төлөв</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-medium">Холболтын төлөв:</span>
              {connectionStatus.isConnected ? (
                <Badge variant="success" className="flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Холбогдсон
                </Badge>
              ) : (
                <Badge variant="destructive" className="flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  Холбогдоогүй
                </Badge>
              )}
            </div>

            <div className="flex items-center justify-between">
              <span className="font-medium">Горим:</span>
              {connectionStatus.isOfflineMode ? (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <WifiOff className="h-3 w-3" />
                  Оффлайн
                </Badge>
              ) : (
                <Badge variant="outline" className="flex items-center gap-1">
                  <Wifi className="h-3 w-3" />
                  Онлайн
                </Badge>
              )}
            </div>

            <div className="flex items-center justify-between">
              <span className="font-medium">Сүүлийн оролдлого:</span>
              <span>{formatDate(connectionStatus.lastAttempt)}</span>
            </div>

            {connectionStatus.error && (
              <div className="mt-4 p-3 bg-destructive/10 rounded-md text-destructive text-sm">
                <div className="font-medium mb-1">Алдааны мэдээлэл:</div>
                <div>{connectionStatus.error.message || "Тодорхойгүй алдаа"}</div>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" onClick={handleRefreshConnection} disabled={isRefreshing}>
              {isRefreshing ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
              ) : (
                <RefreshCw className="mr-2 h-4 w-4" />
              )}
              Дахин холбогдох
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
