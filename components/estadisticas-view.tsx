"use client"

import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { getTmdbImageUrl } from "@/lib/tmdb"
import {
  Diamond,
  Trophy,
  Star,
  Tv,
  Film,
  Clock,
  BookmarkCheck,
  TrendingUp,
  Award,
  Zap,
  Flame,
  Eye,
  Medal,
} from "lucide-react"

interface EstadisticasViewProps {
  stats: {
    totalItems: number
    totalSeries: number
    totalMovies: number
    completedItems: number
    watchingItems: number
    totalEpisodes: number
    estimatedHours: number
    ratingsGiven: number
    avgRating: string
    statusDistribution: { label: string; value: number; color: string }[]
    typeDistribution: { label: string; value: number; color: string }[]
    topRated: any[]
  }
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

function StatCard({ icon, value, label, delay }: { icon: React.ReactNode; value: string | number; label: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="p-5 rounded-xl bg-[#291C1E]/60 border border-[#4F4445]/30 text-center space-y-2"
    >
      <div className="flex justify-center">{icon}</div>
      <p className="text-2xl font-bold text-[#DEBFC3] font-serif">{value}</p>
      <p className="text-[10px] text-[#4F4445] uppercase tracking-wider">{label}</p>
    </motion.div>
  )
}

function BarChart({ data, title }: { data: { label: string; value: number; color: string }[]; title: string }) {
  const max = Math.max(...data.map((d) => d.value), 1)

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-[#DEBFC3] uppercase tracking-[0.15em] font-serif">{title}</h3>
      <div className="space-y-3">
        {data.map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="space-y-1"
          >
            <div className="flex justify-between text-xs">
              <span className="text-[#9B8E8F]">{item.label}</span>
              <span className="text-[#DEBFC3] font-medium">{item.value}</span>
            </div>
            <div className="h-2 bg-[#1B1012] rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(item.value / max) * 100}%` }}
                transition={{ duration: 0.8, delay: i * 0.1 }}
                className="h-full rounded-full"
                style={{ backgroundColor: item.color }}
              />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

interface Badge {
  id: string
  icon: React.ReactNode
  title: string
  description: string
  unlocked: boolean
  color: string
}

export function EstadisticasView({ stats }: EstadisticasViewProps) {
  const badges: Badge[] = [
    {
      id: "first",
      icon: <Eye className="w-5 h-5" />,
      title: "Primer Vistazo",
      description: "Agregaste tu primera producción",
      unlocked: stats.totalItems >= 1,
      color: "#DEBFC3",
    },
    {
      id: "critic",
      icon: <Star className="w-5 h-5" />,
      title: "Crítico de Sala",
      description: "Diste 10 ratings",
      unlocked: stats.ratingsGiven >= 10,
      color: "#FFD65B",
    },
    {
      id: "collector",
      icon: <BookmarkCheck className="w-5 h-5" />,
      title: "Coleccionista",
      description: "50+ producciones en tu lista",
      unlocked: stats.totalItems >= 50,
      color: "#10B981",
    },
    {
      id: "marathon",
      icon: <Zap className="w-5 h-5" />,
      title: "Maratonista",
      description: "100+ episodios vistos",
      unlocked: stats.totalEpisodes >= 100,
      color: "#F59E0B",
    },
    {
      id: "flame",
      icon: <Flame className="w-5 h-5" />,
      title: "Racha Ardiente",
      description: "7+ días seguidos viendo",
      unlocked: stats.watchingItems >= 3,
      color: "#EF4444",
    },
    {
      id: "master",
      icon: <Trophy className="w-5 h-5" />,
      title: "Maestro del Séptimo Arte",
      description: "20+ producciones terminadas",
      unlocked: stats.completedItems >= 20,
      color: "#FFD65B",
    },
    {
      id: "night",
      icon: <Clock className="w-5 h-5" />,
      title: "Noctámbulo",
      description: "100+ horas de visionado",
      unlocked: stats.estimatedHours >= 100,
      color: "#8B5CF6",
    },
    {
      id: "perfectionist",
      icon: <Medal className="w-5 h-5" />,
      title: "Perfeccionista",
      description: "Rating promedio > 8.0",
      unlocked: parseFloat(stats.avgRating) >= 8,
      color: "#06B6D4",
    },
  ]

  const unlockedCount = badges.filter((b) => b.unlocked).length

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
            Anuario Cinéfilo
          </h1>
          <p className="text-sm text-[#9B8E8F] font-serif max-w-md mx-auto">
            Tu legado en el séptimo arte. Estadísticas, logros y momentos destacados de tu trayectoria.
          </p>
          <ArtDecoLine />
        </motion.div>
      </div>

      {/* Stats Grid */}
      <div className="px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 max-w-3xl mx-auto">
          <StatCard
            icon={<Tv className="w-5 h-5 text-[#DEBFC3]" />}
            value={stats.totalSeries}
            label="Series"
            delay={0.1}
          />
          <StatCard
            icon={<Film className="w-5 h-5 text-[#FFD65B]" />}
            value={stats.totalMovies}
            label="Películas"
            delay={0.15}
          />
          <StatCard
            icon={<TrendingUp className="w-5 h-5 text-emerald-400" />}
            value={stats.completedItems}
            label="Terminadas"
            delay={0.2}
          />
          <StatCard
            icon={<Clock className="w-5 h-5 text-[#9B8E8F]" />}
            value={`${stats.estimatedHours}h`}
            label="Estimadas"
            delay={0.25}
          />
        </div>
      </div>

      {/* Charts */}
      <div className="px-4">
        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-6 rounded-xl bg-[#291C1E]/40 border border-[#4F4445]/30"
          >
            <BarChart data={stats.statusDistribution} title="Distribución por Estado" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="p-6 rounded-xl bg-[#291C1E]/40 border border-[#4F4445]/30"
          >
            <BarChart data={stats.typeDistribution} title="Series vs Películas" />
          </motion.div>
        </div>
      </div>

      {/* Decorative Line */}
      <div className="px-4">
        <ArtDecoLine />
      </div>

      {/* Badges */}
      <div className="px-4 max-w-3xl mx-auto space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-center space-y-2"
        >
          <h2 className="text-xl font-bold text-[#DEBFC3] font-serif">Medallas y Logros</h2>
          <p className="text-xs text-[#4F4445]">
            {unlockedCount} de {badges.length} desbloqueadas
          </p>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {badges.map((badge, index) => (
            <motion.div
              key={badge.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 + index * 0.05 }}
              className={`relative p-4 rounded-xl border text-center space-y-2 transition-all ${
                badge.unlocked
                  ? "bg-[#291C1E]/60 border-[#4F4445]/30"
                  : "bg-[#1B1012]/40 border-[#4F4445]/20 opacity-50"
              }`}
            >
              {badge.unlocked && (
                <div
                  className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: badge.color }}
                >
                  <Award className="w-3 h-3 text-[#1B1012]" />
                </div>
              )}
              <div
                className={`mx-auto w-10 h-10 rounded-full flex items-center justify-center ${
                  badge.unlocked ? "" : "grayscale"
                }`}
                style={{ backgroundColor: badge.unlocked ? `${badge.color}20` : "#4F444520" }}
              >
                <div style={{ color: badge.unlocked ? badge.color : "#4F4445" }}>{badge.icon}</div>
              </div>
              <div>
                <p className={`text-xs font-medium font-serif ${badge.unlocked ? "text-[#DEBFC3]" : "text-[#4F4445]"}`}>
                  {badge.title}
                </p>
                <p className="text-[9px] text-[#4F4445] mt-0.5 leading-tight">{badge.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Decorative Line */}
      <div className="px-4">
        <ArtDecoLine />
      </div>

      {/* Top Rated */}
      {stats.topRated.length > 0 && (
        <div className="px-4 max-w-3xl mx-auto space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="text-center"
          >
            <h2 className="text-xl font-bold text-[#DEBFC3] font-serif">Tus Favoritas</h2>
            <p className="text-xs text-[#4F4445] mt-1">Las producciones mejor valoradas por ti</p>
          </motion.div>

          <div className="space-y-2">
            {stats.topRated.map((item: any, index: number) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + index * 0.05 }}
              >
                <Link
                  href={`/${item.id}`}
                  className="flex items-center gap-4 p-3 rounded-xl bg-[#291C1E]/40 border border-[#4F4445]/30 hover:border-[#DEBFC3]/20 transition-all group"
                >
                  <span className="text-lg font-bold text-[#4F4445] w-6 text-center font-serif">
                    {index + 1}
                  </span>
                  <div className="relative w-10 h-14 rounded-lg overflow-hidden shrink-0">
                    <Image
                      src={getTmdbImageUrl(item.posterPath, "w200")}
                      alt={item.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#DEBFC3] group-hover:text-[#FFD65B] transition-colors font-serif truncate">
                      {item.title}
                    </p>
                    <p className="text-[10px] text-[#4F4445] mt-0.5">
                      {item.mediaType === "tv" ? "Serie" : "Película"}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Star className="w-4 h-4 text-[#FFD65B] fill-[#FFD65B]" />
                    <span className="text-sm font-bold text-[#FFD65B]">{item.rating}</span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Spacing */}
      <div className="h-8" />
    </div>
  )
}
