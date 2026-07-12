"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Eye, EyeOff } from "lucide-react"

type Mode = "login" | "register"

export default function LoginPage() {
  const router = useRouter()
  const [mode, setMode] = useState<Mode>("login")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")

  const [form, setForm] = useState({
    nombre: "",
    usuario: "",
    email: "",
    password: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setErrorMsg("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrorMsg("")

    try {
      const endpoint =
        mode === "login"
          ? "/api/usuario/login"
          : "/api/usuario/registrar"

      const body =
        mode === "login"
          ? { email: form.email, password: form.password }
          : { nombre: form.nombre, usuario: form.usuario, email: form.email, password: form.password }

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData?.mensaje || errData?.message || "Credenciales inválidas")
      }

      const data = await res.json()

      if (data.token) {
        // El Middleware lo guardará como Cookie al hacer la redirección
        // Por ahora lo seteamos manualmente como Cookie desde el cliente
        document.cookie = `token=${data.token}; path=/; max-age=${60 * 60 * 24 * 7}; samesite=lax`
        if (data.usuario) {
          localStorage.setItem("usuario", JSON.stringify(data.usuario))
        }
        router.push("/")
        router.refresh()
      } else {
        throw new Error("El servidor no devolvió un token válido.")
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Error al conectar con el servidor")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0a0a0f] p-4">
      {/* Fondo animado con orbes */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-violet-700/20 blur-[120px]" />
        <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-blue-700/20 blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-700/10 blur-[100px]" />
      </div>

      {/* Grid de fondo */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Card principal */}
      <div className="relative z-10 w-full max-w-md">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-blue-600 shadow-lg shadow-violet-500/30">
            <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white">
            {mode === "login" ? "Bienvenido" : "Crear cuenta"}
          </h1>
          <p className="mt-2 text-sm text-white/40">
            {mode === "login"
              ? "Ingresa a tu cuenta para continuar"
              : "Regístrate para comenzar"}
          </p>
        </div>

        {/* Tabs Login / Registrar */}
        <div className="mb-6 flex rounded-xl bg-white/5 p-1">
          <button
            type="button"
            onClick={() => { setMode("login"); setErrorMsg("") }}
            className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all duration-200 ${
              mode === "login"
                ? "bg-gradient-to-r from-violet-600 to-blue-600 text-white shadow-lg"
                : "text-white/40 hover:text-white/70"
            }`}
          >
            Iniciar sesión
          </button>
          <button
            type="button"
            onClick={() => { setMode("register"); setErrorMsg("") }}
            className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all duration-200 ${
              mode === "register"
                ? "bg-gradient-to-r from-violet-600 to-blue-600 text-white shadow-lg"
                : "text-white/40 hover:text-white/70"
            }`}
          >
            Registrarse
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Campos solo para registro */}
          {mode === "register" && (
            <>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-white/60">
                  Nombre completo
                </label>
                <input
                  name="nombre"
                  type="text"
                  value={form.nombre}
                  onChange={handleChange}
                  required
                  placeholder="Tu nombre"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/20 outline-none transition-all focus:border-violet-500/50 focus:bg-white/8 focus:ring-2 focus:ring-violet-500/20"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-white/60">
                  Nombre de usuario
                </label>
                <input
                  name="usuario"
                  type="text"
                  value={form.usuario}
                  onChange={handleChange}
                  required
                  placeholder="usuario123"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/20 outline-none transition-all focus:border-violet-500/50 focus:bg-white/8 focus:ring-2 focus:ring-violet-500/20"
                />
              </div>
            </>
          )}

          {/* Email */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-white/60">
              Correo electrónico
            </label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
              placeholder="ejemplo@correo.com"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/20 outline-none transition-all focus:border-violet-500/50 focus:bg-white/8 focus:ring-2 focus:ring-violet-500/20"
            />
          </div>

          {/* Contraseña */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-white/60">
              Contraseña
            </label>
            <div className="relative">
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={handleChange}
                required
                placeholder="••••••••"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 pr-12 text-white placeholder-white/20 outline-none transition-all focus:border-violet-500/50 focus:bg-white/8 focus:ring-2 focus:ring-violet-500/20"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 transition-colors hover:text-white/60"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Error */}
          {errorMsg && (
            <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              <svg className="h-4 w-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errorMsg}
            </div>
          )}

          {/* Botón submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-violet-500/30 transition-all duration-200 hover:shadow-violet-500/50 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:scale-100"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-violet-500 to-blue-500 opacity-0 transition-opacity group-hover:opacity-100" />
            <span className="relative flex items-center justify-center gap-2">
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              {isLoading
                ? "Procesando..."
                : mode === "login"
                ? "Ingresar"
                : "Crear cuenta"}
            </span>
          </button>
        </form>
      </div>
    </div>
  )
}
