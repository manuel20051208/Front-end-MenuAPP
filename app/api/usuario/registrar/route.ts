import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}))
  const { nombre, usuario, email, password } = body ?? {}

  // Validación básica de campos
  if (!nombre || !usuario || !email || !password) {
    return NextResponse.json(
      { mensaje: "Todos los campos son obligatorios" },
      { status: 400 },
    )
  }

  // Mock local: registra al usuario y devuelve un token de desarrollo.
  // Aquí es donde se conectaría el backend real de registro.
  const token = "local-dev-token"

  return NextResponse.json({
    token,
    usuario: {
      id: 1,
      usuario,
      nombre,
      email,
    },
  })
}
