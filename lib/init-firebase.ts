// Энэ файл нь Firebase-ийг client-side дээр инициализаци хийх зорилготой
import { initializeFirebase } from "./firebase"

// Client-side дээр Firebase-ийг инициализаци хийх
export default function InitFirebase() {
  // Компонент рендер хийгдэх үед Firebase-ийг инициализаци хийх
  if (typeof window !== "undefined") {
    // Хуудас ачаалагдсаны дараа Firebase-ийг инициализаци хийх
    setTimeout(() => {
      initializeFirebase()
      console.log("Firebase инициализаци хийгдлээ (client-side)")
    }, 1000) // Хуудас бүрэн ачаалагдсаны дараа инициализаци хийх
  }

  // Энэ компонент нь юу ч рендер хийхгүй
  return null
}
