"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { getTmdbImageUrl } from "@/lib/tmdb"
import { Search, Diamond, Filter, X, Play, Check, Clock, Bookmark, Star, Film } from "lucide-react"
import type { WatchlistItemWithTmdb } from "@/types"

interface LibraryViewProps {
  initialItems: WatchlistItemWithTmdb[]
}

const statusFilters = [
  { value: "ALL", label: "Todo el Archivo" },
  { value: "WATCHING", label: "Viendo" },
  { value: "COMPLETED", label: "Terminada" },
  { value: "ON_HOLD", label: "En pausa" },
  { value: "PLAN_TO_WATCH", label: "Pendiente" },
  { value: "DROPPED", label: "Abandonada" },
]

const typeFilters = [
  { value: "ALL", label: "Todo" },
  { value: "tv", label: "Series" },
  { value: "movie", label: "Películas" },
]

const statusLabels: Record<string, string> = {
  WATCHING: "Viendo",
  COMPLETED: "Terminada",
  ON_HOLD: "En pausa",
  DROPPED: "Abandonada",
  PLAN_TO_WATCH: "Pendiente",
}

const statusColors: Record<string, string> = {
  WATCHING: "bg-[#FFD65B]/15 text-[#FFD65B] border-[#FFD65B]/20",
  COMPLETED: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  ON_HOLD: "bg-[#DEBFC3]/15 text-[#DEBFC3] border-[#DEBFC3]/20",
  DROPPED: "bg-red-500/15 text-red-400 border-red-500/20",
  PLAN_TO_WATCH: "bg-[#9B8E8F]/15 text-[#9B8E8F] border-[#9B8E8F]/20",
}

const statusIcons: Record<string, React.ReactNode> = {
  WATCHING: <Play className="w-3 h-3" />,
  COMPLETED: <Check className="w-3 h-3" />,
  ON_HOLD: <Clock className="w-3 h-3" />,
  DROPPED: <X className="w-3 h-3" />,
  PLAN_TO_WATCH: <Bookmark className="w-3 h-3" />,
}

