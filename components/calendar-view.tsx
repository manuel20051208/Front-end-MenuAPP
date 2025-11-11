"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ChevronLeft, ChevronRight, Plus, CalendarIcon, Trash2 } from "lucide-react"

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
    const params = new URLSearchParams(window.location.search)
    const tokenFromUrl = params.get("token")
    if (tokenFromUrl) {
      localStorage.setItem("token", tokenFromUrl)
      window.history.replaceState({}, "", window.location.pathname)
    }

    const storedToken = localStorage.getItem("token")
    setToken(storedToken)

    if (storedToken) {
      fetchEventos(storedToken)
    } else {
      alert("⚠️ Debes iniciar sesión nuevamente.")
      window.location.href = "http://localhost:3000/login"
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
    const res = await fetch(`https://api-usuario-tj78.onrender.com/eventos/usuario`, {
      headers: { Authorization: `Bearer ${token}` },
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
      const res = await fetch("https://api-usuario-tj78.onrender.com/eventos/crear", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
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
      const res = await fetch(`https://api-usuario-tj78.onrender.com/eventos/eliminar/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
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
        <h1 className="text-4xl font-bold text-white flex items-center gap-3">
          <CalendarIcon className="h-12 w-12 text-purple-400" />
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
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
        >
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Evento
        </Button>
      </div>

      {/* Calendario */}
      <Card className="bg-white/10 backdrop-blur-md border-white/20 p-6">
        <div className="flex items-center justify-between mb-6">
          <Button onClick={previousMonth} variant="ghost" size="icon" className="text-white hover:bg-white/10">
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <h2 className="text-2xl font-bold text-white">{MONTHS[month]} {year}</h2>
          <Button onClick={nextMonth} variant="ghost" size="icon" className="text-white hover:bg-white/10">
            <ChevronRight className="h-6 w-6" />
          </Button>
        </div>

        {loading ? (
          <div className="text-white">Cargando eventos...</div>
        ) : (
          <div className="grid grid-cols-7 gap-2">
            {DAYS.map((d) => (
              <div key={d} className="text-center text-sm font-bold text-purple-300 py-2">{d}</div>
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
                    "aspect-square p-2 cursor-pointer transition-all hover:scale-105",
                    isToday
                      ? "bg-gradient-to-br from-purple-600 to-blue-600 border-purple-400/40 shadow-lg shadow-purple-500/30"
                      : "bg-white/5 border-white/10 hover:bg-white/10",
                  )}
                >
                  <div className="flex flex-col h-full">
                    <span className="text-white font-semibold text-sm">{day}</span>
                    {dayEvents.length > 0 && (
                      <div className="mt-1 flex-1 flex flex-col gap-1 overflow-hidden">
                        {dayEvents.map((ev) => (
                          <div key={ev.id} className="text-[10px] bg-blue-600 rounded px-1 py-0.5 text-white truncate font-medium">
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
      <Card className="bg-white/10 backdrop-blur-md border-white/20 p-6">
        <h3 className="text-xl font-bold text-white mb-4">Próximos Eventos</h3>
        <div className="space-y-3">
          {Object.entries(events)
            .sort()
            .map(([date, list]) => (
              <div key={date} className="flex flex-col gap-3">
                <p className="text-white font-semibold">
                  {new Date(date).toLocaleDateString("es-ES", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
                {list.map((e) => (
                  <div
                    key={e.id}
                    className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-all"
                  >
                    <div>
                      <p className="text-purple-300 text-sm font-medium">{e.evento}</p>
                      <p className="text-slate-400 text-xs">{e.descripcion}</p>
                    </div>

                    <button
                      onClick={() => handleDeleteEvent(e.id)}
                      className="text-red-400 hover:text-red-500 transition-colors flex items-center gap-1 font-medium"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-gray-900 rounded-2xl p-6 w-full max-w-md z-10 shadow-xl border border-purple-600/40">
            <h3 className="text-lg text-white font-bold mb-4">Nuevo evento</h3>

            <Input
              type="date"
              value={form.fecha}
              onChange={(e: any) => setForm({ ...form, fecha: e.target.value })}
              className="mb-3 text-white bg-white/10 border-white/20"
            />
            <Input
              placeholder="Nombre del evento"
              value={form.evento}
              onChange={(e: any) => setForm({ ...form, evento: e.target.value })}
              className="mb-3 text-white bg-white/10 border-white/20"
            />
            <Textarea
              placeholder="Descripción"
              value={form.descripcion}
              onChange={(e: any) => setForm({ ...form, descripcion: e.target.value })}
              className="text-white bg-white/10 border-white/20"
            />

            <div className="mt-4 flex gap-3">
              <Button onClick={() => setIsModalOpen(false)} variant="ghost" className="flex-1 text-white hover:bg-white/10">
                Cancelar
              </Button>
              <Button onClick={handleCreateEvent} className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                Guardar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ")
}
