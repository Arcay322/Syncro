import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { Navbar } from "@/components/navbar"
import { PendientesView } from "@/components/pendientes-view"
import { getActiveGroupId } from "@/lib/active-group"

export default async function PendientesPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const userId = session.user.id

  const memberships = await prisma.groupMember.findMany({
    where: { userId },
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
  const activeGroupId = await getActiveGroupId()
  const validGroupId = groups.find((g) => g.id === activeGroupId)?.id ?? null

  // Fetch pending items for the active context
  const pendingItems = await prisma.watchlistItem.findMany({
    where: validGroupId
      ? { groupId: validGroupId, status: "PLAN_TO_WATCH" }
      : { userId, groupId: null, status: "PLAN_TO_WATCH" },
    orderBy: { updatedAt: "desc" },
  })

  let moodMatches: any[] = []

  // Mood matches: compare personal pending lists across group members
  if (!validGroupId && memberships.length > 0) {
    const firstGroup = memberships[0]?.group
    if (firstGroup) {
      const otherMembers = firstGroup.members.filter((m) => m.user.id !== userId)
      if (otherMembers.length > 0) {
        const otherUserIds = otherMembers.map((m) => m.user.id)
        const otherPendingItems = await prisma.watchlistItem.findMany({
          where: {
            userId: { in: otherUserIds },
            groupId: null,
            status: "PLAN_TO_WATCH",
          },
          include: {
            user: { select: { id: true, name: true } },
          },
        })
        const userTmdbIds = new Set(pendingItems.map((i) => i.tmdbId))
        moodMatches = otherPendingItems.filter((item) => userTmdbIds.has(item.tmdbId))
      }
    }
  }

  const user = await prisma.user.findUnique({ where: { id: userId } })

  const activeGroup = groups.find((g) => g.id === validGroupId) ?? null

  return (
    <>
      <Navbar user={user} groups={groups} activeGroupId={validGroupId} />
      <main className="flex-1">
        <PendientesView
          pendingItems={pendingItems}
          moodMatches={moodMatches}
          groupName={activeGroup?.name ?? null}
        />
      </main>
    </>
  )
}
