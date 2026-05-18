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
      <div className="relative -mx-4 -mt-8 h-[50vh] min-h-[350px] max-h-[500px] overflow-hidden">
        <Image
          src={getTmdbImageUrl(tmdbDetails.backdrop_path || tmdbDetails.poster_path, "original")}
          alt={item.title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-transparent" />
        
        <div className="absolute bottom-0 left-0 right-0 p-4 md:p-8">
          <Link href="/">
            <Button variant="ghost" size="sm" className="mb-4 gap-2 -ml-2 text-white/70 hover:text-white hover:bg-white/10 rounded-xl">
              <ArrowLeft className="w-4 h-4" />
              Volver
            </Button>
          </Link>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-5xl font-bold text-white tracking-tight drop-shadow-lg"
          >
            {item.title}
          </motion.h1>
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex items-center gap-4 mt-4"
          >
            <Badge className="bg-[rgba(245,197,24,0.15)] text-[#f5c518] border-[rgba(245,197,24,0.2)] backdrop-blur-sm">
              {isTv ? <Tv className="w-3 h-3 mr-1" /> : <Film className="w-3 h-3 mr-1" />}
              {isTv ? "Serie" : "Película"}
            </Badge>
            {tmdbDetails.vote_average > 0 && (
              <span className="flex items-center gap-1 text-sm text-white/80">
                <Star className="w-4 h-4 text-[#f5c518] fill-[#f5c518]" />
                {tmdbDetails.vote_average.toFixed(1)}
              </span>
            )}
            {tmdbDetails.release_date && (
              <span className="flex items-center gap-1 text-sm text-white/80">
                <Calendar className="w-4 h-4" />
                {tmdbDetails.release_date.substring(0, 4)}
              </span>
            )}
          </motion.div>
        </div>
      </div>

      <div className="grid md:grid-cols-[300px_1fr] gap-8">
        {/* Poster */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="hidden md:block"
        >
          <div className="relative aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl shadow-black/50 ring-1 ring-white/10">
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
          className="space-y-8"
        >
          {tmdbDetails.overview && (
            <div>
              <h2 className="text-lg font-semibold mb-3 text-foreground">Sinopsis</h2>
              <p className="text-muted-foreground leading-relaxed">
                {tmdbDetails.overview}
              </p>
            </div>
          )}

          {/* Status & Rating */}
          <div className="flex flex-wrap items-center gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Estado</label>
              <Select
                value={currentItem.status}
                onValueChange={handleStatusChange}
              >
                <SelectTrigger className="w-[180px] rounded-xl bg-card border-border/40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border/40">
                  {statusOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Tu rating</label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
                  <button
                    key={star}
                    onClick={() => handleRatingChange(star)}
                    className="p-0.5 transition-transform hover:scale-110"
                  >
                    <Star
                      className={`w-5 h-5 transition-colors ${
                        star <= rating
                          ? "text-[#f5c518] fill-[#f5c518]"
                          : "text-[#9b8e8f]/20"
                      }`}
                    />
                  </button>
                ))}
                {rating > 0 && <span className="ml-2 text-sm font-semibold text-[#f5c518]">{rating}/10</span>}
              </div>
            </div>
          </div>

          {/* Progress */}
          <div className="p-6 rounded-2xl bg-card/50 border border-border/40 space-y-6">
            <h2 className="text-lg font-semibold flex items-center gap-2 text-foreground">
              <Play className="w-5 h-5 text-[#f5c518]" />
              Progreso
            </h2>

            {isTv ? (
              <div className="space-y-4">
                <div className="flex flex-wrap items-end gap-4">
                  <div className="space-y-2">
                    <label className="text-xs text-muted-foreground uppercase tracking-wider">Temporada</label>
                    <Select
                      value={String(currentItem.currentSeason || selectedSeason)}
                      onValueChange={(v: string | null) => {
                        if (!v) return
                        handleSeasonChange(v)
                        updateItem({ currentSeason: parseInt(v) })
                      }}
                    >
                      <SelectTrigger className="w-[120px] rounded-xl bg-card border-border/40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-border/40">
                        {seasons
                          ?.filter((s: any) => s.season_number > 0)
                          .map((s: any) => (
                            <SelectItem key={s.season_number} value={String(s.season_number)}>
                              Temporada {s.season_number}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs text-muted-foreground uppercase tracking-wider">Episodio</label>
                    <Select
                      value={String(currentItem.currentEpisode || "")}
                      onValueChange={(v: string | null) => {
                        if (v) handleEpisodeChange(v)
                      }}
                    >
                      <SelectTrigger className="w-[120px] rounded-xl bg-card border-border/40">
                        <SelectValue placeholder="Ep." />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-border/40">
                        {seasonEpisodes.length > 0
                          ? seasonEpisodes.map((ep: any) => (
                              <SelectItem key={ep.episode_number} value={String(ep.episode_number)}>
                                E{ep.episode_number} - {ep.name}
                              </SelectItem>
                            ))
                          : Array.from({ length: 20 }, (_, i) => i + 1).map((n) => (
                              <SelectItem key={n} value={String(n)}>
                                Episodio {n}
                              </SelectItem>
                            ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs text-muted-foreground uppercase tracking-wider">Minuto</label>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <input
                        type="number"
                        min={0}
                        value={currentItem.currentMinute || ""}
                        onChange={(e) => handleMinuteChange(e.target.value)}
                        className="w-24 h-10 px-3 rounded-xl border border-border/40 bg-card text-sm focus:ring-2 focus:ring-[#f5c518]/30 focus:border-[#f5c518]/50 outline-none transition-all"
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleNextEpisode}
                  className="gap-2 rounded-xl bg-[#debfc3] text-[#1b1012] hover:bg-[#d4b5b9] shadow-lg shadow-[rgba(222,191,195,0.15)]"
                  disabled={saving}
                >
                  <SkipForward className="w-4 h-4" />
                  Siguiente episodio
                </Button>
              </div>
            ) : (
              <div className="flex items-end gap-4">
                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground uppercase tracking-wider">Minuto actual</label>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <input
                      type="number"
                      min={0}
                      value={currentItem.currentMinute || ""}
                      onChange={(e) => handleMinuteChange(e.target.value)}
                      className="w-28 h-10 px-3 rounded-xl border border-border/40 bg-card text-sm focus:ring-2 focus:ring-[#f5c518]/30 focus:border-[#f5c518]/50 outline-none transition-all"
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>
            )}

            {saving && (
              <p className="text-xs text-[#f5c518]/70">Guardando...</p>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-muted-foreground">Notas</label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Escribe tus notas sobre esta serie o película..."
              className="min-h-[120px] rounded-xl resize-none bg-card border-border/40 focus:ring-2 focus:ring-[#f5c518]/30 focus:border-[#f5c518]/50"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={handleNotesSave}
              disabled={saving}
              className="rounded-xl border-[rgba(222,191,195,0.2)] text-[#debfc3] hover:bg-[rgba(222,191,195,0.08)]"
            >
              Guardar notas
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
