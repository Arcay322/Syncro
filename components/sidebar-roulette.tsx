"use client"

import { useState, useEffect, useCallback, useRef, useMemo } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { getTmdbImageUrl } from "@/lib/tmdb"
import {
  Clapperboard,
  Film,
  Play,
  RotateCcw,
  Sparkles,
  Tv,
  Eye,
  Clock,
  X
} from "lucide-react"
import type { WatchlistItemWithTmdb } from "@/types"

interface SidebarRouletteProps {
  items: WatchlistItemWithTmdb[]
  onUpdate: (item: WatchlistItemWithTmdb) => void
}

export function SidebarRoulette({ items, onUpdate }: SidebarRouletteProps) {
  const router = useRouter()
  const [isSpinning, setIsSpinning] = useState(false)
  const [spinningTitle, setSpinningTitle] = useState("")
  const [selectedItem, setSelectedItem] = useState<WatchlistItemWithTmdb | null>(null)
  const [saving, setSaving] = useState(false)

  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Filter eligible items: prioritize PLAN_TO_WATCH and ON_HOLD
  const pool = useMemo(() => {
    const pending = items.filter(
      (item) => item.status === "PLAN_TO_WATCH" || item.status === "ON_HOLD"
    )
    return pending.length > 0 ? pending : items.filter((item) => item.status !== "COMPLETED")
  }, [items])

  // Keep a ref of the pool to ensure startSpin always has the latest items without being recreated
  const poolRef = useRef(pool)
  useEffect(() => {
    poolRef.current = pool
  }, [pool])

  const startSpin = useCallback(() => {
    const activePool = poolRef.current
    if (activePool.length === 0) return
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    setIsSpinning(true)
    setSelectedItem(null)
    
    let counter = 0
    const duration = 2200 // Total spin duration in ms
    const intervalTime = 60 // Swap title every 60ms
    const totalSteps = duration / intervalTime

    const interval = setInterval(() => {
      counter++

      if (counter < totalSteps) {
        const randomIdx = Math.floor(Math.random() * activePool.length)
        setSpinningTitle(activePool[randomIdx].title)
      } else {
        clearInterval(interval)
        if (intervalRef.current === interval) {
          intervalRef.current = null
        }

        // Select the winning item randomly
        const finalItem = activePool[Math.floor(Math.random() * activePool.length)]
        
        // Lock it into the film strip viewport first
        setSpinningTitle(finalItem.title)
        setSelectedItem(finalItem)

        // Hold the winner in the film strip for 450ms before showing the final result card
        setTimeout(() => {
          setIsSpinning(false)
        }, 450)
      }
    }, intervalTime)

    intervalRef.current = interval
  }, [])

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [])

  const handleStartWatching = async () => {
    if (!selectedItem) return
    setSaving(true)
    try {
      const res = await fetch(`/api/watchlist/${selectedItem.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "WATCHING" }),
      })
      if (res.ok) {
        const data = await res.json()
        onUpdate(data.item)
        router.refresh()
        // Reset roulette view back to idle after starting to watch
        setSelectedItem(null)
      }
    } catch (error) {
      console.error("Failed to start watching:", error)
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    setSelectedItem(null)
    setIsSpinning(false)
  }

  if (items.length === 0) {
    return (
      <div className="p-6 border-2 border-double border-[#4f4445] rounded-lg bg-[#291c1e]/85 relative overflow-hidden shadow-[0_0_15px_rgba(0,0,0,0.2)]">
        <div className="text-center py-6 relative z-10 flex flex-col items-center">
          <div className="w-12 h-12 mx-auto rounded-full bg-[#1b1012] border border-[#4f4445] flex items-center justify-center mb-4">
            <Film className="w-5 h-5 text-[#9b8e8f]/60" />
          </div>
          <h3 className="text-sm font-display font-semibold text-[#f4dde0] tracking-tight mb-2">
            La bobina está vacía
          </h3>
          <p className="text-[11px] text-[#9b8e8f] leading-relaxed max-w-xs mx-auto">
            Busca y agrega películas o series a tu lista de pendientes primero para que el destino elija por ti.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 border-2 border-double border-[#ffd65b]/50 rounded-lg bg-[#291c1e]/85 relative overflow-hidden shadow-[0_0_15px_rgba(255,214,91,0.08)] group hover:shadow-[0_0_25px_rgba(255,214,91,0.15)] transition-all duration-300 min-h-[290px] flex flex-col justify-center">
      
      {/* Projector Flickering Light Beam (Background) */}
      <motion.div
        animate={{ 
          opacity: isSpinning ? [0.08, 0.18, 0.11, 0.22, 0.14, 0.08] : [0.06, 0.12, 0.08, 0.14, 0.1, 0.06],
          scale: isSpinning ? [0.98, 1.02, 1, 1.03, 0.99, 0.98] : [0.99, 1.01, 1, 1.02, 0.99, 0.99]
        }}
        transition={{ 
          repeat: Infinity, 
          duration: isSpinning ? 0.35 : 0.5,
          ease: "easeInOut"
        }}
        className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top,rgba(255,214,91,0.18)_0%,transparent_75%)]"
      />

      {/* Subtle Dust & Scanline Overlay */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(27,16,18,0)_95%,rgba(255,214,91,0.02)_95%)] bg-[size:100%_4px] opacity-25" />

      {/* Film strip sprocket holes background decorative borders */}
      <div className="absolute left-1.5 top-0 bottom-0 flex flex-col justify-between py-3 opacity-15">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={`sprocket-side-l-${i}`} className="w-1.5 h-2.5 bg-[#1b1012] border border-[#ffd65b]/20 rounded-xs" />
        ))}
      </div>
      <div className="absolute right-1.5 top-0 bottom-0 flex flex-col justify-between py-3 opacity-15">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={`sprocket-side-r-${i}`} className="w-1.5 h-2.5 bg-[#1b1012] border border-[#ffd65b]/20 rounded-xs" />
        ))}
      </div>

      <AnimatePresence mode="wait">
        {isSpinning ? (
          /* SPINNING STATE - PROJECTING IN 35MM */
          <motion.div
            key="spinning"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="text-center relative z-10 flex flex-col items-center space-y-4 w-full"
          >
            <p className="text-[9px] tracking-[0.3em] uppercase text-[#ffd65b] font-semibold flex items-center gap-1.5 drop-shadow-[0_0_3px_rgba(255,214,91,0.15)] animate-pulse">
              <Sparkles className="w-3 h-3 text-[#ffd65b]" />
              La ruleta del destino
            </p>

            {/* Fast Rotating Film Reel */}
            <div className="relative">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1.0, repeat: Infinity, ease: "linear" }}
                className="w-16 h-16 rounded-full border-4 border-dashed border-[#ffd65b]/70 flex items-center justify-center bg-[#291c1e] shadow-[0_0_15px_rgba(255,214,91,0.2)]"
              >
                {/* Inner spokes */}
                <div className="absolute inset-1.5 rounded-full border border-[#ffd65b]/25 flex items-center justify-center">
                  <div className="w-0.5 h-full bg-[#ffd65b]/20 absolute transform rotate-0" />
                  <div className="w-0.5 h-full bg-[#ffd65b]/20 absolute transform rotate-45" />
                  <div className="w-0.5 h-full bg-[#ffd65b]/20 absolute transform rotate-90" />
                  <div className="w-0.5 h-full bg-[#ffd65b]/20 absolute transform rotate-135" />
                </div>
                <Clapperboard className="w-6 h-6 text-[#ffd65b] relative z-10 drop-shadow-[0_0_5px_rgba(255,214,91,0.3)]" />
              </motion.div>
            </div>

            {/* Viewport for titles */}
            <div className="relative w-full flex items-center justify-center px-4 mt-2">
              <div className="w-full h-16 relative overflow-hidden bg-[#1b1012]/90 border-y border-[#ffd65b]/40 flex items-center justify-center px-4 shadow-[inset_0_0_10px_rgba(0,0,0,0.8)]">
                
                {/* Shutter indicators */}
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0 h-0 border-t-4 border-t-transparent border-b-4 border-b-transparent border-l-4 border-l-[#ffd65b] filter drop-shadow-[0_0_1px_rgba(255,214,91,0.5)] z-20" />
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0 h-0 border-t-4 border-t-transparent border-b-4 border-b-transparent border-r-4 border-r-[#ffd65b] filter drop-shadow-[0_0_1px_rgba(255,214,91,0.5)] z-20" />

                <AnimatePresence mode="popLayout">
                  <motion.p
                    key={spinningTitle}
                    initial={{ y: 20, opacity: 0, filter: "blur(4px)" }}
                    animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
                    exit={{ y: -20, opacity: 0, filter: "blur(4px)" }}
                    transition={{ 
                      y: { type: "spring", stiffness: 220, damping: 15 },
                      opacity: { duration: 0.08 },
                      filter: { duration: 0.08 }
                    }}
                    className="text-xs md:text-sm font-display font-semibold text-[#ffd65b] tracking-wide truncate max-w-full text-center drop-shadow-[0_0_4px_rgba(255,214,91,0.25)]"
                  >
                    {spinningTitle}
                  </motion.p>
                </AnimatePresence>
              </div>
            </div>

            <p className="text-[8px] text-[#ffd65b]/80 tracking-[0.2em] uppercase font-mono animate-pulse">
              PROYECTANDO...
            </p>
          </motion.div>
        ) : selectedItem ? (
          /* RESULT STATE - SCREENING RESULTS IN SIDEBAR WIDGET */
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="relative z-10 w-full flex flex-col items-center space-y-4"
          >
            {/* Header */}
            <div className="text-center relative w-full">
              <button
                onClick={handleReset}
                className="absolute top-0 right-0 text-[#9b8e8f] hover:text-[#ffd65b] transition-colors p-1"
                title="Volver"
              >
                <X className="w-3.5 h-3.5" />
              </button>
              
              <p className="text-[8px] tracking-[0.25em] uppercase text-[#debfc3] font-semibold mb-0.5">
                El destino ha hablado
              </p>
              <h3 className="text-sm font-display font-bold text-[#ffd65b] tracking-tight leading-snug px-6 max-w-full truncate drop-shadow-[0_0_4px_rgba(255,214,91,0.2)]">
                {selectedItem.title}
              </h3>
            </div>

            {/* Poster and info grid inside card */}
            <div className="w-full flex gap-3 p-3 rounded-md bg-[#1b1012]/80 border border-[#ffd65b]/25 shadow-inner relative overflow-hidden">
              <div className="relative w-12 h-18 shrink-0 rounded bg-[#1b1012] border border-[#ffd65b]/15 overflow-hidden shadow">
                <img
                  src={getTmdbImageUrl(selectedItem.posterPath, "w92")}
                  alt={selectedItem.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0 text-left flex flex-col justify-center space-y-1">
                <div>
                  {selectedItem.mediaType === "movie" ? (
                    <span className="inline-flex items-center gap-0.5 text-[8px] px-1.5 py-0.2 bg-[#debfc3]/10 text-[#debfc3] border border-[#debfc3]/20 rounded-full font-medium">
                      <Film className="w-2 h-2" /> Película
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-0.5 text-[8px] px-1.5 py-0.2 bg-[#ffd65b]/10 text-[#ffd65b] border border-[#ffd65b]/20 rounded-full font-medium">
                      <Tv className="w-2 h-2" /> Serie
                    </span>
                  )}
                </div>

                {selectedItem.mediaType === "tv" ? (
                  <p className="text-[9px] text-[#debfc3] font-mono">
                    Progreso: T{selectedItem.currentSeason ?? 1} · E{selectedItem.currentEpisode ?? 0}
                  </p>
                ) : selectedItem.currentMinute ? (
                  <p className="text-[9px] text-[#debfc3] font-mono">
                    Progreso: {Math.floor(selectedItem.currentMinute / 60)}h {selectedItem.currentMinute % 60}m
                  </p>
                ) : (
                  <p className="text-[9px] text-[#9b8e8f] tracking-wide italic">
                    Sin empezar
                  </p>
                )}
              </div>
            </div>

            {/* Action buttons inside the sidebar card */}
            <div className="w-full space-y-2">
              <Button
                onClick={handleStartWatching}
                disabled={saving}
                className="w-full h-8 bg-[#debfc3] text-[#3f2b2e] hover:bg-[#d4b5b9] rounded-md text-[9px] font-semibold tracking-wider uppercase flex items-center justify-center gap-1.5"
              >
                <Play className="w-3 h-3 fill-current" />
                Empezar a ver
              </Button>
              <div className="flex gap-2">
                <Link href={`/${selectedItem.id}`} className="flex-1">
                  <Button
                    variant="outline"
                    className="w-full h-8 border-[#4f4445] text-[#9b8e8f] hover:text-[#f4dde0] hover:bg-[rgba(159,142,143,0.06)] rounded-md text-[8px] font-semibold tracking-wide uppercase"
                  >
                    <Eye className="w-2.5 h-2.5 mr-1" />
                    Detalles
                  </Button>
                </Link>
                <Button
                  onClick={startSpin}
                  variant="ghost"
                  className="flex-1 h-8 hover:bg-[rgba(159,142,143,0.04)] text-[#9b8e8f] hover:text-[#ffd65b] rounded-md text-[8px] font-semibold tracking-wide uppercase"
                >
                  <RotateCcw className="w-2.5 h-2.5 mr-1" />
                  Otro
                </Button>
              </div>
            </div>
          </motion.div>
        ) : (
          /* IDLE STATE - ELEGANT ART DECO INTRO SCREEN */
          <motion.div
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center relative z-10 flex flex-col items-center"
          >
            <p className="text-[9px] tracking-[0.3em] uppercase text-[#ffd65b] font-semibold mb-4 flex items-center gap-1.5 drop-shadow-[0_0_3px_rgba(255,214,91,0.15)]">
              <Sparkles className="w-3 h-3 text-[#ffd65b]" />
              La ruleta del destino
            </p>
            
            {/* Slowly Rotating Film Projector Reel */}
            <div className="relative mb-5 cursor-pointer" onClick={startSpin}>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 7, repeat: Infinity, ease: "linear" }}
                className="w-18 h-18 rounded-full border-4 border-dashed border-[#ffd65b]/50 flex items-center justify-center bg-[#291c1e] shadow-[0_0_10px_rgba(255,214,91,0.1)] group-hover:scale-105 group-hover:border-[#ffd65b]/80 group-hover:shadow-[0_0_18px_rgba(255,214,91,0.22)] transition-all duration-300 relative animate-pulse"
              >
                {/* Inner spokes */}
                <div className="absolute inset-1 rounded-full border border-[#ffd65b]/20 flex items-center justify-center">
                  <div className="w-0.5 h-full bg-[#ffd65b]/15 absolute transform rotate-0" />
                  <div className="w-0.5 h-full bg-[#ffd65b]/15 absolute transform rotate-45" />
                  <div className="w-0.5 h-full bg-[#ffd65b]/15 absolute transform rotate-90" />
                  <div className="w-0.5 h-full bg-[#ffd65b]/15 absolute transform rotate-135" />
                </div>
                <Clapperboard className="w-6 h-6 text-[#ffd65b] relative z-10 drop-shadow-[0_0_4px_rgba(255,214,91,0.25)] group-hover:rotate-12 transition-transform duration-300" />
              </motion.div>
              
              {/* Projected soft glow behind reel */}
              <motion.div
                animate={{ opacity: [0.15, 0.4, 0.2, 0.5, 0.15] }}
                transition={{ repeat: Infinity, duration: 0.3 }}
                className="absolute -inset-1 bg-yellow-400/5 blur-lg rounded-full -z-10"
              />
            </div>
            
            <Button
              onClick={startSpin}
              className="w-full h-9 bg-transparent border border-[#ffd65b]/60 text-[#ffd65b] hover:bg-[#ffd65b]/10 rounded-md text-[9px] font-semibold tracking-[0.12em] uppercase transition-all duration-300 shadow-[0_0_10px_rgba(255,214,91,0.05)] hover:shadow-[0_0_15px_rgba(255,214,91,0.18)]"
            >
              <span className="mr-1 text-[10px] animate-pulse">⊞</span>
              Girar la bobina
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
