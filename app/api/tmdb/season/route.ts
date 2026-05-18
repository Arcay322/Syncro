import { NextResponse } from "next/server"
import { getTmdbSeasons } from "@/lib/tmdb"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const tvId = searchParams.get("tvId")
  const season = searchParams.get("season")

  if (!tvId || !season) {
    return NextResponse.json({ error: "Missing params" }, { status: 400 })
  }

  try {
    const data = await getTmdbSeasons(parseInt(tvId), parseInt(season))
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch season" }, { status: 500 })
  }
}
