"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { getAuthHeaders, getAuthToken, redirectToLogin, resolveApiUrl } from "@/lib/api"
import {
  LayoutDashboard,
  CheckCircle2,
  Circle,
  Moon,
  TrendingUp,
  Clock,
  Target,
} from "lucide-react"

export function Dashboard() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  
  // 🔹 Token y carga de datos segura
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const tokenFromUrl = params.get("token")

    if (tokenFromUrl) {
      console.log("Token recibido por URL:", tokenFromUrl)
      localStorage.setItem("token", tokenFromUrl)
      window.history.replaceState({}, "", window.location.pathname)
    }

    const token = getAuthToken()

    if (!token) {
      console.warn("No hay token. Redirigiendo al login...")
      localStorage.removeItem("token")
      localStorage.removeItem("usuario")
      redirectToLogin()
      return
    }

    const fetchData = async () => {
      try {
        const res = await fetch(resolveApiUrl("/api/resumen"), {
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(),
          },
        })
        if (!res.ok) throw new Error("Error al obtener datos del backend")

        const json = await res.json()
        setData(json)
      } catch (err) {
        console.error("Error al obtener datos:", err)
        alert("Error cargando datos. Inicia sesión nuevamente.")
        localStorage.removeItem("token")
        localStorage.removeItem("usuario")
        redirectToLogin()
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // 🔹 Mensajes de carga y error
  if (loading)
    return <p className="text-white text-center mt-10">Cargando datos del Resumen...</p>

  if (!data)
    return (
      <p className="text-red-400 text-center mt-10">
        No se pudo cargar la información del usuario.
      </p>
    )

  // 🔹 Procesamiento de datos
  const tasksData = {
    completed: data.tareas_completadas || 0,
    pending: data.tareas_pendientes || 0,
    total: data.tareas_totales || 0,
    progress: data.progreso_tareas || 0,
  }

  const sleepRecords = data.registros_sueno || []
  const sortedRecords = [...sleepRecords].sort(
    (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
  )
  const last7Records = sortedRecords.slice(0, 7).reverse()

  const avgHours =
    last7Records.length > 0
      ? last7Records.reduce((sum, r) => sum + (r.horas || 0), 0) / last7Records.length
      : 0

  const trend =
    last7Records.length >= 2
      ? Math.round(
          (last7Records[last7Records.length - 1].horas -
            last7Records[last7Records.length - 2].horas) * 10
        ) / 10
      : 0

  const avgQuality =
    last7Records.length > 0
      ? Math.round(
          last7Records.reduce((sum, r) => sum + (r.calidad || 0), 0) /
            last7Records.length
        )
      : 0

  const weekData = last7Records.map((record: any) => {
    const date = new Date(record.fecha + "T12:00")
    const day = date.toLocaleDateString("es-ES", { weekday: "short" })
    return {
      day,
      hours: record.horas || 0,
      recorded: true,
    }
  })

  const sleepData = {
    avgHours,
    lastNight: last7Records[last7Records.length - 1]?.horas || avgHours,
    trend: `${trend > 0 ? "+" : ""}${trend}h`,
    quality: avgQuality,
    weekData,
  }

  const formatHoursMinutes = (decimalHours: number) => {
    const hours = Math.floor(decimalHours)
    const minutes = Math.round((decimalHours - hours) * 60)
    return { hours, minutes }
  }

  const avgFormatted = formatHoursMinutes(sleepData.avgHours)
  const lastNightFormatted = formatHoursMinutes(sleepData.lastNight)
  const maxHours = Math.max(...sleepData.weekData.map((d) => d.hours), 1)

  // 🔹 UI del dashboard
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold text-white flex items-center gap-3">
          <LayoutDashboard className="h-12 w-12 text-cyan-400" />
          Resumen de {data.nombre || "Usuario"}
        </h1>
      </div>

      {/* 🔸 Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-500 to-emerald-600 border-white/20 p-6">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-8 w-8 text-white" />
            <div>
              <p className="text-sm text-white/90 font-medium">Tareas Completadas</p>
              <p className="text-3xl font-bold text-white">{tasksData.completed}</p>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-500 to-orange-600 border-white/20 p-6">
          <div className="flex items-center gap-3">
            <Circle className="h-8 w-8 text-white" />
            <div>
              <p className="text-sm text-white/90 font-medium">Tareas Pendientes</p>
              <p className="text-3xl font-bold text-white">{tasksData.pending}</p>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-blue-600 border-white/20 p-6">
          <div className="flex items-center gap-3">
            <Moon className="h-8 w-8 text-white" />
            <div>
              <p className="text-sm text-white/90 font-medium">Sueño Promedio</p>
              <p className="text-3xl font-bold text-white">
                {avgFormatted.hours}h {avgFormatted.minutes}m
              </p>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-cyan-500 to-teal-600 border-white/20 p-6">
          <div className="flex items-center gap-3">
            <Target className="h-8 w-8 text-white" />
            <div>
              <p className="text-sm text-white/90 font-medium">Progreso Diario</p>
              <p className="text-3xl font-bold text-white">
                {Math.round(tasksData.progress)}%
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* 🔸 Contenido principal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Resumen de tareas */}
        <Card className="bg-white/10 border-white/20 p-6">
          <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <CheckCircle2 className="h-6 w-6 text-green-400" />
            Resumen de Tareas
          </h3>

          <div className="flex items-center justify-center mb-6">
            <div className="relative w-48 h-48">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="12"
                  fill="none"
                />
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  stroke="url(#gradient)"
                  strokeWidth="12"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 88}`}
                  strokeDashoffset={`${2 * Math.PI * 88 * (1 - tasksData.progress / 100)}`}
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#3b82f6" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-5xl font-bold text-white">
                  {Math.round(tasksData.progress)}%
                </span>
                <span className="text-sm text-purple-300">Completado</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-400" />
                <span className="text-white font-medium">Completadas</span>
              </div>
              <span className="text-2xl font-bold text-white">
                {tasksData.completed}
              </span>
            </div>

            <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
              <div className="flex items-center gap-3">
                <Circle className="h-5 w-5 text-yellow-400" />
                <span className="text-white font-medium">Pendientes</span>
              </div>
              <span className="text-2xl font-bold text-white">
                {tasksData.pending}
              </span>
            </div>
          </div>
        </Card>

        {/* 🔹 Estadísticas de Sueño con tendencia dinámica */}
        <Card className="bg-white/10 border-white/20 p-6">
          <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Moon className="h-6 w-6 text-purple-400" />
            Estadísticas de Sueño
          </h3>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-4 bg-gradient-to-br from-purple-600/20 to-blue-600/20 rounded-lg">
              <Clock className="h-6 w-6 text-purple-400 mb-2" />
              <p className="text-sm text-purple-300">Última Noche</p>
              <p className="text-3xl font-bold text-white">
                {lastNightFormatted.hours}h {lastNightFormatted.minutes}m
              </p>
            </div>

            <div className="p-4 bg-gradient-to-br from-blue-600/20 to-cyan-600/20 rounded-lg">
              <TrendingUp
                className={`h-6 w-6 mb-2 transition-transform duration-300 ${
                  trend < 0 ? "text-red-400 rotate-180" : "text-blue-400"
                }`}
              />
              <p
                className={`text-sm ${
                  trend < 0 ? "text-red-300" : "text-blue-300"
                }`}
              >
                Tendencia
              </p>
              <p
                className={`text-3xl font-bold ${
                  trend < 0 ? "text-red-400" : "text-white"
                }`}
              >
                {sleepData.trend}
              </p>
            </div>
          </div>

          {/* 🔹 Calidad promedio */}
          <div className="mb-6 p-4 bg-white/5 rounded-lg">
            <p className="text-sm text-purple-300 mb-2">Calidad Promedio</p>
            <div className="flex items-center gap-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className={`w-8 h-8 rounded-full ${
                    i < sleepData.quality ? "bg-yellow-400" : "bg-white/20"
                  }`}
                />
              ))}
              <span className="text-2xl font-bold text-white ml-2">
                {sleepData.quality}/5
              </span>
            </div>
          </div>

          {/* 🔹 Gráfico semanal */}
          <div>
            <p className="text-sm text-purple-300 mb-3">Sueño Reciente</p>
            <div className="flex items-end justify-between gap-2 h-32">
              {sleepData.weekData.map((day, idx) => {
                const dayFormatted = formatHoursMinutes(day.hours)
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full bg-white/10 rounded-t-lg relative h-full">
                      {day.recorded && (
                        <div
                          className="absolute bottom-0 w-full bg-gradient-to-t from-purple-600 to-blue-600 rounded-t-lg transition-all duration-500"
                          style={{ height: `${(day.hours / maxHours) * 100}%` }}
                        />
                      )}
                    </div>
                    <span className="text-xs text-white/60">{day.day}</span>
                    <span className="text-xs font-bold text-white">
                      {day.recorded
                        ? `${dayFormatted.hours}h ${dayFormatted.minutes}m`
                        : "-"}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </Card>
      </div>

      {/* 🔸 Resumen general */}
      <Card className="bg-white/10 border-white/20 p-8 mt-4 shadow-lg rounded-2xl text-white">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div>
            <h3 className="text-2xl font-extrabold mb-3 tracking-wide">
              🌙 Resumen General
            </h3>
            <p className="text-lg leading-relaxed max-w-2xl">
              Has completado{" "}
              <span className="text-green-400 font-bold">
                {tasksData.completed}
              </span>{" "}
              de{" "}
              <span className="text-white font-semibold">
                {tasksData.total}
              </span>{" "}
              tareas hoy. <br />
              Tu promedio de sueño es de{" "}
              <span className="text-cyan-300 font-bold">
                {avgFormatted.hours}h {avgFormatted.minutes}m
              </span>{" "}
              con una tendencia de{" "}
              <span
                className={`font-bold ${
                  trend < 0 ? "text-red-400" : "text-amber-300"
                }`}
              >
                {sleepData.trend}
              </span>{" "}
              esta semana.
            </p>
          </div>
          <TrendingUp
            className={`h-20 w-20 drop-shadow-lg transition-transform duration-500 ${
              trend < 0 ? "text-red-400 rotate-180" : "text-green-400"
            }`}
          />
        </div>
      </Card>
    </div>
  )
}