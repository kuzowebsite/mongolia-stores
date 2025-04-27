import Link from "next/link"
import Image from "next/image"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function AboutPage() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-background">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">Бидний тухай</h1>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              МонголШоп нь Монголын шилдэг дэлгүүрүүдийн мэдээлэл, үнэлгээ болон сэтгэгдэлүүдийг нэг дороос харах
              боломжийг олгодог платформ юм.
            </p>
          </div>
        </div>

        <div className="mx-auto mt-16 max-w-4xl">
          <div className="grid gap-12 md:grid-cols-2 md:gap-16">
            <div>
              <Image
                src="/about-us-image.png"
                alt="Бидний тухай"
                width={500}
                height={500}
                className="mx-auto aspect-square rounded-full object-cover"
              />
            </div>
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Бидний зорилго</h2>
                <p className="text-muted-foreground md:text-xl/relaxed">
                  Бид хэрэглэгчдэд Монголын дэлгүүрүүдийн талаар бодит мэдээлэл, үнэлгээг хүргэх зорилготой. Энэхүү
                  платформ нь хэрэглэгчдэд дэлгүүр сонгоход тусалж, дэлгүүрүүдэд өөрсдийн үйлчилгээгээ сайжруулахад
                  туслах зорилготой.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto mt-16 max-w-5xl">
          <h2 className="mb-8 text-center text-2xl font-bold">Бидний үйлчилгээнүүд</h2>
          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardContent className="p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"
                    />
                  </svg>
                </div>
                <h3 className="mb-2 text-xl font-bold">Дэлгүүрүүдийн үнэлгээ</h3>
                <p className="text-muted-foreground">
                  Хэрэглэгчдийн үнэлгээнд үндэслэн дэлгүүрүүдийн чанар, үйлчилгээний түвшинг харуулдаг.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                </div>
                <h3 className="mb-2 text-xl font-bold">Хэрэглэгчдийн сэтгэгдэл</h3>
                <p className="text-muted-foreground">
                  Бодит хэрэглэгчдийн туршлага, сэтгэгдлийг уншиж, мөн өөрийн сэтгэгдлээ үлдээх боломжтой.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>
                <h3 className="mb-2 text-xl font-bold">Байршлын мэдээлэл</h3>
                <p className="text-muted-foreground">
                  Дэлгүүрүүдийн байршил, ажиллах цаг, холбоо барих мэдээллийг нэг дороос авах боломжтой.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="mx-auto mt-16 max-w-3xl">
          <h2 className="mb-8 text-center text-2xl font-bold">Бидэнтэй холбогдох</h2>
          <Card>
            <CardContent className="p-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <h3 className="font-semibold">Хаяг</h3>
                  <p className="text-sm text-muted-foreground">
                    Улаанбаатар хот, Сүхбаатар дүүрэг, 1-р хороо, Их Монгол гудамж, 101 тоот
                  </p>
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold">Утас</h3>
                  <p className="text-sm text-muted-foreground">+976 9911 2233</p>
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold">И-мэйл</h3>
                  <p className="text-sm text-muted-foreground">info@mongolshop.mn</p>
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold">Ажиллах цаг</h3>
                  <p className="text-sm text-muted-foreground">Даваа - Баасан: 9:00 - 18:00</p>
                </div>
              </div>
              <div className="mt-6 flex justify-center">
                <Button>Холбоо барих</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
