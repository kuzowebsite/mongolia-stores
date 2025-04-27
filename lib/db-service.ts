// Өгөгдлийн сангийн үйлчилгээний функцуудыг сайжруулах
import { ref, get, set, push, remove, update, query, orderByChild, equalTo } from "firebase/database"
import { getFirebaseDatabase, getConnectionStatus } from "./firebase"
import { mockStores, mockCategories, mockReviews, mockUsers, mockSettings } from "./mock-data"

// Өгөгдлийн сангийн үндсэн бүтэц
export interface Store {
  id?: string
  name: string
  category: string
  description: string
  address: string
  phone: string
  hours: string
  website?: string
  email?: string
  image?: string
  gallery?: string[]
  location?: {
    lat: number
    lng: number
  }
  mapLink?: string
  rating?: number
  reviews?: number
  services?: string[]
  fullDescription?: string
  createdAt?: number
  updatedAt?: number
}

export interface Category {
  id?: string
  name: string
  description?: string
  image?: string // base64 encoded image
  storeCount?: number
  createdAt?: number
  updatedAt?: number
}

export interface Review {
  id?: string
  name: string
  store: string
  storeId: string
  rating: number
  comment: string
  date: string
  createdAt?: number
}

// Хэрэглэгчийн интерфейсийг шинэчлэх
export interface User {
  id?: string
  name: string
  email: string
  role: string
  status: string
  phone?: string
  password?: string // Нууц үг талбар нэмэх
  avatar?: string // Профайл зураг нэмэх
  createdAt: string
}

export interface SiteSettings {
  id?: string
  siteName: string
  siteUrl: string
  siteDescription: string
  contactEmail: string
  contactPhone: string
  logo?: string // base64 encoded image
  favicon?: string // base64 encoded image
  logoUrl?: string // URL to logo
  showFeaturedStores: boolean
  showLatestReviews: boolean
  showNewsletter: boolean
  primaryColor?: string
  darkMode: boolean
  animations: boolean
  createdAt?: number
  updatedAt?: number
}

// Firebase connection status
let _dbInitialized = false

// Функц Firebase холболтыг шалгах
async function checkDatabase() {
  if (!_dbInitialized) {
    const db = getFirebaseDatabase()
    if (!db) {
      console.warn("Өгөгдлийн сантай холбогдоход алдаа гарлаа, оффлайн горимд шилжиж байна")
      _dbInitialized = false // Холболт амжилтгүй
      return false
    }
    _dbInitialized = true
  }
  return _dbInitialized
}

// Оффлайн эсэхийг шалгах
export function isOfflineMode() {
  return getConnectionStatus().isOfflineMode
}

