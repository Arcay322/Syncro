import { NextResponse } from "next/server"
import { getTmdbDetails } from "@/lib/tmdb"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")
  const type = searchParams.get("type")

  if (!id || !type) {
    return NextResponse.json({ error: "Missing params" }, { status: 400 })
  }

  try {
    const data = await getTmdbDetails(parseInt(id), type as "movie" | "tv")
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch details" }, { status: 500 })
  }
}
