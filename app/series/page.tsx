import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { Navbar } from "@/components/navbar"
import { LibraryView } from "@/components/library-view"

export default async function LibraryPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const userId = session.user.id

  const items = await prisma.watchlistItem.findMany({
    where: { userId, groupId: null },
    orderBy: { updatedAt: "desc" },
  })

  const user = await prisma.user.findUnique({
    where: { id: userId },
  })

  return (
    <>
      <Navbar user={user} />
      <main className="flex-1">
        <LibraryView initialItems={items} />
      </main>
    </>
  )
}
