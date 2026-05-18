import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const userId = session.user.id
  const { id } = await params
  const body = await request.json()

  const existing = await prisma.watchlistItem.findUnique({
    where: { id },
    include: { group: { include: { members: true } } },
  })

  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  const isOwner = existing.userId === userId
  const isGroupMember =
    existing.groupId &&
    existing.group?.members.some((m) => m.userId === userId)

  if (!isOwner && !isGroupMember) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const updated = await prisma.watchlistItem.update({
    where: { id },
    data: {
      ...body,
      updatedAt: new Date(),
    },
  })

  return NextResponse.json({ item: updated })
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const userId = session.user.id
  const { id } = await params

  const existing = await prisma.watchlistItem.findUnique({
    where: { id },
    include: { group: { include: { members: true } } },
  })

  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  const isOwner = existing.userId === userId
  const isGroupOwner =
    existing.group?.members.some(
      (m) => m.userId === userId && m.role === "owner"
    )

  if (!isOwner && !isGroupOwner) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  await prisma.watchlistItem.delete({ where: { id } })

  return NextResponse.json({ success: true })
}
