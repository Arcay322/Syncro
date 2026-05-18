"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { getTmdbImageUrl } from "@/lib/tmdb"
import { MoreHorizontal, Play, Check, Pause, Trash2 } from "lucide-react"
import type { WatchlistItemWithTmdb } from "@/types"

const statusLabels: Record<string, string> = {
  WATCHING: "Viendo",
  COMPLETED: "Terminada",
  ON_HOLD: "En pausa",
  DROPPED: "Abandonada",
  PLAN_TO_WATCH: "Pendiente",
}

const statusColors: Record<string, string> = {
  WATCHING: "bg-amber-500/15 text-amber-400 border-amber-500/20",
  COMPLETED: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  ON_HOLD: "bg-yellow-500/15 text-yellow-400 border-yellow-500/20",
  DROPPED: "bg-red-500/15 text-red-400 border-red-500/20",
  PLAN_TO_WATCH: "bg-slate-500/15 text-slate-400 border-slate-500/20",
}

interface WatchlistCardProps {
  item: WatchlistItemWithTmdb
  onUpdate: (item: WatchlistItemWithTmdb) => void
  onDelete: (id: string) => void
}

export function WatchlistCard({ item, onUpdate, onDelete }: WatchlistCardProps) {
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
    if (!confirm("¿Eliminar de tu lista?")) return
    const res = await fetch(`/api/watchlist/${item.id}`, { method: "DELETE" })
    if (res.ok) onDelete(item.id)
  }

  const progressText =
    item.mediaType === "tv" && item.currentSeason && item.currentEpisode
      ? `T${item.currentSeason}:E${item.currentEpisode}`
      : item.currentMinute
      ? `${Math.floor(item.currentMinute / 60)}h ${item.currentMinute % 60}m`
      : null

  const isWatching = item.status === "WATCHING"

  return (
    <motion.div 
      whileHover={{ y: -6, scale: 1.02 }} 
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="group"
    >
      <Link href={`/${item.id}`} className="block">
        <div className="relative aspect-[2/3] overflow-hidden rounded-2xl bg-card shadow-lg shadow-black/40">
          {/* Poster */}
          <img
            src={getTmdbImageUrl(item.posterPath)}
            alt={item.title}
            className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110 group-hover:brightness-75"
          />
          
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80" />
          
          {/* Watching glow effect - signature element */}
          {isWatching && (
            <div className="absolute inset-0 rounded-2xl ring-2 ring-amber-500/40 ring-inset shadow-[inset_0_0_40px_rgba(245,158,11,0.15)]" />
          )}

          {/* Top badges */}
          <div className="absolute top-3 left-3 right-3 flex justify-between items-start opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Badge variant="outline" className="bg-black/60 backdrop-blur-md text-white border-white/10 text-[10px] font-medium">
              {item.mediaType === "movie" ? "Película" : "Serie"}
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger onClick={(e) => e.preventDefault()}>
                <div className="h-8 w-8 rounded-lg bg-black/60 backdrop-blur-md flex items-center justify-center cursor-pointer hover:bg-black/80 transition-colors">
                  <MoreHorizontal className="h-4 w-4 text-white" />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-card border-border/40">
                <DropdownMenuItem onClick={(e) => { e.preventDefault(); updateStatus("WATCHING") }} disabled={isLoading}>
                  <Play className="mr-2 h-4 w-4 text-amber-400" /> Viendo
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => { e.preventDefault(); updateStatus("COMPLETED") }} disabled={isLoading}>
                  <Check className="mr-2 h-4 w-4 text-emerald-400" /> Terminada
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => { e.preventDefault(); updateStatus("ON_HOLD") }} disabled={isLoading}>
                  <Pause className="mr-2 h-4 w-4 text-yellow-400" /> En pausa
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => { e.preventDefault(); handleDelete() }}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" /> Eliminar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Bottom info */}
          <div className="absolute bottom-0 left-0 right-0 p-3">
            <h3 className="font-semibold text-sm text-white leading-tight line-clamp-2 drop-shadow-lg">
              {item.title}
            </h3>
            <div className="flex items-center gap-2 mt-2">
              <Badge
                variant="outline"
                className={`text-[10px] px-2 py-0.5 font-medium border ${statusColors[item.status] || ""}`}
              >
                {statusLabels[item.status] || item.status}
              </Badge>
              {progressText && (
                <span className="text-[10px] text-white/70 font-mono">{progressText}</span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
