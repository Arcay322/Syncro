"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { getTmdbImageUrl } from "@/lib/tmdb"
import {
  ArrowLeft,
  Star,
  Clock,
  Calendar,
  Film,
  Tv,
  CheckSquare2,
  Square,
  Diamond,
  Play,
  ChevronRight,
  ChevronLeft,
  Loader2,
  AlertTriangle,
  Skull,
  Check,
  Pause,
  Clapperboard,
  User2,
  X,
  Flame,
  FileText,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { WatchlistItemWithTmdb } from "@/types"

interface DetailViewProps {
  item: WatchlistItemWithTmdb
  tmdbDetails: any
}

const statusLabels: Record<string, string> = {
  WATCHING: "Viendo",
  COMPLETED: "Terminada",
  ON_HOLD: "En pausa",
  DROPPED: "Abandonada",
  PLAN_TO_WATCH: "Pendiente",
}

const statusColors: Record<string, string> = {
  WATCHING: "bg-[#FFD65B]/15 text-[#FFD65B] border-[#FFD65B]/20",
  COMPLETED: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  ON_HOLD: "bg-[#DEBFC3]/15 text-[#DEBFC3] border-[#DEBFC3]/20",
  DROPPED: "bg-red-500/15 text-red-400 border-red-500/20",
  PLAN_TO_WATCH: "bg-[#9B8E8F]/15 text-[#9B8E8F] border-[#9B8E8F]/20",
}

function ArtDecoLine() {
  return (
    <div className="flex items-center justify-center gap-4 py-6">
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#4F4445] to-[#4F4445]" />
      <Diamond className="w-2.5 h-2.5 text-[#FFD65B] rotate-45 fill-[#FFD65B]" />
      <div className="h-px flex-1 bg-gradient-to-l from-transparent via-[#4F4445] to-[#4F4445]" />
    </div>
  )
}

function StarRating({ value, onChange, size = "md" }: { value: number; onChange?: (v: number) => void; size?: "sm" | "md" | "lg" }) {
  const starSize = size === "sm" ? "w-3.5 h-3.5" : size === "lg" ? "w-6 h-6" : "w-5 h-5"
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
        <button
          key={star}
          onClick={() => onChange?.(star)}
          disabled={!onChange}
          className={`p-0.5 transition-transform hover:scale-110 ${onChange ? "cursor-pointer" : "cursor-default"}`}
        >
          <Star
            className={`${starSize} transition-colors ${
              star <= value
                ? "text-[#FFD65B] fill-[#FFD65B]"
                : "text-[#4F4445]"
            }`}
          />
        </button>
      ))}
    </div>
  )
}

