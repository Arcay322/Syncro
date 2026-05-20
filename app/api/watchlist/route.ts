import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { getTmdbDetails } from "@/lib/tmdb"

export async function GET(request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const groupId = searchParams.get("groupId")

  const where = groupId
    ? { groupId, userId: null }
    : { userId: session.user.id, groupId: null }

  const items = await prisma.watchlistItem.findMany({
    where,
    orderBy: { updatedAt: "desc" },
  })

  return NextResponse.json({ items })
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const { tmdbId, mediaType, title, posterPath, backdropPath, groupId } = body

  if (!tmdbId || !mediaType || !title) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 })
  }

  // Validate group membership if adding to group
  if (groupId) {
    const member = await prisma.groupMember.findFirst({
      where: { groupId, userId: session.user.id },
    })
    if (!member) {
      return NextResponse.json({ error: "Not a group member" }, { status: 403 })
    }
  }

  try {
    let genres: string[] = []
    try {
      const tmdbData = await getTmdbDetails(tmdbId, mediaType as "movie" | "tv")
      if (tmdbData && tmdbData.genres) {
        genres = tmdbData.genres.map((g: any) => g.name)
      }
    } catch (err) {
      console.error("Error fetching genres from TMDB:", err)
    }

    const item = await prisma.watchlistItem.create({
      data: {
        tmdbId,
        mediaType,
        title,
        posterPath: posterPath || null,
        backdropPath: backdropPath || null,
        userId: groupId ? null : session.user.id,
        groupId: groupId || null,
        genres,
      },
    })
    return NextResponse.json({ item }, { status: 201 })
  } catch (error: any) {
    if (error.code === "P2002") {
      return NextResponse.json({ error: "Already in list" }, { status: 409 })
    }
    return NextResponse.json({ error: "Failed to add" }, { status: 500 })
  }
}
