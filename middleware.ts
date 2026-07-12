import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const url = request.nextUrl
  
  // 1. Extraer el token si viene en la URL
  const tokenParam = url.searchParams.get("token")
  
  // 2. Leer la cookie
  let cookieToken = request.cookies.get("token")?.value
  
  // Si venimos regresando de Vercel con el token en la URL
  if (tokenParam) {
    // Limpiamos la URL (quitamos el ?token=...)
    const newUrl = request.nextUrl.clone()
    newUrl.searchParams.delete("token")
    
    const response = NextResponse.redirect(newUrl)
    
    // Guardamos el token en una cookie segura
    response.cookies.set("token", tokenParam, {
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 1 semana
      sameSite: "lax",
    })
    
    return response
  }

  // Si no hay token en la cookie ni en la URL, expulsar instantáneamente
  if (!cookieToken) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = "/login"
    return NextResponse.redirect(loginUrl)
  }

  // Si hay token válido, permitir que Next.js renderice la app
  return NextResponse.next()
}

// Configurar en qué rutas se ejecuta este Middleware
export const config = {
  // Se ejecuta en todas las rutas EXCEPTO /login, APIs internas de Next.js, archivos estáticos, imágenes y favicon
  matcher: ["/((?!login|api|_next/static|_next/image|favicon.ico).*)"],
}
