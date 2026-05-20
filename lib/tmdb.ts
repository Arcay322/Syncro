const TMDB_BASE_URL = "https://api.themoviedb.org/3"
const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p"

function getTmdbHeaders() {
  return {
    Authorization: `Bearer ${process.env.TMDB_ACCESS_TOKEN}`,
    accept: "application/json",
  }
}

export function getTmdbImageUrl(path: string | null, size: string = "w500") {
  if (!path) return "/placeholder.svg"
  return `${TMDB_IMAGE_BASE_URL}/${size}${path}`
}

export async function searchTmdb(query: string) {
  const res = await fetch(
    `${TMDB_BASE_URL}/search/multi?language=es-ES&query=${encodeURIComponent(query)}&page=1`,
    { headers: getTmdbHeaders(), next: { revalidate: 60 } }
  )
  if (!res.ok) throw new Error("TMDB search failed")
  return res.json()
}

export async function getTmdbDetails(id: number, mediaType: "movie" | "tv") {
  const res = await fetch(
    `${TMDB_BASE_URL}/${mediaType}/${id}?language=es-ES&append_to_response=credits`,
    { headers: getTmdbHeaders(), next: { revalidate: 3600 } }
  )
  if (!res.ok) throw new Error("TMDB details failed")
  return res.json()
}

export async function getTmdbSeasons(tvId: number, seasonNumber: number) {
  const res = await fetch(
    `${TMDB_BASE_URL}/tv/${tvId}/season/${seasonNumber}?language=es-ES`,
    { headers: getTmdbHeaders(), next: { revalidate: 3600 } }
  )
  if (!res.ok) throw new Error("TMDB season failed")
  return res.json()
}