// Дэлгүүрийн CRUD үйлдлүүд
export const storeService = {
  // Бүх дэлгүүрийг авах
  async getAllStores(): Promise<Store[]> {
    try {
      // Оффлайн горимд байвал жишээ өгөгдөл буцаах
      if (isOfflineMode()) {
        console.log("Оффлайн горимд ажиллаж байна, жишээ дэлгүүрүүдийг буцааж байна")
        return mockStores
      }

      const dbInitialized = await checkDatabase()
      if (!dbInitialized) {
        console.warn("Өгөгдлийн сан холбогдоогүй тул жишээ дэлгүүрүүдийг буцааж байна")
        return mockStores
      }

      const db = getFirebaseDatabase()
      if (!db) {
        console.warn("Өгөгдлийн сан холбогдоогүй тул жишээ дэлгүүрүүдийг буцааж байна")
        return mockStores
      }

      const storesRef = ref(db, "stores")
      const snapshot = await get(storesRef)

      if (!snapshot.exists()) {
        return mockStores // Хэрэв өгөгдөл байхгүй бол жишээ өгөгдөл буцаах
      }

      const storesData = snapshot.val()
      return Object.keys(storesData).map((key) => ({
        id: key,
        ...storesData[key],
      }))
    } catch (error) {
      console.error("Дэлгүүрүүдийг авахад алдаа гарлаа:", error)
      return mockStores // Алдаа гарсан ч жишээ өгөгдөл буцаах
    }
  },

  // Нэг дэлгүүрийг ID-гаар авах
  async getStoreById(id: string): Promise<Store | null> {
    try {
      // Оффлайн горимд байвал жишээ өгөгдөл буцаах
      if (isOfflineMode()) {
        console.log("Оффлайн горимд ажиллаж байна, жишээ дэлгүүрийг буцааж байна")
        const store = mockStores.find((s) => s.id === id)
        return store || null
      }

      await checkDatabase()
      const db = getFirebaseDatabase()
      if (!db) {
        console.warn("Өгөгдлийн сан холбогдоогүй тул жишээ дэлгүүрийг буцааж байна")
        const store = mockStores.find((s) => s.id === id)
        return store || null
      }

      const storeRef = ref(db, `stores/${id}`)
      const snapshot = await get(storeRef)

      if (!snapshot.exists()) {
        // Хэрэв өгөгдөл байхгүй бол жишээ өгөгдлөөс хайх
        const store = mockStores.find((s) => s.id === id)
        return store || null
      }

      return {
        id,
        ...snapshot.val(),
      }
    } catch (error) {
      console.error(`Дэлгүүр (ID: ${id}) авахад алдаа гарлаа:`, error)
      // Алдаа гарсан ч жишээ өгөгдлөөс хайх
      const store = mockStores.find((s) => s.id === id)
      return store || null
    }
  },

  // Ангилалаар дэлгүүрүүдийг авах
  async getStoresByCategory(category: string): Promise<Store[]> {
    try {
      // Оффлайн горимд байвал жишээ өгөгдөл буцаах
      if (isOfflineMode()) {
        console.log("Оффлайн горимд ажиллаж байна, ангилалаар жишээ дэлгүүрүүдийг буцааж байна")
        return mockStores.filter((s) => s.category === category)
      }

      await checkDatabase()
      const db = getFirebaseDatabase()
      if (!db) {
        console.warn("Өгөгдлийн сан холбогдоогүй тул ангилалаар жишээ дэлгүүрүүдийг буцааж байна")
        return mockStores.filter((s) => s.category === category)
      }

      try {
        // Эхлээд индекстэй хувилбарыг оролдох
        const storesRef = ref(db, "stores")
        const storesQuery = query(storesRef, orderByChild("category"), equalTo(category))
        const snapshot = await get(storesQuery)

        if (snapshot.exists()) {
          const storesData = snapshot.val()
          return Object.keys(storesData).map((key) => ({
            id: key,
            ...storesData[key],
          }))
        }
      } catch (indexError) {
        console.warn("Индекс ашиглан дэлгүүрүүдийг авахад алдаа гарлаа, бүх дэлгүүрүүдийг авч шүүж байна:", indexError)
        // Индекс алдаа гарвал бүх дэлгүүрүүдийг авч JavaScript-ээр шүүх
      }

      // Бүх дэлгүүрүүдийг авч JavaScript-ээр шүүх
      const storesRef = ref(db, "stores")
      const snapshot = await get(storesRef)

      if (!snapshot.exists()) {
        return mockStores.filter((s) => s.category === category)
      }

      const storesData = snapshot.val()
      const allStores = Object.keys(storesData).map((key) => ({
        id: key,
        ...storesData[key],
      }))

      // JavaScript-ээр шүүх
      return allStores.filter((store) => store.category === category)
    } catch (error) {
      console.error(`${category} ангилалын дэлгүүрүүдийг авахад алдаа гарлаа:`, error)
      return mockStores.filter((s) => s.category === category)
    }
  },

  // Шинэ дэлгүүр нэмэх
  async addStore(store: Store): Promise<string | null> {
    try {
      // Оффлайн горимд байвал жишээ ID буцаах
      if (isOfflineMode()) {
        console.log("Оффлайн горимд ажиллаж байна, дэлгүүр нэмэх боломжгүй")
        return "offline-store-id"
      }

      await checkDatabase()
      const db = getFirebaseDatabase()
      if (!db) {
        console.warn("Өгөгдлийн сан холбогдоогүй тул дэлгүүр нэмэх боломжгүй")
        return "offline-store-id"
      }

      const storesRef = ref(db, "stores")
      const newStoreRef = push(storesRef)

      const currentTime = Date.now()
      const storeData = {
        ...store,
        createdAt: currentTime,
        updatedAt: currentTime,
      }

      await set(newStoreRef, storeData)
      return newStoreRef.key
    } catch (error) {
      console.error("Дэлгүүр нэмэхэд алдаа гарлаа:", error)
      return null
    }
  },

  // Дэлгүүр шинэчлэх
  async updateStore(id: string, store: Partial<Store>): Promise<boolean> {
    try {
      // Оффлайн горимд байвал амжилттай гэж буцаах
      if (isOfflineMode()) {
        console.log("Оффлайн горимд ажиллаж байна, дэлгүүр шинэчлэх боломжгүй")
        return true
      }

      await checkDatabase()
      const db = getFirebaseDatabase()
      if (!db) {
        console.warn("Өгөгдлийн сан холбогдоогүй тул дэлгүүр шинэчлэх боломжгүй")
        return false
      }

      const storeRef = ref(db, `stores/${id}`)

      // Одоогийн дэлгүүрийн мэдээлэл авах
      const snapshot = await get(storeRef)
      if (!snapshot.exists()) {
        return false
      }

      // Логируем данные для отладки
      console.log("Existing store data:", snapshot.val())
      console.log("New store data to update:", store)

      const updatedStore = {
        ...snapshot.val(),
        ...store,
        updatedAt: Date.now(),
      }

      // Логируем финальные данные
      console.log("Final updated store data:", updatedStore)

      await update(storeRef, updatedStore)
      return true
    } catch (error) {
      console.error(`Дэлгүүр (ID: ${id}) шинэчлэхэд алдаа гарлаа:`, error)
      return false
    }
  },

  // Дэлгүүр устгах
  async deleteStore(id: string): Promise<boolean> {
    try {
      // Оффлайн горимд байвал амжилттай гэж буцаах
      if (isOfflineMode()) {
        console.log("Оффлайн горимд ажиллаж байна, дэлгүүр устгах боломжгүй")
        return true
      }

      await checkDatabase()
      const db = getFirebaseDatabase()
      if (!db) {
        console.warn("Өгөгдлийн сан холбогдоогүй тул дэлгүүр устгах боломжгүй")
        return false
      }

      const storeRef = ref(db, `stores/${id}`)
      await remove(storeRef)
      return true
    } catch (error) {
      console.error(`Дэлгүүр (ID: ${id}) устгахад алдаа гарлаа:`, error)
      return false
    }
  },
}

