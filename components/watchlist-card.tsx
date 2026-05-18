"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { getTmdbImageUrl } from "@/lib/tmdb"
import { MoreHorizontal, Play, Check, Pause, Trash2, ChevronRight } from "lucide-react"
import type { WatchlistItemWithTmdb } from "@/types"

const statusLabels: Record<string, string> = {
  WATCHING: "Viendo",
  COMPLETED: "Terminada",
  ON_HOLD: "En pausa",
  DROPPED: "Abandonada",
  PLAN_TO_WATCH: "Pendiente",
}

interface WatchlistCardProps {
  item: WatchlistItemWithTmdb
  onUpdate: (item: WatchlistItemWithTmdb) => void
  onDelete: (id: string) => void
  compact?: boolean
}

export function WatchlistCard({ item, onUpdate, onDelete, compact }: WatchlistCardProps) {
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
    }
    setIsLoading(false)
  }

  const handleDelete = async () => {
    if (!confirm("¿Eliminar?")) return
    const res = await fetch(`/api/watchlist/${item.id}`, { method: "DELETE" })
    if (res.ok) onDelete(item.id)
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
    }
    setIsLoading(false)
  }

  const progressText =
    item.mediaType === "tv" && item.currentSeason && item.currentEpisode
      ? `T${item.currentSeason}:E${item.currentEpisode}`
      : item.currentMinute
      ? `${Math.floor(item.currentMinute / 60)}h ${item.currentMinute % 60}m`
      : null

  if (compact) {
    return (
      <motion.div whileHover={{ y: -4 }} transition={{ type: "spring", stiffness: 300 }}>
        <Link href={`/${item.id}`} className="block group">
          <div className="relative aspect-[2/3] overflow-hidden border border-[rgba(245,197,24,0.15)] bg-[#2c1a1d]">
            <img
              src={getTmdbImageUrl(item.posterPath)}
              alt={item.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            <div className="absolute top-2 right-2">
              <span className="text-[9px] px-1.5 py-0.5 bg-[#f5c518] text-[#1b1012] font-medium tracking-wider uppercase">Compartido</span>
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-2">
              <p className="text-xs font-medium text-[#f4dde0] leading-tight line-clamp-2">{item.title}</p>
              {progressText && <p className="text-[9px] text-[#9b8e8f] mt-0.5 font-mono">{progressText}</p>}
            </div>
          </div>
        </Link>
      </motion.div>
    )
  }

  return (
    <motion.div whileHover={{ y: -4 }} transition={{ type: "spring", stiffness: 300 }}>
      <div className="border border-[rgba(245,197,24,0.2)] bg-[#2c1a1d] overflow-hidden group">
        {/* Poster */}
        <Link href={`/${item.id}`} className="block relative aspect-[16/10] overflow-hidden">
          <img
            src={getTmdbImageUrl(item.backdropPath || item.posterPath, "w780")}
            alt={item.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#2c1a1d] via-transparent to-transparent" />
          
          {/* Shared badge */}
          <div className="absolute top-3 left-3">
            <span className="text-[10px] px-2 py-1 bg-[#f5c518] text-[#1b1012] font-medium tracking-wider uppercase">Compartido</span>
          </div>
          
          {/* Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger onClick={(e) => e.preventDefault()}>
              <div className="absolute top-3 right-3 h-7 w-7 bg-black/40 backdrop-blur flex items-center justify-center cursor-pointer hover:bg-black/60 transition-colors">
                <MoreHorizontal className="h-3.5 w-3.5 text-white" />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-[#2c1a1d] border border-[rgba(245,197,24,0.15)] min-w-[140px]">
              <DropdownMenuItem onClick={(e) => { e.preventDefault(); updateStatus("WATCHING") }} disabled={isLoading} className="text-xs text-[#f4dde0]">
                <Play className="mr-1.5 h-3 w-3 text-[#f5c518]" /> Viendo
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => { e.preventDefault(); updateStatus("COMPLETED") }} disabled={isLoading} className="text-xs text-[#f4dde0]">
                <Check className="mr-1.5 h-3 w-3 text-emerald-400" /> Terminada
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => { e.preventDefault(); updateStatus("ON_HOLD") }} disabled={isLoading} className="text-xs text-[#f4dde0]">
                <Pause className="mr-1.5 h-3 w-3 text-yellow-400" /> En pausa
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => { e.preventDefault(); handleDelete() }} className="text-[#ffb4ab] focus:text-[#ffb4ab] text-xs">
                <Trash2 className="mr-1.5 h-3 w-3" /> Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </Link>

        {/* Info */}
        <div className="p-4">
          <h3 className="text-base font-display font-semibold text-[#f4dde0] mb-1">{item.title}</h3>
          {progressText && (
            <p className="text-xs text-[#9b8e8f] font-mono mb-3">{progressText}</p>
          )}
          
          {/* Next episode button */}
          {item.mediaType === "tv" && (
            <Button
              onClick={handleNextEpisode}
              disabled={isLoading}
              className="w-full h-9 bg-[#f5c518] text-[#1b1012] hover:bg-[#f5c518]/90 rounded-sm text-xs font-medium tracking-wider uppercase"
            >
              <ChevronRight className="w-3.5 h-3.5 mr-1" />
              Marcar siguiente capítulo
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  )
}
