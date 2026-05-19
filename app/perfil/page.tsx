import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { Navbar } from "@/components/navbar"
import { PerfilView } from "@/components/perfil-view"

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

  const groupMember = await prisma.groupMember.findFirst({
    where: { userId: user.id },
    include: { group: true },
  })

  return (
    <>
      <Navbar user={user} />
      <main className="flex-1">
        <PerfilView
          user={user}
          stats={{ totalItems, completedItems }}
          groupName={groupMember?.group.name || null}
        />
      </main>
    </>
  )
}
