import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { Navbar } from "@/components/navbar"
import { PerfilView } from "@/components/perfil-view"
import { getActiveGroupId } from "@/lib/active-group"

export default async function PerfilPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      username: true,
      image: true,
    },
  })

  if (!user) redirect("/login")

  // Count stats for display
  const totalItems = await prisma.watchlistItem.count({
    where: { userId: user.id, groupId: null },
  })

  const completedItems = await prisma.watchlistItem.count({
    where: { userId: user.id, groupId: null, status: "COMPLETED" },
  })

  const memberships = await prisma.groupMember.findMany({
    where: { userId: user.id },
    include: {
      group: {
        include: {
          members: { include: { user: { select: { id: true, name: true, image: true } } } },
        },
      },
    },
  })
  const groups = memberships.map((m) => ({ ...m.group, role: m.role }))
  const activeGroupId = await getActiveGroupId()
  const validGroupId = groups.find((g) => g.id === activeGroupId)?.id ?? null

  const firstGroup = memberships[0]?.group ?? null

  return (
    <>
      <Navbar user={user} groups={groups} activeGroupId={validGroupId} />
      <main className="flex-1">
        <PerfilView
          user={user}
          stats={{ totalItems, completedItems }}
          groupName={firstGroup?.name || null}
        />
      </main>
    </>
  )
}
