import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { randomBytes } from "crypto"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const memberships = await prisma.groupMember.findMany({
    where: { userId: session.user.id },
    include: {
      group: {
        include: {
          members: {
            include: { user: { select: { id: true, name: true, image: true } } },
          },
        },
      },
    },
  })

  const groups = memberships.map((m) => ({ ...m.group, role: m.role }))
  return NextResponse.json({ groups })
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const { name } = body

  if (!name || name.trim().length < 2) {
    return NextResponse.json({ error: "Invalid name" }, { status: 400 })
  }

  const inviteCode = randomBytes(3).toString("hex").toUpperCase()

  const group = await prisma.group.create({
    data: {
      name: name.trim(),
      inviteCode,
      members: {
        create: {
          userId: session.user.id,
          role: "owner",
        },
      },
    },
  })

  return NextResponse.json({ group }, { status: 201 })
}
