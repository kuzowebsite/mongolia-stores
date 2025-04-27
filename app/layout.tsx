import type React from "react"
import type { Metadata } from "next"
import ClientLayout from "./ClientLayout"

// Metadata can't be used in client components, so we need to define it separately
export const metadata: Metadata = {
  title: "МонголШоп - Монголын шилдэг дэлгүүрүүд",
  description: "Монголын шилдэг дэлгүүрүүдийн мэдээлэл, үнэлгээ болон сэтгэгдэлүүдийг нэг дороос харах вэбсайт",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="mn">
      <body>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  )
}
