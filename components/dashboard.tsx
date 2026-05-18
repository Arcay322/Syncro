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
    <div className="space-y-6 max-w-[1800px] mx-auto">
      {/* Header row */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground font-display">
            {mode === "personal" ? "Mi Watchlist" : groupState?.name || "Sala"}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {items.length} títulos
          </p>
        </div>
        <div className="flex items-center gap-2">
          {groupState && (
            <Tabs value={mode} onValueChange={handleModeChange}>
              <TabsList className="bg-card/50 border border-border-soft p-1 h-9">
                <TabsTrigger value="personal" className="gap-1.5 rounded-md text-xs px-2.5 h-7 data-[state=active]:bg-amber-500/15 data-[state=active]:text-amber-400">
                  <User className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Personal</span>
                </TabsTrigger>
                <TabsTrigger value="group" className="gap-1.5 rounded-md text-xs px-2.5 h-7 data-[state=active]:bg-amber-500/15 data-[state=active]:text-amber-400">
                  <Users className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Sala</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          )}
          <Button
            onClick={() => setSearchOpen(true)}
            size="sm"
            className="gap-1.5 rounded-lg bg-gradient-to-r from-amber-400 to-amber-500 text-background hover:from-amber-300 hover:to-amber-400 text-xs h-8 px-3"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Agregar</span>
          </Button>
        </div>
      </div>

      {/* Compact stats */}
      <div className="flex gap-2">
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span className="text-sm font-semibold text-foreground">{watchingCount}</span>
          <span className="text-xs text-muted-foreground">viendo</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
          <Trophy className="w-4 h-4 text-emerald-400" />
          <span className="text-sm font-semibold text-foreground">{completedCount}</span>
          <span className="text-xs text-muted-foreground">terminadas</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-card/50 border border-border-soft">
          <Film className="w-4 h-4 text-slate-400" />
          <span className="text-sm font-semibold text-foreground">{items.length}</span>
          <span className="text-xs text-muted-foreground">total</span>
        </div>
      </div>

      {/* Hero - only if watching */}
      {heroItem && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative rounded-xl overflow-hidden aspect-[3/1] max-h-[200px] group cursor-pointer"
          onClick={() => window.location.href = `/${heroItem.id}`}
        >
          <img
            src={getTmdbImageUrl(heroItem.backdropPath || heroItem.posterPath, "original")}
            alt={heroItem.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-4 flex items-end justify-between">
            <div>
              <span className="inline-block px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-medium border border-amber-500/30 mb-1.5">
                Viendo ahora
              </span>
              <h2 className="text-xl md:text-2xl font-semibold text-white font-display">
                {heroItem.title}
              </h2>
            </div>
            <Button size="sm" className="rounded-lg bg-white/15 backdrop-blur border border-white/20 text-white hover:bg-white/25 text-xs h-8 gap-1.5">
              <Play className="w-3.5 h-3.5" />
              Continuar
            </Button>
          </div>
        </motion.div>
      )}

      {!groupState && mode === "personal" && (
        <GroupManager onGroupChange={setGroupState} />
      )}

      <StatusFilter value={filter} onChange={setFilter} />

      <AnimatePresence mode="popLayout">
        {filteredItems.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-16 text-center"
          >
            <Film className="w-10 h-10 text-amber-400/30 mb-3" />
            <h3 className="text-lg font-semibold text-foreground font-display">Nada por aquí</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Agrega una película o serie para empezar
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-3">
            {filteredItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
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
