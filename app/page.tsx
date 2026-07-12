"use client"

import { useState } from "react"
import dynamic from "next/dynamic"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import {
  ChevronLeft,
  ChevronRight,
  CalendarIcon,
  Moon,
  CheckSquare,
  UserCircle,
  LayoutDashboard,
  Loader2,
} from "lucide-react"
import { cn } from "@/lib/utils"

// Carga diferida: solo se descarga el código de la vista activa
const ViewLoader = () => (
  <div className="flex h-full items-center justify-center py-20 text-muted-foreground">
    <Loader2 className="h-6 w-6 animate-spin" />
  </div>
)

const Dashboard = dynamic(() => import("@/components/dashboard-view").then((m) => m.Dashboard), {
  loading: ViewLoader,
})
const Calendar = dynamic(() => import("@/components/calendar-view").then((m) => m.Calendar), {
  loading: ViewLoader,
})
const Sleep = dynamic(() => import("@/components/sleep-view").then((m) => m.Sleep), {
  loading: ViewLoader,
})
const Tasks = dynamic(() => import("@/components/tasks-view").then((m) => m.Tasks), {
  loading: ViewLoader,
})
const Profile = dynamic(() => import("@/components/profile-view").then((m) => m.Profile), {
  loading: ViewLoader,
})

type View = "dashboard" | "calendar" | "sleep" | "tasks" | "profile"

const NAV_ITEMS: {
  id: View
  label: string
  icon: typeof LayoutDashboard
  gradient: string
}[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, gradient: "from-indigo-500 to-blue-500" },
  { id: "calendar", label: "Calendario", icon: CalendarIcon, gradient: "from-blue-500 to-cyan-500" },
  { id: "sleep", label: "Sueño", icon: Moon, gradient: "from-violet-500 to-indigo-500" },
  { id: "tasks", label: "Tareas", icon: CheckSquare, gradient: "from-cyan-500 to-teal-500" },
  { id: "profile", label: "Perfil", icon: UserCircle, gradient: "from-fuchsia-500 to-violet-500" },
]

export default function Home() {
  const [currentView, setCurrentView] = useState<View>("dashboard")
  const [menuOpen, setMenuOpen] = useState(true)

  return (
    <div className="app-bg flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside
        className={cn(
          "relative flex flex-col border-r border-border bg-sidebar/80 backdrop-blur-xl transition-all duration-300",
          menuOpen ? "w-64" : "w-0 overflow-hidden",
        )}
      >
        <div className="flex flex-col gap-6 p-5">
          {/* Brand */}
          <div className="flex items-center gap-3 px-1">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-lg shadow-primary/30">
              <LayoutDashboard className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold leading-none text-sidebar-foreground">MenuApp</p>
              <p className="mt-1 text-[11px] font-medium tracking-wide text-muted-foreground">Tu día, organizado</p>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex flex-col gap-1.5">
            <p className="mb-1 px-2 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
              Menú
            </p>
            {NAV_ITEMS.map(({ id, label, icon: Icon, gradient }) => {
              const active = currentView === id
              return (
                <button
                  key={id}
                  onClick={() => setCurrentView(id)}
                  className={cn(
                    "group flex h-12 items-center gap-3 rounded-xl px-3 text-sm font-semibold transition-all",
                    active
                      ? "bg-gradient-to-r text-white shadow-md " + gradient
                      : "text-sidebar-foreground hover:bg-sidebar-accent",
                  )}
                >
                  <span
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-lg transition-colors",
                      active ? "bg-white/20" : "bg-muted text-primary group-hover:bg-primary/10",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  {label}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Theme toggle pinned bottom */}
        <div className="mt-auto p-5">
          <ThemeToggle />
        </div>

        <Button
          onClick={() => setMenuOpen(false)}
          size="icon"
          className="absolute -right-3 top-6 z-50 h-8 w-8 rounded-full border border-border bg-card p-0 text-foreground shadow-md hover:bg-muted"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      </aside>

      {!menuOpen && (
        <Button
          onClick={() => setMenuOpen(true)}
          size="icon"
          className="absolute left-4 top-6 z-50 h-10 w-10 rounded-full border border-border bg-card p-0 text-foreground shadow-lg hover:bg-muted"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      )}

      {/* Main content */}
      <main className="flex-1 overflow-auto p-6 md:p-8">
        {currentView === "dashboard" && <Dashboard />}
        {currentView === "calendar" && <Calendar />}
        {currentView === "sleep" && <Sleep />}
        {currentView === "tasks" && <Tasks />}
        {currentView === "profile" && <Profile />}
      </main>
    </div>
  )
}
