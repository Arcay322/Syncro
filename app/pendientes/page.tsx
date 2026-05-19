import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { Navbar } from "@/components/navbar"
import { PendientesView } from "@/components/pendientes-view"

export default async function PendientesPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const userId = session.user.id

  // Fetch user's pending items
  const pendingItems = await prisma.watchlistItem.findMany({
    where: {
      userId,
      groupId: null,
      status: "PLAN_TO_WATCH",
    },
    orderBy: { updatedAt: "desc" },
  })

  // Find user's group
  const groupMember = await prisma.groupMember.findFirst({
    where: { userId },
    include: {
      group: {
        include: {
          members: {
            include: {
              user: {
                select: { id: true, name: true },
              },
            },
          },
        },
      },
    },
  })

  let moodMatches: any[] = []

  if (groupMember) {
    const group = groupMember.group
    const otherMembers = group.members.filter((m) => m.userId !== userId)

    if (otherMembers.length > 0) {
      const otherUserIds = otherMembers.map((m) => m.userId)

      // Find items that are PLAN_TO_WATCH for both user and other members
      const otherPendingItems = await prisma.watchlistItem.findMany({
        where: {
          userId: { in: otherUserIds },
          groupId: null,
          status: "PLAN_TO_WATCH",
        },
        include: {
          user: {
            select: { id: true, name: true },
          },
        },
      })

      // Find matches by tmdbId
      const userTmdbIds = new Set(pendingItems.map((i) => i.tmdbId))
      moodMatches = otherPendingItems.filter((item) => userTmdbIds.has(item.tmdbId))
    }
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
  })

  return (
    <>
      <Navbar user={user} />
      <main className="flex-1">
        <PendientesView
          pendingItems={pendingItems}
          moodMatches={moodMatches}
          groupName={groupMember?.group.name || null}
        />
      </main>
    </>
  )
}
