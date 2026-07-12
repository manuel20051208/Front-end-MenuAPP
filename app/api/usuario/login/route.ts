import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}))
  const { email, password } = body ?? {}

  // Validación básica de campos
  if (!email || !password) {
    return NextResponse.json(
      { mensaje: "Debes ingresar correo y contraseña" },
      { status: 400 },
    )
  }

  // Mock local: cualquier credencial válida genera un token de desarrollo.
  // Aquí es donde se conectaría el backend real de autenticación.
  const token = "local-dev-token"

  return NextResponse.json({
    token,
    usuario: {
      id: 1,
      usuario: email.split("@")[0] || "localuser",
      nombre: "Usuario Local",
      email,
    },
  })
}
