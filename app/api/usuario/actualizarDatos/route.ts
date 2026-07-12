import { NextResponse } from "next/server"

export async function PUT(req: Request) {
  const auth = req.headers.get("authorization")
  if (!auth || !auth.startsWith("Bearer ")) {
    return NextResponse.json({ mensaje: "No autorizado" }, { status: 401 })
  }

  const body = await req.json()
  return NextResponse.json({
    usuario: {
      ...body,
      id: body.id || 1,
    },
  })
}
