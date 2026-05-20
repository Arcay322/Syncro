"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { getTmdbImageUrl } from "@/lib/tmdb"
import { MoreHorizontal, Play, Check, Pause, Trash2, Heart, Clock } from "lucide-react"
import type { WatchlistItemWithTmdb } from "@/types"

interface WatchlistCardProps {
  item: WatchlistItemWithTmdb
  onUpdate: (item: WatchlistItemWithTmdb) => void
  onDelete: (id: string) => void
}

export function WatchlistCard({ item, onUpdate, onDelete }: WatchlistCardProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const updateStatus = async (status: string) => {
    setIsLoading(true)
    const res = await fetch(`/api/watchlist/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    })
    if (res.ok) {
      const data = await res.json()
      onUpdate(data.item)
      router.refresh()
    }
    setIsLoading(false)
  }

  const handleDelete = async () => {
    if (!confirm("¿Eliminar?")) return
    const res = await fetch(`/api/watchlist/${item.id}`, { method: "DELETE" })
    if (res.ok) {
      onDelete(item.id)
      router.refresh()
    }
  }

  const handleNextEpisode = async () => {
    const season = item.currentSeason || 1
    const episode = item.currentEpisode || 0
    setIsLoading(true)
    const res = await fetch(`/api/watchlist/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentSeason: season, currentEpisode: episode + 1 }),
    })
    if (res.ok) {
      const data = await res.json()
      onUpdate(data.item)
      router.refresh()
    }
    setIsLoading(false)
  }

  const currentSeason = item.currentSeason ?? 1
  const currentEpisode = item.currentEpisode ?? 0
  const progressText =
    item.mediaType === "tv"
      ? `T${currentSeason} · E${currentEpisode}`
      : item.currentMinute
      ? `${Math.floor(item.currentMinute / 60)}h ${item.currentMinute % 60}m`
      : null

  const [details, setDetails] = useState<{ seasons?: any[]; runtime?: number } | null>(null)

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const cacheKey = `tmdb_details_${item.mediaType}_${item.tmdbId}`
        const cached = localStorage.getItem(cacheKey)
        if (cached) {
          setDetails(JSON.parse(cached))
          return
        }

        const res = await fetch(`/api/tmdb/details?id=${item.tmdbId}&type=${item.mediaType}`)
        if (res.ok) {
          const data = await res.json()
          const detailsData = {
            seasons: data.seasons || null,
            runtime: data.runtime || null,
          }
          localStorage.setItem(cacheKey, JSON.stringify(detailsData))
          setDetails(detailsData)
        }
      } catch (error) {
        console.error("Error fetching details", error)
      }
    }
    fetchDetails()
  }, [item.tmdbId, item.mediaType])

  const getProgressWidth = () => {
    if (item.status === "COMPLETED") return 100
    if (item.status === "PLAN_TO_WATCH") return 0

    if (item.mediaType === "movie") {
      const currentMinute = item.currentMinute || 0
      if (currentMinute === 0) return 0
      
      const runtime = details?.runtime || 120
      return Math.min(100, Math.round((currentMinute / runtime) * 100))
    } else {
      // TV Series
      const currentSeason = item.currentSeason || 1
      const currentEpisode = item.currentEpisode || 0
      
      if (details?.seasons && details.seasons.length > 0) {
        const filteredSeasons = details.seasons.filter((s: any) => s.season_number > 0)
        let watched = 0
        for (const s of filteredSeasons) {
          if (s.season_number < currentSeason) {
            watched += s.episode_count || 0
          } else if (s.season_number === currentSeason) {
            watched += currentEpisode
          }
        }
        const total = filteredSeasons.reduce((acc: number, s: any) => acc + (s.episode_count || 0), 0)
        if (watched === 0) return 0
        if (total > 0) {
          return Math.min(100, Math.round((watched / total) * 100))
        }
      }
      
      // Fallback to estimation if details are not yet loaded/available
      const watchedEpisodes = (currentSeason - 1) * 10 + currentEpisode
      if (watchedEpisodes === 0) return 0
      const estimatedTotalEpisodes = Math.max(watchedEpisodes, currentSeason * 10)
      return Math.min(100, Math.round((watchedEpisodes / estimatedTotalEpisodes) * 100))
    }
  }

  const progressWidth = getProgressWidth()


  return (
    <motion.div whileHover={{ y: -4 }} transition={{ type: "spring", stiffness: 300 }}>
      <div className="border border-[#4f4445] rounded-lg bg-[#291c1e] overflow-hidden group card-glow relative">
        {/* Menu - top left (placed outside the Link as an absolute node to prevent click propagation) */}
        <div className="absolute top-3 left-3 z-20">
          <DropdownMenu>
            <DropdownMenuTrigger onClick={(e) => {
              e.stopPropagation()
              e.preventDefault()
            }}>
              <div
                className="h-6 w-6 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center cursor-pointer hover:bg-black/70 border border-white/10 transition-colors"
                title="Opciones"
              >
                <MoreHorizontal className="h-3 w-3 text-white" />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="bg-[#291c1e] border border-[#4f4445] min-w-[130px] rounded-md shadow-lg">
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation()
                  updateStatus("PLAN_TO_WATCH")
                }}
                disabled={isLoading}
                className="text-xs text-[#f4dde0] cursor-pointer hover:bg-[#debfc3]/10"
              >
                <Clock className="mr-1.5 h-3 w-3 text-[#debfc3]" /> Pendiente
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation()
                  updateStatus("WATCHING")
                }}
                disabled={isLoading}
                className="text-xs text-[#f4dde0] cursor-pointer hover:bg-[#debfc3]/10"
              >
                <Play className="mr-1.5 h-3 w-3 text-[#ffd65b]" /> Viendo
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation()
                  updateStatus("COMPLETED")
                }}
                disabled={isLoading}
                className="text-xs text-[#f4dde0] cursor-pointer hover:bg-[#debfc3]/10"
              >
                <Check className="mr-1.5 h-3 w-3 text-emerald-400" /> Terminada
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation()
                  updateStatus("ON_HOLD")
                }}
                disabled={isLoading}
                className="text-xs text-[#f4dde0] cursor-pointer hover:bg-[#debfc3]/10"
              >
                <Pause className="mr-1.5 h-3 w-3 text-yellow-400" /> En pausa
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation()
                  handleDelete()
                }}
                className="text-[#ffb4ab] focus:text-[#ffb4ab] text-xs cursor-pointer hover:bg-red-500/10"
              >
                <Trash2 className="mr-1.5 h-3 w-3" /> Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Poster image */}
        <Link href={`/${item.id}`} className="block relative aspect-[2/3] overflow-hidden">
          <img
            src={getTmdbImageUrl(item.posterPath)}
            alt={item.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#291c1e]/60 via-transparent to-transparent" />
          
          {/* Shared badge - top right */}
          {item.groupId && (
            <div className="absolute top-3 right-3 z-10">
              <span className="inline-flex items-center gap-1 text-[9px] px-2.5 py-1 bg-[#debfc3] text-[#3f2b2e] font-semibold tracking-wider rounded-full">
                <Heart className="w-2.5 h-2.5" fill="currentColor" /> Compartido
              </span>
            </div>
          )}
        </Link>

        {/* Content */}
        <div className="p-3">
          <h3 className="text-sm font-display font-semibold text-[#f4dde0] mb-0.5 leading-tight">{item.title}</h3>
          {progressText && (
            <p className="text-[10px] text-[#9b8e8f] font-mono tracking-wider mb-3">{progressText}</p>
          )}
          
          {/* Progress bar - gold secondary */}
          <div className="h-[2px] bg-[#3f3133] rounded-full mb-3 overflow-hidden">
            <div 
              className="h-full bg-[#ffd65b] rounded-full transition-all duration-500" 
              style={{ width: `${progressWidth}%` }} 
            />
          </div>
          
          {/* Next episode button - primary beige */}
          {item.mediaType === "tv" && (
            <Button
              onClick={handleNextEpisode}
              disabled={isLoading}
              className="w-full h-9 bg-[#debfc3] text-[#3f2b2e] hover:bg-[#d4b5b9] rounded-md text-[10px] font-semibold tracking-[0.06em] uppercase"
            >
              <Play className="w-3 h-3 mr-1.5 fill-current" />
              Marcar siguiente capítulo
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  )
}
