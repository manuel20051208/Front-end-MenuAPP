"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { getAuthHeaders, getAuthToken, resolveApiUrl } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Moon, Sun, TrendingUp, Clock } from "lucide-react"

interface SleepRecord {
  id?: number
  fecha: string
  horaDormir: string
  horaDespertar: string
  horasDormidas: number
  calidad: number
}

export function Sleep() {
  const [sleepRecords, setSleepRecords] = useState<SleepRecord[]>([])
  const [bedtime, setBedtime] = useState("")
  const [wakeup, setWakeup] = useState("")
  const token = typeof window !== "undefined" ? getAuthToken() : null
  const API = resolveApiUrl("/api/sueno")

  useEffect(() => {
    const fetchSleep = async () => {
      try {
        if (!token) {
          setSleepRecords([
            { fecha: "2025-11-04", horaDormir: "23:00", horaDespertar: "07:00", horasDormidas: 8, calidad: 4 },
            { fecha: "2025-11-03", horaDormir: "23:30", horaDespertar: "06:30", horasDormidas: 7, calidad: 3 },
            { fecha: "2025-11-02", horaDormir: "22:00", horaDespertar: "06:00", horasDormidas: 8, calidad: 5 },
          ])
          return
        }

        const res = await fetch(API, { headers: getAuthHeaders() })
        if (!res.ok) throw new Error("Error al obtener registros de sueño")
        const data = await res.json()
        setSleepRecords(data)
      } catch (err) {
        console.error("Error cargando sueño:", err)
      }
    }

    fetchSleep()
  }, [token])

  const formatHoursMinutes = (decimalHours: number) => {
    const hours = Math.floor(decimalHours)
    const minutes = Math.round((decimalHours - hours) * 60)
    return { hours, minutes }
  }

  const calculateHours = (bed: string, wake: string) => {
    if (!bed || !wake) return 0
    const [bedH, bedM] = bed.split(":").map(Number)
    const [wakeH, wakeM] = wake.split(":").map(Number)
    let bedDate = new Date(2000, 0, 1, bedH, bedM)
    let wakeDate = new Date(2000, 0, 1, wakeH, wakeM)
    if (wakeDate <= bedDate) wakeDate.setDate(wakeDate.getDate() + 1)
    return (wakeDate.getTime() - bedDate.getTime()) / (1000 * 60 * 60)
  }

  const addRecord = async () => {
    if (!bedtime || !wakeup) return alert("Completa las horas antes de guardar.")
    if (!token) return alert("No hay usuario logueado.")

    const hours = Math.round(calculateHours(bedtime, wakeup) * 10) / 10

    const today = new Date()
    const fecha = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`

    const existeHoy = sleepRecords.some((r) => r.fecha === fecha)
    if (existeHoy) {
      alert("¡Ya registraste tu sueño de hoy!")
      return
    }

    let calidad = 3
    if (hours < 5) calidad = 2
    else if (hours < 7) calidad = 3
    else if (hours < 9) calidad = 4
    else calidad = 5

    const newRecord: SleepRecord = {
      fecha,
      horaDormir: bedtime,
      horaDespertar: wakeup,
      horasDormidas: hours,
      calidad,
    }

    try {
      const res = await fetch(`${API}/agregar`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify(newRecord),
      })

      if (!res.ok) {
        const errorText = await res.text()
        console.error("Error Backend:", res.status, errorText)
        alert("No se pudo guardar: " + errorText)
        return
      }

      const saved = await res.json()
      setSleepRecords([saved, ...sleepRecords])
      setBedtime("")
      setWakeup("")
      alert("Registro de sueño guardado correctamente")
    } catch (err) {
      console.error("Error al agregar registro:", err)
      alert("No se pudo guardar: " + (err as Error).message)
    }
  }

  const avgHours = sleepRecords.length > 0
    ? sleepRecords.reduce((sum, r) => sum + r.horasDormidas, 0) / sleepRecords.length
    : 0
  const avgFormatted = formatHoursMinutes(avgHours)

  const avgQuality = sleepRecords.length > 0
    ? Math.round(sleepRecords.reduce((sum, r) => sum + r.calidad, 0) / sleepRecords.length)
    : 0

  const calculateTrend = () => {
    if (sleepRecords.length < 2) return 0
    const last = sleepRecords[0].horasDormidas
    const prev = sleepRecords[1].horasDormidas
    return Math.round((last - prev) * 10) / 10
  }
  const trend = calculateTrend()
  const trendLabel = trend > 0 ? `+${trend}h` : `${trend}h`

  // 🔹 Render
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="flex items-center gap-3 text-3xl font-bold text-foreground md:text-4xl">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-500 text-white shadow-lg shadow-violet-500/30">
            <Moon className="h-6 w-6" />
          </span>
          Registro de Sueño
        </h1>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="border-transparent bg-gradient-to-br from-violet-600 to-indigo-600 p-6 shadow-lg shadow-violet-500/20">
          <div className="flex items-center gap-3">
            <Clock className="h-8 w-8 text-white" />
            <div>
              <p className="text-sm font-medium text-white/90">Promedio de Sueño</p>
              <p className="text-3xl font-bold text-white">
                {avgFormatted.hours}h {avgFormatted.minutes}m
              </p>
            </div>
          </div>
        </Card>

        <Card className="border-transparent bg-gradient-to-br from-blue-600 to-sky-600 p-6 shadow-lg shadow-blue-500/20">
          <div className="flex items-center gap-3">
            <TrendingUp className="h-8 w-8 text-white" />
            <div>
              <p className="text-sm font-medium text-white/90">Tendencia</p>
              <p className="text-3xl font-bold text-white">{trendLabel}</p>
            </div>
          </div>
        </Card>

        <Card className="border-transparent bg-gradient-to-br from-cyan-600 to-teal-600 p-6 shadow-lg shadow-cyan-500/20">
          <div className="flex items-center gap-3">
            <Sun className="h-8 w-8 text-white" />
            <div>
              <p className="text-sm font-medium text-white/90">Calidad Promedio</p>
              <p className="text-3xl font-bold text-white">{avgQuality}/5</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Registro nuevo */}
      <Card className="glass-card p-6">
        <h3 className="mb-4 text-xl font-bold text-foreground">Registrar Sueño de Hoy</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <Label htmlFor="bedtime" className="mb-2 block text-foreground">Hora de Dormir</Label>
            <Input
              id="bedtime"
              type="time"
              value={bedtime}
              onChange={(e) => setBedtime(e.target.value)}
              className="border-border bg-muted/60 text-foreground"
            />
          </div>
          <div>
            <Label htmlFor="wakeup" className="mb-2 block text-foreground">Hora de Despertar</Label>
            <Input
              id="wakeup"
              type="time"
              value={wakeup}
              onChange={(e) => setWakeup(e.target.value)}
              className="border-border bg-muted/60 text-foreground"
            />
          </div>
          <div className="flex items-end">
            <Button
              onClick={addRecord}
              className="w-full bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-lg shadow-primary/30 transition-all hover:opacity-90"
            >
              Guardar Registro
            </Button>
          </div>
        </div>
      </Card>

      {/* Historial */}
      <Card className="glass-card p-6">
        <h3 className="mb-4 text-xl font-bold text-foreground">Historial de Sueño</h3>
        <div className="space-y-3">
          {sleepRecords.map((record, idx) => {
            const formatted = formatHoursMinutes(record.horasDormidas)
            const displayDate = new Date(record.fecha + "T00:00").toLocaleDateString("es-ES", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })
            return (
              <div key={idx} className="glass-inner flex items-center justify-between rounded-lg p-4 transition-colors hover:bg-muted">
                <div className="flex items-center gap-4">
                  <Moon className="h-6 w-6 text-primary" />
                  <div>
                    <p className="font-semibold text-foreground">{displayDate}</p>
                    <p className="text-sm text-primary">
                      {record.horaDormir} - {record.horaDespertar}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-foreground">
                    {formatted.hours}h {formatted.minutes}m
                  </p>
                  <div className="mt-1 flex gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className={`h-2 w-2 rounded-full ${i < record.calidad ? "bg-amber-400" : "bg-muted-foreground/30"}`} />
                    ))}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </Card>
    </div>
  )
}
