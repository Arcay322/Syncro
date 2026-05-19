"use client"

import { useState, useCallback, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
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
  Loader2,
} from "lucide-react"
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

export function DetailView({ item, tmdbDetails }: DetailViewProps) {
  const [currentItem, setCurrentItem] = useState(item)
  const [seasons] = useState<any[]>(tmdbDetails.seasons?.filter((s: any) => s.season_number > 0) || [])
  const [selectedSeason, setSelectedSeason] = useState(currentItem.currentSeason || 1)
  const [seasonEpisodes, setSeasonEpisodes] = useState<any[]>([])
  const [loadingSeason, setLoadingSeason] = useState(false)
  const [saving, setSaving] = useState(false)
  const [notes, setNotes] = useState(currentItem.notes || "")
  const [rating, setRating] = useState(currentItem.rating || 0)
  const [showNotes, setShowNotes] = useState(false)

  const isTv = item.mediaType === "tv"
  const totalEpisodes = seasons.reduce((acc: number, s: any) => acc + (s.episode_count || 0), 0)
  const currentEp = currentItem.currentEpisode || 0
  const watchedPercent = isTv && totalEpisodes > 0 ? Math.round((currentEp / totalEpisodes) * 100) : 0

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
    }
    setSaving(false)
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

  const handleNotesSave = () => {
    updateItem({ notes })
  }

  const handleEpisodeWatched = (episodeNumber: number) => {
    if (!isTv) return
    const current = currentItem.currentEpisode || 0
    if (episodeNumber > current) {
      updateItem({ currentSeason: selectedSeason, currentEpisode: episodeNumber })
    } else if (episodeNumber === current) {
      updateItem({ currentSeason: selectedSeason, currentEpisode: Math.max(0, current - 1) })
    }
  }

  const year = tmdbDetails.release_date || tmdbDetails.first_air_date
    ? (tmdbDetails.release_date || tmdbDetails.first_air_date).substring(0, 4)
    : null

  const isCompleted = currentItem.status === "COMPLETED"

  return (
    <div className="space-y-0">
      {/* Hero Header */}
      <div className="relative -mx-4 -mt-8 min-h-[60vh] overflow-hidden">
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
        <div className="relative z-10 container mx-auto px-4 pt-24 pb-12">
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
              className="shrink-0 w-full max-w-[280px] lg:w-[280px]"
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
                <p className="text-[#9B8E8F] leading-relaxed text-sm lg:text-base max-w-2xl font-serif">
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
                <Button
                  onClick={handleNextEpisode}
                  disabled={saving || isCompleted}
                  className="gap-2 rounded-lg bg-[#DEBFC3] text-[#3F2B2E] hover:bg-[#d4b5b9] px-6 py-5 text-sm font-semibold tracking-wide uppercase shadow-lg shadow-[rgba(222,191,195,0.15)]"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
                  {isTv ? "Reanudar Producción" : "Reanudar"}
                </Button>

                <Button
                  variant="outline"
                  onClick={() => setShowNotes(!showNotes)}
                  className="rounded-lg border-[#4F4445] text-[#9B8E8F] hover:bg-[#291C1E] hover:text-[#DEBFC3] px-5 py-5"
                >
                  Notas
                </Button>

                <div className="flex items-center gap-2">
                  <StarRating value={rating} onChange={handleRatingChange} />
                  {rating > 0 && (
                    <span className="text-sm font-bold text-[#FFD65B]">{rating}/10</span>
                  )}
                </div>
              </div>

              {/* Progress Bar */}
              {isTv && totalEpisodes > 0 && (
                <div className="space-y-2 max-w-md">
                  <div className="flex justify-between text-xs text-[#9B8E8F]">
                    <span>Progreso</span>
                    <span>{currentEp} / {totalEpisodes} episodios</span>
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
          <div className="max-w-2xl mx-auto space-y-3">
            <label className="text-sm font-medium text-[#DEBFC3] font-serif">Notas del Cinéfilo</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Escribe tus impresiones sobre esta producción..."
              className="w-full min-h-[120px] px-4 py-3 rounded-xl bg-[#1B1012] border border-[#4F4445]/50 text-[#DEBFC3] placeholder:text-[#4F4445] focus:ring-2 focus:ring-[#FFD65B]/30 focus:border-[#FFD65B]/50 outline-none transition-all resize-none text-sm leading-relaxed font-serif"
            />
            <div className="flex justify-end">
              <Button
                onClick={handleNotesSave}
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
          <p className="text-xs text-[#4F4445] italic font-serif max-w-md mx-auto">
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
          className="max-w-md mx-auto"
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
            <div className="flex items-center gap-2">
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
                const isWatched = (currentItem.currentEpisode || 0) >= epNum && (currentItem.currentSeason || 1) === selectedSeason
                const isCurrentlyWatching = (currentItem.currentEpisode || 0) + 1 === epNum && (currentItem.currentSeason || 1) === selectedSeason

                return (
                  <motion.div
                    key={ep.id}
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
            className="max-w-md mx-auto p-6 rounded-xl bg-[#291C1E]/60 border border-[#4F4445]/40 space-y-4"
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
    </div>
  )
}
