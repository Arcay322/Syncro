import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Dashboard } from "@/components/dashboard"
import { Navbar } from "@/components/navbar"
import { getActiveGroupId } from "@/lib/active-group"

export default async function Home() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/login")
  }

  const userId = session.user.id

  const user = await prisma.user.findUnique({
    where: { id: userId },
  })

  // Fetch all groups the user belongs to
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

  // Active group from cookie
  const activeGroupId = await getActiveGroupId()
  // Validate: only use cookie value if user is actually a member of that group
  const validGroupId = groups.find((g) => g.id === activeGroupId)?.id ?? null

  // Fetch items for the active context (personal or group)
  const items = await prisma.watchlistItem.findMany({
    where: validGroupId
      ? { groupId: validGroupId }
      : { userId, groupId: null },
    orderBy: { updatedAt: "desc" },
  })

  return (
    <>
      <Navbar user={user} groups={groups} activeGroupId={validGroupId} />
      <main className="flex-1 w-full">
        <Dashboard
          initialItems={items}
          groups={groups}
          activeGroupId={validGroupId}
          userId={userId}
        />
      </main>
    </>
  )
}
