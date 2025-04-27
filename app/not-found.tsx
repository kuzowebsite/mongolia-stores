import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="container flex flex-col items-center justify-center min-h-[70vh] px-4 py-12 md:px-6">
      <div className="mx-auto max-w-md text-center">
        <h2 className="text-2xl font-bold mb-4">404 - Хуудас олдсонгүй</h2>
        <p className="text-muted-foreground mb-6">
          Уучлаарай, таны хайсан хуудас олдсонгүй. Хаяг зөв эсэхийг шалгана уу.
        </p>
        <Button asChild>
          <Link href="/">Нүүр хуудас руу буцах</Link>
        </Button>
      </div>
    </div>
  )
}
