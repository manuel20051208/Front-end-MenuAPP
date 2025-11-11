"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
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
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null

  // --- Cargar tareas desde el backend al iniciar ---
  useEffect(() => {
    const fetchTasks = async () => {
      if (!token) return
      try {
        const res = await fetch("https://api-usuario-tj78.onrender.com/api/tarea", {
          headers: { Authorization: `Bearer ${token}` },
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
      const res = await fetch("https://api-usuario-tj78.onrender.com/api/tarea/agregar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
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
      const res = await fetch(`https://api-usuario-tj78.onrender.com/api/tarea/completar/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
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
      const res = await fetch(`https://api-usuario-tj78.onrender.com/api/tarea/eliminar/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
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
        <h1 className="text-4xl font-bold text-white flex items-center gap-3">
          <CheckCircle2 className="h-12 w-12 text-green-400" />
          Tareas del Día
        </h1>
      </div>

      {/* Progress Card */}
      <Card className="bg-gradient-to-r from-purple-600 to-blue-600 border-purple-400/30 p-6 shadow-lg shadow-purple-500/30">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-white">Progreso del Día</h3>
          <span className="text-2xl font-bold text-white">
            {completedCount}/{totalCount}
          </span>
        </div>
        <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
          <div
            className="bg-gradient-to-r from-green-400 to-emerald-400 h-full transition-all duration-500 rounded-full shadow-lg"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-sm text-white/90 mt-2 font-medium">{Math.round(progress)}% completado</p>
      </Card>

      {/* Add New Task */}
      <Card className="bg-white/10 backdrop-blur-md border-white/20 p-6">
        <div className="flex gap-3">
          <Input
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addTask()}
            placeholder="Agregar nueva tarea..."
            className="flex-1 bg-white/5 border-white/20 text-white placeholder:text-white/40"
          />
          <Button onClick={addTask} className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
            <Plus className="h-5 w-5" />
          </Button>
        </div>
      </Card>

      {/* Tasks List */}
      <div className="space-y-3">
        {tasks.filter((t) => !t.completada).map((task) => (
          <Card key={task.id} className="bg-white/10 backdrop-blur-md border-white/20 p-4 hover:bg-white/15 transition-all">
            <div className="flex items-center gap-4">
              <button onClick={() => toggleTask(task.id)} className="flex-shrink-0 text-white/60 hover:text-white transition-colors">
                <Circle className="h-6 w-6" />
              </button>
              <span className="flex-1 text-white font-medium">{task.descripcion}</span>
              <Button onClick={() => deleteTask(task.id)} variant="ghost" size="icon" className="text-red-400 hover:text-red-300 hover:bg-red-500/10">
                <Trash2 className="h-5 w-5" />
              </Button>
            </div>
          </Card>
        ))}

        {tasks.filter((t) => t.completada).length > 0 && (
          <>
            <h3 className="text-lg font-semibold text-white/60 mt-6 mb-3">Completadas</h3>
            {tasks.filter((t) => t.completada).map((task) => (
              <Card key={task.id} className="bg-white/5 backdrop-blur-md border-white/10 p-4 opacity-60">
                <div className="flex items-center gap-4">
                  <button onClick={() => toggleTask(task.id)} className="flex-shrink-0 text-green-400">
                    <CheckCircle2 className="h-6 w-6" />
                  </button>
                  <span className="flex-1 text-white/60 font-medium line-through">{task.descripcion}</span>
                  <Button onClick={() => deleteTask(task.id)} variant="ghost" size="icon" className="text-red-400 hover:text-red-300 hover:bg-red-500/10">
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
