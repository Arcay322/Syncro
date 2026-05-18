"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
  WATCHING: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  COMPLETED: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  ON_HOLD: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  DROPPED: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  PLAN_TO_WATCH: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400",
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
      ? `${Math.floor(item.currentMinute / 60)}:${String(item.currentMinute % 60).padStart(2, "0")}`
      : null

  return (
    <motion.div whileHover={{ y: -4 }} transition={{ type: "spring", stiffness: 300 }}>
      <Card className="group relative overflow-hidden border-0 shadow-sm hover:shadow-md transition-shadow bg-card">
        <Link href={`/${item.id}`} className="block">
          <div className="relative aspect-[2/3] overflow-hidden bg-muted">
            <Image
              src={getTmdbImageUrl(item.posterPath)}
              alt={item.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 20vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Badge variant="secondary" className="bg-black/50 text-white backdrop-blur-sm border-0">
                {item.mediaType === "movie" ? "Película" : "Serie"}
              </Badge>
            </div>
          </div>
        </Link>

        <div className="p-3">
          <div className="flex items-start justify-between gap-2">
            <Link href={`/${item.id}`} className="flex-1 min-w-0">
              <h3 className="font-medium text-sm leading-tight truncate">
                {item.title}
              </h3>
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger>
                <div className="h-7 w-7 -mr-1 shrink-0 flex items-center justify-center cursor-pointer">
                  <MoreHorizontal className="h-4 w-4" />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => updateStatus("WATCHING")} disabled={isLoading}>
                  <Play className="mr-2 h-4 w-4" /> Viendo
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => updateStatus("COMPLETED")} disabled={isLoading}>
                  <Check className="mr-2 h-4 w-4" /> Terminada
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => updateStatus("ON_HOLD")} disabled={isLoading}>
                  <Pause className="mr-2 h-4 w-4" /> En pausa
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleDelete}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" /> Eliminar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex items-center gap-2 mt-2">
            <Badge
              variant="secondary"
              className={`text-[10px] px-1.5 py-0.5 font-medium ${statusColors[item.status] || ""}`}
            >
              {statusLabels[item.status] || item.status}
            </Badge>
            {progressText && (
              <span className="text-[10px] text-muted-foreground">{progressText}</span>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  )
}
