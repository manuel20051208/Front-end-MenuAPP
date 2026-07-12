"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { getAuthHeaders, getAuthToken, redirectToLogin, resolveApiUrl } from "@/lib/api"
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

      const token = getAuthToken()

      // Validar token antes del fetch
      if (!token || token === "null") {
        alert("Sesión no válida o expirada.")
        redirectToLogin()
        return
      }

      // Petición al backend
      const res = await fetch(resolveApiUrl("/api/usuario/me"), {
        headers: getAuthHeaders(),
      })

      if (!res.ok) throw new Error("Token inválido o expirado")

      const data = await res.json()

      // Solo setear userData si el backend devuelve algo
      if (data && data.usuario) {
        setUserData(data.usuario)
        setOriginalData(data.usuario)
      } else {
        throw new Error("No se pudo cargar el usuario")
      }
    } catch (err) {
      console.error("Error en autenticación:", err)
      alert("Sesión no válida o expirada.")
      localStorage.removeItem("token")
      redirectToLogin()
    }
  }

  checkAuth()
}, [router])


  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) return alert("Sesión expirada.")

      const res = await fetch(resolveApiUrl("/api/usuario/actualizarDatos"), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
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
      alert("Datos actualizados correctamente")
      setIsEditing(false)
    } catch (err) {
      console.error(err)
      alert("No se pudo actualizar el usuario.")
    }
  }

  const handleDelete = async () => {
    try {
      const response = await fetch(resolveApiUrl(`/api/usuario/eliminar/${userData.email}`), {
        method: "DELETE",
        headers: getAuthHeaders(),
      })

      if (response.ok) {
        alert("Usuario eliminado correctamente")
        localStorage.removeItem("token")
        setUserData(null)
        setShowDeleteConfirm(false)
        window.location.href = "https://front-end-loggin.vercel.app/"
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
    alert("Sesión cerrada correctamente")
    redirectToLogin()
  }

  if (!userData || !userData.nombre) {
    return <p className="mt-10 text-center text-muted-foreground">Cargando perfil...</p>
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="flex items-center gap-3 text-3xl font-bold text-foreground md:text-4xl">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-fuchsia-500 to-violet-500 text-white shadow-lg shadow-fuchsia-500/30">
            <UserCircle className="h-6 w-6" />
          </span>
          Mi Perfil
        </h1>
        {!isEditing && (
          <Button
            onClick={() => setIsEditing(true)}
            className="bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-lg shadow-primary/30 transition-all hover:opacity-90"
          >
            <Edit2 className="mr-2 h-4 w-4" />
            Editar Perfil
          </Button>
        )}
      </div>

      {/* Avatar */}
      <Card className="glass-card rounded-2xl p-8">
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent shadow-2xl shadow-primary/40 ring-4 ring-border">
            <UserCircle className="h-20 w-20 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">{userData?.nombre}</h2>
          <p className="font-medium text-muted-foreground">@{userData?.usuario}</p>
        </div>
      </Card>

      {/* Formulario */}
      <Card className="glass-card rounded-2xl p-8">
        <h3 className="mb-6 text-2xl font-bold text-foreground">Información Personal</h3>
        <div className="space-y-6">
          {/* Usuario */}
          <div className="space-y-2">
            <Label htmlFor="usuario" className="flex items-center gap-2 text-foreground">
              <User className="h-4 w-4 text-primary" /> Usuario
            </Label>
            <Input
              id="usuario"
              value={userData.usuario}
              onChange={(e) => setUserData({ ...userData, usuario: e.target.value })}
              disabled={!isEditing}
              className="h-12 border-border bg-muted/60 text-lg text-foreground placeholder:text-muted-foreground disabled:opacity-60"
            />
          </div>

          {/* Nombre */}
          <div className="space-y-2">
            <Label htmlFor="nombre" className="flex items-center gap-2 text-foreground">
              <UserCircle className="h-4 w-4 text-primary" /> Nombre Completo
            </Label>
            <Input
              id="nombre"
              value={userData.nombre}
              onChange={(e) => setUserData({ ...userData, nombre: e.target.value })}
              disabled={!isEditing}
              className="h-12 border-border bg-muted/60 text-lg text-foreground placeholder:text-muted-foreground disabled:opacity-60"
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2 text-foreground">
              <Mail className="h-4 w-4 text-primary" /> Correo Electrónico
            </Label>
            <Input
              id="email"
              type="email"
              value={userData.email}
              onChange={(e) => setUserData({ ...userData, email: e.target.value })}
              disabled={!isEditing}
              className="h-12 border-border bg-muted/60 text-lg text-foreground placeholder:text-muted-foreground disabled:opacity-60"
            />
          </div>

          {isEditing && (
            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleSave}
                className="h-12 flex-1 bg-gradient-to-r from-emerald-600 to-green-600 text-lg font-semibold text-white shadow-lg shadow-emerald-500/30 transition-all hover:opacity-90"
              >
                <Save className="mr-2 h-5 w-5" /> Guardar Cambios
              </Button>
              <Button
                onClick={() => {
                  setUserData(originalData)
                  setIsEditing(false)
                }}
                variant="outline"
                className="h-12 flex-1 border-border bg-muted/60 text-lg font-semibold text-foreground transition-all hover:bg-muted"
              >
                Cancelar
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Cerrar Sesión */}
      <Card className="glass-card rounded-2xl p-8">
        <h3 className="mb-4 flex items-center gap-2 text-2xl font-bold text-foreground">
          <LogOut className="h-6 w-6 text-primary" /> Sesión
        </h3>
        <p className="mb-6 font-medium text-muted-foreground">
          Puedes cerrar tu sesión cuando quieras. Tu token será eliminado del navegador.
        </p>
        <Button
          onClick={handleLogout}
          className="h-12 bg-gradient-to-r from-primary to-accent px-8 font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition-all hover:opacity-90"
        >
          Cerrar Sesión
        </Button>
      </Card>

      {/* Zona Peligrosa */}
      <Card className="rounded-2xl border-destructive/30 bg-destructive/5 p-8 shadow-lg backdrop-blur-xl">
        <h3 className="mb-4 flex items-center gap-2 text-2xl font-bold text-foreground">
          <Trash2 className="h-6 w-6 text-destructive" /> Zona Peligrosa
        </h3>
        <p className="mb-6 font-medium text-destructive">
          Una vez que elimines tu cuenta, no hay vuelta atrás. Ten cuidado.
        </p>

        {!showDeleteConfirm ? (
          <Button
            onClick={() => setShowDeleteConfirm(true)}
            className="h-12 bg-destructive px-8 font-semibold text-destructive-foreground shadow-lg shadow-destructive/30 transition-all hover:opacity-90"
          >
            <Trash2 className="mr-2 h-5 w-5" /> Eliminar Cuenta
          </Button>
        ) : (
          <div className="space-y-4">
            <div className="rounded-lg border-2 border-destructive/30 bg-destructive/10 p-4">
              <p className="mb-2 font-semibold text-foreground">¿Estás seguro?</p>
              <p className="text-sm text-destructive">
                Esto eliminará permanentemente tu cuenta y todos tus datos.
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={handleDelete}
                className="h-12 flex-1 bg-destructive font-semibold text-destructive-foreground shadow-lg shadow-destructive/30 transition-all hover:opacity-90"
              >
                Sí, eliminar mi cuenta
              </Button>
              <Button
                onClick={() => setShowDeleteConfirm(false)}
                variant="outline"
                className="h-12 flex-1 border-border bg-muted/60 font-semibold text-foreground transition-all hover:bg-muted"
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
