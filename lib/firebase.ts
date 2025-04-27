// Firebase холболтын файл
import { initializeApp, getApps, type FirebaseApp } from "firebase/app"
import { getDatabase, type Database, connectDatabaseEmulator, ref, onValue } from "firebase/database"

// Firebase тохиргоо
const firebaseConfig = {
  apiKey: "AIzaSyAmX_0zW98U4P2sk_pdp9Stqr8Zv5IxZc0",
  authDomain: "crypto-78b68.firebaseapp.com",
  databaseURL: "https://crypto-78b68-default-rtdb.firebaseio.com",
  projectId: "crypto-78b68",
  storageBucket: "crypto-78b68.firebasestorage.app",
  messagingSenderId: "506662617204",
  appId: "1:506662617204:web:85110d4e4fa11a53a51121",
  measurementId: "G-VTPTEFE8H0",
}

// Firebase app болон database-ийн instance-уудыг хадгалах хувьсагчид
let firebaseApp: FirebaseApp | undefined
let firebaseDatabase: Database | undefined
let connectionAttempts = 0
const MAX_ATTEMPTS = 3
const RETRY_DELAY = 2000 // 2 секунд

// Холболтын төлөвийг хадгалах
export const connectionStatus = {
  isConnected: false,
  lastError: null as string | null,
  lastAttempt: 0,
  isOfflineMode: true, // Анхнаасаа оффлайн горимд эхлүүлэх
}

// Дотоод төлөвийн хувьсагчид
let _isConnected = false
let _isOfflineMode = true
let _lastError: string | null = null
let _lastAttempt = 0

