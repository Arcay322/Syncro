import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { Navbar } from "@/components/navbar"
import { EstadisticasView } from "@/components/estadisticas-view"

export default async function EstadisticasPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const userId = session.user.id

  const items = await prisma.watchlistItem.findMany({
    where: { userId, groupId: null },
  })

  const user = await prisma.user.findUnique({
    where: { id: userId },
  })

  // Calculate stats
  const totalItems = items.length
  const totalSeries = items.filter((i) => i.mediaType === "tv").length
  const totalMovies = items.filter((i) => i.mediaType === "movie").length
  const completedItems = items.filter((i) => i.status === "COMPLETED").length
  const watchingItems = items.filter((i) => i.status === "WATCHING").length
  const droppedItems = items.filter((i) => i.status === "DROPPED").length
  const onHoldItems = items.filter((i) => i.status === "ON_HOLD").length
  const pendingItems = items.filter((i) => i.status === "PLAN_TO_WATCH").length

  const totalEpisodes = items
    .filter((i) => i.mediaType === "tv")
    .reduce((acc, i) => acc + (i.currentEpisode || 0), 0)

  const totalMinutes = items
    .filter((i) => i.mediaType === "movie")
    .reduce((acc, i) => acc + (i.currentMinute || 0), 0)

  const estimatedHours = Math.round(totalEpisodes * 0.75 + totalMinutes / 60)

  const ratingsGiven = items.filter((i) => i.rating && i.rating > 0).length
  const avgRating = ratingsGiven > 0
    ? (items.filter((i) => i.rating && i.rating > 0).reduce((acc, i) => acc + (i.rating || 0), 0) / ratingsGiven).toFixed(1)
    : "0"

  // Status distribution for chart
  const statusDistribution = [
    { label: "Viendo", value: watchingItems, color: "#FFD65B" },
    { label: "Terminada", value: completedItems, color: "#10B981" },
    { label: "Pausa", value: onHoldItems, color: "#DEBFC3" },
    { label: "Abandonada", value: droppedItems, color: "#EF4444" },
    { label: "Pendiente", value: pendingItems, color: "#9B8E8F" },
  ].filter((s) => s.value > 0)

  // Type distribution
  const typeDistribution = [
    { label: "Series", value: totalSeries, color: "#DEBFC3" },
    { label: "Películas", value: totalMovies, color: "#FFD65B" },
  ].filter((s) => s.value > 0)

  // Top rated items
  const topRated = items
    .filter((i) => i.rating && i.rating > 0)
    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
    .slice(0, 5)

  return (
    <>
      <Navbar user={user} />
      <main className="flex-1">
        <EstadisticasView
          stats={{
            totalItems,
            totalSeries,
            totalMovies,
            completedItems,
            watchingItems,
            totalEpisodes,
            estimatedHours,
            ratingsGiven,
            avgRating,
            statusDistribution,
            typeDistribution,
            topRated,
          }}
        />
      </main>
    </>
  )
}
