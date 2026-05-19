"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { WatchlistCard } from "./watchlist-card"
import { SearchCommand } from "./search-command"
import { StatusFilter } from "./status-filter"
import { Button } from "@/components/ui/button"
import { Plus, Film, Clapperboard } from "lucide-react"
import type { WatchlistItemWithTmdb } from "@/types"
import type { Group } from "@prisma/client"

interface DashboardProps {
  initialItems: WatchlistItemWithTmdb[]
  group: Group | null
  userId: string
}

export function Dashboard({ initialItems, group, userId }: DashboardProps) {
  const [items, setItems] = useState(initialItems)
  const [filter, setFilter] = useState<string>("ALL")
  const [searchOpen, setSearchOpen] = useState(false)

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

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="text-center mb-14">
        <p className="text-[10px] tracking-[0.3em] uppercase text-[#9b8e8f] mb-3 font-medium">Nosotros y Series</p>
        <h1 className="text-3xl md:text-4xl font-display font-semibold text-[#f4dde0] tracking-tight">
          Nuestro sofá, nuestras series
        </h1>
        <div className="deco-divider mt-5 max-w-md mx-auto" />
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
            <div className="grid grid-cols-2 gap-5">
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
                className="grid grid-cols-2 md:grid-cols-3 gap-5"
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
              <div className="w-1 h-1 rounded-full bg-[#9b8e8f]" />
              <span className="text-[10px] tracking-[0.2em] uppercase text-[#9b8e8f] font-medium">Actividad reciente</span>
            </div>
            <div className="space-y-3">
              {items.slice(0, 3).map((item) => (
                <div key={item.id} className="flex items-center gap-3 py-2 border-b border-[#4f4445]/30">
                  <div className="w-8 h-8 rounded-full bg-[#3f3133] flex items-center justify-center shrink-0">
                    <Film className="w-3.5 h-3.5 text-[#9b8e8f]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[#f4dde0] truncate">{item.title}</p>
                    <p className="text-[10px] text-[#9b8e8f]">
                      {item.mediaType === "tv" ? "Serie" : "Película"} · Actualizado recientemente
                    </p>
                  </div>
                </div>
              ))}
              {items.length === 0 && (
                <p className="text-xs text-[#9b8e8f] py-4 text-center">No hay actividad reciente</p>
              )}
            </div>
          </div>
        </div>

        {/* Right sidebar - 1 col */}
        <div className="space-y-6">
          {/* Roulette */}
          <div className="p-6 border border-[#4f4445] rounded-lg bg-[#291c1e] relative overflow-hidden">
            <div className="text-center relative z-10">
              <p className="text-[10px] tracking-[0.25em] uppercase text-[#9b8e8f] font-medium mb-5">La ruleta del destino</p>
              
              {/* Dashed circle with clapperboard */}
              <div className="w-20 h-20 mx-auto mb-5 rounded-full border-2 border-dashed border-[#4f4445] flex items-center justify-center">
                <Clapperboard className="w-7 h-7 text-[#9b8e8f]" />
              </div>
              
              <Button
                className="w-full h-10 bg-transparent border border-[#4f4445] text-[#9b8e8f] hover:bg-[rgba(159,142,143,0.06)] hover:text-[#f4dde0] rounded-md text-[10px] font-medium tracking-[0.08em] uppercase"
              >
                <span className="mr-1.5 text-xs">⊞</span>
                Girar la bobina
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="p-6 border border-[#4f4445] rounded-lg bg-[#291c1e]">
            <p className="text-[10px] tracking-[0.25em] uppercase text-[#9b8e8f] font-medium mb-6 text-center">Estadísticas juntos</p>
            <div className="text-center mb-5">
              <p className="text-4xl font-display font-bold text-[#ffd65b]">{items.length}</p>
              <p className="text-[10px] text-[#9b8e8f] tracking-[0.15em] uppercase mt-1">horas juntos</p>
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

          {/* Shared status */}
          {group && (
            <div className="p-4 border border-[#4f4445] rounded-lg bg-[#291c1e]">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 rounded-full bg-[#ffd65b]" />
                <span className="text-xs text-[#f4dde0]">Sala compartida activa</span>
              </div>
              <p className="text-[10px] text-[#9b8e8f]">{group.name}</p>
            </div>
          )}
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
    </div>
  )
}
