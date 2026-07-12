import { NextResponse } from "next/server"

const tasks = [
  { id: 1, descripcion: "Revisar diseño", completada: false },
  { id: 2, descripcion: "Actualizar notas", completada: true },
]

export async function GET(req: Request) {
  const auth = req.headers.get("authorization")
  if (!auth || !auth.startsWith("Bearer ")) {
    return NextResponse.json({ mensaje: "No autorizado" }, { status: 401 })
  }

  return NextResponse.json(tasks)
}

export async function POST(req: Request) {
  const auth = req.headers.get("authorization")
  if (!auth || !auth.startsWith("Bearer ")) {
    return NextResponse.json({ mensaje: "No autorizado" }, { status: 401 })
  }

  const body = await req.json()
  return NextResponse.json({ id: Date.now(), descripcion: body.descripcion, completada: false })
}
