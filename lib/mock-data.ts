// Жишээ өгөгдөл
import type { Store, Review, SiteSettings, Category, User } from "./db-service"

// Жишээ дэлгүүрүүд
export const mockStores: Store[] = [
  {
    id: "store1",
    name: "Шангри-Ла Молл",
    category: "Худалдааны төв",
    rating: 4.5,
    reviews: 120,
    image: "/shangri-la-mall-ulaanbaatar-exterior.png",
    description: "Улаанбаатар хотын хамгийн орчин үеийн худалдааны төв",
    address: "Сүхбаатарын талбай, Улаанбаатар",
    phone: "+976 7700 8877",
    hours: "10:00 - 22:00",
    website: "https://shangrila.mn",
    createdAt: Date.now() - 1000000,
    updatedAt: Date.now() - 10000,
  },
  {
    id: "store2",
    name: "Улсын их дэлгүүр",
    category: "Их дэлгүүр",
    rating: 4.2,
    reviews: 85,
    image: "/ulaanbaatar-state-department-store.png",
    description: "Монголын хамгийн том уламжлалт их дэлгүүр",
    address: "Сүхбаатарын гудамж, Улаанбаатар",
    phone: "+976 1100 2233",
    hours: "09:00 - 21:00",
    website: "https://uidstore.mn",
    createdAt: Date.now() - 2000000,
    updatedAt: Date.now() - 20000,
  },
  {
    id: "store3",
    name: "Номин Супермаркет",
    category: "Супермаркет",
    rating: 4.0,
    reviews: 65,
    image: "/nomin-supermarket-aisle.png",
    description: "Өргөн хэрэглээний бараа, хүнсний бүтээгдэхүүний дэлгүүр",
    address: "Баянзүрх дүүрэг, Улаанбаатар",
    phone: "+976 7711 4455",
    hours: "08:00 - 23:00",
    website: "https://nomin.mn",
    createdAt: Date.now() - 3000000,
    updatedAt: Date.now() - 30000,
  },
  {
    id: "store4",
    name: "Улаанбаатар Бутик",
    category: "Хувцас",
    rating: 4.7,
    reviews: 42,
    image: "/ulaanbaatar-boutique.png",
    description: "Орчин үеийн загварлаг хувцасны дэлгүүр",
    address: "Чингэлтэй дүүрэг, Улаанбаатар",
    phone: "+976 9900 1122",
    hours: "10:00 - 20:00",
    website: "https://ubboutique.mn",
    createdAt: Date.now() - 4000000,
    updatedAt: Date.now() - 40000,
  },
]

// Жишээ ангилалууд
export const mockCategories: Category[] = [
  {
    id: "cat1",
    name: "Худалдааны төв",
    description: "Олон төрлийн дэлгүүр, үйлчилгээ нэг дор",
    storeCount: 5,
    createdAt: Date.now() - 5000000,
    updatedAt: Date.now() - 50000,
  },
  {
    id: "cat2",
    name: "Супермаркет",
    description: "Хүнсний болон өргөн хэрэглээний бараа",
    storeCount: 8,
    createdAt: Date.now() - 6000000,
    updatedAt: Date.now() - 60000,
  },
  {
    id: "cat3",
    name: "Хувцас",
    description: "Загварлаг хувцас, гутал, гоёл чимэглэл",
    storeCount: 12,
    createdAt: Date.now() - 7000000,
    updatedAt: Date.now() - 70000,
  },
  {
    id: "cat4",
    name: "Цахилгаан бараа",
    description: "Цахилгаан хэрэгсэл, компьютер, гар утас",
    storeCount: 6,
    createdAt: Date.now() - 8000000,
    updatedAt: Date.now() - 80000,
  },
]

// Жишээ сэтгэгдлүүд
export const mockReviews: Review[] = [
  {
    id: "review1",
    name: "Болд Баатар",
    store: "Шангри-Ла Молл",
    storeId: "store1",
    rating: 5,
    comment: "Маш сайхан худалдааны төв. Олон төрлийн дэлгүүр, ресторан байдаг. Цэвэрхэн, тухтай.",
    date: "2023-05-15",
    createdAt: Date.now() - 100000,
  },
  {
    id: "review2",
    name: "Сараа Дорж",
    store: "Улсын их дэлгүүр",
    storeId: "store2",
    rating: 4,
    comment: "Уламжлалт их дэлгүүр, олон төрлийн бараа бүтээгдэхүүн байдаг. Гэхдээ зарим үед хүн их байдаг.",
    date: "2023-06-20",
    createdAt: Date.now() - 200000,
  },
  {
    id: "review3",
    name: "Баяр Лхагва",
    store: "Номин Супермаркет",
    storeId: "store3",
    rating: 4,
    comment: "Үнэ хямд, барааны сонголт сайтай. Ажилчид эелдэг, үйлчилгээ сайн.",
    date: "2023-07-10",
    createdAt: Date.now() - 300000,
  },
  {
    id: "review4",
    name: "Оюун Бат",
    store: "Улаанбаатар Бутик",
    storeId: "store4",
    rating: 5,
    comment: "Загварлаг хувцас, чанартай материал. Үнэ өндөр ч чанартай.",
    date: "2023-08-05",
    createdAt: Date.now() - 400000,
  },
  {
    id: "review5",
    name: "Төгөлдөр Ганбат",
    store: "Шангри-Ла Молл",
    storeId: "store1",
    rating: 4,
    comment: "Байршил сайтай, олон төрлийн үйлчилгээ нэг дор. Зогсоол хязгаарлагдмал.",
    date: "2023-09-12",
    createdAt: Date.now() - 500000,
  },
  {
    id: "review6",
    name: "Нарангэрэл Бат",
    store: "Улсын их дэлгүүр",
    storeId: "store2",
    rating: 3,
    comment: "Уламжлалт дэлгүүр, гэхдээ шинэчлэл хийх шаардлагатай. Үйлчилгээ дунд зэрэг.",
    date: "2023-10-18",
    createdAt: Date.now() - 600000,
  },
]

// Жишээ хэрэглэгчид
export const mockUsers: User[] = [
  {
    id: "user1",
    name: "Админ",
    email: "admin@mongolshop.mn",
    role: "admin",
    status: "active",
    password: "admin123",
    createdAt: "2023-01-01",
  },
  {
    id: "user2",
    name: "Хэрэглэгч",
    email: "user@mongolshop.mn",
    role: "user",
    status: "active",
    password: "user123",
    createdAt: "2023-02-15",
  },
]

// Жишээ тохиргоо
export const mockSettings: SiteSettings = {
  id: "settings1",
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
  createdAt: Date.now() - 9000000,
  updatedAt: Date.now() - 90000,
}
