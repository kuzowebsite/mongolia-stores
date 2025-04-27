"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { User, Search, Plus, Edit, Trash2, MoreHorizontal, UserCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"
import { userService } from "@/lib/db-service"

export default function UsersPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [users, setUsers] = useState<any[]>([])
  const [filteredUsers, setFilteredUsers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  // Хэрэглэгчдийн жагсаалтыг авах
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersData = await userService.getAllUsers()
        setUsers(usersData)
        setFilteredUsers(usersData)
      } catch (error) {
        toast({
          title: "Алдаа",
          description: "Хэрэглэгчдийн жагсаалтыг авахад алдаа гарлаа",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchUsers()
  }, [toast])

  // Хайлт хийх
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredUsers(users)
    } else {
      const query = searchQuery.toLowerCase()
      const filtered = users.filter(
        (user) =>
          user.name?.toLowerCase().includes(query) ||
          user.email?.toLowerCase().includes(query) ||
          user.phone?.toLowerCase().includes(query),
      )
      setFilteredUsers(filtered)
    }
  }, [searchQuery, users])

  // Хэрэглэгч устгах
  const handleDeleteUser = async (id: string) => {
    if (!window.confirm("Та энэ хэрэглэгчийг устгахдаа итгэлтэй байна уу?")) {
      return
    }

    try {
      await userService.deleteUser(id)
      setUsers((prevUsers) => prevUsers.filter((user) => user.id !== id))
      setFilteredUsers((prevUsers) => prevUsers.filter((user) => user.id !== id))
      toast({
        title: "Амжилттай",
        description: "Хэрэглэгч амжилттай устгагдлаа",
      })
    } catch (error) {
      toast({
        title: "Алдаа",
        description: "Хэрэглэгчийг устгахад алдаа гарлаа",
        variant: "destructive",
      })
    }
  }

  // Хэрэглэгчийн эрхийн төрлийг харуулах
  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return <Badge variant="default">Админ</Badge>
      case "editor":
        return <Badge variant="outline">Редактор</Badge>
      default:
        return <Badge variant="secondary">Хэрэглэгч</Badge>
    }
  }

  // Хэрэглэгчийн төлөвийг харуулах
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge variant="success">Идэвхтэй</Badge>
      case "inactive":
        return <Badge variant="secondary">Идэвхгүй</Badge>
      case "blocked":
        return <Badge variant="destructive">Хориглосон</Badge>
      default:
        return <Badge variant="outline">Тодорхойгүй</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Хэрэглэгчид</h1>
          <p className="text-muted-foreground">Системийн бүх хэрэглэгчдийн жагсаалт</p>
        </div>
        <Button asChild>
          <Link href="/admin/users/new">
            <Plus className="mr-2 h-4 w-4" />
            Шинэ хэрэглэгч
          </Link>
        </Button>
      </div>

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Хэрэглэгчдийн жагсаалт
          </CardTitle>
          <CardDescription>Системд бүртгэлтэй бүх хэрэглэгчид</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Хэрэглэгч хайх..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <UserCircle className="h-12 w-12 text-muted-foreground mb-2" />
              <h3 className="text-lg font-medium">Хэрэглэгч олдсонгүй</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {searchQuery ? "Хайлтад тохирох хэрэглэгч олдсонгүй" : "Системд бүртгэлтэй хэрэглэгч байхгүй байна"}
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead style={{ width: "40px" }}>#</TableHead>
                    <TableHead>Нэр</TableHead>
                    <TableHead>И-мэйл</TableHead>
                    <TableHead>Утас</TableHead>
                    <TableHead>Эрх</TableHead>
                    <TableHead>Төлөв</TableHead>
                    <TableHead style={{ width: "80px" }}></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user, index) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{index + 1}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {user.avatar ? (
                            <div className="relative h-8 w-8 overflow-hidden rounded-full">
                              <img
                                src={user.avatar || "/placeholder.svg"}
                                alt={user.name}
                                className="h-full w-full object-cover"
                                onError={(e) => {
                                  ;(e.target as HTMLImageElement).src = "/vibrant-street-market.png"
                                }}
                              />
                            </div>
                          ) : (
                            <UserCircle className="h-8 w-8 text-muted-foreground" />
                          )}
                          <span>{user.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.phone || "-"}</TableCell>
                      <TableCell>{getRoleBadge(user.role)}</TableCell>
                      <TableCell>{getStatusBadge(user.status)}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Цэс</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => router.push(`/admin/users/${user.id}`)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Засах
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDeleteUser(user.id)}>
                              <Trash2 className="mr-2 h-4 w-4" />
                              Устгах
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
