const LOCAL_STORAGE_KEY = "token"
const LOCAL_DEV_TOKEN = "local-dev-token"

export function isLocalDevelopment() {
  if (typeof window === "undefined") return true
  return window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
}

export function getAuthToken() {
  if (typeof window === "undefined") return null

  // Leer la cookie "token"
  const match = document.cookie.match(new RegExp('(^| )token=([^;]+)'))
  if (match) return match[2]

  return null
}

export function clearAuthToken() {
  if (typeof window !== "undefined") {
    // Borrar la cookie configurando su expiración en el pasado
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;"
  }
}

export function resolveApiUrl(path: string) {
  if (!path.startsWith("/")) {
    path = `/${path}`
  }

  return path
}

export function getAuthHeaders(extra: Record<string, string> = {}) {
  const token = getAuthToken()
  const headers: Record<string, string> = {
    ...(extra as Record<string, string>),
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  return headers
}

export function redirectToLogin() {
  if (typeof window === "undefined") return
  window.location.href = "/login"
}