// Firebase-ийг инициализаци хийх функц
export function initializeFirebase() {
  if (typeof window === "undefined") {
    // Server-side rendering үед Firebase-ийг инициализаци хийхгүй
    return null
  }

  try {
    // Хэрэв аппликейшн аль хэдийн инициализаци хийгдсэн бол шинээр хийхгүй
    if (!getApps().length) {
      console.log("Firebase аппликейшн инициализаци хийж байна...")
      try {
        firebaseApp = initializeApp(firebaseConfig)
        console.log("Firebase аппликейшн амжилттай инициализаци хийгдлээ")
      } catch (appError: any) {
        console.error("Firebase app инициализаци хийхэд алдаа гарлаа:", appError.message || appError)
        connectionStatus.isConnected = false
        connectionStatus.lastError = appError.message || "Firebase app инициализаци хийхэд алдаа гарлаа"
        connectionStatus.lastAttempt = Date.now()
        connectionStatus.isOfflineMode = true
        return null
      }
    } else {
      firebaseApp = getApps()[0]
      console.log("Firebase аппликейшн аль хэдийн инициализаци хийгдсэн байна")
    }

    // Database-ийг инициализаци хийх
    if (!firebaseDatabase && firebaseApp) {
      try {
        console.log("Firebase database-тэй холбогдож байна...")

        // Хэрэв databaseURL байхгүй бол алдаа гаргах
        if (!firebaseConfig.databaseURL) {
          console.warn("Firebase databaseURL тохиргоо байхгүй байна")
          connectionStatus.isConnected = false
          connectionStatus.lastError = "Firebase databaseURL тохиргоо байхгүй байна"
          connectionStatus.lastAttempt = Date.now()
          connectionStatus.isOfflineMode = true
          return { app: firebaseApp, database: null }
        }

        // Try-catch блок нэмж, алдааг илүү сайн барих
        try {
          // Хэрэв эмулятор ашиглаж байвал холбох (хөгжүүлэлтийн орчинд)
          if (process.env.NODE_ENV === "development" && process.env.USE_FIREBASE_EMULATOR === "true") {
            try {
              firebaseDatabase = getDatabase(firebaseApp)
              connectDatabaseEmulator(firebaseDatabase, "localhost", 9000)
              console.log("Firebase эмулятортой холбогдлоо")
            } catch (emulatorError: any) {
              console.warn("Firebase эмулятортой холбогдоход алдаа гарлаа:", emulatorError)
              connectionStatus.isConnected = false
              connectionStatus.lastError = emulatorError.message || "Firebase эмулятортой холбогдоход алдаа гарлаа"
              connectionStatus.lastAttempt = Date.now()
              connectionStatus.isOfflineMode = true
              return { app: firebaseApp, database: null }
            }
          } else {
            // Энгийн холболт
            try {
              firebaseDatabase = getDatabase(firebaseApp)
            } catch (dbError: any) {
              console.error("Firebase database авахад алдаа гарлаа:", dbError.message || dbError)
              connectionStatus.isConnected = false
              connectionStatus.lastError = dbError.message || "Firebase database авахад алдаа гарлаа"
              connectionStatus.lastAttempt = Date.now()
              connectionStatus.isOfflineMode = true
              return { app: firebaseApp, database: null }
            }
          }

          // Холболтыг шалгах
          if (firebaseDatabase) {
            try {
              const connectedRef = ref(firebaseDatabase, ".info/connected")
              onValue(connectedRef, (snap) => {
                if (snap.val() === true) {
                  console.log("Firebase database-тэй амжилттай холбогдлоо")
                  connectionStatus.isConnected = true
                  connectionStatus.lastError = null
                  connectionStatus.isOfflineMode = false

                  _isConnected = true
                  _isOfflineMode = false
                  _lastError = null
                  _lastAttempt = Date.now()
                } else {
                  console.log("Firebase database-тэй холбогдоогүй байна")
                  connectionStatus.isConnected = false
                  connectionStatus.isOfflineMode = true

                  _isConnected = false
                  _isOfflineMode = true
                }
              })

              // Database холболтыг шалгах
              console.log("Firebase database амжилттай холбогдлоо:", firebaseDatabase.app.options.databaseURL)
              connectionStatus.isConnected = true
              connectionStatus.lastError = null
              connectionStatus.lastAttempt = Date.now()
              connectionStatus.isOfflineMode = false

              _isConnected = true
              _isOfflineMode = false
              _lastError = null
              _lastAttempt = Date.now()

              return { app: firebaseApp, database: firebaseDatabase }
            } catch (connError: any) {
              console.error("Firebase холболтыг шалгахад алдаа гарлаа:", connError.message || connError)
              connectionStatus.isConnected = false
              connectionStatus.lastError = connError.message || "Firebase холболтыг шалгахад алдаа гарлаа"
              connectionStatus.lastAttempt = Date.now()
              connectionStatus.isOfflineMode = true

              _isConnected = false
              _isOfflineMode = true
              _lastError = connError.message || "Firebase холболтыг шалгахад алдаа гарлаа"
              _lastAttempt = Date.now()

              return { app: firebaseApp, database: null }
            }
          }
        } catch (dbInitError: any) {
          console.error("Firebase database инициализаци хийхэд алдаа гарлаа:", dbInitError.message || dbInitError)
          connectionStatus.isConnected = false
          connectionStatus.lastError = dbInitError.message || "Firebase database инициализаци хийхэд алдаа гарлаа"
          connectionStatus.lastAttempt = Date.now()
          connectionStatus.isOfflineMode = true

          _isConnected = false
          _isOfflineMode = true
          _lastError = dbInitError.message || "Firebase database инициализаци хийхэд алдаа гарлаа"
          _lastAttempt = Date.now()

          return { app: firebaseApp, database: null }
        }
      } catch (dbError: any) {
        console.error("Firebase database инициализаци хийхэд алдаа гарлаа:", dbError.message || dbError)
        connectionStatus.isConnected = false
        connectionStatus.lastError = dbError.message || "Firebase database инициализаци хийхэд алдаа гарлаа"
        connectionStatus.lastAttempt = Date.now()
        connectionStatus.isOfflineMode = true

        _isConnected = false
        _isOfflineMode = true
        _lastError = dbError.message || "Firebase database инициализаци хийхэд алдаа гарлаа"
        _lastAttempt = Date.now()

        return { app: firebaseApp, database: null }
      }
    }

    return { app: firebaseApp, database: firebaseDatabase }
  } catch (error: any) {
    console.error("Firebase инициализаци хийхэд алдаа гарлаа:", error.message || error)
    connectionStatus.isConnected = false
    connectionStatus.lastError = error.message || "Firebase инициализаци хийхэд алдаа гарлаа"
    connectionStatus.lastAttempt = Date.now()
    connectionStatus.isOfflineMode = true

    _isConnected = false
    _isOfflineMode = true
    _lastError = error.message || "Firebase инициализаци хийхэд алдаа гарлаа"
    _lastAttempt = Date.now()

    return null
  }

  return { app: firebaseApp, database: null }
}

// Firebase database авах функц
export function getFirebaseDatabase(): Database | null {
  if (typeof window === "undefined") {
    // Server-side rendering үед null буцаана
    return null
  }

  try {
    // Хэрэв database аль хэдийн инициализаци хийгдсэн бол түүнийг буцаана
    if (firebaseDatabase) {
      return firebaseDatabase
    }

    // Хэрэв үгүй бол Firebase-ийг инициализаци хийж, database-ийг буцаана
    const firebase = initializeFirebase()

    // Хэрэв холболт амжилтгүй болсон бол дахин оролдох
    if (!firebase?.database && connectionAttempts < MAX_ATTEMPTS) {
      connectionAttempts++
      console.log(`Firebase database-тэй холбогдох ${connectionAttempts}-р оролдлого...`)

      // Дахин оролдох хугацааг тохируулах
      setTimeout(() => {
        connectionAttempts = 0 // Тоологчийг дахин тохируулах
        initializeFirebase() // Дахин холбогдох оролдлого хийх
      }, RETRY_DELAY)
    } else if (!firebase?.database && connectionAttempts >= MAX_ATTEMPTS) {
      // Хэрэв максимум оролдлого хийсэн бол оффлайн горим идэвхжүүлэх
      connectionStatus.isOfflineMode = true
      console.log("Firebase database-тэй холбогдох боломжгүй, оффлайн горим идэвхжүүллээ")
    }

    return firebase?.database || null
  } catch (error: any) {
    console.error("Firebase database авахад алдаа гарлаа:", error.message || error)
    connectionStatus.isConnected = false
    connectionStatus.lastError = error.message || "Firebase database авахад алдаа гарлаа"
    connectionStatus.lastAttempt = Date.now()
    connectionStatus.isOfflineMode = true

    _isConnected = false
    _isOfflineMode = true
    _lastError = error.message || "Firebase database авахад алдаа гарлаа"
    _lastAttempt = Date.now()

    return null
  }
}

