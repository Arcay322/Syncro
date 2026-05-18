import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { randomBytes } from "crypto"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const member = await prisma.groupMember.findFirst({
    where: { userId: session.user.id },
    include: { group: { include: { members: { include: { user: true } } } } },
  })

  if (!member) {
    return NextResponse.json({ group: null })
  }

  return NextResponse.json({ group: member.group })
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Check if user already in a group
  const existing = await prisma.groupMember.findFirst({
    where: { userId: session.user.id },
  })
  if (existing) {
    return NextResponse.json(
      { error: "Already in a group" },
      { status: 400 }
    )
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