// Ангилалын CRUD үйлдлүүд
export const categoryService = {
  // Бүх ангилалыг авах
  async getAllCategories(): Promise<Category[]> {
    try {
      // Оффлайн горимд байвал жишээ өгөгдөл буцаах
      if (isOfflineMode()) {
        console.log("Оффлайн горимд ажиллаж байна, жишээ ангилалуудыг буцааж байна")
        return mockCategories
      }

      await checkDatabase()
      const db = getFirebaseDatabase()
      if (!db) {
        console.warn("Өгөгдлийн сан холбогдоогүй тул жишээ ангилалуудыг буцааж байна")
        return mockCategories
      }

      const categoriesRef = ref(db, "categories")
      const snapshot = await get(categoriesRef)

      if (!snapshot.exists()) {
        return mockCategories
      }

      const categoriesData = snapshot.val()
      return Object.keys(categoriesData).map((key) => ({
        id: key,
        ...categoriesData[key],
      }))
    } catch (error) {
      console.error("Ангилалуудыг авахад алдаа гарлаа:", error)
      return mockCategories
    }
  },

  // Нэг ангилалыг ID-гаар авах
  async getCategoryById(id: string): Promise<Category | null> {
    try {
      // Оффлайн горимд байвал жишээ өгөгдөл буцаах
      if (isOfflineMode()) {
        console.log("Оффлайн горимд ажиллаж байна, жишээ ангилалыг буцааж байна")
        const category = mockCategories.find((c) => c.id === id)
        return category || null
      }

      await checkDatabase()
      const db = getFirebaseDatabase()
      if (!db) {
        console.warn("Өгөгдлийн сан холбогдоогүй тул жишээ ангилалыг буцааж байна")
        const category = mockCategories.find((c) => c.id === id)
        return category || null
      }

      const categoryRef = ref(db, `categories/${id}`)
      const snapshot = await get(categoryRef)

      if (!snapshot.exists()) {
        const category = mockCategories.find((c) => c.id === id)
        return category || null
      }

      return {
        id,
        ...snapshot.val(),
      }
    } catch (error) {
      console.error(`Ангилал (ID: ${id}) авахад алдаа гарлаа:`, error)
      const category = mockCategories.find((c) => c.id === id)
      return category || null
    }
  },

  // Нэг ангилалыг нэрээр авах
  async getCategoryByName(name: string): Promise<Category | null> {
    try {
      // Оффлайн горимд байвал жишээ өгөгдөл буцаах
      if (isOfflineMode()) {
        console.log("Оффлайн горимд ажиллаж байна, нэрээр жишээ ангилалыг буцааж байна")
        const category = mockCategories.find((c) => c.name === name)
        return category || null
      }

      await checkDatabase()
      const db = getFirebaseDatabase()
      if (!db) {
        console.warn("Өгөгдлийн сан холбогдоогүй тул нэрээр жишээ ангилалыг буцааж байна")
        const category = mockCategories.find((c) => c.name === name)
        return category || null
      }

      const categoriesRef = ref(db, "categories")
      const categoriesQuery = query(categoriesRef, orderByChild("name"), equalTo(name))
      const snapshot = await get(categoriesQuery)

      if (!snapshot.exists()) {
        const category = mockCategories.find((c) => c.name === name)
        return category || null
      }

      const categoriesData = snapshot.val()
      const categoryId = Object.keys(categoriesData)[0]

      return {
        id: categoryId,
        ...categoriesData[categoryId],
      }
    } catch (error) {
      console.error(`${name} нэртэй ангилал авахад алдаа гарлаа:`, error)
      const category = mockCategories.find((c) => c.name === name)
      return category || null
    }
  },

  // Шинэ ангилал нэмэх
  async addCategory(category: Category): Promise<string | null> {
    try {
      // Оффлайн горимд байвал жишээ ID буцаах
      if (isOfflineMode()) {
        console.log("Оффлайн горимд ажиллаж байна, ангилал нэмэх боломжгүй")
        return "offline-category-id"
      }

      await checkDatabase()
      const db = getFirebaseDatabase()
      if (!db) {
        console.warn("Өгөгдлийн сан холбогдоогүй тул ангилал нэмэх боломжгүй")
        return "offline-category-id"
      }

      const categoriesRef = ref(db, "categories")
      const newCategoryRef = push(categoriesRef)

      const currentTime = Date.now()
      const categoryData = {
        ...category,
        createdAt: currentTime,
        updatedAt: currentTime,
      }

      await set(newCategoryRef, categoryData)
      return newCategoryRef.key
    } catch (error) {
      console.error("Ангилал нэмэхэд алдаа гарлаа:", error)
      return null
    }
  },

  // Ангилал шинэчлэх
  async updateCategory(id: string, category: Partial<Category>): Promise<boolean> {
    try {
      // Оффлайн горимд байвал амжилттай гэж буцаах
      if (isOfflineMode()) {
        console.log("Оффлайн горимд ажиллаж байна, ангилал шинэчлэх боломжгүй")
        return true
      }

      await checkDatabase()
      const db = getFirebaseDatabase()
      if (!db) {
        console.warn("Өгөгдлийн сан холбогдоогүй тул ангилал шинэчлэх боломжгүй")
        return false
      }

      const categoryRef = ref(db, `categories/${id}`)

      // Одоогийн ангилалын мэдээлэл авах
      const snapshot = await get(categoryRef)
      if (!snapshot.exists()) {
        return false
      }

      const updatedCategory = {
        ...snapshot.val(),
        ...category,
        updatedAt: Date.now(),
      }

      await update(categoryRef, updatedCategory)
      return true
    } catch (error) {
      console.error(`Ангилал (ID: ${id}) шинэчлэхэд алдаа гарлаа:`, error)
      return false
    }
  },

  // Ангилал устгах
  async deleteCategory(id: string): Promise<boolean> {
    try {
      // Оффлайн горимд байвал амжилттай гэж буцаах
      if (isOfflineMode()) {
        console.log("Оффлайн горимд ажиллаж байна, ангилал устгах боломжгүй")
        return true
      }

      await checkDatabase()
      const db = getFirebaseDatabase()
      if (!db) {
        console.warn("Өгөгдлийн сан холбогдоогүй тул ангилал устгах боломжгүй")
        return false
      }

      const categoryRef = ref(db, `categories/${id}`)
      await remove(categoryRef)
      return true
    } catch (error) {
      console.error(`Ангилал (ID: ${id}) устгахад алдаа гарлаа:`, error)
      return false
    }
  },

  // Ангилалын дэлгүүрийн тоог шинэчлэх
  async updateCategoryStoreCount(categoryName: string): Promise<void> {
    try {
      // Оффлайн горимд байвал үйлдэл хийхгүй
      if (isOfflineMode()) {
        console.log("Оффлайн горимд ажиллаж байна, ангилалын дэлгүүрийн тоог шинэчлэх боломжгүй")
        return
      }

      await checkDatabase()
      const db = getFirebaseDatabase()
      if (!db) {
        console.warn("Өгөгдлийн сан холбогдоогүй тул ангилалын дэлгүүрийн тоог шинэчлэх боломжгүй")
        return
      }

      // Ангилалыг нэрээр хайж олох
      const category = await this.getCategoryByName(categoryName)
      if (!category || !category.id) return

      // Ангилалд хамаарах дэлгүүрүүдийн тоог тооцоолох
      const stores = await storeService.getStoresByCategory(categoryName)

      // Ангилалыг шинэчлэх
      await this.updateCategory(category.id, { storeCount: stores.length })
    } catch (error) {
      console.error("Ангилалын дэлгүүрийн тоог шинэчлэхэд алдаа гарлаа:", error)
    }
  },

  // Бүх ангилалын дэлгүүрийн тоог шинэчлэх
  async updateAllCategoryStoreCounts(): Promise<void> {
    try {
      // Оффлайн горимд байвал үйлдэл хийхгүй
      if (isOfflineMode()) {
        console.log("Оффлайн горимд ажиллаж байна, бүх ангилалын дэлгүүрийн тоог шинэчлэх боломжгүй")
        return
      }

      const categories = await this.getAllCategories()
      for (const category of categories) {
        if (category.name) {
          await this.updateCategoryStoreCount(category.name)
        }
      }
    } catch (error) {
      console.error("Бүх ангилалын дэлгүүрийн тоог шинэчлэхэд алдаа гарлаа:", error)
    }
  },
}

