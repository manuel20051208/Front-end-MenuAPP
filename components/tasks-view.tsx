"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { getAuthHeaders, getAuthToken, resolveApiUrl } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Trash2, CheckCircle2, Circle } from "lucide-react"

interface Task {
  id: number
  descripcion: string
  completada?: boolean
}

export function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [newTask, setNewTask] = useState("")
  const token = typeof window !== "undefined" ? getAuthToken() : null

  // --- Cargar tareas desde el backend al iniciar ---
  useEffect(() => {
    const fetchTasks = async () => {
      if (!token) return
      try {
        const res = await fetch(resolveApiUrl("/api/tarea"), {
          headers: getAuthHeaders(),
        })
        if (!res.ok) throw new Error("Error al obtener tareas")
        const data = await res.json()
        setTasks(data)
      } catch (err) {
        console.error("Error cargando tareas:", err)
      }
    }
    fetchTasks()
  }, [token])

  // --- Agregar nueva tarea ---
  const addTask = async () => {
    if (!newTask.trim() || !token) return
    try {
      const res = await fetch(resolveApiUrl("/api/tarea/agregar"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ descripcion: newTask }),
      })
      if (!res.ok) {
        const txt = await res.text()
        throw new Error(txt || "Error al agregar tarea")
      }
      const nueva = await res.json()
      setTasks([...tasks, nueva])
      setNewTask("")
    } catch (err) {
      console.error("Error agregando tarea:", err)
      alert("No se pudo agregar la tarea: " + (err as Error).message)
    }
  }

  // --- Toggle completado persistente ---
  const toggleTask = async (id: number) => {
    if (!token) return
    try {
      const res = await fetch(resolveApiUrl(`/api/tarea/completar/${id}`), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
      })
      if (!res.ok) {
        const txt = await res.text()
        throw new Error(txt || "Error al actualizar tarea")
      }
      const actualizado: Task = await res.json()
      setTasks(tasks.map((t) => (t.id === id ? actualizado : t)))
    } catch (err) {
      console.error("Error actualizando tarea:", err)
      alert("No se pudo actualizar la tarea: " + (err as Error).message)
    }
  }

  // --- Eliminar tarea ---
  const deleteTask = async (id: number) => {
    if (!token) return
    try {
      const res = await fetch(resolveApiUrl(`/api/tarea/eliminar/${id}`), {
        method: "DELETE",
        headers: getAuthHeaders(),
      })
      if (!res.ok) {
        const txt = await res.text()
        throw new Error(txt || "Error al eliminar tarea")
      }
      setTasks(tasks.filter((t) => t.id !== id))
    } catch (err) {
      console.error("Error eliminando tarea:", err)
      alert("No se pudo eliminar la tarea: " + (err as Error).message)
    }
  }

  // --- Progreso visual ---
  const completedCount = tasks.filter((t) => !!t.completada).length
  const totalCount = tasks.length
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="flex items-center gap-3 text-3xl font-bold text-foreground md:text-4xl">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-teal-500 text-white shadow-lg shadow-cyan-500/30">
            <CheckCircle2 className="h-6 w-6" />
          </span>
          Tareas del Día
        </h1>
      </div>

      {/* Progress Card */}
      <Card className="border-transparent bg-gradient-to-r from-primary to-accent p-6 shadow-lg shadow-primary/20">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Progreso del Día</h3>
          <span className="text-2xl font-bold text-white">
            {completedCount}/{totalCount}
          </span>
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full bg-white/25">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-300 to-emerald-100 shadow-lg transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="mt-2 text-sm font-medium text-white/90">{Math.round(progress)}% completado</p>
      </Card>

      {/* Add New Task */}
      <Card className="glass-card p-6">
        <div className="flex gap-3">
          <Input
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.nativeEvent.isComposing && addTask()}
            placeholder="Agregar nueva tarea..."
            className="flex-1 border-border bg-muted/60 text-foreground placeholder:text-muted-foreground"
          />
          <Button onClick={addTask} className="bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90">
            <Plus className="h-5 w-5" />
          </Button>
        </div>
      </Card>

      {/* Tasks List */}
      <div className="space-y-3">
        {tasks.filter((t) => !t.completada).map((task) => (
          <Card key={task.id} className="glass-card p-4 transition-all hover:bg-muted/40">
            <div className="flex items-center gap-4">
              <button onClick={() => toggleTask(task.id)} className="flex-shrink-0 text-muted-foreground transition-colors hover:text-primary">
                <Circle className="h-6 w-6" />
              </button>
              <span className="flex-1 font-medium text-foreground">{task.descripcion}</span>
              <Button onClick={() => deleteTask(task.id)} variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10 hover:text-destructive">
                <Trash2 className="h-5 w-5" />
              </Button>
            </div>
          </Card>
        ))}

        {tasks.filter((t) => t.completada).length > 0 && (
          <>
            <h3 className="mb-3 mt-6 text-lg font-semibold text-muted-foreground">Completadas</h3>
            {tasks.filter((t) => t.completada).map((task) => (
              <Card key={task.id} className="glass-card p-4 opacity-70">
                <div className="flex items-center gap-4">
                  <button onClick={() => toggleTask(task.id)} className="flex-shrink-0 text-emerald-500">
                    <CheckCircle2 className="h-6 w-6" />
                  </button>
                  <span className="flex-1 font-medium text-muted-foreground line-through">{task.descripcion}</span>
                  <Button onClick={() => deleteTask(task.id)} variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10 hover:text-destructive">
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </div>
              </Card>
            ))}
          </>
        )}
      </div>
    </div>
  )
}
