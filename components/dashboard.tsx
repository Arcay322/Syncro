"use client"

import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { WatchlistCard } from "./watchlist-card"
import { SearchCommand } from "./search-command"
import { RouletteDialog } from "./roulette-dialog"
import { StatusFilter } from "./status-filter"
import { Button } from "@/components/ui/button"
import { Plus, Film, Clapperboard, Clock, CheckCircle, Tv, TrendingUp, Sparkles } from "lucide-react"
import { GroupManager } from "./group-manager"
import type { WatchlistItemWithTmdb } from "@/types"

interface GroupMember {
  id: string
  role: string
  user: {
    id: string
    name: string | null
    image: string | null
  }
}

interface GroupWithMembers {
  id: string
  name: string
  inviteCode: string
  createdAt: Date
  members: GroupMember[]
}

interface DashboardProps {
  initialItems: WatchlistItemWithTmdb[]
  group: GroupWithMembers | null
  userId: string
}

function formatTimeAgo(date: Date): string {
  const now = new Date()
  const diff = now.getTime() - new Date(date).getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  
  if (minutes < 1) return "Justo ahora"
  if (minutes < 60) return `Hace ${minutes} min`
  if (hours < 24) return `Hace ${hours} h`
  if (days < 7) return `Hace ${days} d`
  return new Date(date).toLocaleDateString("es", { day: "numeric", month: "short" })
}