// ──────────────── Cast Carousel ────────────────
function CastCarousel({ cast }: { cast: any[] }) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  const checkScroll = () => {
    const el = scrollRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 10)
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10)
  }

  const scroll = (dir: "left" | "right") => {
    scrollRef.current?.scrollBy({ left: dir === "left" ? -240 : 240, behavior: "smooth" })
  }

  if (!cast || cast.length === 0) return null

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-[#DEBFC3] uppercase tracking-[0.15em] font-serif">
          Reparto
        </h3>
        <div className="flex gap-1">
          <button
            onClick={() => scroll("left")}
            disabled={!canScrollLeft}
            className="w-7 h-7 rounded-full border border-[#4F4445]/50 flex items-center justify-center text-[#9B8E8F] hover:text-[#DEBFC3] hover:border-[#DEBFC3]/30 disabled:opacity-30 transition-all"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => scroll("right")}
            disabled={!canScrollRight}
            className="w-7 h-7 rounded-full border border-[#4F4445]/50 flex items-center justify-center text-[#9B8E8F] hover:text-[#DEBFC3] hover:border-[#DEBFC3]/30 disabled:opacity-30 transition-all"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        onScroll={checkScroll}
        className="flex gap-3 overflow-x-auto scrollbar-none pb-2"
        style={{ scrollbarWidth: "none" }}
      >
        {cast.slice(0, 20).map((actor: any) => (
          <motion.div
            key={actor.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-none w-[90px] text-center"
          >
            <div className="relative w-[90px] h-[120px] rounded-xl overflow-hidden bg-[#291C1E] mb-2 ring-1 ring-[#4F4445]/30">
              {actor.profile_path ? (
                <Image
                  src={getTmdbImageUrl(actor.profile_path, "w185")}
                  alt={actor.name}
                  fill
                  sizes="90px"
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <User2 className="w-8 h-8 text-[#4F4445]" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[#1B1012]/80 to-transparent" />
            </div>
            <p className="text-[11px] font-medium text-[#DEBFC3] leading-tight line-clamp-2 font-serif">
              {actor.name}
            </p>
            <p className="text-[10px] text-[#4F4445] mt-0.5 line-clamp-1">
              {actor.character}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// ──────────────── Botón del Delito Modal ────────────────
function DelitoModal({
  item,
  open,
  onClose,
  crimes,
  onCrimeRegistered,
}: {
  item: WatchlistItemWithTmdb
  open: boolean
  onClose: () => void
  crimes: any[]
  onCrimeRegistered: (crime: any) => void
}) {
  const [loading, setLoading] = useState(false)
  const [newCrime, setNewCrime] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleConfess = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/crimes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tmdbId: item.tmdbId,
          title: item.title,
          season: item.currentSeason || 1,
          episode: item.currentEpisode || 0,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Error al registrar el delito")
      } else {
        setNewCrime(data.crime)
        onCrimeRegistered(data.crime)
      }
    } catch {
      setError("Error de conexión")
    }
    setLoading(false)
  }

  if (!open) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ opacity: 0, y: 60, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="w-full max-w-md bg-[#1B1012] border border-red-500/30 rounded-2xl overflow-hidden shadow-2xl shadow-red-900/30"
        >
          {/* Header */}
          <div className="relative p-6 bg-gradient-to-b from-red-950/40 to-transparent border-b border-red-500/20">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-[#291C1E] text-[#9B8E8F] hover:text-[#DEBFC3] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-red-500/15 flex items-center justify-center">
                <Skull className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-red-400 font-serif">Botón del Delito</h2>
                <p className="text-xs text-[#9B8E8F]">Confesionario del Cineclub</p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-5">
            {/* Current progress context */}
            <div className="p-3 rounded-xl bg-[#291C1E]/60 border border-[#4F4445]/30">
              <p className="text-xs text-[#9B8E8F] font-serif">
                📺 <span className="text-[#DEBFC3] font-medium">{item.title}</span>
                {item.currentSeason && item.currentEpisode
                  ? ` · S${item.currentSeason}E${item.currentEpisode}`
                  : ""}
              </p>
              <p className="text-[11px] text-[#4F4445] mt-1">
                ¿Te adelantaste hasta este punto sin tu pareja? ¡Reconócelo!
              </p>
            </div>

            {/* New crime result */}
            {newCrime ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-3"
              >
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 space-y-2">
                  <div className="flex items-center gap-2 text-red-400">
                    <Flame className="w-4 h-4" />
                    <p className="text-xs font-bold uppercase tracking-wider">¡Delito registrado!</p>
                  </div>
                  <p className="text-sm text-[#DEBFC3] font-serif font-medium">Tu penitencia:</p>
                  <p className="text-sm text-[#FFD65B] font-serif italic leading-relaxed">
                    "{newCrime.penance}"
                  </p>
                </div>
                <Button
                  onClick={() => { setNewCrime(null); onClose() }}
                  className="w-full rounded-xl bg-[#DEBFC3] text-[#3F2B2E] hover:bg-[#d4b5b9] text-sm"
                >
                  Entendido, me arrepiento 🙏
                </Button>
              </motion.div>
            ) : (
              <div className="space-y-3">
                {error && (
                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                    <p className="text-xs text-red-400">{error}</p>
                  </div>
                )}
                <Button
                  onClick={handleConfess}
                  disabled={loading}
                  className="w-full rounded-xl bg-red-500/20 border border-red-500/40 text-red-300 hover:bg-red-500/30 hover:text-red-200 gap-2 py-5"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Skull className="w-4 h-4" />
                  )}
                  {loading ? "Registrando..." : "Confesar mi delito"}
                </Button>
                <p className="text-[10px] text-[#4F4445] text-center font-serif italic">
                  La confesión es el primer paso a la redención cinematográfica.
                </p>
              </div>
            )}

            {/* Crime history */}
            {crimes.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs text-[#9B8E8F] uppercase tracking-[0.12em] font-serif">
                  Delitos anteriores
                </p>
                <div className="space-y-2 max-h-40 overflow-y-auto scrollbar-none" style={{ scrollbarWidth: "none" }}>
                  {crimes.map((crime: any) => (
                    <div
                      key={crime.id}
                      className="p-2.5 rounded-lg bg-[#291C1E]/60 border border-red-500/10 space-y-0.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-medium text-[#DEBFC3] font-serif">
                          {crime.title} S{crime.season}E{crime.episode}
                        </span>
                        <span className="text-[10px] text-[#4F4445]">
                          {new Date(crime.createdAt).toLocaleDateString("es-ES", { day: "2-digit", month: "short" })}
                        </span>
                      </div>
                      <p className="text-[10px] text-[#FFD65B]/80 italic font-serif leading-snug">
                        {crime.penance}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// ──────────────── Main Component ────────────────
export function DetailView({ item, tmdbDetails }: DetailViewProps) {
  const router = useRouter()
  const [currentItem, setCurrentItem] = useState(item)
  const [seasons] = useState<any[]>(tmdbDetails.seasons?.filter((s: any) => s.season_number > 0) || [])
  const [selectedSeason, setSelectedSeason] = useState(currentItem.currentSeason || 1)
  const [seasonEpisodes, setSeasonEpisodes] = useState<any[]>([])
  const [loadingSeason, setLoadingSeason] = useState(false)
  const getInitialNotes = (raw: string | null): Record<string, string> => {
    if (!raw) return {}
    try {
      if (raw.trim().startsWith("{")) {
        return JSON.parse(raw)
      }
    } catch {}
    return { global: raw }
  }

  const [saving, setSaving] = useState(false)
  const [notesDict, setNotesDict] = useState<Record<string, string>>(getInitialNotes(currentItem.notes))
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null)
  const [rating, setRating] = useState(currentItem.rating || 0)
  const [showNotes, setShowNotes] = useState(false)
  const [showDelito, setShowDelito] = useState(false)
  const [expandedNoteEpisode, setExpandedNoteEpisode] = useState<number | null>(null)
  const [crimes, setCrimes] = useState<any[]>([])
  const [loadingCrimes, setLoadingCrimes] = useState(false)

  const isTv = item.mediaType === "tv"
  const totalEpisodes = seasons.reduce((acc: number, s: any) => acc + (s.episode_count || 0), 0)

  // Extract cast & director from credits
  const cast: any[] = tmdbDetails.credits?.cast || []
  const crew: any[] = tmdbDetails.credits?.crew || []
  const director = crew.find((c: any) => c.job === "Director" || c.job === "Series Director" || c.department === "Directing")
  const creators = tmdbDetails.created_by || []

  const getWatchedEpisodesCount = () => {
    if (!isTv) return 0
    let count = 0
    const currentSeason = currentItem.currentSeason || 1
    const currentEpisode = currentItem.currentEpisode || 0
    for (const s of seasons) {
      if (s.season_number < currentSeason) {
        count += s.episode_count || 0
      } else if (s.season_number === currentSeason) {
        count += currentEpisode
      }
    }
    return count
  }
  const watchedEpCount = getWatchedEpisodesCount()
  const watchedPercent = isTv && totalEpisodes > 0
    ? (currentItem.status === "COMPLETED" ? 100 : Math.min(100, Math.round((watchedEpCount / totalEpisodes) * 100)))
    : 0

  const fetchSeason = useCallback(
    async (seasonNumber: number) => {
      if (!isTv) return
      setLoadingSeason(true)
      try {
        const res = await fetch(`/api/tmdb/season?tvId=${item.tmdbId}&season=${seasonNumber}`)
        const data = await res.json()
        setSeasonEpisodes(data.episodes || [])
      } catch {
        setSeasonEpisodes([])
      }
      setLoadingSeason(false)
    },
    [isTv, item.tmdbId]
  )

  useEffect(() => {
    if (isTv && selectedSeason) {
      fetchSeason(selectedSeason)
    }
  }, [isTv, selectedSeason, fetchSeason])

  // Fetch crimes when delito modal opens
  useEffect(() => {
    if (showDelito && currentItem.groupId) {
      setLoadingCrimes(true)
      fetch("/api/crimes")
        .then((r) => r.json())
        .then((data) => {
          // Filter crimes relevant to this title
          const relevant = (data.crimes || []).filter((c: any) => c.tmdbId === item.tmdbId)
          setCrimes(relevant)
        })
        .catch(() => {})
        .finally(() => setLoadingCrimes(false))
    }
  }, [showDelito, currentItem.groupId, item.tmdbId])

  const updateItem = async (data: Partial<WatchlistItemWithTmdb>) => {
    setSaving(true)
    const res = await fetch(`/api/watchlist/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    if (res.ok) {
      const result = await res.json()
      setCurrentItem(result.item)
      router.refresh()
    }
    setSaving(false)
    return res.ok
  }

  const handleNextEpisode = () => {
    const season = currentItem.currentSeason || 1
    const episode = currentItem.currentEpisode || 0
    const currentSeasonData = seasons.find((s: any) => s.season_number === season)
    const totalInSeason = currentSeasonData?.episode_count || 99

    if (episode < totalInSeason) {
      updateItem({ currentSeason: season, currentEpisode: episode + 1 })
    } else {
      const nextSeason = seasons.find((s: any) => s.season_number === season + 1)
      if (nextSeason) {
        updateItem({ currentSeason: season + 1, currentEpisode: 1 })
        setSelectedSeason(season + 1)
      }
    }
  }

  const handleRatingChange = (value: number) => {
    setRating(value)
    updateItem({ rating: value })
  }

  const handleNotesSave = async (key: string, value: string) => {
    const updated = { ...notesDict, [key]: value }
    setNotesDict(updated)
    const ok = await updateItem({ notes: JSON.stringify(updated) })
    if (ok) {
      setSaveSuccess(key)
      setTimeout(() => setSaveSuccess(null), 2500)
    }
  }

  const handleEpisodeWatched = (episodeNumber: number) => {
    if (!isTv) return
    const isWatched =
      selectedSeason < (currentItem.currentSeason || 1) ||
      (selectedSeason === (currentItem.currentSeason || 1) && episodeNumber <= (currentItem.currentEpisode || 0))
      
    if (!isWatched) {
      updateItem({ currentSeason: selectedSeason, currentEpisode: episodeNumber })
    } else {
      updateItem({ currentSeason: selectedSeason, currentEpisode: Math.max(0, episodeNumber - 1) })
    }
  }

  const year = tmdbDetails.release_date || tmdbDetails.first_air_date
    ? (tmdbDetails.release_date || tmdbDetails.first_air_date).substring(0, 4)
    : null

  const isCompleted = currentItem.status === "COMPLETED"

  return (
    <div className="space-y-0">
      {/* Hero Header */}
      <div className="relative -mx-6 lg:-mx-12 xl:-mx-16 -mt-8 min-h-[60vh] overflow-hidden">
        {/* Backdrop */}
        <Image
          src={getTmdbImageUrl(tmdbDetails.backdrop_path || tmdbDetails.poster_path, "original")}
          alt={item.title}
          fill
          className="object-cover opacity-40"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1B1012] via-[#1B1012]/80 to-[#1B1012]/40" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#1B1012] via-[#1B1012]/60 to-transparent" />

        {/* Content */}
        <div className="relative z-10 w-full px-6 lg:px-12 xl:px-16 pt-24 pb-12">
          <Link href="/">
            <Button
              variant="ghost"
              size="sm"
              className="mb-6 gap-2 -ml-2 text-[#9B8E8F] hover:text-[#DEBFC3] hover:bg-[#DEBFC3]/10 rounded-xl font-serif"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver a la cartelera
            </Button>
          </Link>

          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
            {/* Poster */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="shrink-0 w-full max-w-[320px] lg:w-[300px] xl:w-[340px]"
            >
              <div className="relative aspect-[2/3] rounded-xl overflow-hidden shadow-2xl shadow-black/60 ring-1 ring-[#4F4445]/50">
                <Image
                  src={getTmdbImageUrl(item.posterPath, "w500")}
                  alt={item.title}
                  fill
                  className="object-cover"
                />
              </div>
            </motion.div>

            {/* Info */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="flex-1 space-y-5"
            >
              {/* Title */}
              <div>
                <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-[#DEBFC3] tracking-tight leading-tight font-serif">
                  {item.title}
                </h1>

                {/* Director / Creator */}
                {(director || creators.length > 0) && (
                  <p className="text-sm text-[#9B8E8F] mt-2 font-serif flex items-center gap-1.5">
                    <Clapperboard className="w-3.5 h-3.5" />
                    {creators.length > 0
                      ? `Creada por ${creators.map((c: any) => c.name).join(", ")}`
                      : `Dirigida por ${director?.name}`}
                  </p>
                )}

                {/* Meta */}
                <div className="flex flex-wrap items-center gap-3 mt-3">
                  {year && (
                    <span className="flex items-center gap-1.5 text-sm text-[#9B8E8F]">
                      <Calendar className="w-3.5 h-3.5" />
                      {year}
                    </span>
                  )}
                  {isTv && (
                    <>
                      <span className="text-[#4F4445]">•</span>
                      <span className="flex items-center gap-1.5 text-sm text-[#9B8E8F]">
                        <Tv className="w-3.5 h-3.5" />
                        Temporada {currentItem.currentSeason || 1}
                      </span>
                      <span className="text-[#4F4445]">•</span>
                      <span className="text-sm text-[#9B8E8F]">
                        {seasons.length} temporadas
                      </span>
                    </>
                  )}
                  {!isTv && (
                    <>
                      <span className="text-[#4F4445]">•</span>
                      <span className="flex items-center gap-1.5 text-sm text-[#9B8E8F]">
                        <Film className="w-3.5 h-3.5" />
                        Película
                      </span>
                    </>
                  )}
                  <span className="text-[#4F4445]">•</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusColors[currentItem.status] || statusColors.PLAN_TO_WATCH}`}>
                    {statusLabels[currentItem.status] || currentItem.status}
                  </span>
                </div>
              </div>

              {/* Sinopsis */}
              {tmdbDetails.overview && (
                <p className="text-[#9B8E8F] leading-relaxed text-sm lg:text-base max-w-4xl font-serif">
                  {tmdbDetails.overview}
                </p>
              )}

              {/* TMDB Rating */}
              {tmdbDetails.vote_average > 0 && (
                <div className="flex items-center gap-3">
                  <Star className="w-5 h-5 text-[#FFD65B] fill-[#FFD65B]" />
                  <span className="text-lg font-bold text-[#FFD65B]">{tmdbDetails.vote_average.toFixed(1)}</span>
                  <span className="text-xs text-[#4F4445]">/ 10 en TMDB</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <DropdownMenu>
                  <DropdownMenuTrigger>
                    <div
                      className={`flex h-11 items-center justify-center gap-2 rounded-lg px-6 text-sm font-semibold tracking-wide uppercase shadow-lg transition-all cursor-pointer ${
                        currentItem.status === "COMPLETED" ? "bg-emerald-500 text-emerald-950 hover:bg-emerald-400 shadow-emerald-500/20" :
                        currentItem.status === "WATCHING" ? "bg-[#FFD65B] text-[#3F2B2E] hover:bg-[#e6c152] shadow-[#FFD65B]/20" :
                        currentItem.status === "DROPPED" ? "bg-red-500 text-white hover:bg-red-400 shadow-red-500/20" :
                        currentItem.status === "ON_HOLD" ? "bg-[#DEBFC3] text-[#3F2B2E] hover:bg-[#c9ada0] shadow-[#DEBFC3]/20" :
                        "bg-[#9B8E8F] text-[#1B1012] hover:bg-[#857a7b] shadow-[#9B8E8F]/20"
                      } ${saving ? 'opacity-50 pointer-events-none' : ''}`}
                    >
                      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 
                        currentItem.status === "COMPLETED" ? <Check className="w-4 h-4 stroke-[3]" /> :
                        currentItem.status === "WATCHING" ? <Play className="w-4 h-4 fill-current" /> :
                        currentItem.status === "ON_HOLD" ? <Pause className="w-4 h-4 fill-current" /> :
                        currentItem.status === "DROPPED" ? <Skull className="w-4 h-4" /> :
                        <Clock className="w-4 h-4" />
                      }
                      {statusLabels[currentItem.status] || currentItem.status}
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="bg-[#291C1E] border border-[#4F4445] min-w-[150px] rounded-md shadow-2xl z-30">
                    {Object.entries(statusLabels).map(([key, label]) => {
                      let Icon = Play
                      if (key === "PLAN_TO_WATCH") Icon = Clock
                      if (key === "COMPLETED") Icon = Check
                      if (key === "ON_HOLD") Icon = Pause
                      if (key === "DROPPED") Icon = Skull
                      
                      return (
                        <DropdownMenuItem
                          key={key}
                          onClick={() => updateItem({ status: key })}
                          className={`text-xs cursor-pointer hover:bg-[#DEBFC3]/10 py-2.5 px-3 flex items-center gap-2 ${
                            currentItem.status === key ? "text-[#FFD65B] font-semibold bg-[#DEBFC3]/5" : "text-[#f4dde0]"
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                          <span>{label}</span>
                        </DropdownMenuItem>
                      )
                    })}
                  </DropdownMenuContent>
                </DropdownMenu>

                <Button
                  variant="outline"
                  onClick={() => setShowNotes(!showNotes)}
                  className="rounded-lg border-[#4F4445] text-[#9B8E8F] hover:bg-[#291C1E] hover:text-[#DEBFC3] px-5 py-5"
                >
                  Notas
                </Button>

                {currentItem.groupId && (
                  <Button
                    variant="outline"
                    onClick={() => setShowDelito(true)}
                    disabled={saving}
                    className="rounded-lg border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300 px-4 py-5 gap-2"
                  >
                    <Skull className="w-4 h-4" />
                    Botón del Delito
                  </Button>
                )}

                <div className="flex items-center gap-2">
                  <StarRating value={rating} onChange={handleRatingChange} />
                  {rating > 0 && (
                    <span className="text-sm font-bold text-[#FFD65B]">{rating}/10</span>
                  )}
                </div>
              </div>

              {/* Progress Bar */}
              {isTv && totalEpisodes > 0 && (
                <div className="space-y-2 max-w-xl">
                  <div className="flex justify-between text-xs text-[#9B8E8F]">
                    <span>Progreso</span>
                    <span>{watchedEpCount} / {totalEpisodes} episodios</span>
                  </div>
                  <div className="h-1.5 bg-[#291C1E] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#FFD65B] rounded-full transition-all duration-500"
                      style={{ width: `${watchedPercent}%` }}
                    />
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Notes Section (collapsible) */}
      {showNotes && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="px-4 py-6 bg-[#291C1E]/50 border-y border-[#4F4445]/30"
        >
          <div className="max-w-4xl mx-auto space-y-3">
            <label className="text-sm font-medium text-[#DEBFC3] font-serif">Notas del Cinéfilo</label>
            <textarea
              value={notesDict["global"] || ""}
              onChange={(e) => setNotesDict({ ...notesDict, global: e.target.value })}
              placeholder="Escribe tus impresiones generales sobre esta producción..."
              className="w-full min-h-[120px] px-4 py-3 rounded-xl bg-[#1B1012] border border-[#4F4445]/50 text-[#DEBFC3] placeholder:text-[#4F4445] focus:ring-2 focus:ring-[#FFD65B]/30 focus:border-[#FFD65B]/50 outline-none transition-all resize-none text-sm leading-relaxed font-serif"
            />
            <div className="flex justify-end items-center gap-3">
              <AnimatePresence>
                {saveSuccess === "global" && (
                  <motion.span
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="text-xs text-emerald-400 font-medium flex items-center gap-1"
                  >
                    <Check className="w-3 h-3" /> ¡Guardado!
                  </motion.span>
                )}
              </AnimatePresence>
              <Button
                onClick={() => handleNotesSave("global", notesDict["global"] || "")}
                disabled={saving}
                className="rounded-lg bg-[#DEBFC3] text-[#3F2B2E] hover:bg-[#d4b5b9] text-xs px-4"
              >
                {saving ? "Guardando..." : "Guardar notas"}
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Decorative Line */}
      <div className="px-4">
        <ArtDecoLine />
      </div>

      {/* Cast & Director Section */}
      {cast.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="px-4 max-w-5xl mx-auto"
        >
          <CastCarousel cast={cast} />
        </motion.div>
      )}

      {cast.length > 0 && (
        <div className="px-4">
          <ArtDecoLine />
        </div>
      )}

      {/* Ratings Section */}
      <div className="px-4 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center space-y-3"
        >
          <h3 className="text-sm font-medium text-[#9B8E8F] uppercase tracking-[0.2em] font-serif">
            Consenso del Cineclub
          </h3>
          <div className="flex justify-center">
            <StarRating value={Math.round(tmdbDetails.vote_average || 0)} size="lg" />
          </div>
          <p className="text-xs text-[#4F4445] italic font-serif max-w-2xl mx-auto">
            {tmdbDetails.vote_average >= 8
              ? "Una obra maestra del séptimo arte. Imperdible."
              : tmdbDetails.vote_average >= 6
              ? "Una producción sólida que deleita a la audiencia."
              : "Opiniones divididas entre la crítica especializada."}
          </p>
        </motion.div>

        {/* User Rating Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="max-w-xl mx-auto"
        >
          <div className="p-5 rounded-xl bg-[#291C1E]/60 border border-[#4F4445]/40 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#FFD65B]/15 flex items-center justify-center">
                <Star className="w-4 h-4 text-[#FFD65B]" />
              </div>
              <div>
                <p className="text-sm font-medium text-[#DEBFC3]">Tu Rating</p>
                <p className="text-xs text-[#4F4445]">Evaluación personal</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <StarRating value={rating} onChange={handleRatingChange} size="md" />
              <span className="text-lg font-bold text-[#FFD65B]">{rating > 0 ? `${rating}/10` : "—"}</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Decorative Line */}
      <div className="px-4">
        <ArtDecoLine />
      </div>

      {/* Episodes Section */}
      {isTv && (
        <div className="px-4 space-y-6">
          {/* Season Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex items-end justify-between"
          >
            <div>
              <h2 className="text-2xl font-bold text-[#DEBFC3] font-serif">
                Temporada {selectedSeason}
              </h2>
              {seasons.find((s: any) => s.season_number === selectedSeason)?.name && (
                <p className="text-xs text-[#4F4445] uppercase tracking-[0.15em] mt-1 font-serif">
                  {seasons.find((s: any) => s.season_number === selectedSeason)?.name}
                </p>
              )}
            </div>

            {/* Season Selector */}
            <div className="flex items-center gap-2 flex-wrap justify-end max-w-xs">
              {seasons.map((s: any) => (
                <button
                  key={s.season_number}
                  onClick={() => {
                    setSelectedSeason(s.season_number)
                    updateItem({ currentSeason: s.season_number })
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    selectedSeason === s.season_number
                      ? "bg-[#DEBFC3] text-[#3F2B2E]"
                      : "bg-[#291C1E] text-[#9B8E8F] hover:text-[#DEBFC3] border border-[#4F4445]/40"
                  }`}
                >
                  T{s.season_number}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Episodes List */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="space-y-2"
          >
            {loadingSeason ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 text-[#FFD65B] animate-spin" />
              </div>
            ) : seasonEpisodes.length > 0 ? (
              seasonEpisodes.map((ep: any, index: number) => {
                const epNum = ep.episode_number
                const currentSeasonData = seasons.find((s: any) => s.season_number === (currentItem.currentSeason || 1))
                const totalInSeason = currentSeasonData?.episode_count || 0
                
                const isWatched =
                  selectedSeason < (currentItem.currentSeason || 1) ||
                  (selectedSeason === (currentItem.currentSeason || 1) && epNum <= (currentItem.currentEpisode || 0))
                  
                const isCurrentlyWatching =
                  (selectedSeason === (currentItem.currentSeason || 1) && epNum === (currentItem.currentEpisode || 0) + 1) ||
                  (selectedSeason === (currentItem.currentSeason || 1) + 1 && (currentItem.currentEpisode || 0) === totalInSeason && epNum === 1)

                const epKey = `S${selectedSeason}E${epNum}`
                const hasNote = !!notesDict[epKey]
                const isExpanded = expandedNoteEpisode === epNum

                return (
                  <div key={ep.id} className="flex flex-col gap-1">
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className={`group flex items-center gap-4 p-3.5 rounded-xl border transition-all ${
                        isWatched
                          ? "bg-[#291C1E]/40 border-[#4F4445]/20"
                          : isCurrentlyWatching
                          ? "bg-[#FFD65B]/5 border-[#FFD65B]/20"
                          : "bg-transparent border-[#4F4445]/20 hover:bg-[#291C1E]/30"
                      }`}
                    >
                    {/* Episode Number */}
                    <span className={`text-sm font-bold w-6 text-center font-serif ${
                      isWatched ? "text-[#4F4445]" : "text-[#9B8E8F]"
                    }`}>
                      {epNum}
                    </span>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-medium truncate ${
                          isWatched ? "text-[#4F4445] line-through" : "text-[#DEBFC3]"
                        }`}>
                          {ep.name}
                        </span>
                        {isCurrentlyWatching && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-[#FFD65B]/15 text-[#FFD65B] font-medium">
                            Siguiente
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#4F4445] truncate mt-0.5 line-clamp-1">
                        {ep.overview || "Sin descripción disponible."}
                      </p>
                    </div>

                    {/* Duration */}
                    {ep.runtime && (
                      <span className="text-xs text-[#4F4445] flex items-center gap-1 shrink-0">
                        <Clock className="w-3 h-3" />
                        {ep.runtime}m
                      </span>
                    )}

                    {/* Note Button */}
                    <button
                      onClick={() => setExpandedNoteEpisode(isExpanded ? null : epNum)}
                      className={`shrink-0 p-1.5 rounded-md transition-colors ${
                        hasNote || isExpanded ? "text-[#FFD65B] bg-[#FFD65B]/10" : "text-[#4F4445] hover:text-[#DEBFC3] hover:bg-[#DEBFC3]/10"
                      }`}
                      title="Notas del capítulo"
                    >
                      <FileText className="w-4 h-4" />
                    </button>

                    {/* Checkbox */}
                    <button
                      onClick={() => handleEpisodeWatched(epNum)}
                      className="shrink-0 p-1 transition-colors"
                    >
                      {isWatched ? (
                        <CheckSquare2 className="w-5 h-5 text-[#FFD65B]" />
                      ) : (
                        <Square className="w-5 h-5 text-[#4F4445] group-hover:text-[#9B8E8F]" />
                      )}
                    </button>
                  </motion.div>

                  {/* Expandable Note Section */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="px-4 overflow-hidden"
                      >
                        <div className="bg-[#1B1012] border border-[#4F4445]/30 rounded-xl p-3 mb-2 flex flex-col gap-2">
                          <textarea
                            value={notesDict[epKey] || ""}
                            onChange={(e) => setNotesDict({ ...notesDict, [epKey]: e.target.value })}
                            placeholder={`Tus notas para el Episodio ${epNum}...`}
                            className="w-full min-h-[80px] bg-transparent text-[#DEBFC3] placeholder:text-[#4F4445] text-xs resize-none outline-none font-serif"
                          />
                          <div className="flex justify-end items-center gap-3">
                            {saveSuccess === epKey && (
                              <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                                <Check className="w-3 h-3" /> Guardado
                              </span>
                            )}
                            <Button
                              onClick={() => handleNotesSave(epKey, notesDict[epKey] || "")}
                              disabled={saving}
                              size="sm"
                              className="h-7 text-[10px] px-3 rounded-md bg-[#291C1E] text-[#9B8E8F] hover:text-[#DEBFC3] hover:bg-[#DEBFC3]/20"
                            >
                              {saving ? "Guardando..." : "Guardar nota"}
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )
              })
            ) : (
              <div className="text-center py-12 text-[#4F4445]">
                <p className="text-sm">No hay episodios disponibles para esta temporada.</p>
              </div>
            )}
          </motion.div>
        </div>
      )}

      {/* Movie Progress */}
      {!isTv && (
        <div className="px-4 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="max-w-xl mx-auto p-6 rounded-xl bg-[#291C1E]/60 border border-[#4F4445]/40 space-y-4"
          >
            <h3 className="text-sm font-medium text-[#DEBFC3] font-serif">Progreso de Visionado</h3>
            <div className="flex items-center gap-3">
              <Clock className="w-4 h-4 text-[#9B8E8F]" />
              <input
                type="number"
                min={0}
                value={currentItem.currentMinute || ""}
                onChange={(e) => {
                  const minute = parseInt(e.target.value) || 0
                  updateItem({ currentMinute: minute })
                }}
                className="w-24 h-10 px-3 rounded-lg border border-[#4F4445]/50 bg-[#1B1012] text-sm text-[#DEBFC3] focus:ring-2 focus:ring-[#FFD65B]/30 focus:border-[#FFD65B]/50 outline-none transition-all"
                placeholder="0"
              />
              <span className="text-xs text-[#4F4445]">minutos</span>
            </div>
            {tmdbDetails.runtime && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-[#9B8E8F]">
                  <span>Duración total: {tmdbDetails.runtime}m</span>
                  <span>{Math.round(((currentItem.currentMinute || 0) / tmdbDetails.runtime) * 100)}%</span>
                </div>
                <div className="h-1.5 bg-[#1B1012] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#FFD65B] rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, ((currentItem.currentMinute || 0) / tmdbDetails.runtime) * 100)}%` }}
                  />
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}

      {/* Bottom Spacing */}
      <div className="h-12" />

      {/* Delito Modal */}
      <DelitoModal
        item={currentItem}
        open={showDelito}
        onClose={() => setShowDelito(false)}
        crimes={crimes}
        onCrimeRegistered={(crime) => setCrimes((prev) => [crime, ...prev])}
      />
    </div>
  )
}
