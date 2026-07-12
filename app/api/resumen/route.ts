import { NextResponse } from "next/server"

export async function GET(req: Request) {
  const auth = req.headers.get("authorization")
  if (!auth || !auth.startsWith("Bearer ")) {
    return NextResponse.json({ mensaje: "No autorizado" }, { status: 401 })
  }

  return NextResponse.json({
    nombre: "Usuario Local",
    tareas_completadas: 2,
    tareas_pendientes: 1,
    tareas_totales: 3,
    progreso_tareas: 66,
    registros_sueno: [
      { fecha: "2025-11-04", horas: 8, calidad: 4 },
      { fecha: "2025-11-03", horas: 7, calidad: 3 },
      { fecha: "2025-11-02", horas: 8, calidad: 5 },
    ],
  })
}
