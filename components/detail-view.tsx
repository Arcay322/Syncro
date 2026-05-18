"use client"

import { useState, useCallback } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { getTmdbImageUrl } from "@/lib/tmdb"
import {
  ArrowLeft,
  Play,
  SkipForward,
  Star,
  Clock,
  Calendar,
  Film,
  Tv,
  ChevronDown,
} from "lucide-react"
import type { WatchlistItemWithTmdb } from "@/types"

interface DetailViewProps {
  item: WatchlistItemWithTmdb
  tmdbDetails: any
}

const statusOptions = [
  { value: "WATCHING", label: "Viendo" },
  { value: "COMPLETED", label: "Terminada" },
  { value: "ON_HOLD", label: "En pausa" },
  { value: "DROPPED", label: "Abandonada" },
  { value: "PLAN_TO_WATCH", label: "Pendiente" },
]

export function DetailView({ item, tmdbDetails }: DetailViewProps) {
  const [currentItem, setCurrentItem] = useState(item)
  const [seasons, setSeasons] = useState<any[]>(tmdbDetails.seasons || [])
  const [selectedSeason, setSelectedSeason] = useState(currentItem.currentSeason || 1)
  const [seasonEpisodes, setSeasonEpisodes] = useState<any[]>([])
  const [loadingSeason, setLoadingSeason] = useState(false)
  const [saving, setSaving] = useState(false)
  const [notes, setNotes] = useState(currentItem.notes || "")
  const [rating, setRating] = useState(currentItem.rating || 0)

  const isTv = item.mediaType === "tv"

  const fetchSeason = useCallback(
    async (seasonNumber: number) => {
      if (!isTv) return
      setLoadingSeason(true)
      try {
        const res = await fetch(
          `/api/tmdb/season?tvId=${item.tmdbId}&season=${seasonNumber}`
        )
        const data = await res.json()
        setSeasonEpisodes(data.episodes || [])
      } catch (error) {
        setSeasonEpisodes([])
      }
      setLoadingSeason(false)
    },
    [isTv, item.tmdbId]
  )

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
    const totalEpisodes = currentSeasonData?.episode_count || 99

    if (episode < totalEpisodes) {
      updateItem({ currentSeason: season, currentEpisode: episode + 1 })
    } else {
      const nextSeason = seasons.find((s: any) => s.season_number === season + 1)
      if (nextSeason) {
        updateItem({ currentSeason: season + 1, currentEpisode: 1 })
      }
    }
  }

  const handleStatusChange = (status: string | null) => {
    if (status) updateItem({ status })
  }

  const handleRatingChange = (value: number) => {
    setRating(value)
    updateItem({ rating: value })
  }

  const handleNotesSave = () => {
    updateItem({ notes })
  }

  const handleSeasonChange = (value: string) => {
    const season = parseInt(value)
    setSelectedSeason(season)
    fetchSeason(season)
  }

  const handleEpisodeChange = (value: string) => {
    const episode = parseInt(value)
    updateItem({ currentSeason: selectedSeason, currentEpisode: episode })
  }

  const handleMinuteChange = (value: string) => {
    const minute = parseInt(value) || 0
    updateItem({ currentMinute: minute })
  }

  return (
    <div className="space-y-8">
      {/* Backdrop Header */}
      <div className="relative -mx-4 -mt-8 h-64 md:h-80 overflow-hidden">
        <Image
          src={getTmdbImageUrl(tmdbDetails.backdrop_path || tmdbDetails.poster_path, "original")}
          alt={item.title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-4 md:p-8">
          <Link href="/">
            <Button variant="ghost" size="sm" className="mb-4 gap-2 -ml-2 text-white/80 hover:text-white hover:bg-white/10">
              <ArrowLeft className="w-4 h-4" />
              Volver
            </Button>
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
            {item.title}
          </h1>
          <div className="flex items-center gap-3 mt-3 text-white/70">
            <Badge variant="secondary" className="bg-white/20 text-white border-0 backdrop-blur-sm">
              {isTv ? <Tv className="w-3 h-3 mr-1" /> : <Film className="w-3 h-3 mr-1" />}
              {isTv ? "Serie" : "Película"}
            </Badge>
            {tmdbDetails.vote_average > 0 && (
              <span className="flex items-center gap-1 text-sm">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                {tmdbDetails.vote_average.toFixed(1)}
              </span>
            )}
            {tmdbDetails.release_date && (
              <span className="flex items-center gap-1 text-sm">
                <Calendar className="w-4 h-4" />
                {tmdbDetails.release_date.substring(0, 4)}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-[280px_1fr] gap-8">
        {/* Poster */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="hidden md:block"
        >
          <div className="relative aspect-[2/3] rounded-2xl overflow-hidden shadow-lg">
            <Image
              src={getTmdbImageUrl(item.posterPath)}
              alt={item.title}
              fill
              className="object-cover"
            />
          </div>
        </motion.div>

        {/* Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {tmdbDetails.overview && (
            <div>
              <h2 className="text-lg font-semibold mb-2">Sinopsis</h2>
              <p className="text-muted-foreground leading-relaxed">
                {tmdbDetails.overview}
              </p>
            </div>
          )}

          {/* Status */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Estado</label>
              <Select
                value={currentItem.status}
                onValueChange={handleStatusChange}
              >
                <SelectTrigger className="w-[160px] rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Rating */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Tu rating</label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
                  <button
                    key={star}
                    onClick={() => handleRatingChange(star)}
                    className="p-0.5 transition-transform hover:scale-110"
                  >
                    <Star
                      className={`w-5 h-5 ${
                        star <= rating
                          ? "text-yellow-400 fill-yellow-400"
                          : "text-muted-foreground/30"
                      }`}
                    />
                  </button>
                ))}
                {rating > 0 && <span className="ml-2 text-sm font-medium">{rating}/10</span>}
              </div>
            </div>
          </div>

          {/* Progress */}
          <div className="p-6 rounded-2xl bg-muted/50 space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Play className="w-5 h-5" />
              Progreso
            </h2>

            {isTv ? (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">Temporada</label>
                    <Select
                      value={String(currentItem.currentSeason || selectedSeason)}
                      onValueChange={(v: string | null) => {
                        if (!v) return
                        handleSeasonChange(v)
                        updateItem({ currentSeason: parseInt(v) })
                      }}
                    >
                      <SelectTrigger className="w-[100px] rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {seasons
                          ?.filter((s: any) => s.season_number > 0)
                          .map((s: any) => (
                            <SelectItem key={s.season_number} value={String(s.season_number)}>
                              T{s.season_number}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">Episodio</label>
                    <Select
                      value={String(currentItem.currentEpisode || "")}
                      onValueChange={(v: string | null) => {
                        if (v) handleEpisodeChange(v)
                      }}
                    >
                      <SelectTrigger className="w-[100px] rounded-xl">
                        <SelectValue placeholder="E" />
                      </SelectTrigger>
                      <SelectContent>
                        {seasonEpisodes.length > 0
                          ? seasonEpisodes.map((ep: any) => (
                              <SelectItem key={ep.episode_number} value={String(ep.episode_number)}>
                                E{ep.episode_number} - {ep.name}
                              </SelectItem>
                            ))
                          : Array.from({ length: 20 }, (_, i) => i + 1).map((n) => (
                              <SelectItem key={n} value={String(n)}>
                                E{n}
                              </SelectItem>
                            ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">Minuto</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={0}
                        value={currentItem.currentMinute || ""}
                        onChange={(e) => handleMinuteChange(e.target.value)}
                        className="w-20 h-9 px-3 rounded-xl border bg-background text-sm"
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleNextEpisode}
                  className="gap-2 rounded-full"
                  disabled={saving}
                >
                  <SkipForward className="w-4 h-4" />
                  Siguiente episodio
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Minuto actual</label>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <input
                      type="number"
                      min={0}
                      value={currentItem.currentMinute || ""}
                      onChange={(e) => handleMinuteChange(e.target.value)}
                      className="w-24 h-9 px-3 rounded-xl border bg-background text-sm"
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>
            )}

            {saving && (
              <p className="text-xs text-muted-foreground">Guardando...</p>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Notas</label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Escribe tus notas sobre esta serie o película..."
              className="min-h-[100px] rounded-xl resize-none"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={handleNotesSave}
              disabled={saving}
              className="rounded-full"
            >
              Guardar notas
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
