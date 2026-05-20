import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

const PENANCES = [
  "Hacer un masaje de pies de 15 minutos en el próximo visionado 💆‍♂️.",
  "Preparar el desayuno y llevarlo a la cama este fin de semana ☕🥞.",
  "Lavar todos los platos de la cena del siguiente maratón 🍽️🧼.",
  "Comprar su chocolate o postre favorito antes del próximo episodio 🍫🍰.",
  "Darle el control absoluto del mando de la tele durante 3 días 📺👑.",
  "Cocinar una cena temática inspirada en su película favorita 🍕🎬.",
  "Comprar las palomitas gigantes y bebidas en el próximo cine 🍿🥤.",
  "Hacer 15 flexiones de pecho gritando '¡Soy un traidor del sofá!' 🏋️‍♂️💀.",
  "Comprar una ronda de helados en vuestra heladería favorita 🍦🍨.",
  "Tener que rascarle la espalda a tu pareja cada vez que diga 'traidor/a' durante 24 horas 👉👈."
]

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const userId = session.user.id

  try {
    const groupMember = await prisma.groupMember.findFirst({
      where: { userId },
    })

    if (!groupMember) {
      return NextResponse.json({ crimes: [] })
    }

    const crimes = await prisma.crime.findMany({
      where: { groupId: groupMember.groupId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ crimes })
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const userId = session.user.id
  const body = await request.json()
  const { tmdbId, title, season, episode } = body

  if (!tmdbId || !title || season === undefined || episode === undefined) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  try {
    const groupMember = await prisma.groupMember.findFirst({
      where: { userId },
    })

    if (!groupMember) {
      return NextResponse.json(
        { error: "Debes estar en un cineclub/grupo para registrar un delito." },
        { status: 400 }
      )
    }

    const randomPenance = PENANCES[Math.floor(Math.random() * PENANCES.length)]

    const crime = await prisma.crime.create({
      data: {
        groupId: groupMember.groupId,
        userId,
        tmdbId,
        title,
        season,
        episode,
        penance: randomPenance,
      },
    })

    return NextResponse.json({ crime }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "No se pudo registrar el delito" }, { status: 500 })
  }
}
