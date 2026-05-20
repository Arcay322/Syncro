import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function DELETE(request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const groupId = searchParams.get("groupId")

  const membership = await prisma.groupMember.findFirst({
    where: {
      userId: session.user.id,
      ...(groupId ? { groupId } : {}),
    },
    include: { group: true },
  })

  if (!membership) {
    return NextResponse.json({ error: "Not in a group" }, { status: 404 })
  }

  const isOwner = membership.role === "owner"
  const gId = membership.groupId

  await prisma.groupMember.delete({
    where: { id: membership.id },
  })

  if (isOwner) {
    const remaining = await prisma.groupMember.count({
      where: { groupId: gId },
    })
    if (remaining === 0) {
      await prisma.group.delete({
        where: { id: gId },
      })
    }
  }

  return NextResponse.json({ success: true })
}