function ArtDecoLine({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center gap-4 ${className}`}>
      <div className="h-px flex-1 max-w-[120px] bg-gradient-to-r from-transparent via-[#4F4445] to-[#4F4445]" />
      <Diamond className="w-2 h-2 text-[#FFD65B] rotate-45 fill-[#FFD65B]" />
      <div className="h-px flex-1 max-w-[120px] bg-gradient-to-l from-transparent via-[#4F4445] to-[#4F4445]" />
    </div>
  )
}

export function LibraryView({ initialItems }: LibraryViewProps) {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [typeFilter, setTypeFilter] = useState("ALL")
  const [items] = useState(initialItems)

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase())
      const matchesStatus = statusFilter === "ALL" || item.status === statusFilter
      const matchesType = typeFilter === "ALL" || item.mediaType === typeFilter
      return matchesSearch && matchesStatus && matchesType
    })
  }, [items, search, statusFilter, typeFilter])

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
            Biblioteca de Series
          </h1>
          <ArtDecoLine />
        </motion.div>
      </div>

      {/* Search */}
      <div className="px-4 max-w-xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative flex items-center gap-2"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4F4445]" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar en el archivo..."
              className="pl-10 h-11 bg-[#291C1E] border-[#4F4445]/50 text-[#DEBFC3] placeholder:text-[#4F4445] rounded-lg focus:ring-[#FFD65B]/30 focus:border-[#FFD65B]/50 font-serif"
            />
          </div>
          <Button className="h-11 px-5 bg-[#DEBFC3] text-[#3F2B2E] hover:bg-[#d4b5b9] rounded-lg font-semibold text-sm tracking-wide">
            BUSCAR
          </Button>
        </motion.div>
      </div>

      {/* Filters */}
      <div className="px-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap items-center justify-center gap-2"
        >
          <div className="flex items-center gap-1.5 text-[#4F4445] mr-2">
            <Filter className="w-3.5 h-3.5" />
            <span className="text-xs uppercase tracking-wider">Filtros</span>
          </div>

          {typeFilters.map((f) => (
            <button
              key={f.value}
              onClick={() => setTypeFilter(f.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                typeFilter === f.value
                  ? "bg-[#DEBFC3] text-[#3F2B2E] border-[#DEBFC3]"
                  : "bg-transparent text-[#9B8E8F] border-[#4F4445]/40 hover:text-[#DEBFC3] hover:border-[#DEBFC3]/30"
              }`}
            >
              {f.label}
            </button>
          ))}

          <div className="w-px h-5 bg-[#4F4445]/40 mx-1" />

          {statusFilters.map((f) => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                statusFilter === f.value
                  ? "bg-[#FFD65B]/15 text-[#FFD65B] border-[#FFD65B]/30"
                  : "bg-transparent text-[#9B8E8F] border-[#4F4445]/40 hover:text-[#DEBFC3] hover:border-[#DEBFC3]/30"
              }`}
            >
              {f.label}
            </button>
          ))}
        </motion.div>
      </div>

      {/* Results Count */}
      <div className="px-4 text-center">
        <p className="text-xs text-[#4F4445] font-serif">
          {filteredItems.length} {filteredItems.length === 1 ? "producción" : "producciones"} en el archivo
        </p>
      </div>

      {/* Grid */}
      <div className="px-4">
        {filteredItems.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-5">
            {filteredItems.map((item, index) => (
              <LibraryCard key={item.id} item={item} index={index} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <Film className="w-12 h-12 text-[#4F4445] mx-auto mb-4" />
            <p className="text-[#9B8E8F] font-serif">No se encontraron producciones en el archivo.</p>
            <p className="text-xs text-[#4F4445] mt-1">Prueba con otros filtros o agrega nuevas series.</p>
          </div>
        )}
      </div>

      {/* Special Collections */}
      {filteredItems.length > 0 && (
        <div className="px-4 pt-8">
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-lg font-bold text-[#DEBFC3] font-serif">Colecciones Especiales</h2>
            <div className="h-px flex-1 bg-gradient-to-r from-[#4F4445] to-transparent" />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <CollectionCard
              title="Cine Negro Moderno"
              subtitle="COLECCIÓN CURADA"
              description="Una selección de series y películas que capturan la estética clásica del noir con un toque contemporáneo."
              cta="Explorar Archivo"
              color="from-[#291C1E] to-[#1B1012]"
            />
            <CollectionCard
              title="Joyas Ocultas"
              subtitle="RECOMENDADAS POR ELLA"
              description="Producciones poco conocidas pero extraordinarias que merecen tu atención."
              cta="Descubrir"
              color="from-[#291C1E] to-[#1B1012]"
            />
          </div>
        </div>
      )}
    </div>
  )
}

function LibraryCard({ item, index }: { item: WatchlistItemWithTmdb; index: number }) {
  const statusLabel = statusLabels[item.status] || item.status
  const progressText =
    item.mediaType === "tv" && item.currentSeason && item.currentEpisode
      ? `T${item.currentSeason} · E${item.currentEpisode}`
      : item.currentMinute
      ? `${Math.floor(item.currentMinute / 60)}h ${item.currentMinute % 60}m`
      : null

  // Estimate rating bar width based on episode progress
  const ratingWidth = item.currentEpisode
    ? Math.min(20 + (item.currentEpisode * 5), 90)
    : item.currentMinute
    ? Math.min(20 + (item.currentMinute / 10), 90)
    : 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
    >
      <Link href={`/${item.id}`} className="block group">
        <div className="relative aspect-[2/3] rounded-xl overflow-hidden mb-3 ring-1 ring-[#4F4445]/30 group-hover:ring-[#DEBFC3]/30 transition-all">
          <Image
            src={getTmdbImageUrl(item.posterPath, "w500")}
            alt={item.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1B1012] via-transparent to-transparent opacity-80" />

          {/* Status Badge */}
          <div className="absolute top-3 left-3">
            <span className={`inline-flex items-center gap-1 text-[9px] px-2.5 py-1 font-semibold tracking-wider rounded-full border ${statusColors[item.status] || statusColors.PLAN_TO_WATCH}`}>
              {statusIcons[item.status]}
              {statusLabel}
            </span>
          </div>

          {/* Shared Badge */}
          {item.groupId && (
            <div className="absolute top-3 right-3">
              <span className="inline-flex items-center text-[9px] px-2 py-1 bg-[#DEBFC3] text-[#3F2B2E] font-semibold tracking-wider rounded-full">
                Compartido
              </span>
            </div>
          )}

          {/* Rating Bar on Image */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#1B1012]/60">
            <div
              className="h-full bg-[#FFD65B] transition-all duration-500"
              style={{ width: `${ratingWidth}%` }}
            />
          </div>
        </div>

        {/* Title */}
        <h3 className="text-sm font-semibold text-[#DEBFC3] leading-tight group-hover:text-[#FFD65B] transition-colors font-serif">
          {item.title}
        </h3>

        {/* Meta */}
        <div className="flex items-center gap-2 mt-1.5">
          {progressText && (
            <span className="text-[10px] text-[#9B8E8F] tracking-wider">{progressText}</span>
          )}
          {item.rating && item.rating > 0 && (
            <>
              <span className="text-[#4F4445]">•</span>
              <span className="text-[10px] text-[#FFD65B] flex items-center gap-0.5">
                <Star className="w-2.5 h-2.5 fill-[#FFD65B]" />
                {item.rating}
              </span>
            </>
          )}
        </div>
      </Link>
    </motion.div>
  )
}

function CollectionCard({
  title,
  subtitle,
  description,
  cta,
  color,
}: {
  title: string
  subtitle: string
  description: string
  cta: string
  color: string
}) {
  return (
    <div className={`relative p-6 rounded-xl bg-gradient-to-br ${color} border border-[#4F4445]/30 overflow-hidden group hover:border-[#DEBFC3]/20 transition-all`}>
      <div className="relative z-10 space-y-3">
        <p className="text-[10px] text-[#FFD65B] uppercase tracking-[0.2em] font-medium">{subtitle}</p>
        <h3 className="text-xl font-bold text-[#DEBFC3] font-serif">{title}</h3>
        <p className="text-sm text-[#9B8E8F] leading-relaxed font-serif max-w-sm">{description}</p>
        <Button
          variant="outline"
          className="mt-2 rounded-lg border-[#DEBFC3]/30 text-[#DEBFC3] hover:bg-[#DEBFC3]/10 text-xs px-4 py-2 h-auto"
        >
          {cta}
        </Button>
      </div>

      {/* Decorative gradient orb */}
      <div className="absolute -bottom-10 -right-10 w-32 h-32 rounded-full bg-[#FFD65B]/5 blur-3xl group-hover:bg-[#FFD65B]/10 transition-all" />
    </div>
  )
}
