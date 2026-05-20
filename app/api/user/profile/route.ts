import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const userId = session.user.id
  const body = await request.json()
  const { name, username, image } = body

  try {
    // Validate username uniqueness if changing
    if (username) {
      const trimmedUsername = username.trim().toLowerCase()
      const existingUser = await prisma.user.findFirst({
        where: {
          username: {
            equals: trimmedUsername,
            mode: "insensitive",
          },
          id: { not: userId },
        },
      })

      if (existingUser) {
        return NextResponse.json(
          { error: "El nombre de usuario ya está tomado por otro cinéfilo." },
          { status: 400 }
        )
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name: name !== undefined ? name : undefined,
        username: username !== undefined ? username.trim() : undefined,
        image: image !== undefined ? image : undefined,
      },
    })

    return NextResponse.json({
      message: "Perfil actualizado con éxito",
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        username: updatedUser.username,
        image: updatedUser.image,
      },
    })
  } catch (error) {
    return NextResponse.json({ error: "No se pudo actualizar el perfil" }, { status: 500 })
  }
}
