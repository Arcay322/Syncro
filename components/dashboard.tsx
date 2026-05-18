"use client"

import { useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { WatchlistCard } from "./watchlist-card"
import { SearchCommand } from "./search-command"
import { GroupManager } from "./group-manager"
import { StatusFilter } from "./status-filter"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Users, User } from "lucide-react"
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

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Mi Watchlist</h1>
          <p className="text-muted-foreground mt-1">
            {mode === "personal"
              ? "Tu lista personal"
              : groupState
              ? `Sala compartida: ${groupState.name}`
              : "Sala compartida"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {groupState && (
            <Tabs value={mode} onValueChange={handleModeChange}>
              <TabsList className="bg-muted">
                <TabsTrigger value="personal" className="gap-2">
                  <User className="w-4 h-4" />
                  <span className="hidden sm:inline">Personal</span>
                </TabsTrigger>
                <TabsTrigger value="group" className="gap-2">
                  <Users className="w-4 h-4" />
                  <span className="hidden sm:inline">Sala</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          )}
          <Button
            onClick={() => setSearchOpen(true)}
            className="gap-2 rounded-full"
          >
            <Plus className="w-4 h-4" />
            Agregar
          </Button>
        </div>
      </div>

      <StatusFilter value={filter} onChange={setFilter} />

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
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
              <Plus className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium">Nada por aquí</h3>
            <p className="text-muted-foreground max-w-sm mt-2">
              {mode === "group" && !groupState
                ? "Únete a una sala compartida para ver contenido en conjunto"
                : "Agrega una película o serie para empezar a llevar el registro"}
            </p>
            {mode !== "group" && (
              <Button
                variant="outline"
                className="mt-6 rounded-full"
                onClick={() => setSearchOpen(true)}
              >
                Buscar contenido
              </Button>
            )}
          </motion.div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
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
