import { NextResponse } from "next/server"

const records = [
  { fecha: "2025-11-04", horaDormir: "23:00", horaDespertar: "07:00", horasDormidas: 8, calidad: 4 },
  { fecha: "2025-11-03", horaDormir: "23:30", horaDespertar: "06:30", horasDormidas: 7, calidad: 3 },
  { fecha: "2025-11-02", horaDormir: "22:00", horaDespertar: "06:00", horasDormidas: 8, calidad: 5 },
]

export async function GET(req: Request) {
  const auth = req.headers.get("authorization")
  if (!auth || !auth.startsWith("Bearer ")) {
    return NextResponse.json({ mensaje: "No autorizado" }, { status: 401 })
  }

  return NextResponse.json(records)
}

export async function POST(req: Request) {
  const auth = req.headers.get("authorization")
  if (!auth || !auth.startsWith("Bearer ")) {
    return NextResponse.json({ mensaje: "No autorizado" }, { status: 401 })
  }

  const body = await req.json()
  return NextResponse.json({ ...body, id: Date.now() })
}
