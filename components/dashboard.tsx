"use client"

import { useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { WatchlistCard } from "./watchlist-card"
import { SearchCommand } from "./search-command"
import { GroupManager } from "./group-manager"
import { StatusFilter } from "./status-filter"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Users, User, Film, Sparkles, Trophy, Play } from "lucide-react"
import { getTmdbImageUrl } from "@/lib/tmdb"
import type { WatchlistItemWithTmdb } from "@/types"
import type { Group } from "@prisma/client"

interface DashboardProps {
  initialItems: WatchlistItemWithTmdb[]
  group: Group | null
  userId: string
}

export function Dashboard({ initialItems, group, userId }: DashboardProps) {
  const [mode, setMode] = useState<"personal" | "group">("personal")
  const [items, setItems] = useState(initialItems)
  const [filter, setFilter] = useState<string>("ALL")
  const [searchOpen, setSearchOpen] = useState(false)
  const [groupState, setGroupState] = useState(group)

  const loadItems = useCallback(
    async (targetMode: "personal" | "group") => {
      const url = targetMode === "group" && groupState
        ? `/api/watchlist?groupId=${groupState.id}`
        : "/api/watchlist"
      const res = await fetch(url)
      const data = await res.json()
      setItems(data.items || [])
    },
    [groupState]
  )

  const handleModeChange = async (value: string) => {
    const newMode = value as "personal" | "group"
    setMode(newMode)
    await loadItems(newMode)
  }

  const handleItemUpdate = (updatedItem: WatchlistItemWithTmdb) => {
    setItems((prev) =>
      prev.map((item) => (item.id === updatedItem.id ? updatedItem : item))
    )
  }

  const handleItemDelete = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id))
  }

  const handleItemAdded = (item: WatchlistItemWithTmdb) => {
    setItems((prev) => [item, ...prev])
  }

  const filteredItems =
    filter === "ALL"
      ? items
      : items.filter((item) => item.status === filter)

  const watchingItems = items.filter((i) => i.status === "WATCHING")
  const watchingCount = watchingItems.length
  const completedCount = items.filter((i) => i.status === "COMPLETED").length
  const heroItem = watchingItems[0]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-semibold tracking-tight text-foreground font-display">
              {mode === "personal" ? "Mi Watchlist" : groupState?.name || "Sala Compartida"}
            </h1>
            <p className="text-muted-foreground mt-1.5 font-body">
              {mode === "personal"
                ? `${items.length} títulos en tu colección`
                : "Sincronizando progreso juntos"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {groupState && (
              <Tabs value={mode} onValueChange={handleModeChange}>
                <TabsList className="bg-card/50 border border-border-soft p-1">
                  <TabsTrigger value="personal" className="gap-2 rounded-lg data-[state=active]:bg-amber-500/15 data-[state=active]:text-amber-400">
                    <User className="w-4 h-4" />
                    <span className="hidden sm:inline">Personal</span>
                  </TabsTrigger>
                  <TabsTrigger value="group" className="gap-2 rounded-lg data-[state=active]:bg-amber-500/15 data-[state=active]:text-amber-400">
                    <Users className="w-4 h-4" />
                    <span className="hidden sm:inline">Sala</span>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            )}
            <Button
              onClick={() => setSearchOpen(true)}
              className="gap-2 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 text-background hover:from-amber-300 hover:to-amber-400 shadow-lg shadow-amber-500/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              Agregar
            </Button>
          </div>
        </div>

        {/* Asymmetric Stats */}
        <div className="grid grid-cols-12 gap-3">
          {/* Hero stat - watching */}
          <div className="col-span-12 md:col-span-5 flex items-center gap-4 px-5 py-4 rounded-2xl bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/20">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <p className="text-3xl font-bold text-foreground font-display">{watchingCount}</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Viendo ahora</p>
            </div>
          </div>
          
          {/* Secondary stats */}
          <div className="col-span-6 md:col-span-4 flex items-center gap-3 px-4 py-4 rounded-2xl bg-card/50 border border-border-soft">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center">
              <Trophy className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground font-display">{completedCount}</p>
              <p className="text-xs text-muted-foreground">Terminadas</p>
            </div>
          </div>
          
          <div className="col-span-6 md:col-span-3 flex items-center gap-3 px-4 py-4 rounded-2xl bg-card/50 border border-border-soft">
            <div className="w-10 h-10 rounded-xl bg-slate-500/15 flex items-center justify-center">
              <Film className="w-5 h-5 text-slate-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground font-display">{items.length}</p>
              <p className="text-xs text-muted-foreground">Total</p>
            </div>
          </div>
        </div>

        {/* Hero section - Currently watching */}
        {heroItem && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative rounded-3xl overflow-hidden aspect-[21/9] md:aspect-[3/1] group cursor-pointer"
            onClick={() => window.location.href = `/${heroItem.id}`}
          >
            <img
              src={getTmdbImageUrl(heroItem.backdropPath || heroItem.posterPath, "original")}
              alt={heroItem.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-transparent" />
            
            {/* Watching glow */}
            <div className="absolute inset-0 ring-2 ring-amber-500/30 ring-inset shadow-[inset_0_0_80px_rgba(245,158,11,0.15)]" />
            
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
              <div className="flex items-end justify-between">
                <div className="max-w-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-xs font-medium border border-amber-500/30">
                      Viendo ahora
                    </span>
                    {heroItem.mediaType === "tv" && heroItem.currentSeason && heroItem.currentEpisode && (
                      <span className="text-xs text-white/60 font-mono">
                        T{heroItem.currentSeason}:E{heroItem.currentEpisode}
                      </span>
                    )}
                  </div>
                  <h2 className="text-2xl md:text-4xl font-semibold text-white font-display tracking-tight">
                    {heroItem.title}
                  </h2>
                  <p className="text-white/60 mt-1 text-sm max-w-md line-clamp-2">
                    Continúa viendo donde lo dejaste
                  </p>
                </div>
                <Button className="rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 text-white hover:bg-white/20 hidden md:flex gap-2">
                  <Play className="w-4 h-4" />
                  Continuar
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        <StatusFilter value={filter} onChange={setFilter} />
      </div>

      {!groupState && mode === "personal" && (
        <GroupManager onGroupChange={setGroupState} />
      )}

      <AnimatePresence mode="popLayout">
        {filteredItems.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col items-center justify-center py-24 text-center"
          >
            <div className="w-20 h-20 rounded-2xl bg-amber-500/10 flex items-center justify-center mb-6">
              <Film className="w-10 h-10 text-amber-400/50" />
            </div>
            <h3 className="text-xl font-semibold text-foreground font-display">Nada por aquí</h3>
            <p className="text-muted-foreground max-w-sm mt-2 leading-relaxed">
              {mode === "group" && !groupState
                ? "Únete a una sala compartida para ver contenido en conjunto"
                : "Agrega una película o serie para empezar a llevar el registro"}
            </p>
            {mode !== "group" && (
              <Button
                variant="outline"
                className="mt-6 rounded-xl border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
                onClick={() => setSearchOpen(true)}
              >
                Buscar contenido
              </Button>
            )}
          </motion.div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5 md:gap-6">
            {filteredItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.05 }}
              >
                <WatchlistCard
                  item={item}
                  onUpdate={handleItemUpdate}
                  onDelete={handleItemDelete}
                />
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

      <SearchCommand
        open={searchOpen}
        onOpenChange={setSearchOpen}
        onItemAdded={handleItemAdded}
        groupId={mode === "group" && groupState ? groupState.id : undefined}
      />
    </div>
  )
}
