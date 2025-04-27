"use client"

import { useState, useEffect, type FormEvent, type ChangeEvent } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/components/ui/use-toast"
import { settingsService, type SiteSettings } from "@/lib/db-service"
import { Loader2, Save, Upload } from "lucide-react"

export default function SettingsPage() {
  const router = useRouter()
  const [settings, setSettings] = useState<SiteSettings>({
    siteName: "МонголШоп",
    siteUrl: "https://mongolshop.mn",
    siteDescription: "Монголын шилдэг дэлгүүрүүдийн мэдээлэл, үнэлгээ болон сэтгэгдэлүүдийг нэг дороос харах вэбсайт",
    contactEmail: "info@mongolshop.mn",
    contactPhone: "+976 9911 2233",
    showFeaturedStores: true,
    showLatestReviews: true,
    showNewsletter: true,
    darkMode: false,
    animations: true,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)

  // Тохиргоог авах
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setIsLoading(true)
        const siteSettings = await settingsService.getOrCreateSettings()
        if (siteSettings) {
          setSettings(siteSettings)
          if (siteSettings.logo) {
            setLogoPreview(siteSettings.logo)
          } else if (siteSettings.logoUrl) {
            setLogoPreview(siteSettings.logoUrl)
          }
        }
      } catch (error) {
        console.error("Тохиргоо авахад алдаа гарлаа:", error)
        toast({
          title: "Алдаа гарлаа",
          description: "Тохиргоо авахад алдаа гарлаа. Дахин оролдоно уу.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadSettings()
  }, [])

  // Тохиргоог хадгалах
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    try {
      setIsSaving(true)

      // Лого зургийг base64 болгох
      if (logoFile) {
        const base64Logo = await convertFileToBase64(logoFile)
        settings.logo = base64Logo
        settings.logoUrl = base64Logo // logoUrl-г шинэчлэх
      }

      // Тохиргоог хадгалах
      await settingsService.saveSettings(settings)

      toast({
        title: "Амжилттай",
        description: "Тохиргоо амжилттай хадгалагдлаа.",
      })

      // Хуудсыг дахин ачаалах
      router.refresh()
    } catch (error) {
      console.error("Тохиргоо хадгалахад алдаа гарлаа:", error)
      toast({
        title: "Алдаа гарлаа",
        description: "Тохиргоо хадгалахад алдаа гарлаа. Дахин оролдоно уу.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Талбарын утгыг өөрчлөх
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setSettings({
      ...settings,
      [name]: type === "checkbox" ? checked : value,
    })
  }

  // Switch утгыг өөрчлөх
  const handleSwitchChange = (name: string, checked: boolean) => {
    setSettings({
      ...settings,
      [name]: checked,
    })
  }

  // Лого зураг сонгох
  const handleLogoChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setLogoFile(file)

      // Зургийн preview үүсгэх
      const reader = new FileReader()
      reader.onload = (event) => {
        if (event.target?.result) {
          setLogoPreview(event.target.result as string)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  // Файлыг base64 болгох
  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = (error) => reject(error)
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6 py-6">
      <div>
        <h3 className="text-lg font-medium">Сайтын тохиргоо</h3>
        <p className="text-sm text-muted-foreground">Сайтын үндсэн тохиргоог энд хийнэ.</p>
      </div>
      <Separator />

      <form onSubmit={handleSubmit}>
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="general">Үндсэн</TabsTrigger>
            <TabsTrigger value="appearance">Харагдах байдал</TabsTrigger>
            <TabsTrigger value="features">Боломжууд</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Үндсэн мэдээлэл</CardTitle>
                <CardDescription>Сайтын үндсэн мэдээллийг оруулна уу.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="siteName">Сайтын нэр</Label>
                    <Input
                      id="siteName"
                      name="siteName"
                      value={settings.siteName}
                      onChange={handleChange}
                      placeholder="Сайтын нэр"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="siteUrl">Сайтын URL</Label>
                    <Input
                      id="siteUrl"
                      name="siteUrl"
                      value={settings.siteUrl}
                      onChange={handleChange}
                      placeholder="https://example.com"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="siteDescription">Сайтын тайлбар</Label>
                  <Input
                    id="siteDescription"
                    name="siteDescription"
                    value={settings.siteDescription}
                    onChange={handleChange}
                    placeholder="Сайтын тайлбар"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contactEmail">Холбоо барих и-мэйл</Label>
                    <Input
                      id="contactEmail"
                      name="contactEmail"
                      value={settings.contactEmail}
                      onChange={handleChange}
                      placeholder="info@example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactPhone">Холбоо барих утас</Label>
                    <Input
                      id="contactPhone"
                      name="contactPhone"
                      value={settings.contactPhone}
                      onChange={handleChange}
                      placeholder="+976 9911 2233"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="logo">Лого</Label>
                  <div className="flex items-center gap-4">
                    {logoPreview && (
                      <div className="w-16 h-16 border rounded overflow-hidden">
                        <img
                          src={logoPreview || "/placeholder.svg"}
                          alt="Лого"
                          className="w-full h-full object-contain"
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <Label
                        htmlFor="logo"
                        className="flex items-center justify-center w-full h-10 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 cursor-pointer"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Лого сонгох
                      </Label>
                      <Input id="logo" type="file" accept="image/*" onChange={handleLogoChange} className="hidden" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appearance" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Харагдах байдал</CardTitle>
                <CardDescription>Сайтын харагдах байдлын тохиргоог хийнэ.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="darkMode">Харанхуй горим</Label>
                    <p className="text-sm text-muted-foreground">Сайт харанхуй горимтой эхлэх эсэх.</p>
                  </div>
                  <Switch
                    id="darkMode"
                    checked={settings.darkMode}
                    onCheckedChange={(checked) => handleSwitchChange("darkMode", checked)}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="animations">Анимэйшн</Label>
                    <p className="text-sm text-muted-foreground">Сайтын анимэйшн идэвхтэй эсэх.</p>
                  </div>
                  <Switch
                    id="animations"
                    checked={settings.animations}
                    onCheckedChange={(checked) => handleSwitchChange("animations", checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="features" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Боломжууд</CardTitle>
                <CardDescription>Сайтын боломжуудын тохиргоог хийнэ.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="showFeaturedStores">Онцлох дэлгүүрүүд</Label>
                    <p className="text-sm text-muted-foreground">Нүүр хуудсанд онцлох дэлгүүрүүдийг харуулах эсэх.</p>
                  </div>
                  <Switch
                    id="showFeaturedStores"
                    checked={settings.showFeaturedStores}
                    onCheckedChange={(checked) => handleSwitchChange("showFeaturedStores", checked)}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="showLatestReviews">Сүүлийн сэтгэгдлүүд</Label>
                    <p className="text-sm text-muted-foreground">Нүүр хуудсанд сүүлийн сэтгэгдлүүдийг харуулах эсэх.</p>
                  </div>
                  <Switch
                    id="showLatestReviews"
                    checked={settings.showLatestReviews}
                    onCheckedChange={(checked) => handleSwitchChange("showLatestReviews", checked)}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="showNewsletter">Мэдээллийн захиалга</Label>
                    <p className="text-sm text-muted-foreground">
                      Нүүр хуудсанд мэдээллийн захиалгын хэсгийг харуулах эсэх.
                    </p>
                  </div>
                  <Switch
                    id="showNewsletter"
                    checked={settings.showNewsletter}
                    onCheckedChange={(checked) => handleSwitchChange("showNewsletter", checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-6 flex justify-end">
          <Button type="submit" disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Хадгалж байна...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Хадгалах
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
