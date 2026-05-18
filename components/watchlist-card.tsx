"use client"

import { useState } from "react"
import Link from "next/link"
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion"
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
  WATCHING: "bg-amber-500/15 text-amber-400 border-amber-500/25",
  COMPLETED: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
  ON_HOLD: "bg-yellow-500/15 text-yellow-400 border-yellow-500/25",
  DROPPED: "bg-red-500/15 text-red-400 border-red-500/25",
  PLAN_TO_WATCH: "bg-slate-500/15 text-slate-400 border-slate-500/25",
}

interface WatchlistCardProps {
  item: WatchlistItemWithTmdb
  onUpdate: (item: WatchlistItemWithTmdb) => void
  onDelete: (id: string) => void
}

export function WatchlistCard({ item, onUpdate, onDelete }: WatchlistCardProps) {
  const [isLoading, setIsLoading] = useState(false)
  
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 })
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 })
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["5deg", "-5deg"])
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-5deg", "5deg"])
  
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top
    x.set(mouseX / rect.width - 0.5)
    y.set(mouseY / rect.height - 0.5)
  }
  
  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
  }

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

  const progressText =
    item.mediaType === "tv" && item.currentSeason && item.currentEpisode
      ? `T${item.currentSeason}:E${item.currentEpisode}`
      : item.currentMinute
      ? `${Math.floor(item.currentMinute / 60)}h ${item.currentMinute % 60}m`
      : null

  const isWatching = item.status === "WATCHING"

  return (
    <motion.div 
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileHover={{ scale: 1.04, y: -4 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className="group"
    >
      <Link href={`/${item.id}`} className="block">
        <div className="relative aspect-[2/3] overflow-hidden rounded-xl bg-card shadow-lg shadow-black/40">
          <img
            src={getTmdbImageUrl(item.posterPath)}
            alt={item.title}
            className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110 group-hover:brightness-75"
          />
          
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80" />
          
          {isWatching && (
            <div className="absolute inset-0 ring-1 ring-amber-500/50 ring-inset" />
          )}

          <div className="absolute top-2 left-2 right-2 flex justify-between items-start opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <Badge variant="outline" className="bg-black/60 backdrop-blur text-white border-white/10 text-[9px] px-1.5 py-0">
              {item.mediaType === "movie" ? "PEL" : "SER"}
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger onClick={(e) => e.preventDefault()}>
                <div className="h-6 w-6 rounded-md bg-black/60 backdrop-blur flex items-center justify-center cursor-pointer hover:bg-black/80">
                  <MoreHorizontal className="h-3 w-3 text-white" />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-card border-border-soft min-w-[140px]">
                <DropdownMenuItem onClick={(e) => { e.preventDefault(); updateStatus("WATCHING") }} disabled={isLoading} className="text-xs">
                  <Play className="mr-1.5 h-3 w-3 text-amber-400" /> Viendo
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => { e.preventDefault(); updateStatus("COMPLETED") }} disabled={isLoading} className="text-xs">
                  <Check className="mr-1.5 h-3 w-3 text-emerald-400" /> Terminada
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => { e.preventDefault(); updateStatus("ON_HOLD") }} disabled={isLoading} className="text-xs">
                  <Pause className="mr-1.5 h-3 w-3 text-yellow-400" /> En pausa
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => { e.preventDefault(); handleDelete() }} className="text-red-400 focus:text-red-400 text-xs">
                  <Trash2 className="mr-1.5 h-3 w-3" /> Eliminar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-2">
            <h3 className="font-medium text-xs text-white leading-tight line-clamp-2 drop-shadow-lg">
              {item.title}
            </h3>
            <div className="flex items-center gap-1.5 mt-1">
              <Badge variant="outline" className={`text-[9px] px-1.5 py-0 font-medium border ${statusColors[item.status] || ""}`}>
                {statusLabels[item.status] || item.status}
              </Badge>
              {progressText && (
                <span className="text-[9px] text-white/60 font-mono">{progressText}</span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
