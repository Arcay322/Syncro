import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { Navbar } from "@/components/navbar"
import { LibraryView } from "@/components/library-view"
import { getActiveGroupId } from "@/lib/active-group"

export default async function LibraryPage() {
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

  const items = await prisma.watchlistItem.findMany({
    where: validGroupId ? { groupId: validGroupId } : { userId, groupId: null },
    orderBy: { updatedAt: "desc" },
  })

  const user = await prisma.user.findUnique({
    where: { id: userId },
  })

  return (
    <>
      <Navbar user={user} groups={groups} activeGroupId={validGroupId} />
      <main className="flex-1">
        <LibraryView initialItems={items} groupId={validGroupId} />
      </main>
    </>
  )
}
