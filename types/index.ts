export interface TmdbSearchResult {
  id: number
  media_type: "movie" | "tv"
  title?: string
  name?: string
  poster_path: string | null
  backdrop_path: string | null
  overview: string
  release_date?: string
  first_air_date?: string
  vote_average: number
}

export interface WatchlistItemWithTmdb {
  id: string
  userId: string | null
  groupId: string | null
  tmdbId: number
  mediaType: string
  title: string
  posterPath: string | null
  backdropPath: string | null
  status: string
  rating: number | null
  notes: string | null
  currentSeason: number | null
  currentEpisode: number | null
  currentMinute: number | null
  createdAt: Date
  updatedAt: Date
}
