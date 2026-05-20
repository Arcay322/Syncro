import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { Navbar } from "@/components/navbar"
import { EstadisticasView } from "@/components/estadisticas-view"
import { getActiveGroupId } from "@/lib/active-group"

export default async function EstadisticasPage() {
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

  const whereClause = validGroupId
    ? { groupId: validGroupId }
    : { userId, groupId: null }

  const items = await prisma.watchlistItem.findMany({ where: whereClause })
  const user = await prisma.user.findUnique({ where: { id: userId } })

  // ── Base stats ──
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
  const avgRating =
    ratingsGiven > 0
      ? (
          items
            .filter((i) => i.rating && i.rating > 0)
            .reduce((acc, i) => acc + (i.rating || 0), 0) / ratingsGiven
        ).toFixed(1)
      : "0"

  // ── Status distribution ──
  const statusDistribution = [
    { label: "Viendo", value: watchingItems, color: "#FFD65B" },
    { label: "Terminada", value: completedItems, color: "#10B981" },
    { label: "Pausa", value: onHoldItems, color: "#DEBFC3" },
    { label: "Abandonada", value: droppedItems, color: "#EF4444" },
    { label: "Pendiente", value: pendingItems, color: "#9B8E8F" },
  ].filter((s) => s.value > 0)

  // ── Type distribution ──
  const typeDistribution = [
    { label: "Series", value: totalSeries, color: "#DEBFC3" },
    { label: "Películas", value: totalMovies, color: "#FFD65B" },
  ].filter((s) => s.value > 0)

  // ── Genre distribution ──
  const genreCounts: Record<string, number> = {}
  for (const item of items) {
    for (const genre of item.genres || []) {
      genreCounts[genre] = (genreCounts[genre] || 0) + 1
    }
  }
  const genreColors = [
    "#8B5CF6", "#EF4444", "#FFD65B", "#EC4899",
    "#10B981", "#F59E0B", "#06B6D4", "#DEBFC3",
    "#3B82F6", "#84cc16",
  ]
  const genreDistribution = Object.entries(genreCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([label, value], i) => ({ label, value, color: genreColors[i % genreColors.length] }))

  // ── Top rated ──
  const topRated = items
    .filter((i) => i.rating && i.rating > 0)
    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
    .slice(0, 5)

  // ── Crimes ──
  let totalCrimes = 0
  let partnerCrimes = 0
  let partnerName: string | undefined
  if (validGroupId) {
    try {
      const activeGroupData = groups.find((g) => g.id === validGroupId)
      const [myCrimes, allCrimes] = await Promise.all([
        prisma.crime.count({ where: { groupId: validGroupId, userId } }),
        prisma.crime.count({ where: { groupId: validGroupId } }),
      ])
      totalCrimes = myCrimes
      partnerCrimes = allCrimes - myCrimes
      const partner = activeGroupData?.members?.find((m) => m.user.id !== userId)
      partnerName = partner?.user?.name || undefined
    } catch {
      // Crime model may not exist yet if DB not pushed
    }
  }

  return (
    <>
      <Navbar user={user} groups={groups} activeGroupId={validGroupId} />
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
            genreDistribution,
            totalCrimes,
            partnerCrimes,
            partnerName,
          }}
        />
      </main>
    </>
  )
}
