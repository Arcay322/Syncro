import { notFound, redirect } from "next/navigation"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { getTmdbDetails } from "@/lib/tmdb"
import { DetailView } from "@/components/detail-view"
import { Navbar } from "@/components/navbar"

export default async function DetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const userId = session.user.id
  const { id } = await params

  const item = await prisma.watchlistItem.findUnique({
    where: { id },
    include: { group: { include: { members: true } } },
  })

  if (!item) notFound()

  const isOwner = item.userId === userId
  const isGroupMember =
    item.groupId && item.group?.members.some((m) => m.userId === userId)

  if (!isOwner && !isGroupMember) {
    redirect("/")
  }

  const tmdbDetails = await getTmdbDetails(
    item.tmdbId,
    item.mediaType as "movie" | "tv"
  )

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  })

  return (
    <>
      <Navbar user={user} />
      <main className="flex-1 w-full px-6 lg:px-12 xl:px-16 py-8">
        <DetailView item={item} tmdbDetails={tmdbDetails} />
      </main>
    </>
  )
}
