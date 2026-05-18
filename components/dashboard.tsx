"use client"

import { useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { WatchlistCard } from "./watchlist-card"
import { SearchCommand } from "./search-command"
import { StatusFilter } from "./status-filter"
import { Button } from "@/components/ui/button"
import { Plus, Film, Sparkles, Clock, Diamond } from "lucide-react"
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
    <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-10">
        <p className="text-[10px] tracking-[0.25em] uppercase text-[#9b8e8f] mb-2 font-medium">Nosotros y Series</p>
        <h1 className="text-3xl md:text-4xl font-display font-semibold text-[#f4dde0] tracking-tight">
          Nuestro sofá, nuestras series
        </h1>
        <div className="deco-divider mt-4 max-w-md mx-auto" />
      </div>

      {/* Main grid - 2/3 content + 1/3 sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left content - 2 cols */}
        <div className="lg:col-span-2 space-y-8">
          {/* Section header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Film className="w-4 h-4 text-[#f5c518]" />
              <span className="text-xs tracking-[0.15em] uppercase text-[#f5c518] font-medium">Viendo ahora</span>
            </div>
            <Button
              onClick={() => setSearchOpen(true)}
              size="sm"
              className="h-8 gap-1.5 rounded-sm bg-transparent border border-[rgba(245,197,24,0.3)] text-[#f5c518] hover:bg-[rgba(245,197,24,0.1)] text-xs px-3"
            >
              <Plus className="w-3.5 h-3.5" />
              Agregar
            </Button>
          </div>

          {/* Movie cards grid */}
          {watchingItems.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {watchingItems.map((item) => (
                <WatchlistCard key={item.id} item={item} onUpdate={handleItemUpdate} onDelete={handleItemDelete} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border border-dashed border-[rgba(245,197,24,0.15)] rounded-sm">
              <Film className="w-8 h-8 text-[#f5c518]/30 mx-auto mb-3" />
              <p className="text-sm text-[#9b8e8f]">No estás viendo nada ahora mismo</p>
              <Button
                variant="ghost"
                onClick={() => setSearchOpen(true)}
                className="mt-3 text-xs text-[#f5c518] hover:text-[#f5c518] hover:bg-[rgba(245,197,24,0.1)]"
              >
                Buscar serie o película
              </Button>
            </div>
          )}

          <StatusFilter value={filter} onChange={setFilter} />

          {/* All items grid */}
          <AnimatePresence mode="popLayout">
            {filteredItems.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"
              >
                {filteredItems.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.04 }}
                  >
                    <WatchlistCard item={item} onUpdate={handleItemUpdate} onDelete={handleItemDelete} compact />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Recent Activity */}
          <div className="pt-6">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-4 h-4 text-[#9b8e8f]" />
              <span className="text-xs tracking-[0.15em] uppercase text-[#9b8e8f] font-medium">Actividad reciente</span>
            </div>
            <div className="space-y-3">
              {items.slice(0, 3).map((item) => (
                <div key={item.id} className="flex items-center gap-3 py-2 border-b border-[rgba(245,197,24,0.06)]">
                  <div className="w-8 h-8 rounded-full bg-[#3f3133] flex items-center justify-center shrink-0">
                    <Film className="w-3.5 h-3.5 text-[#f5c518]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[#f4dde0] truncate">{item.title}</p>
                    <p className="text-[10px] text-[#9b8e8f]">
                      {item.mediaType === "tv" ? "Serie" : "Película"} • Actualizado recientemente
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
          <div className="p-6 border border-[rgba(245,197,24,0.15)] bg-[#2c1a1d] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#f5c518]/5 rounded-full blur-2xl" />
            <div className="text-center relative z-10">
              <Diamond className="w-6 h-6 text-[#f5c518] mx-auto mb-3" />
              <h3 className="text-sm font-display font-semibold text-[#f4dde0] mb-1">La buena, del oeste</h3>
              <p className="text-[10px] text-[#9b8e8f] mb-4">Deja que el cine elija por ti</p>
              <Button
                className="w-full h-10 bg-[#f5c518] text-[#1b1012] hover:bg-[#f5c518]/90 rounded-sm text-xs font-medium tracking-wider uppercase"
              >
                <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                Girar la rueda
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="p-6 border border-[rgba(245,197,24,0.15)] bg-[#2c1a1d]">
            <h3 className="text-xs tracking-[0.15em] uppercase text-[#9b8e8f] font-medium mb-4">Estadísticas juntos</h3>
            <div className="text-center mb-4">
              <p className="text-3xl font-display font-bold text-[#f5c518]">{items.length}</p>
              <p className="text-[10px] text-[#9b8e8f] mt-0.5">horas juntos</p>
            </div>
            {/* Bar chart */}
            <div className="flex items-end justify-center gap-2 h-16">
              <div className="w-6 bg-[#3f3133] rounded-t-sm" style={{ height: '30%' }} />
              <div className="w-6 bg-[#3f3133] rounded-t-sm" style={{ height: '50%' }} />
              <div className="w-6 bg-[#f5c518] rounded-t-sm" style={{ height: '80%' }} />
              <div className="w-6 bg-[#3f3133] rounded-t-sm" style={{ height: '40%' }} />
              <div className="w-6 bg-[#3f3133] rounded-t-sm" style={{ height: '25%' }} />
            </div>
          </div>

          {/* Shared status */}
          {group && (
            <div className="p-4 border border-[rgba(245,197,24,0.15)] bg-[#2c1a1d]">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-[#f5c518]" />
                <span className="text-xs text-[#f4dde0]">Sala compartida activa</span>
              </div>
              <p className="text-[10px] text-[#9b8e8f]">{group.name}</p>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-16 pt-8 border-t border-[rgba(245,197,24,0.1)]">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Diamond className="w-3.5 h-3.5 text-[#f5c518]" />
            <span className="font-display text-sm font-semibold tracking-[0.15em] text-[#f4dde0] uppercase">Syncro</span>
          </div>
          <p className="text-[10px] text-[#9b8e8f] tracking-wider">
            CINEMATIC STUDIOS • CREADO PARA AMAR Y BINGE
          </p>
          <div className="flex gap-4">
            <span className="text-[10px] text-[#9b8e8f] hover:text-[#f4dde0] cursor-pointer transition-colors">Archivo</span>
            <span className="text-[10px] text-[#9b8e8f] hover:text-[#f4dde0] cursor-pointer transition-colors">Soporte</span>
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