export function Dashboard({ initialItems, group, userId }: DashboardProps) {
  const [items, setItems] = useState(initialItems)
  const [filter, setFilter] = useState<string>("ALL")
  const [searchOpen, setSearchOpen] = useState(false)
  const [rouletteOpen, setRouletteOpen] = useState(false)

  const handleItemUpdate = (updatedItem: WatchlistItemWithTmdb) => {
    setItems((prev) => prev.map((item) => (item.id === updatedItem.id ? updatedItem : item)))
  }

  const handleItemDelete = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id))
  }

  const handleItemAdded = (item: WatchlistItemWithTmdb) => {
    setItems((prev) => [item, ...prev])
  }

  const filteredItems = filter === "ALL" ? items : items.filter((item) => item.status === filter)
  const watchingItems = items.filter((i) => i.status === "WATCHING")

  // Stats
  const stats = useMemo(() => {
    const totalSeries = items.filter((i) => i.mediaType === "tv").length
    const totalMovies = items.filter((i) => i.mediaType === "movie").length
    const completed = items.filter((i) => i.status === "COMPLETED").length
    const totalEpisodes = items.reduce((acc, item) => acc + (item.currentEpisode || 0), 0)
    const estimatedHours = Math.round(totalEpisodes * 0.75 + totalMovies * 1.5)
    
    return { totalSeries, totalMovies, completed, totalEpisodes, estimatedHours }
  }, [items])

  // Activity feed
  const activityFeed = useMemo(() => {
    return items
      .filter((item) => item.currentEpisode && item.currentEpisode > 0)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 5)
      .map((item) => ({
        id: item.id,
        title: item.title,
        type: item.mediaType,
        action: item.currentEpisode
          ? `Marcó episodio ${item.currentEpisode}`
          : "Agregó a la lista",
        timestamp: item.updatedAt,
      }))
  }, [items])

  return (
    <div className="w-full px-6 lg:px-12 xl:px-16 py-10">
      {/* Header */}
      <div className="text-center mb-14">
        <p className="text-[10px] tracking-[0.3em] uppercase text-[#9b8e8f] mb-3 font-medium">Nosotros y Series</p>
        <h1 className="text-3xl md:text-4xl font-display font-semibold text-[#f4dde0] tracking-tight">
          Nuestro sofá, nuestras series
        </h1>
        <div className="deco-divider mt-5 max-w-xl mx-auto" />
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left content - 2 cols */}
        <div className="lg:col-span-2 space-y-8">
          {/* Section header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Film className="w-4 h-4 text-[#9b8e8f]" />
              <span className="text-[10px] tracking-[0.2em] uppercase text-[#9b8e8f] font-medium">Viendo ahora</span>
            </div>
            <Button
              onClick={() => setSearchOpen(true)}
              size="sm"
              className="h-8 gap-1.5 rounded-md bg-transparent border border-[#4f4445] text-[#9b8e8f] hover:bg-[rgba(159,142,143,0.06)] hover:text-[#f4dde0] text-[10px] tracking-wider uppercase px-3"
            >
              <Plus className="w-3.5 h-3.5" />
              Agregar
            </Button>
          </div>

          {/* Watching cards */}
          {watchingItems.length > 0 ? (
            <div className="grid grid-cols-2 xl:grid-cols-3 gap-5">
              {watchingItems.map((item) => (
                <WatchlistCard key={item.id} item={item} onUpdate={handleItemUpdate} onDelete={handleItemDelete} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 border border-dashed border-[#4f4445] rounded-md">
              <Film className="w-8 h-8 text-[#9b8e8f]/30 mx-auto mb-3" />
              <p className="text-sm text-[#9b8e8f]">No estás viendo nada ahora mismo</p>
              <Button
                variant="ghost"
                onClick={() => setSearchOpen(true)}
                className="mt-3 text-xs text-[#9b8e8f] hover:text-[#f4dde0] hover:bg-[rgba(159,142,143,0.04)]"
              >
                Buscar serie o película
              </Button>
            </div>
          )}

          {/* Status filter */}
          <StatusFilter value={filter} onChange={setFilter} />

          {/* All items grid */}
          <AnimatePresence mode="popLayout">
            {filteredItems.length > 0 && (
                <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5"
              >
                {filteredItems.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.04 }}
                  >
                    <WatchlistCard item={item} onUpdate={handleItemUpdate} onDelete={handleItemDelete} />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Recent Activity */}
          <div className="pt-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-3.5 h-3.5 text-[#9b8e8f]" />
              <span className="text-[10px] tracking-[0.2em] uppercase text-[#9b8e8f] font-medium">Actividad reciente</span>
            </div>
            <div className="space-y-2">
              {activityFeed.length > 0 ? (
                activityFeed.map((activity) => (
                  <div key={activity.id} className="flex items-center gap-3 py-2.5 border-b border-[#4f4445]/30">
                    <div className="w-8 h-8 rounded-full bg-[#342729] flex items-center justify-center shrink-0">
                      {activity.type === "tv" ? (
                        <Tv className="w-3.5 h-3.5 text-[#ffd65b]" />
                      ) : (
                        <Film className="w-3.5 h-3.5 text-[#debfc3]" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-[#f4dde0] truncate">{activity.title}</p>
                      <p className="text-[10px] text-[#9b8e8f]">
                        {activity.action}
                      </p>
                    </div>
                    <span className="text-[9px] text-[#9b8e8f] tracking-wider shrink-0">
                      {formatTimeAgo(activity.timestamp)}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-[#9b8e8f] py-4 text-center">No hay actividad reciente</p>
              )}
            </div>
          </div>
        </div>

        {/* Right sidebar - 1 col */}
        <div className="space-y-6">
          {/* Roulette - Art Deco Projector Theme */}
          <div className="p-6 border-2 border-double border-[#ffd65b]/50 rounded-lg bg-[#291c1e]/85 relative overflow-hidden shadow-[0_0_15px_rgba(255,214,91,0.08)] group hover:shadow-[0_0_25px_rgba(255,214,91,0.15)] transition-all duration-300">
            
            {/* Projector Flickering Light Beam (Background) */}
            <motion.div
              animate={{ 
                opacity: [0.06, 0.12, 0.08, 0.14, 0.1, 0.06],
                scale: [0.99, 1.01, 1, 1.02, 0.99, 0.99]
              }}
              transition={{ 
                repeat: Infinity, 
                duration: 0.5,
                ease: "easeInOut"
              }}
              className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top,rgba(255,214,91,0.18)_0%,transparent_75%)]"
            />

            {/* Film strip sprocket holes background decorative borders */}
            <div className="absolute left-1.5 top-0 bottom-0 flex flex-col justify-between py-2 opacity-15">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={`sprocket-side-l-${i}`} className="w-1.5 h-2.5 bg-[#1b1012] border border-[#ffd65b]/20 rounded-xs" />
              ))}
            </div>
            <div className="absolute right-1.5 top-0 bottom-0 flex flex-col justify-between py-2 opacity-15">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={`sprocket-side-r-${i}`} className="w-1.5 h-2.5 bg-[#1b1012] border border-[#ffd65b]/20 rounded-xs" />
              ))}
            </div>

            <div className="text-center relative z-10 flex flex-col items-center">
              <p className="text-[9px] tracking-[0.3em] uppercase text-[#ffd65b] font-semibold mb-5 flex items-center gap-1.5 drop-shadow-[0_0_3px_rgba(255,214,91,0.15)]">
                <Sparkles className="w-3 h-3 text-[#ffd65b]" />
                La ruleta del destino
              </p>
              
              {/* Slowly Rotating Film Projector Reel */}
              <div className="relative mb-5">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                  className="w-20 h-20 rounded-full border-4 border-dashed border-[#ffd65b]/60 flex items-center justify-center bg-[#291c1e] shadow-[0_0_12px_rgba(255,214,91,0.15)] group-hover:scale-105 group-hover:border-[#ffd65b]/80 group-hover:shadow-[0_0_18px_rgba(255,214,91,0.25)] transition-all duration-300 relative animate-pulse"
                >
                  {/* Inner spokes */}
                  <div className="absolute inset-1.5 rounded-full border border-[#ffd65b]/20 flex items-center justify-center">
                    <div className="w-0.5 h-full bg-[#ffd65b]/15 absolute transform rotate-0" />
                    <div className="w-0.5 h-full bg-[#ffd65b]/15 absolute transform rotate-45" />
                    <div className="w-0.5 h-full bg-[#ffd65b]/15 absolute transform rotate-90" />
                    <div className="w-0.5 h-full bg-[#ffd65b]/15 absolute transform rotate-135" />
                  </div>
                  <Clapperboard className="w-7 h-7 text-[#ffd65b] relative z-10 drop-shadow-[0_0_5px_rgba(255,214,91,0.3)] group-hover:rotate-12 transition-transform duration-300" />
                </motion.div>
                
                {/* Projected soft glow behind reel */}
                <motion.div
                  animate={{ opacity: [0.2, 0.5, 0.3, 0.6, 0.2] }}
                  transition={{ repeat: Infinity, duration: 0.3 }}
                  className="absolute -inset-1.5 bg-yellow-400/5 blur-lg rounded-full -z-10"
                />
              </div>
              
              <Button
                onClick={() => setRouletteOpen(true)}
                className="w-full h-10 bg-transparent border border-[#ffd65b]/60 text-[#ffd65b] hover:bg-[#ffd65b]/10 rounded-md text-[10px] font-semibold tracking-[0.12em] uppercase transition-all duration-300 shadow-[0_0_10px_rgba(255,214,91,0.05)] hover:shadow-[0_0_15px_rgba(255,214,91,0.2)]"
              >
                <span className="mr-1.5 text-xs animate-pulse">⊞</span>
                Girar la bobina
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="p-6 border border-[#4f4445] rounded-lg bg-[#291c1e]">
            <p className="text-[10px] tracking-[0.25em] uppercase text-[#9b8e8f] font-medium mb-5 text-center">Estadísticas juntos</p>
            
            {/* Big number */}
            <div className="text-center mb-5">
              <p className="text-4xl font-display font-bold text-[#ffd65b]">{stats.estimatedHours}</p>
              <p className="text-[10px] text-[#9b8e8f] tracking-[0.15em] uppercase mt-1">horas juntas</p>
            </div>

            {/* Mini stats grid */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              <div className="text-center p-2 bg-[#1b1012] rounded-md">
                <p className="text-lg font-display font-bold text-[#f4dde0]">{stats.totalSeries}</p>
                <p className="text-[9px] text-[#9b8e8f] tracking-wider uppercase">Series</p>
              </div>
              <div className="text-center p-2 bg-[#1b1012] rounded-md">
                <p className="text-lg font-display font-bold text-[#f4dde0]">{stats.totalMovies}</p>
                <p className="text-[9px] text-[#9b8e8f] tracking-wider uppercase">Películas</p>
              </div>
              <div className="text-center p-2 bg-[#1b1012] rounded-md">
                <p className="text-lg font-display font-bold text-[#debfc3]">{stats.completed}</p>
                <p className="text-[9px] text-[#9b8e8f] tracking-wider uppercase">Terminadas</p>
              </div>
              <div className="text-center p-2 bg-[#1b1012] rounded-md">
                <p className="text-lg font-display font-bold text-[#debfc3]">{stats.totalEpisodes}</p>
                <p className="text-[9px] text-[#9b8e8f] tracking-wider uppercase">Episodios</p>
              </div>
            </div>

            {/* Bar chart */}
            <div className="flex items-end justify-center gap-2 h-16">
              <div className="w-7 bg-[#4f4445] rounded-t-sm" style={{ height: '30%' }} />
              <div className="w-7 bg-[#4f4445] rounded-t-sm" style={{ height: '50%' }} />
              <div className="w-7 bg-[#ffd65b] rounded-t-sm" style={{ height: '80%' }} />
              <div className="w-7 bg-[#4f4445] rounded-t-sm" style={{ height: '40%' }} />
              <div className="w-7 bg-[#4f4445] rounded-t-sm" style={{ height: '25%' }} />
            </div>
          </div>

          {/* Group Manager */}
          <GroupManager group={group} onGroupChange={() => {
            window.location.reload()
          }} />
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-20 pt-8 border-t border-[#4f4445]">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-display text-sm font-semibold tracking-[0.15em] text-[#f4dde0] uppercase">Syncro</span>
          </div>
          <p className="text-[10px] text-[#9b8e8f] tracking-[0.15em] uppercase">
            Cinematic Studios · Creado para amar y binge
          </p>
          <div className="flex gap-6">
            <span className="text-[10px] text-[#9b8e8f] hover:text-[#f4dde0] cursor-pointer transition-colors tracking-wider uppercase">Archivo</span>
            <span className="text-[10px] text-[#9b8e8f] hover:text-[#f4dde0] cursor-pointer transition-colors tracking-wider uppercase">Soporte</span>
          </div>
        </div>
      </footer>

      <SearchCommand
        open={searchOpen}
        onOpenChange={setSearchOpen}
        onItemAdded={handleItemAdded}
      />

      <RouletteDialog
        open={rouletteOpen}
        onOpenChange={setRouletteOpen}
        items={items}
        onUpdate={handleItemUpdate}
      />
    </div>
  )
}
