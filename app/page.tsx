import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Dashboard } from "@/components/dashboard"
import { Navbar } from "@/components/navbar"

export default async function Home() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/login")
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  })

  const groupMember = await prisma.groupMember.findFirst({
    where: { userId: session.user.id },
    include: { group: true },
  })

  const personalItems = await prisma.watchlistItem.findMany({
    where: { userId: session.user.id, groupId: null },
    orderBy: { updatedAt: "desc" },
  })

  return (
    <>
      <Navbar user={user} />
      <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 xl:px-12 py-6">
        <Dashboard
          initialItems={personalItems}
          group={groupMember?.group || null}
          userId={session.user.id}
        />
      </main>
    </>
  )
}
