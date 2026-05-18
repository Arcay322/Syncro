"use client"

import { useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { WatchlistCard } from "./watchlist-card"
import { SearchCommand } from "./search-command"
import { GroupManager } from "./group-manager"
import { StatusFilter } from "./status-filter"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Users, User, Film } from "lucide-react"
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

  const watchingCount = items.filter((i) => i.status === "WATCHING").length
  const completedCount = items.filter((i) => i.status === "COMPLETED").length

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              {mode === "personal" ? "Mi Watchlist" : groupState?.name || "Sala Compartida"}
            </h1>
            <p className="text-muted-foreground mt-1.5">
              {mode === "personal"
                ? `${items.length} títulos en tu colección`
                : "Sincronizando progreso juntos"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {groupState && (
              <Tabs value={mode} onValueChange={handleModeChange}>
                <TabsList className="bg-card/50 border border-border/40 p-1">
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
              className="gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-background hover:from-amber-300 hover:to-amber-400 shadow-lg shadow-amber-500/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              Agregar
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="flex gap-4">
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-card/50 border border-border/40">
            <div className="w-10 h-10 rounded-lg bg-amber-500/15 flex items-center justify-center">
              <Film className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{items.length}</p>
              <p className="text-xs text-muted-foreground">Total</p>
            </div>
          </div>
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-card/50 border border-border/40">
            <div className="w-10 h-10 rounded-lg bg-amber-500/15 flex items-center justify-center">
              <Users className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{watchingCount}</p>
              <p className="text-xs text-muted-foreground">Viendo</p>
            </div>
          </div>
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-card/50 border border-border/40">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/15 flex items-center justify-center">
              <Film className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{completedCount}</p>
              <p className="text-xs text-muted-foreground">Terminadas</p>
            </div>
          </div>
        </div>

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
            <h3 className="text-xl font-semibold text-foreground">Nada por aquí</h3>
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
