import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const userId = session.user.id

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { vibe: true },
    })

    let partnerVibe = null
    let partnerName = null

    // Check if in a group to get partner vibe
    const groupMember = await prisma.groupMember.findFirst({
      where: { userId },
      include: {
        group: {
          include: {
            members: {
              where: { userId: { not: userId } },
              include: {
                user: {
                  select: { name: true, vibe: true },
                },
              },
            },
          },
        },
      },
    })

    if (groupMember && groupMember.group.members.length > 0) {
      const partner = groupMember.group.members[0].user
      partnerVibe = partner.vibe
      partnerName = partner.name
    }

    return NextResponse.json({
      vibe: user?.vibe || null,
      partnerVibe,
      partnerName,
    })
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
  const { vibe } = body

  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        vibe: vibe || null,
        vibeUpdatedAt: vibe ? new Date() : null,
      },
    })

    return NextResponse.json({
      message: "Vibe updated successfully",
      vibe: updatedUser.vibe,
    })
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
