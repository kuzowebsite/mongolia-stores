"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Menu } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

export function MobileNav() {
  const [open, setOpen] = useState(false)

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
            <Image src="/shopping-bag-icon.png" alt="Logo" width={32} height={32} className="rounded" />
            <span className="text-xl font-bold">МонголШоп</span>
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
