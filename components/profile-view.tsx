"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { User, Mail, UserCircle, Trash2, Save, Edit2, LogOut } from "lucide-react"
import { useRouter } from "next/navigation"

export function Profile() {
  const router = useRouter()
  const [userData, setUserData] = useState<any>(null)
  const [originalData, setOriginalData] = useState<any>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (typeof window === "undefined") return

        const params = new URLSearchParams(window.location.search)
        const tokenFromUrl = params.get("token")
        const storedToken = localStorage.getItem("token")
        const token = tokenFromUrl || storedToken

        if (tokenFromUrl) {
          localStorage.setItem("token", tokenFromUrl)
          window.history.replaceState({}, document.title, "/")
        }

        if (!token) {
          window.location.href = "http://localhost:3000"
          return
        }

        const res = await fetch("http://localhost:8080/api/usuario/me", {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (!res.ok) throw new Error("Token inválido o expirado")

        const data = await res.json()
        setUserData(data.usuario)
        setOriginalData(data.usuario)
      } catch (err) {
        console.error("Error en autenticación:", err)
        alert("Sesión no válida o expirada.")
        localStorage.removeItem("token")
        window.location.href = "http://localhost:3000"
      }
    }

    checkAuth()
  }, [router])

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) return alert("Sesión expirada.")

      const res = await fetch("http://localhost:8080/api/usuario/actualizarDatos", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id: userData.id,
          usuario: userData.usuario,
          nombre: userData.nombre,
          email: userData.email,
        }),
      })

      if (!res.ok) {
        const text = await res.text()
        console.error("Error PUT:", res.status, text)
        throw new Error("Error al actualizar usuario")
      }

      const data = await res.json()
      setUserData(data.usuario)
      setOriginalData(data.usuario)
      alert("✅ Datos actualizados correctamente")
      setIsEditing(false)
    } catch (err) {
      console.error(err)
      alert("❌ No se pudo actualizar el usuario.")
    }
  }

  const handleDelete = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/usuario/eliminar/${userData.email}`, {
        method: "DELETE",
      })

      if (response.ok) {
        alert("Usuario eliminado correctamente")
        localStorage.removeItem("token")
        setUserData(null)
        setShowDeleteConfirm(false)
        window.location.href = "http://localhost:3000"
      } else {
        const errorData = await response.json()
        alert(`Error: ${errorData.mensaje}`)
      }
    } catch (err) {
      console.error(err)
      alert("No se pudo conectar con el servidor")
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    alert("👋 Sesión cerrada correctamente")
    window.location.href = "http://localhost:3000"
  }

  if (!userData || !userData.nombre) {
    return <p className="text-center text-white mt-10">Cargando perfil...</p>
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold text-white flex items-center gap-3">
          <UserCircle className="h-12 w-12 text-purple-600" />
          Mi Perfil
        </h1>
        {!isEditing && (
          <Button
            onClick={() => setIsEditing(true)}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg shadow-purple-500/50 hover:shadow-purple-500/70 transition-all"
          >
            <Edit2 className="mr-2 h-4 w-4" />
            Editar Perfil
          </Button>
        )}
      </div>

      {/* Avatar */}
      <Card className="bg-white/10 border-white/20 p-8 shadow-lg rounded-2xl">
        <div className="flex flex-col items-center gap-4">
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-2xl shadow-purple-500/50 ring-4 ring-white/20">
            <UserCircle className="w-20 h-20 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white">{userData?.nombre}</h2>
          <p className="text-white/70 font-medium">@{userData?.usuario}</p>
        </div>
      </Card>

      {/* Formulario */}
      <Card className="bg-white/10 border-white/20 p-8 shadow-lg rounded-2xl">
        <h3 className="text-2xl font-bold text-white mb-6">Información Personal</h3>
        <div className="space-y-6">
          {/* Usuario */}
          <div className="space-y-2">
            <Label htmlFor="usuario" className="text-white flex items-center gap-2">
              <User className="h-4 w-4 text-purple-400" /> Usuario
            </Label>
            <Input
              id="usuario"
              value={userData.usuario}
              onChange={(e) => setUserData({ ...userData, usuario: e.target.value })}
              disabled={!isEditing}
              className="bg-white/5 border-white/20 text-white placeholder:text-white/40 disabled:opacity-60 h-12 text-lg"
            />
          </div>

          {/* Nombre */}
          <div className="space-y-2">
            <Label htmlFor="nombre" className="text-white flex items-center gap-2">
              <UserCircle className="h-4 w-4 text-purple-400" /> Nombre Completo
            </Label>
            <Input
              id="nombre"
              value={userData.nombre}
              onChange={(e) => setUserData({ ...userData, nombre: e.target.value })}
              disabled={!isEditing}
              className="bg-white/5 border-white/20 text-white placeholder:text-white/40 disabled:opacity-60 h-12 text-lg"
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-white flex items-center gap-2">
              <Mail className="h-4 w-4 text-purple-400" /> Correo Electrónico
            </Label>
            <Input
              id="email"
              type="email"
              value={userData.email}
              onChange={(e) => setUserData({ ...userData, email: e.target.value })}
              disabled={!isEditing}
              className="bg-white/5 border-white/20 text-white placeholder:text-white/40 disabled:opacity-60 h-12 text-lg"
            />
          </div>

          {isEditing && (
            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleSave}
                className="flex-1 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 h-12 text-lg font-semibold shadow-lg shadow-emerald-500/50 hover:shadow-emerald-500/70 transition-all"
              >
                <Save className="mr-2 h-5 w-5" /> Guardar Cambios
              </Button>
              <Button
                onClick={() => {
                  setUserData(originalData)
                  setIsEditing(false)
                }}
                className="flex-1 bg-white/10 hover:bg-white/20 border border-white/20 text-white h-12 text-lg font-semibold shadow-lg transition-all"
              >
                Cancelar
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Cerrar Sesión */}
      <Card className="bg-white/10 border-white/20 p-8 shadow-lg rounded-2xl">
        <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
          <LogOut className="h-6 w-6 text-blue-400" /> Sesión
        </h3>
        <p className="text-white/70 mb-6 font-medium">
          Puedes cerrar tu sesión cuando quieras. Tu token será eliminado del navegador.
        </p>
        <Button
          onClick={handleLogout}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white h-12 px-8 font-semibold shadow-lg shadow-blue-500/40 transition-all border border-blue-400/30"
        >
          Cerrar Sesión
        </Button>
      </Card>

      {/* Zona Peligrosa */}
      <Card className="bg-white/10 border-white/20 p-8 shadow-lg rounded-2xl">
        <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
          <Trash2 className="h-6 w-6 text-red-500" /> Zona Peligrosa
        </h3>
        <p className="text-red-400 mb-6 font-medium">
          Una vez que elimines tu cuenta, no hay vuelta atrás. Ten cuidado.
        </p>

        {!showDeleteConfirm ? (
          <Button
            onClick={() => setShowDeleteConfirm(true)}
            className="bg-red-600 hover:bg-red-700 text-white h-12 px-8 font-semibold shadow-lg shadow-red-500/50 transition-all border border-red-400/30"
          >
            <Trash2 className="mr-2 h-5 w-5" /> Eliminar Cuenta
          </Button>
        ) : (
          <div className="space-y-4">
            <div className="bg-red-500/10 border-2 border-red-400/30 rounded-lg p-4">
              <p className="text-white font-semibold mb-2">¿Estás seguro?</p>
              <p className="text-red-300 text-sm">
                Esto eliminará permanentemente tu cuenta y todos tus datos.
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={handleDelete}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white h-12 font-semibold shadow-lg shadow-red-500/50 border border-red-400/30 transition-all"
              >
                Sí, eliminar mi cuenta
              </Button>
              <Button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 bg-white/10 hover:bg-white/20 border border-white/20 text-white h-12 font-semibold shadow-lg transition-all"
              >
                Cancelar
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}