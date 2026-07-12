import { NextResponse } from "next/server"

export async function DELETE(req: Request) {
  const auth = req.headers.get("authorization")
  if (!auth || !auth.startsWith("Bearer ")) {
    return NextResponse.json({ mensaje: "No autorizado" }, { status: 401 })
  }

  return NextResponse.json({ mensaje: "Usuario eliminado" })
}