// Холболтын төлөвийг авах функц
export function getConnectionStatus() {
  // Хэрэв localStorage дотор холболтын төлөв хадгалагдсан бол түүнийг буцаана
  if (typeof window !== "undefined") {
    const savedStatus = localStorage.getItem("connectionStatus")
    if (savedStatus) {
      try {
        return JSON.parse(savedStatus)
      } catch (e) {
        console.error("Холболтын төлөвийг задлахад алдаа гарлаа:", e)
      }
    }
  }

  // Анхны төлөв
  return {
    isConnected: true, // Анхны төлөв нь холбогдсон гэж үзнэ
    isOfflineMode: false,
    lastAttempt: Date.now(),
    lastError: null,
    connectionAttempts: 0,
    successfulConnections: 0,
    lastSuccessfulConnection: Date.now(),
  }
}

// Холболтын төлөвийг шинэчлэх функц
export function updateConnectionStatus(status: {
  isConnected?: boolean
  isOfflineMode?: boolean
  lastError?: string | null
  connectionAttempts?: number
  successfulConnections?: number
  lastSuccessfulConnection?: number
}) {
  if (typeof window !== "undefined") {
    localStorage.setItem(
      "connectionStatus",
      JSON.stringify({
        ...getConnectionStatus(),
        ...status,
        lastAttempt: Date.now(),
      }),
    )
  }
}

// Өгөгдлийн сантай холбогдох функц
export async function reconnectToDatabase() {
  try {
    // Холболтын оролдлогын тоог нэмэгдүүлэх
    const currentStatus = getConnectionStatus()
    updateConnectionStatus({
      connectionAttempts: (currentStatus.connectionAttempts || 0) + 1,
    })

    // Холболтыг шалгах
    const result = await testDatabaseConnection()

    if (result.success) {
      // Амжилттай холбогдсон бол төлөвийг шинэчлэх
      updateConnectionStatus({
        isConnected: true,
        isOfflineMode: false,
        lastError: null,
        successfulConnections: (currentStatus.successfulConnections || 0) + 1,
        lastSuccessfulConnection: Date.now(),
      })
      return true
    } else {
      // Холбогдож чадаагүй бол алдааг хадгалах
      updateConnectionStatus({
        isConnected: false,
        lastError: result.error,
      })
      return false
    }
  } catch (error: unknown) {
    // Алдаа гарсан бол төлөвийг шинэчлэх
    const errorMessage = error instanceof Error ? error.message : "Тодорхойгүй алдаа"
    updateConnectionStatus({
      isConnected: false,
      lastError: errorMessage,
    })
    return false
  }
}

// Өгөгдлийн сангийн холболтыг шалгах функц
export async function testDatabaseConnection() {
  try {
    // Энд өгөгдлийн сангийн холболтыг шалгах логик бичнэ
    // Жишээ нь: Firebase-ийн холболтыг шалгах
    const db = getDatabase()
    const testRef = ref(db, "connection_test")
    const snapshot = await await onValue(testRef, (snapshot) => {
      return snapshot
    })

    return {
      success: true,
      error: null,
    }
  } catch (error: unknown) {
    console.error("Өгөгдлийн сангийн холболтыг шалгахад алдаа гарлаа:", error)
    const errorMessage = error instanceof Error ? error.message : "Тодорхойгүй алдаа"
    return {
      success: false,
      error: errorMessage,
    }
  }
}

// Дахин холбогдох функц
// export function reconnectToDatabase() {
//   connectionAttempts = 0
//   firebaseDatabase = undefined
//   connectionStatus.isOfflineMode = false
//   return initializeFirebase()
// }

// Client-side дээр Firebase-ийг инициализаци хийх
if (typeof window !== "undefined") {
  // Хөтөч дээр ажиллаж байгаа эсэхийг шалгах
  try {
    // Хуудас бүрэн ачаалагдсаны дараа Firebase-ийг инициализаци хийх
    window.addEventListener("load", () => {
      console.log("Хуудас ачаалагдсан, Firebase инициализаци хийж байна...")
      initializeFirebase()
    })

    // Сүлжээний холболт өөрчлөгдөх үед дахин холбогдох
    window.addEventListener("online", () => {
      console.log("Сүлжээний холболт сэргэлээ, Firebase-тэй дахин холбогдож байна...")
      reconnectToDatabase()
    })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Тодорхойгүй алдаа"
    console.error("Firebase автоматаар инициализаци хийхэд алдаа гарлаа:", errorMessage)
  }
}
