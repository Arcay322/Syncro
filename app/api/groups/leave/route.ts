import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function DELETE() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const membership = await prisma.groupMember.findFirst({
    where: { userId: session.user.id },
    include: { group: true },
  })

  if (!membership) {
    return NextResponse.json({ error: "Not in a group" }, { status: 404 })
  }

  const isOwner = membership.role === "owner"
  const groupId = membership.groupId

  await prisma.groupMember.delete({
    where: { id: membership.id },
  })

  if (isOwner) {
    const remaining = await prisma.groupMember.count({
      where: { groupId },
    })
    if (remaining === 0) {
      await prisma.group.delete({
        where: { id: groupId },
      })
    }
  }

  return NextResponse.json({ success: true })
}
