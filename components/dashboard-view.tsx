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
    const token = getAuthToken()

    if (!token) {
      console.warn("No hay token. Redirigiendo al login...")
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
    return <p className="mt-10 text-center text-muted-foreground">Cargando datos del Resumen...</p>

  if (!data)
    return (
      <p className="mt-10 text-center text-destructive">
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
        <h1 className="flex items-center gap-3 text-3xl font-bold text-foreground md:text-4xl">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-lg shadow-primary/30">
            <LayoutDashboard className="h-6 w-6" />
          </span>
          Resumen de {data.nombre || "Usuario"}
        </h1>
      </div>

      {/* 🔸 Quick Stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card className="border-transparent bg-gradient-to-br from-green-500 to-emerald-600 p-6 shadow-lg shadow-emerald-500/20">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-8 w-8 text-white" />
            <div>
              <p className="text-sm font-medium text-white/90">Tareas Completadas</p>
              <p className="text-3xl font-bold text-white">{tasksData.completed}</p>
            </div>
          </div>
        </Card>

        <Card className="border-transparent bg-gradient-to-br from-amber-500 to-orange-600 p-6 shadow-lg shadow-orange-500/20">
          <div className="flex items-center gap-3">
            <Circle className="h-8 w-8 text-white" />
            <div>
              <p className="text-sm font-medium text-white/90">Tareas Pendientes</p>
              <p className="text-3xl font-bold text-white">{tasksData.pending}</p>
            </div>
          </div>
        </Card>

        <Card className="border-transparent bg-gradient-to-br from-violet-500 to-blue-600 p-6 shadow-lg shadow-violet-500/20">
          <div className="flex items-center gap-3">
            <Moon className="h-8 w-8 text-white" />
            <div>
              <p className="text-sm font-medium text-white/90">Sueño Promedio</p>
              <p className="text-3xl font-bold text-white">
                {avgFormatted.hours}h {avgFormatted.minutes}m
              </p>
            </div>
          </div>
        </Card>

        <Card className="border-transparent bg-gradient-to-br from-cyan-500 to-teal-600 p-6 shadow-lg shadow-cyan-500/20">
          <div className="flex items-center gap-3">
            <Target className="h-8 w-8 text-white" />
            <div>
              <p className="text-sm font-medium text-white/90">Progreso Diario</p>
              <p className="text-3xl font-bold text-white">
                {Math.round(tasksData.progress)}%
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* 🔸 Contenido principal */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Resumen de tareas */}
        <Card className="glass-card p-6">
          <h3 className="mb-6 flex items-center gap-2 text-2xl font-bold text-foreground">
            <CheckCircle2 className="h-6 w-6 text-emerald-500" />
            Resumen de Tareas
          </h3>

          <div className="mb-6 flex items-center justify-center">
            <div className="relative h-48 w-48">
              <svg className="h-full w-full -rotate-90">
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  className="stroke-muted-foreground/20"
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
                <span className="text-5xl font-bold text-foreground">
                  {Math.round(tasksData.progress)}%
                </span>
                <span className="text-sm text-muted-foreground">Completado</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="glass-inner flex items-center justify-between rounded-lg p-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                <span className="font-medium text-foreground">Completadas</span>
              </div>
              <span className="text-2xl font-bold text-foreground">
                {tasksData.completed}
              </span>
            </div>

            <div className="glass-inner flex items-center justify-between rounded-lg p-4">
              <div className="flex items-center gap-3">
                <Circle className="h-5 w-5 text-amber-500" />
                <span className="font-medium text-foreground">Pendientes</span>
              </div>
              <span className="text-2xl font-bold text-foreground">
                {tasksData.pending}
              </span>
            </div>
          </div>
        </Card>

        {/* 🔹 Estadísticas de Sueño con tendencia dinámica */}
        <Card className="glass-card p-6">
          <h3 className="mb-6 flex items-center gap-2 text-2xl font-bold text-foreground">
            <Moon className="h-6 w-6 text-primary" />
            Estadísticas de Sueño
          </h3>

          <div className="mb-6 grid grid-cols-2 gap-4">
            <div className="glass-inner rounded-lg p-4">
              <Clock className="mb-2 h-6 w-6 text-primary" />
              <p className="text-sm text-muted-foreground">Última Noche</p>
              <p className="text-3xl font-bold text-foreground">
                {lastNightFormatted.hours}h {lastNightFormatted.minutes}m
              </p>
            </div>

            <div className="glass-inner rounded-lg p-4">
              <TrendingUp
                className={`mb-2 h-6 w-6 transition-transform duration-300 ${
                  trend < 0 ? "rotate-180 text-destructive" : "text-accent"
                }`}
              />
              <p className={`text-sm ${trend < 0 ? "text-destructive" : "text-muted-foreground"}`}>
                Tendencia
              </p>
              <p
                className={`text-3xl font-bold ${
                  trend < 0 ? "text-destructive" : "text-foreground"
                }`}
              >
                {sleepData.trend}
              </p>
            </div>
          </div>

          {/* 🔹 Calidad promedio */}
          <div className="glass-inner mb-6 rounded-lg p-4">
            <p className="mb-2 text-sm text-muted-foreground">Calidad Promedio</p>
            <div className="flex items-center gap-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className={`h-8 w-8 rounded-full ${
                    i < sleepData.quality ? "bg-amber-400" : "bg-muted"
                  }`}
                />
              ))}
              <span className="ml-2 text-2xl font-bold text-foreground">
                {sleepData.quality}/5
              </span>
            </div>
          </div>

          {/* 🔹 Gráfico semanal */}
          <div>
            <p className="mb-3 text-sm text-muted-foreground">Sueño Reciente</p>
            <div className="flex h-32 items-end justify-between gap-2">
              {sleepData.weekData.map((day, idx) => {
                const dayFormatted = formatHoursMinutes(day.hours)
                return (
                  <div key={idx} className="flex flex-1 flex-col items-center gap-2">
                    <div className="relative h-full w-full rounded-t-lg bg-muted">
                      {day.recorded && (
                        <div
                          className="absolute bottom-0 w-full rounded-t-lg bg-gradient-to-t from-primary to-accent transition-all duration-500"
                          style={{ height: `${(day.hours / maxHours) * 100}%` }}
                        />
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">{day.day}</span>
                    <span className="text-xs font-bold text-foreground">
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
      <Card className="glass-card mt-4 rounded-2xl p-8 text-foreground">
        <div className="flex flex-col items-center justify-between gap-6 text-center md:flex-row md:text-left">
          <div>
            <h3 className="mb-3 text-2xl font-extrabold tracking-wide">Resumen General</h3>
            <p className="max-w-2xl text-lg leading-relaxed text-muted-foreground">
              Has completado{" "}
              <span className="font-bold text-emerald-500">{tasksData.completed}</span> de{" "}
              <span className="font-semibold text-foreground">{tasksData.total}</span> tareas hoy.{" "}
              <br />
              Tu promedio de sueño es de{" "}
              <span className="font-bold text-primary">
                {avgFormatted.hours}h {avgFormatted.minutes}m
              </span>{" "}
              con una tendencia de{" "}
              <span className={`font-bold ${trend < 0 ? "text-destructive" : "text-accent"}`}>
                {sleepData.trend}
              </span>{" "}
              esta semana.
            </p>
          </div>
          <TrendingUp
            className={`h-20 w-20 drop-shadow-lg transition-transform duration-500 ${
              trend < 0 ? "rotate-180 text-destructive" : "text-emerald-500"
            }`}
          />
        </div>
      </Card>
    </div>
  )
}
