const LOCAL_STORAGE_KEY = "token"
const LOCAL_DEV_TOKEN = "local-dev-token"

export function isLocalDevelopment() {
  if (typeof window === "undefined") return true
  return window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
}

export function getAuthToken() {
  if (typeof window === "undefined") return null

  const storedToken = window.localStorage.getItem(LOCAL_STORAGE_KEY)
  if (storedToken && storedToken !== "null") return storedToken

  if (isLocalDevelopment()) {
    window.localStorage.setItem(LOCAL_STORAGE_KEY, LOCAL_DEV_TOKEN)
    return LOCAL_DEV_TOKEN
  }

  return null
}

export function clearAuthToken() {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(LOCAL_STORAGE_KEY)
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

  if (isLocalDevelopment()) {
    return
  }

  window.location.href = "https://front-end-loggin.vercel.app/"
}