// Сэтгэгдлийн CRUD үйлдлүүд
export const reviewService = {
  // Бүх сэтгэгдлийг авах
  async getAllReviews(): Promise<Review[]> {
    try {
      // Оффлайн горимд байвал жишээ өгөгдөл буцаах
      if (isOfflineMode()) {
        console.log("Оффлайн горимд ажиллаж байна, жишээ сэтгэгдлүүдийг буцааж байна")
        return mockReviews
      }

      const dbInitialized = await checkDatabase()
      if (!dbInitialized) {
        console.warn("Өгөгдлийн сан холбогдоогүй тул жишээ сэтгэгдлүүдийг буцааж байна")
        return mockReviews
      }

      const db = getFirebaseDatabase()
      if (!db) {
        console.warn("Өгөгдлийн сан холбогдоогүй тул жишээ сэтгэгдлүүдийг буцааж байна")
        return mockReviews
      }

      const reviewsRef = ref(db, "reviews")
      const snapshot = await get(reviewsRef)

      if (!snapshot.exists()) {
        return mockReviews
      }

      const reviewsData = snapshot.val()
      return Object.keys(reviewsData).map((key) => ({
        id: key,
        ...reviewsData[key],
      }))
    } catch (error) {
      console.error("Сэтгэгдлүүдийг авахад алдаа гарлаа:", error)
      return mockReviews
    }
  },

  // Дэлгүүрийн сэтгэгдлүүдийг авах - индекс шаардахгүй шинэ хувилбар
  async getReviewsByStoreId(storeId: string): Promise<Review[]> {
    try {
      // Оффлайн горимд байвал жишээ өгөгдөл буцаах
      if (isOfflineMode()) {
        console.log("Оффлайн горимд ажиллаж байна, дэлгүүрийн жишээ сэтгэгдлүүдийг буцааж байна")
        return mockReviews.filter((r) => r.storeId === storeId)
      }

      await checkDatabase()
      const db = getFirebaseDatabase()
      if (!db) {
        console.warn("Өгөгдлийн сан холбогдоогүй тул дэлгүүрийн жишээ сэтгэгдлүүдийг буцааж байна")
        return mockReviews.filter((r) => r.storeId === storeId)
      }

      try {
        // Эхлээд индекстэй хувилбарыг оролдох
        const reviewsRef = ref(db, "reviews")
        const reviewsQuery = query(reviewsRef, orderByChild("storeId"), equalTo(storeId))
        const snapshot = await get(reviewsQuery)

        if (snapshot.exists()) {
          const reviewsData = snapshot.val()
          return Object.keys(reviewsData).map((key) => ({
            id: key,
            ...reviewsData[key],
          }))
        }
      } catch (indexError) {
        console.warn(
          "Индекс ашиглан сэтгэгдлүүдийг авахад алдаа гарлаа, бүх сэтгэгдлүүдийг авч шүүж байна:",
          indexError,
        )
        // Индекс алдаа гарвал бүх сэтгэгдлүүдийг авч JavaScript-ээр шүүх
      }

      // Бүх сэтгэгдлүүдийг авч JavaScript-ээр шүүх
      const reviewsRef = ref(db, "reviews")
      const snapshot = await get(reviewsRef)

      if (!snapshot.exists()) {
        return mockReviews.filter((r) => r.storeId === storeId)
      }

      const reviewsData = snapshot.val()
      const allReviews = Object.keys(reviewsData).map((key) => ({
        id: key,
        ...reviewsData[key],
      }))

      // JavaScript-ээр шүүх
      return allReviews.filter((review) => review.storeId === storeId)
    } catch (error) {
      console.error(`Дэлгүүрийн (ID: ${storeId}) сэтгэгдлүүдийг авахад алдаа гарлаа:`, error)
      return mockReviews.filter((r) => r.storeId === storeId)
    }
  },

  // Шинэ сэтгэгдэл нэмэх
  async addReview(review: Review): Promise<string | null> {
    try {
      // Оффлайн горимд байвал жишээ ID буцаах
      if (isOfflineMode()) {
        console.log("Оффлайн горимд ажиллаж байна, сэтгэгдэл нэмэх боломжгүй")
        return "offline-review-id"
      }

      await checkDatabase()
      const db = getFirebaseDatabase()
      if (!db) {
        console.warn("Өгөгдлийн сан холбогдоогүй тул сэтгэгдэл нэмэх боломжгүй")
        return "offline-review-id"
      }

      const reviewsRef = ref(db, "reviews")
      const newReviewRef = push(reviewsRef)

      const reviewData = {
        ...review,
        createdAt: Date.now(),
      }

      await set(newReviewRef, reviewData)

      // Дэлгүүрийн үнэлгээг шинэчлэх
      await this.updateStoreRating(review.storeId)

      return newReviewRef.key
    } catch (error) {
      console.error("Сэтгэгдэл нэмэхэд алдаа гарлаа:", error)
      return null
    }
  },

  // Сэтгэгдэл устгах
  async deleteReview(id: string, storeId: string): Promise<boolean> {
    try {
      // Оффлайн горимд байвал амжилттай гэж буцаах
      if (isOfflineMode()) {
        console.log("Оффлайн горимд ажиллаж байна, сэтгэгдэл устгах боломжгүй")
        return true
      }

      await checkDatabase()
      const db = getFirebaseDatabase()
      if (!db) {
        console.warn("Өгөгдлийн сан холбогдоогүй тул сэтгэгдэл устгах боломжгүй")
        return false
      }

      const reviewRef = ref(db, `reviews/${id}`)
      await remove(reviewRef)

      // Дэлгүүрийн үнэлгээг шинэчлэх
      await this.updateStoreRating(storeId)

      return true
    } catch (error) {
      console.error(`Сэтгэгдэл (ID: ${id}) устгахад алдаа гарлаа:`, error)
      return false
    }
  },

  // Дэлгүүрийн үнэлгээг шинэчлэх
  async updateStoreRating(storeId: string): Promise<void> {
    try {
      // Оффлайн горимд байвал үйлдэл хийхгүй
      if (isOfflineMode()) {
        console.log("Оффлайн горимд ажиллаж байна, дэлгүүрийн үнэлгээг шинэчлэх боломжгүй")
        return
      }

      await checkDatabase()
      const db = getFirebaseDatabase()
      if (!db) {
        console.warn("Өгөгдлийн сан холбогдоогүй тул дэлгүүрийн үнэлгээг шинэчлэх боломжгүй")
        return
      }

      // Дэлгүүрийн сэтгэгдлүүдийг авах
      const reviews = await this.getReviewsByStoreId(storeId)

      // Дэлгүүрийн мэдээллийг авах
      const store = await storeService.getStoreById(storeId)
      if (!store) return

      // Дундаж үнэлгээг тооцоолох
      let totalRating = 0
      for (const review of reviews) {
        totalRating += review.rating
      }

      const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0

      // Дэлгүүрийн үнэлгээ болон сэтгэгдлийн тоог шинэчлэх
      await storeService.updateStore(storeId, {
        rating: Number(averageRating.toFixed(1)),
        reviews: reviews.length,
      })
    } catch (error) {
      console.error("Дэлгүүрийн үнэлгээг шинэчлэхэд алдаа гарлаа:", error)
    }
  },
}

