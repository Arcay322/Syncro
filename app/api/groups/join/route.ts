import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const { inviteCode } = body

  if (!inviteCode || inviteCode.length !== 6) {
    return NextResponse.json({ error: "Invalid code" }, { status: 400 })
  }

  // Check if user already in a group
  const existingMembership = await prisma.groupMember.findFirst({
    where: { userId: session.user.id },
  })
  if (existingMembership) {
    return NextResponse.json(
      { error: "Already in a group" },
      { status: 400 }
    )
  }

  const group = await prisma.group.findUnique({
    where: { inviteCode: inviteCode.toUpperCase() },
  })

  if (!group) {
    return NextResponse.json({ error: "Group not found" }, { status: 404 })
  }

  await prisma.groupMember.create({
    data: {
      groupId: group.id,
      userId: session.user.id,
      role: "member",
    },
  })

  return NextResponse.json({ group }, { status: 200 })
}
