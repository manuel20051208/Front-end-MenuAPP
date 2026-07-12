"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { getAuthHeaders, getAuthToken, redirectToLogin, resolveApiUrl } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ChevronLeft, ChevronRight, Plus, CalendarIcon, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"

const DAYS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"]
const MONTHS = [
  "Enero","Febrero","Marzo","Abril","Mayo","Junio",
  "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"
]

type BackendEvento = {
  id: number
  usuario: { id: number }
  evento: string
  descripcion: string
  fecha: string // "2025-01-15"
}

export function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [events, setEvents] = useState<{ [key: string]: BackendEvento[] }>({})
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedDay, setSelectedDay] = useState<number | null>(null)
  const [form, setForm] = useState({ evento: "", descripcion: "", fecha: "" })
  const [loading, setLoading] = useState(false)
  const [token, setToken] = useState<string | null>(null)

  // 🔹 Cargar token desde URL o localStorage
  useEffect(() => {
    const storedToken = getAuthToken()
    setToken(storedToken)

    if (storedToken) {
      fetchEventos(storedToken)
    } else {
      alert("⚠️ Debes iniciar sesión nuevamente.")
      redirectToLogin()
    }
  }, [])

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

 // 🔹 Obtener eventos del usuario autenticado
async function fetchEventos(token: string) {
  try {
    setLoading(true)
    const res = await fetch(resolveApiUrl("/api/eventos/usuario"), {
      headers: getAuthHeaders(),
    })

    if (res.status === 204) {
      // No hay eventos → limpiar estado sin error
      setEvents({})
      return
    }

    if (!res.ok) throw new Error("Error al traer eventos del usuario")

    const data: BackendEvento[] = await res.json()
    const map: { [key: string]: BackendEvento[] } = {}
    data.forEach((e) => {
      map[e.fecha] = map[e.fecha] || []
      map[e.fecha].push(e)
    })
    setEvents(map)
  } catch (err) {
    console.error(err)
    alert("No se pudieron cargar los eventos del usuario.")
  } finally {
    setLoading(false)
  }
}

  function previousMonth() {
    setCurrentDate(new Date(year, month - 1, 1))
  }

  function nextMonth() {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  function getDateKey(day: number) {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
  }

  function getDayEvents(day: number) {
    return events[getDateKey(day)] || []
  }

  function openModalForDay(day: number) {
    const fecha = getDateKey(day)
    setSelectedDay(day)
    setForm({ evento: "", descripcion: "", fecha })
    setIsModalOpen(true)
  }

  // 🔹 Crear evento (el backend asigna el usuario por token)
  async function handleCreateEvent() {
    if (!token) return alert("Sesión no válida")
    if (form.evento.trim().length < 5) return alert("El nombre del evento debe tener al menos 5 caracteres")
    if (form.descripcion.trim().length < 5) return alert("La descripción debe tener al menos 5 caracteres")

    const payload = {
      evento: form.evento,
      descripcion: form.descripcion,
      fecha: form.fecha,
    }

    try {
      const res = await fetch(resolveApiUrl("/api/eventos/crear"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error("Error al crear evento")

      await fetchEventos(token)
      setIsModalOpen(false)
      setForm({ evento: "", descripcion: "", fecha: "" })
    } catch (err: any) {
      console.error(err)
      alert("No se pudo crear el evento: " + (err.message || err))
    }
  }

  // 🔹 Eliminar evento
  async function handleDeleteEvent(id: number) {
    if (!token) return alert("Sesión no válida")
    const confirmDelete = confirm("¿Seguro que deseas eliminar este evento?")
    if (!confirmDelete) return

    try {
      const res = await fetch(resolveApiUrl(`/api/eventos/eliminar/${id}`), {
        method: "DELETE",
        headers: getAuthHeaders(),
      })
      if (!res.ok) throw new Error("Error al eliminar evento")

      await fetchEventos(token)
      alert("Evento eliminado correctamente ✅")
    } catch (err: any) {
      console.error("Error eliminando evento:", err)
      alert("No se pudo eliminar el evento: " + (err.message || err))
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="flex items-center gap-3 text-3xl font-bold text-foreground md:text-4xl">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/30">
            <CalendarIcon className="h-6 w-6" />
          </span>
          Calendario
        </h1>
        <Button
          onClick={() => {
            const today = new Date()
            if (today.getMonth() === month && today.getFullYear() === year) {
              openModalForDay(today.getDate())
            } else {
              openModalForDay(1)
            }
          }}
          className="bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90"
        >
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Evento
        </Button>
      </div>

      {/* Calendario */}
      <Card className="glass-card p-6">
        <div className="mb-6 flex items-center justify-between">
          <Button onClick={previousMonth} variant="ghost" size="icon" className="text-foreground hover:bg-muted">
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <h2 className="text-2xl font-bold text-foreground">{MONTHS[month]} {year}</h2>
          <Button onClick={nextMonth} variant="ghost" size="icon" className="text-foreground hover:bg-muted">
            <ChevronRight className="h-6 w-6" />
          </Button>
        </div>

        {loading ? (
          <div className="text-muted-foreground">Cargando eventos...</div>
        ) : (
          <div className="grid grid-cols-7 gap-2">
            {DAYS.map((d) => (
              <div key={d} className="py-2 text-center text-sm font-bold text-primary">{d}</div>
            ))}
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square" />
            ))}

            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1
              const dayEvents = getDayEvents(day)
              const isToday = day === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear()

              return (
                <Card
                  key={day}
                  onClick={() => openModalForDay(day)}
                  className={cn(
                    "aspect-square cursor-pointer p-2 transition-all hover:scale-105",
                    isToday
                      ? "border-transparent bg-gradient-to-br from-primary to-accent text-white shadow-lg shadow-primary/30"
                      : "glass-inner hover:bg-muted",
                  )}
                >
                  <div className="flex h-full flex-col">
                    <span className={cn("text-sm font-semibold", isToday ? "text-white" : "text-foreground")}>{day}</span>
                    {dayEvents.length > 0 && (
                      <div className="mt-1 flex flex-1 flex-col gap-1 overflow-hidden">
                        {dayEvents.map((ev) => (
                          <div key={ev.id} className="truncate rounded bg-primary px-1 py-0.5 text-[10px] font-medium text-primary-foreground">
                            {ev.evento}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </Card>

      {/* Lista de próximos eventos */}
      <Card className="glass-card p-6">
        <h3 className="mb-4 text-xl font-bold text-foreground">Próximos Eventos</h3>
        <div className="space-y-3">
          {Object.entries(events)
            .sort()
            .map(([date, list]) => (
              <div key={date} className="flex flex-col gap-3">
                <p className="font-semibold text-foreground">
                  {new Date(date).toLocaleDateString("es-ES", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
                {list.map((e) => (
                  <div
                    key={e.id}
                    className="glass-inner flex items-center justify-between rounded-lg p-3 transition-all hover:bg-muted"
                  >
                    <div>
                      <p className="text-sm font-medium text-primary">{e.evento}</p>
                      <p className="text-xs text-muted-foreground">{e.descripcion}</p>
                    </div>

                    <button
                      onClick={() => handleDeleteEvent(e.id)}
                      className="flex items-center gap-1 font-medium text-destructive transition-colors hover:opacity-80"
                    >
                      <Trash2 className="h-4 w-4" /> Eliminar
                    </button>
                  </div>
                ))}
              </div>
            ))}
        </div>
      </Card>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative z-10 w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <h3 className="mb-4 text-lg font-bold text-foreground">Nuevo evento</h3>

            <Input
              type="date"
              value={form.fecha}
              onChange={(e: any) => setForm({ ...form, fecha: e.target.value })}
              className="mb-3 border-border bg-muted/60 text-foreground"
            />
            <Input
              placeholder="Nombre del evento"
              value={form.evento}
              onChange={(e: any) => setForm({ ...form, evento: e.target.value })}
              className="mb-3 border-border bg-muted/60 text-foreground"
            />
            <Textarea
              placeholder="Descripción"
              value={form.descripcion}
              onChange={(e: any) => setForm({ ...form, descripcion: e.target.value })}
              className="border-border bg-muted/60 text-foreground"
            />

            <div className="mt-4 flex gap-3">
              <Button onClick={() => setIsModalOpen(false)} variant="ghost" className="flex-1 text-foreground hover:bg-muted">
                Cancelar
              </Button>
              <Button onClick={handleCreateEvent} className="flex-1 bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90">
                Guardar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