// Хэрэглэгчийн CRUD үйлдлүүд
export const userService = {
  // Бүх хэрэглэгчийг авах
  async getAllUsers(): Promise<User[]> {
    try {
      // Оффлайн горимд байвал жишээ өгөгдөл буцаах
      if (isOfflineMode()) {
        console.log("Оффлайн горимд ажиллаж байна, жишээ хэрэглэгчдийг буцааж байна")
        return mockUsers
      }

      await checkDatabase()
      const db = getFirebaseDatabase()
      if (!db) {
        console.warn("Өгөгдлийн сан холбогдоогүй тул жишээ хэрэглэгчдийг буцааж байна")
        return mockUsers
      }

      const usersRef = ref(db, "users")
      const snapshot = await get(usersRef)

      if (!snapshot.exists()) {
        return mockUsers
      }

      const usersData = snapshot.val()
      return Object.keys(usersData).map((key) => ({
        id: key,
        ...usersData[key],
      }))
    } catch (error) {
      console.error("Хэрэглэгчдийг авахад алдаа гарлаа:", error)
      return mockUsers
    }
  },

  // Нэг хэрэглэгчийг ID-гаар авах
  async getUserById(id: string): Promise<User | null> {
    try {
      // Оффлайн горимд байвал жишээ өгөгдөл буцаах
      if (isOfflineMode()) {
        console.log("Оффлайн горимд ажиллаж байна, жишээ хэрэглэгчийг буцааж байна")
        const user = mockUsers.find((u) => u.id === id)
        return user || null
      }

      await checkDatabase()
      const db = getFirebaseDatabase()
      if (!db) {
        console.warn("Өгөгдлийн сан холбогдоогүй тул жишээ хэрэглэгчийг буцааж байна")
        const user = mockUsers.find((u) => u.id === id)
        return user || null
      }

      const userRef = ref(db, `users/${id}`)
      const snapshot = await get(userRef)

      if (!snapshot.exists()) {
        const user = mockUsers.find((u) => u.id === id)
        return user || null
      }

      return {
        id,
        ...snapshot.val(),
      }
    } catch (error) {
      console.error(`Хэрэглэгч (ID: ${id}) авахад алдаа гарлаа:`, error)
      const user = mockUsers.find((u) => u.id === id)
      return user || null
    }
  },

  // Шинэ хэрэглэгч нэмэх
  async addUser(user: User): Promise<string | null> {
    try {
      // Оффлайн горимд байвал жишээ ID буцаах
      if (isOfflineMode()) {
        console.log("Оффлайн горимд ажиллаж байна, хэрэглэгч нэмэх боломжгүй")
        return "offline-user-id"
      }

      await checkDatabase()
      const db = getFirebaseDatabase()
      if (!db) {
        console.warn("Өгөгдлийн сан холбогдоогүй тул хэрэглэгч нэмэх боломжгүй")
        return "offline-user-id"
      }

      const usersRef = ref(db, "users")
      const newUserRef = push(usersRef)

      await set(newUserRef, user)
      return newUserRef.key
    } catch (error) {
      console.error("Хэрэглэгч нэмэхэд алдаа гарлаа:", error)
      return null
    }
  },

  // Хэрэглэгч үүсгэх
  async createUser(user: User): Promise<string | null> {
    return this.addUser(user)
  },

  // isOfflineMode функцийг нэмэх
  isOfflineMode,

  // Нууц үг шалгах функцийг сайжруулах
  async authenticateUser(email: string, password: string): Promise<User | null> {
    try {
      // Оффлайн горимд байвал жишээ өгөгдөл буцаах
      if (isOfflineMode()) {
        console.log("Оффлайн горимд ажиллаж байна, жишээ хэрэглэгчээр нэвтрэх")
        const user = mockUsers.find((u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password)
        if (!user) return null

        // Нууц үгийг хариултаас хасах
        const { password: _, ...userWithoutPassword } = user as any
        return userWithoutPassword
      }

      await checkDatabase()
      const db = getFirebaseDatabase()
      if (!db) {
        console.warn("Өгөгдлийн сан холбогдоогүй тул жишээ хэрэглэгчээр нэвтрэх")
        const user = mockUsers.find((u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password)
        if (!user) return null

        // Нууц үгийг хариултаас хасах
        const { password: _, ...userWithoutPassword } = user as any
        return userWithoutPassword
      }

      // Бүх хэрэглэгчдийг авах
      const users = await this.getAllUsers()

      // Хэрэглэгчийг хайх
      const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password)

      if (!user) {
        return null
      }

      // Нууц үгийг хариултаас хасах
      const { password: _, ...userWithoutPassword } = user as any
      return userWithoutPassword
    } catch (error) {
      console.error("Хэрэглэгчийн нэвтрэлтийг шалгахад алдаа гарлаа:", error)
      return null
    }
  },

  // Нууц үг шинэчлэх функц нэмэх
  async updatePassword(id: string, newPassword: string): Promise<boolean> {
    try {
      console.log("updatePassword функц дуудагдлаа, ID:", id)
      console.log("Шинэ нууц үг:", newPassword)

      // Оффлайн горимд байвал амжилттай гэж буцаах
      if (isOfflineMode()) {
        console.log("Оффлайн горимд ажиллаж байна, нууц үг шинэчлэх боломжгүй")
        return true
      }

      await checkDatabase()
      const db = getFirebaseDatabase()
      if (!db) {
        console.warn("Өгөгдлийн сан холбогдоогүй тул нууц үг шинэчлэх боломжгүй")
        return false
      }

      const userRef = ref(db, `users/${id}`)

      // Одоогийн хэрэглэгчийн мэдээлэл авах
      const snapshot = await get(userRef)
      if (!snapshot.exists()) {
        console.error("Хэрэглэгч олдсонгүй, ID:", id)
        return false
      }

      // Шууд password талбарыг шинэчлэх
      await update(userRef, { password: newPassword })

      // newPassword талбар байвал устгах
      const userData = snapshot.val()
      if (userData.newPassword) {
        await update(userRef, { newPassword: null })
      }

      console.log("Нууц үг амжилттай шинэчлэгдлээ")
      return true
    } catch (error) {
      console.error(`Нууц үг шинэчлэхэд алдаа гарлаа (ID: ${id}):`, error)
      return false
    }
  },

  // Хэрэглэгч шинэчлэх функцийг сайжруулах
  async updateUser(id: string, userData: Partial<User>): Promise<boolean> {
    try {
      console.log("updateUser функц дуудагдлаа, ID:", id)
      console.log("Шинэчлэх өгөгдөл:", JSON.stringify(userData))

      // Оффлайн горимд байвал амжилттай гэж буцаах
      if (isOfflineMode()) {
        console.log("Оффлайн горимд ажиллаж байна, хэрэглэгч шинэчлэх боломжгүй")

        // Оффлайн горимд хэрэглэгчийн мэдээллийг session storage-д шинэчлэх
        if (typeof window !== "undefined") {
          const userStr = sessionStorage.getItem("currentUser")
          if (userStr) {
            try {
              const currentUser = JSON.parse(userStr)
              if (currentUser.id === id) {
                const updatedUser = { ...currentUser, ...userData }
                // Нууц үгийг хариултаас хасах
                if (updatedUser.password) {
                  delete updatedUser.password
                }
                sessionStorage.setItem("currentUser", JSON.stringify(updatedUser))
              }
            } catch (e) {
              console.error("Хэрэглэгчийн мэдээлэл уншихад алдаа гарлаа:", e)
            }
          }
        }

        return true
      }

      await checkDatabase()
      const db = getFirebaseDatabase()
      if (!db) {
        console.warn("Өгөгдлийн сан холбогдоогүй тул хэрэглэгч шинэчлэх боломжгүй")
        return false
      }

      const userRef = ref(db, `users/${id}`)

      // Одоогийн хэрэглэгчийн мэдээлэл авах
      const snapshot = await get(userRef)
      if (!snapshot.exists()) {
        console.error("Хэрэглэгч олдсонгүй, ID:", id)
        return false
      }

      const currentUserData = snapshot.val()
      console.log("Одоогийн хэрэглэгчийн мэдээлэл:", JSON.stringify(currentUserData))

      // Шинэчлэх өгөгдлийг бэлтгэх
      const updatedUser = {
        ...currentUserData,
        ...userData,
      }

      // newPassword талбар байвал устгах
      if (updatedUser.newPassword) {
        console.log("newPassword талбарыг устгаж байна")
        delete updatedUser.newPassword
      }

      console.log("Шинэчлэгдсэн хэрэглэгчийн мэдээлэл:", JSON.stringify(updatedUser))

      // Өгөгдлийн санд шинэчлэх
      await update(userRef, updatedUser)
      console.log("Хэрэглэгчийн мэдээлэл амжилттай шинэчлэгдлээ")

      return true
    } catch (error) {
      console.error(`Хэрэглэгч (ID: ${id}) шинэчлэхэд алдаа гарлаа:`, error)
      return false
    }
  },

  // Хэрэглэгч устгах
  async deleteUser(id: string): Promise<boolean> {
    try {
      // Оффлайн горимд байвал амжилттай гэж буцаах
      if (isOfflineMode()) {
        console.log("Оффлайн горимд ажиллаж байна, хэрэглэгч устгах боломжгүй")
        return true
      }

      await checkDatabase()
      const db = getFirebaseDatabase()
      if (!db) {
        console.warn("Өгөгдлийн сан холбогдоогүй тул хэрэглэгч устгах боломжгүй")
        return false
      }

      const userRef = ref(db, `users/${id}`)
      await remove(userRef)
      return true
    } catch (error) {
      console.error(`Хэрэглэгч (ID: ${id}) устгахад алдаа гарлаа:`, error)
      return false
    }
  },

  // Хэрэглэгчийн и-мэйл хаягаар хайх
  async getUserByEmail(email: string): Promise<User | null> {
    try {
      // Оффлайн горимд байвал жишээ өгөгдөл буцаах
      if (isOfflineMode()) {
        console.log("Оффлайн горимд ажиллаж байна, и-мэйлээр жишээ хэрэглэгчийг буцааж байна")
        const user = mockUsers.find((u) => u.email.toLowerCase() === email.toLowerCase())
        return user || null
      }

      await checkDatabase()
      const db = getFirebaseDatabase()
      if (!db) {
        console.warn("Өгөгдлийн сан холбогдоогүй тул и-мэйлээр жишээ хэрэглэгчийг буцааж байна")
        const user = mockUsers.find((u) => u.email.toLowerCase() === email.toLowerCase())
        return user || null
      }

      // Бүх хэрэглэгчдийг авах
      const users = await this.getAllUsers()

      // Хэрэглэгчийг и-мэйл хаягаар хайх
      const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase())

      return user || null
    } catch (error) {
      console.error(`${email} и-мэйл хаягтай хэрэглэгч хайхад алдаа гарлаа:`, error)
      return null
    }
  },

  // Админ хэрэглэгчийн нэвтрэх үйлдлийг шалгах
  async authenticateAdmin(email: string, password: string): Promise<User | null> {
    try {
      console.log(`Админ нэвтрэлт шалгаж байна: ${email}`)

      // Оффлайн горимд байвал жишээ өгөгдөл буцаах
      if (isOfflineMode()) {
        console.log("Оффлайн горимд ажиллаж байна, жишээ админ хэрэглэгчээр нэвтрэх")
        const user = mockUsers.find(
          (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password && u.role === "admin",
        )
        if (!user) return null

        // Нууц үгийг хариултаас хасах
        const { password: _, ...userWithoutPassword } = user as any
        return userWithoutPassword
      }

      await checkDatabase()
      const db = getFirebaseDatabase()
      if (!db) {
        console.warn("Өгөгдлийн сан холбогдоогүй тул жишээ админ хэрэглэгчээр нэвтрэх")
        const user = mockUsers.find(
          (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password && u.role === "admin",
        )
        if (!user) return null

        // Нууц үгийг хариултаас хасах
        const { password: _, ...userWithoutPassword } = user as any
        return userWithoutPassword
      }

      // Бүх хэрэглэгчдийг авах
      const users = await this.getAllUsers()

      // Админ хэрэглэгчийг хайх
      const user = users.find(
        (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password && u.role === "admin",
      )

      if (!user) {
        console.log("Админ хэрэглэгч олдсонгүй эсвэл нууц үг буруу байна")
        return null
      }

      console.log("Админ амжилттай нэвтэрлээ:", user)

      // Нууц үгийг хариултаас хасах
      const { password: _, ...userWithoutPassword } = user as any
      return userWithoutPassword
    } catch (error) {
      console.error("Админ хэрэглэгчийн нэвтрэлтийг шалгахад алдаа гарлаа:", error)
      return null
    }
  },
}

// Тохиргооны CRUD үйлдлүүд
export const settingsService = {
  // Тохиргоог авах
  async getSettings(): Promise<SiteSettings | null> {
    try {
      // Оффлайн горимд байвал жишээ өгөгдөл буцаах
      if (isOfflineMode()) {
        console.log("Оффлайн горимд ажиллаж байна, жишээ тохиргоог буцааж байна")
        return mockSettings
      }

      await checkDatabase()
      const db = getFirebaseDatabase()
      if (!db) {
        console.warn("Өгөгдлийн сан холбогдоогүй тул жишээ тохиргоог буцааж байна")
        return mockSettings
      }

      const settingsRef = ref(db, "settings")
      const snapshot = await get(settingsRef)

      if (!snapshot.exists()) {
        return mockSettings
      }

      const settingsData = snapshot.val()
      // Зөвхөн нэг тохиргоо байна гэж үзнэ
      const settingsId = Object.keys(settingsData)[0]

      return {
        id: settingsId,
        ...settingsData[settingsId],
      }
    } catch (error) {
      console.error("Тохиргоо авахад алдаа гарлаа:", error)
      return mockSettings
    }
  },

  // Тохиргоо шинэчлэх эсвэл шинээр үүсгэх
  async saveSettings(settings: SiteSettings): Promise<string | null> {
    try {
      // Оффлайн горимд байвал жишээ ID буцаах
      if (isOfflineMode()) {
        console.log("Оффлайн горимд ажиллаж байна, тохиргоо хадгалах боломжгүй")
        return "offline-settings-id"
      }

      await checkDatabase()
      const db = getFirebaseDatabase()
      if (!db) {
        console.warn("Өгөгдлийн сан холбогдоогүй тул тохиргоо хадгалах боломжгүй")
        return "offline-settings-id"
      }

      const settingsRef = ref(db, "settings")
      let settingId = settings.id

      // Хэрэв ID байхгүй бол шинээр үүсгэх
      if (!settingId) {
        const newSettingsRef = push(settingsRef)
        settingId = newSettingsRef.key

        const currentTime = Date.now()
        const settingsData = {
          ...settings,
          createdAt: currentTime,
          updatedAt: currentTime,
        }

        await set(newSettingsRef, settingsData)
      } else {
        // ID байвал тухайн тохиргоог шинэчлэх
        const settingRef = ref(db, `settings/${settingId}`)

        // Одоогийн тохиргоо авах
        const snapshot = await get(settingRef)
        if (snapshot.exists()) {
          const updatedSettings = {
            ...snapshot.val(),
            ...settings,
            updatedAt: Date.now(),
          }

          await update(settingRef, updatedSettings)
        } else {
          // Тохиргоо байхгүй бол шинээр үүсгэх
          const currentTime = Date.now()
          const settingsData = {
            ...settings,
            createdAt: currentTime,
            updatedAt: currentTime,
          }

          await set(settingRef, settingsData)
        }
      }

      return settingId
    } catch (error) {
      console.error("Тохиргоо хадгалахад алдаа гарлаа:", error)
      return null
    }
  },

  // Анхны тохиргоог үүсгэх
  async createDefaultSettings(): Promise<SiteSettings | null> {
    try {
      const defaultSettings: SiteSettings = {
        siteName: "МонголШоп",
        siteUrl: "https://mongolshop.mn",
        siteDescription:
          "Монголын шилдэг дэлгүүрүүдийн мэдээлэл, үнэлгээ болон сэтгэгдэлүүдийг нэг дороос харах вэбсайт",
        contactEmail: "info@mongolshop.mn",
        contactPhone: "+976 9911 2233",
        showFeaturedStores: true,
        showLatestReviews: true,
        showNewsletter: true,
        darkMode: false,
        animations: true,
      }

      const settingId = await this.saveSettings(defaultSettings)
      if (!settingId) return null

      return {
        id: settingId,
        ...defaultSettings,
      }
    } catch (error) {
      console.error("Анхны тохиргоог үүсгэхэд алдаа гарлаа:", error)
      return null
    }
  },

  // Тохиргоог авах эсвэл анхны тохиргоог үүсгэх
  async getOrCreateSettings(): Promise<SiteSettings | null> {
    try {
      // Оффлайн горимд байвал жишээ өгөгдөл буцаах
      if (isOfflineMode()) {
        console.log("Оффлайн горимд ажиллаж байна, жишээ тохиргоог буцааж байна")
        return mockSettings
      }

      const dbInitialized = await checkDatabase()
      if (!dbInitialized) {
        console.warn("Өгөгдлийн сан холбогдоогүй тул жишээ тохиргоог буцааж байна")
        return mockSettings
      }

      const db = getFirebaseDatabase()
      if (!db) {
        console.warn("Өгөгдлийн сан холбогдоогүй тул жишээ тохиргоог буцааж байна")
        return mockSettings
      }

      // Одоогийн тохиргоог авах
      const settings = await this.getSettings()

      // Тохиргоо байхгүй бол анхны тохиргоог үүсгэх
      if (!settings) {
        return await this.createDefaultSettings()
      }

      return settings
    } catch (error) {
      console.error("Тохиргоог авах эсвэл үүсгэхэд алдаа гарлаа:", error)
      return mockSettings
    }
  },
}

// Зураг base64 болгох функц
export const imageToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = (error) => reject(error)
  })
}

// Export getUserById, updateUser, and deleteUser
export const { getUserById, updateUser, deleteUser } = userService
