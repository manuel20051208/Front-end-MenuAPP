"use client"

import { useState } from "react"
import { Calendar } from "@/components/calendar-view"
import { Sleep } from "@/components/sleep-view"
import { Tasks } from "@/components/tasks-view"
import { Profile } from "@/components/profile-view"
import { Dashboard } from "@/components/dashboard-view"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, CalendarIcon, Moon, CheckSquare, UserCircle, LayoutDashboard } from "lucide-react"
import { cn } from "@/lib/utils"

type View = "dashboard" | "calendar" | "sleep" | "tasks" | "profile"

export default function Home() {
  const [currentView, setCurrentView] = useState<View>("dashboard")
  const [menuOpen, setMenuOpen] = useState(true)

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      {/* Sidebar Menu */}
      <div
        className={cn(
          "relative flex flex-col bg-gray-900/95 backdrop-blur-md transition-all duration-300 shadow-2xl border-r border-gray-700/50",
          menuOpen ? "w-56" : "w-0 overflow-hidden",
        )}
      >
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xs font-bold tracking-[0.2em] text-gray-400">MENÚ</h2>
          </div>

          <Button
            onClick={() => setCurrentView("dashboard")}
            className={cn(
              "w-full h-14 justify-start px-5 text-sm font-bold rounded-xl transition-all",
              currentView === "dashboard"
                ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-900/50 hover:shadow-blue-900/70"
                : "bg-gray-800/50 text-gray-300 border border-gray-700/50 hover:bg-gray-700/50",
            )}
          >
            <LayoutDashboard className="mr-3 h-5 w-5" />
            Dashboard
          </Button>

          <Button
            onClick={() => setCurrentView("calendar")}
            className={cn(
              "w-full h-14 justify-start px-5 text-sm font-bold rounded-xl transition-all",
              currentView === "calendar"
                ? "bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg shadow-indigo-900/50 hover:shadow-indigo-900/70"
                : "bg-gray-800/50 text-gray-300 border border-gray-700/50 hover:bg-gray-700/50",
            )}
          >
            <CalendarIcon className="mr-3 h-5 w-5" />
            Calendario
          </Button>

          <Button
            onClick={() => setCurrentView("sleep")}
            className={cn(
              "w-full h-14 justify-start px-5 text-sm font-bold rounded-xl transition-all",
              currentView === "sleep"
                ? "bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg shadow-purple-900/50 hover:shadow-purple-900/70"
                : "bg-gray-800/50 text-gray-300 border border-gray-700/50 hover:bg-gray-700/50",
            )}
          >
            <Moon className="mr-3 h-5 w-5" />
            Sueño
          </Button>

          <Button
            onClick={() => setCurrentView("tasks")}
            className={cn(
              "w-full h-14 justify-start px-5 text-sm font-bold rounded-xl transition-all",
              currentView === "tasks"
                ? "bg-gradient-to-r from-teal-600 to-teal-700 text-white shadow-lg shadow-teal-900/50 hover:shadow-teal-900/70"
                : "bg-gray-800/50 text-gray-300 border border-gray-700/50 hover:bg-gray-700/50",
            )}
          >
            <CheckSquare className="mr-3 h-5 w-5" />
            Tareas
          </Button>

          <Button
            onClick={() => setCurrentView("profile")}
            className={cn(
              "w-full h-14 justify-start px-5 text-sm font-bold rounded-xl transition-all",
              currentView === "profile"
                ? "bg-gradient-to-r from-slate-600 to-slate-700 text-white shadow-lg shadow-slate-900/50 hover:shadow-slate-900/70"
                : "bg-gray-800/50 text-gray-300 border border-gray-700/50 hover:bg-gray-700/50",
            )}
          >
            <UserCircle className="mr-3 h-5 w-5" />
            Perfil
          </Button>
        </div>

        <Button
          onClick={() => setMenuOpen(!menuOpen)}
          className="absolute -right-3 top-6 z-50 h-10 w-10 rounded-full bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 text-white p-0 transition-all shadow-lg shadow-black/50 hover:shadow-black/70 border border-gray-600"
        >
          {menuOpen ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
        </Button>
      </div>

      {!menuOpen && (
        <Button
          onClick={() => setMenuOpen(true)}
          className="absolute left-3 top-6 z-50 h-10 w-10 rounded-full bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 text-white p-0 transition-all shadow-lg shadow-black/50 hover:shadow-black/70 border border-gray-600"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      )}

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-auto">
        {currentView === "dashboard" && <Dashboard />}
        {currentView === "calendar" && <Calendar />}
        {currentView === "sleep" && <Sleep />}
        {currentView === "tasks" && <Tasks />}
        {currentView === "profile" && <Profile />}
      </div>
    </div>
  )
}
