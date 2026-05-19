"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { getTmdbImageUrl } from "@/lib/tmdb"
import { Diamond, Sparkles, Users, Bookmark, Trash2 } from "lucide-react"
import type { WatchlistItemWithTmdb } from "@/types"

interface PendientesViewProps {
  pendingItems: WatchlistItemWithTmdb[]
  moodMatches: any[]
  groupName: string | null
}

function ArtDecoLine({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center gap-4 ${className}`}>
      <div className="h-px flex-1 max-w-[100px] bg-gradient-to-r from-transparent via-[#4F4445] to-[#4F4445]" />
      <Diamond className="w-2 h-2 text-[#FFD65B] rotate-45 fill-[#FFD65B]" />
      <div className="h-px flex-1 max-w-[100px] bg-gradient-to-l from-transparent via-[#4F4445] to-[#4F4445]" />
    </div>
  )
}

export function PendientesView({ pendingItems, moodMatches, groupName }: PendientesViewProps) {
  const [items, setItems] = useState(pendingItems)
  const [removingId, setRemovingId] = useState<string | null>(null)

  const handleRemove = async (id: string) => {
    if (!confirm("¿Eliminar de pendientes?")) return
    setRemovingId(id)
    const res = await fetch(`/api/watchlist/${id}`, { method: "DELETE" })
    if (res.ok) {
      setItems((prev) => prev.filter((i) => i.id !== id))
    }
    setRemovingId(null)
  }

  const handleStartWatching = async (id: string) => {
    const res = await fetch(`/api/watchlist/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "WATCHING" }),
    })
    if (res.ok) {
      setItems((prev) => prev.filter((i) => i.id !== id))
    }
  }

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="pt-8 px-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-[#FFD65B] tracking-wide font-serif uppercase">
            El Baúl
          </h1>
          <p className="text-sm text-[#9B8E8F] font-serif max-w-md mx-auto">
            Producciones guardadas para ver más tarde. Tu lista de espera personal.
          </p>
          <ArtDecoLine />
        </motion.div>
      </div>

      {/* Stats Bar */}
      <div className="px-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex justify-center gap-8"
        >
          <div className="text-center">
            <p className="text-2xl font-bold text-[#DEBFC3] font-serif">{items.length}</p>
            <p className="text-[10px] text-[#4F4445] uppercase tracking-wider">Pendientes</p>
          </div>
          <div className="w-px bg-[#4F4445]/40" />
          <div className="text-center">
            <p className="text-2xl font-bold text-[#DEBFC3] font-serif">
              {items.filter((i) => i.mediaType === "tv").length}
            </p>
            <p className="text-[10px] text-[#4F4445] uppercase tracking-wider">Series</p>
          </div>
          <div className="w-px bg-[#4F4445]/40" />
          <div className="text-center">
            <p className="text-2xl font-bold text-[#DEBFC3] font-serif">
              {items.filter((i) => i.mediaType === "movie").length}
            </p>
            <p className="text-[10px] text-[#4F4445] uppercase tracking-wider">Películas</p>
          </div>
        </motion.div>
      </div>

      {/* Mood Matcher */}
      {moodMatches.length > 0 && groupName && (
        <div className="px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-5xl mx-auto"
          >
            <div className="p-6 rounded-xl bg-gradient-to-br from-[#291C1E] to-[#1B1012] border border-[#FFD65B]/20 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#FFD65B]/15 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-[#FFD65B]" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#FFD65B] font-serif">Mood Matcher</h2>
                  <p className="text-xs text-[#9B8E8F]">Vibraciones cruzadas en {groupName}</p>
                </div>
              </div>

              <p className="text-sm text-[#9B8E8F] font-serif">
                Coincidencias de estado de ánimo con otros miembros del cineclub. 
                Estas producciones están en las listas de pendientes de varios miembros.
              </p>

              <div className="grid sm:grid-cols-2 gap-3">
                {moodMatches.map((match, index) => (
                  <motion.div
                    key={`${match.id}-${index}`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center gap-3 p-3 rounded-lg bg-[#1B1012]/60 border border-[#4F4445]/30"
                  >
                    <div className="relative w-12 h-16 rounded-lg overflow-hidden shrink-0">
                      <Image
                        src={getTmdbImageUrl(match.posterPath, "w200")}
                        alt={match.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#DEBFC3] truncate font-serif">{match.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Users className="w-3 h-3 text-[#FFD65B]" />
                        <span className="text-[10px] text-[#9B8E8F]">
                          También en lista de <span className="text-[#FFD65B]">{match.user?.name || "alguien"}</span>
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Decorative Line */}
      <div className="px-4">
        <ArtDecoLine />
      </div>

      {/* Pending List */}
      <div className="px-4 max-w-5xl mx-auto space-y-3">
        {items.length > 0 ? (
          items.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              className={`group flex items-center gap-4 p-4 rounded-xl border transition-all ${
                removingId === item.id ? "opacity-50" : ""
              } bg-[#291C1E]/40 border-[#4F4445]/30 hover:border-[#DEBFC3]/20`}
            >
              {/* Poster */}
              <Link href={`/${item.id}`} className="shrink-0">
                <div className="relative w-14 h-20 rounded-lg overflow-hidden ring-1 ring-[#4F4445]/50 group-hover:ring-[#DEBFC3]/30 transition-all">
                  <Image
                    src={getTmdbImageUrl(item.posterPath, "w200")}
                    alt={item.title}
                    fill
                    className="object-cover"
                  />
                </div>
              </Link>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <Link href={`/${item.id}`}>
                  <h3 className="text-sm font-semibold text-[#DEBFC3] group-hover:text-[#FFD65B] transition-colors font-serif truncate">
                    {item.title}
                  </h3>
                </Link>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-[9px] px-2 py-0.5 rounded-full border ${
                    item.mediaType === "tv"
                      ? "bg-[#DEBFC3]/15 text-[#DEBFC3] border-[#DEBFC3]/20"
                      : "bg-[#9B8E8F]/15 text-[#9B8E8F] border-[#9B8E8F]/20"
                  }`}>
                    {item.mediaType === "tv" ? "Serie" : "Película"}
                  </span>
                  <span className="text-[10px] text-[#4F4445]">
                    Agregado {new Date(item.createdAt).toLocaleDateString("es-ES", { day: "numeric", month: "short" })}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleStartWatching(item.id)}
                  className="px-3 py-1.5 rounded-lg bg-[#DEBFC3] text-[#3F2B2E] text-[10px] font-semibold tracking-wide hover:bg-[#d4b5b9] transition-colors"
                >
                  Empezar
                </button>
                <button
                  onClick={() => handleRemove(item.id)}
                  className="p-1.5 rounded-lg text-[#4F4445] hover:text-[#ffb4ab] hover:bg-[#ffb4ab]/10 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="text-center py-16">
            <Bookmark className="w-12 h-12 text-[#4F4445] mx-auto mb-4" />
            <p className="text-[#9B8E8F] font-serif">El baúl está vacío.</p>
            <p className="text-xs text-[#4F4445] mt-1">Agrega series o películas desde la cartelera.</p>
          </div>
        )}
      </div>
    </div>
  )
}
