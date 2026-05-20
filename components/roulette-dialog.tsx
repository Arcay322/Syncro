"use client"

import { useState, useEffect, useCallback, useRef, useMemo } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { getTmdbImageUrl } from "@/lib/tmdb"
import {
  Clapperboard,
  Film,
  Play,
  RotateCcw,
  Sparkles,
  Star,
  Calendar,
  Tv,
  Eye,
  X
} from "lucide-react"
import type { WatchlistItemWithTmdb } from "@/types"

interface RouletteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  items: WatchlistItemWithTmdb[]
  onUpdate: (item: WatchlistItemWithTmdb) => void
}

export function RouletteDialog({ open, onOpenChange, items, onUpdate }: RouletteDialogProps) {
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
    if (open) {
      if (poolRef.current.length > 0) {
        startSpin()
      } else {
        setSelectedItem(null)
        setIsSpinning(false)
      }
    } else {
      // Clear interval when dialog is closed
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      setIsSpinning(false)
      setSelectedItem(null)
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [open, startSpin])

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
        onOpenChange(false)
      }
    } catch (error) {
      console.error("Failed to start watching:", error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="sm:max-w-md p-0 gap-0 overflow-hidden bg-[#1b1012] border border-[#4f4445] rounded-xl shadow-2xl">
        <div className="relative p-6 md:p-8 flex flex-col items-center text-center min-h-[420px] justify-center">
          
          {/* Background art deco grid */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(222,191,195,0.04),transparent)] pointer-events-none" />

          {/* Projector Flickering Light Beam (Background) */}
          <motion.div
            animate={{ 
              opacity: [0.08, 0.16, 0.1, 0.2, 0.13, 0.08],
              scale: [0.98, 1.02, 1, 1.03, 0.99, 0.98]
            }}
            transition={{ 
              repeat: Infinity, 
              duration: 0.4,
              ease: "easeInOut"
            }}
            className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top,rgba(255,214,91,0.22)_0%,transparent_75%)]"
          />

          {/* Subtle Dust & Scanline Overlay */}
          <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(27,16,18,0)_95%,rgba(255,214,91,0.02)_95%)] bg-[size:100%_4px] opacity-35" />

          {/* Close button */}
          <button
            onClick={() => onOpenChange(false)}
            className="absolute top-4 right-4 text-[#9b8e8f] hover:text-[#f4dde0] transition-colors p-1"
          >
            <X className="w-4 h-4" />
          </button>

          {pool.length === 0 ? (
            /* Empty state */
            <div className="space-y-6 py-6 z-10">
              <div className="w-16 h-16 mx-auto rounded-full bg-[#291c1e] border border-[#4f4445] flex items-center justify-center">
                <Film className="w-6 h-6 text-[#9b8e8f]/60" />
              </div>
              <div>
                <h3 className="text-lg font-display font-semibold text-[#f4dde0] tracking-tight mb-2">
                  La bobina está vacía
                </h3>
                <p className="text-xs text-[#9b8e8f] leading-relaxed max-w-xs mx-auto">
                  El destino no puede decidir por ti si no le das opciones. ¡Busca y agrega películas o series a tu lista de pendientes primero!
                </p>
              </div>
              <Button
                onClick={() => onOpenChange(false)}
                className="w-full bg-[#debfc3] text-[#3f2b2e] hover:bg-[#d4b5b9] rounded-md text-[10px] font-semibold tracking-wider uppercase h-10"
              >
                Entendido
              </Button>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              {isSpinning ? (
                /* Spinning animation screen - 35mm Film Projector */
                <motion.div
                  key="spinning"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  className="space-y-6 w-full py-4 z-10 flex flex-col items-center"
                >
                  <p className="text-[9px] tracking-[0.3em] uppercase text-[#ffd65b] font-semibold flex items-center gap-1.5 drop-shadow-[0_0_4px_rgba(255,214,91,0.2)]">
                    <Sparkles className="w-3 h-3 animate-pulse text-[#ffd65b]" />
                    La ruleta del destino
                  </p>

                  {/* Glowing Art Deco Projector Reel */}
                  <div className="relative">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
                      className="w-24 h-24 rounded-full border-4 border-dashed border-[#ffd65b]/70 flex items-center justify-center bg-[#291c1e] shadow-[0_0_15px_rgba(255,214,91,0.2)] relative animate-pulse"
                    >
                      {/* Film Reel Inner Spokes */}
                      <div className="absolute inset-2 rounded-full border border-[#ffd65b]/20 flex items-center justify-center">
                        <div className="w-1 h-full bg-[#ffd65b]/20 absolute transform rotate-0" />
                        <div className="w-1 h-full bg-[#ffd65b]/20 absolute transform rotate-45" />
                        <div className="w-1 h-full bg-[#ffd65b]/20 absolute transform rotate-90" />
                        <div className="w-1 h-full bg-[#ffd65b]/20 absolute transform rotate-135" />
                      </div>
                      <Clapperboard className="w-9 h-9 text-[#ffd65b] relative z-10 drop-shadow-[0_0_6px_rgba(255,214,91,0.4)]" />
                    </motion.div>
                    
                    {/* Flashing projector bulb behind the reel */}
                    <motion.div
                      animate={{ opacity: [0.3, 0.7, 0.4, 0.8, 0.3] }}
                      transition={{ repeat: Infinity, duration: 0.2 }}
                      className="absolute -inset-2 bg-yellow-400/10 blur-xl rounded-full -z-10"
                    />
                  </div>

                  {/* 35mm Film Strip Viewport */}
                  <div className="relative w-full flex items-center justify-center px-8">
                    
                    {/* Left Sprocket Holes */}
                    <div className="absolute left-2 top-0 bottom-0 flex flex-col justify-between py-1 opacity-70">
                      {Array.from({ length: 6 }).map((_, i) => (
                        <div key={`sprocket-l-${i}`} className="w-2.5 h-3 bg-[#150b0d] border border-[#ffd65b]/30 rounded-xs" />
                      ))}
                    </div>

                    {/* Right Sprocket Holes */}
                    <div className="absolute right-2 top-0 bottom-0 flex flex-col justify-between py-1 opacity-70">
                      {Array.from({ length: 6 }).map((_, i) => (
                        <div key={`sprocket-r-${i}`} className="w-2.5 h-3 bg-[#150b0d] border border-[#ffd65b]/30 rounded-xs" />
                      ))}
                    </div>

                    {/* Central Golden Gate Border */}
                    <div className="w-full h-24 relative overflow-hidden bg-[#291c1e]/90 border-y-2 border-[#ffd65b]/50 flex items-center justify-center px-4 shadow-[inset_0_0_15px_rgba(0,0,0,0.8)]">
                      
                      {/* Golden Triangular Pointers / Obturador Indicators */}
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0 h-0 border-t-6 border-t-transparent border-b-6 border-b-transparent border-l-6 border-l-[#ffd65b] filter drop-shadow-[0_0_2px_rgba(255,214,91,0.5)] z-20" />
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0 h-0 border-t-6 border-t-transparent border-b-6 border-b-transparent border-r-6 border-r-[#ffd65b] filter drop-shadow-[0_0_2px_rgba(255,214,91,0.5)] z-20" />

                      {/* Title scrolling viewport with custom motion blur animation */}
                      <AnimatePresence mode="popLayout">
                        <motion.p
                          key={spinningTitle}
                          initial={{ y: 30, opacity: 0, filter: "blur(5px)", scale: 0.95 }}
                          animate={{ y: 0, opacity: 1, filter: "blur(0px)", scale: 1 }}
                          exit={{ y: -30, opacity: 0, filter: "blur(5px)", scale: 0.95 }}
                          transition={{ 
                            y: { type: "spring", stiffness: 220, damping: 15 },
                            opacity: { duration: 0.08 },
                            filter: { duration: 0.08 }
                          }}
                          className="text-base md:text-lg font-display font-semibold text-[#ffd65b] tracking-wide truncate max-w-full text-center drop-shadow-[0_0_5px_rgba(255,214,91,0.3)]"
                        >
                          {spinningTitle}
                        </motion.p>
                      </AnimatePresence>
                    </div>
                  </div>

                  <p className="text-[10px] text-[#ffd65b]/80 tracking-[0.25em] uppercase font-mono animate-pulse">
                    PROYECTANDO...
                  </p>
                </motion.div>
              ) : (
                selectedItem && (
                  /* Result Screen - Premiere */
                  <motion.div
                    key="result"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    className="w-full z-10 space-y-6 py-2"
                  >
                    <div>
                      <p className="text-[9px] tracking-[0.3em] uppercase text-[#debfc3] font-semibold mb-1">
                        El destino ha hablado
                      </p>
                      <h3 className="text-xl md:text-2xl font-display font-bold text-[#ffd65b] tracking-tight leading-tight px-4 drop-shadow-[0_0_6px_rgba(255,214,91,0.25)]">
                        {selectedItem.title}
                      </h3>
                    </div>

                    {/* Poster + details row with Golden Frame */}
                    <div className="flex gap-4 items-center justify-center max-w-sm mx-auto p-4 rounded-lg bg-[#291c1e]/80 border-2 border-double border-[#ffd65b]/50 shadow-[0_0_15px_rgba(255,214,91,0.1)] relative overflow-hidden">
                      
                      {/* Film strip sprocket holes background overlay for result */}
                      <div className="absolute left-1 top-0 bottom-0 flex flex-col justify-between py-1 opacity-20">
                        {Array.from({ length: 4 }).map((_, i) => (
                          <div key={`sprocket-res-l-${i}`} className="w-1.5 h-2 bg-[#1b1012] border border-[#ffd65b]/20 rounded-xs" />
                        ))}
                      </div>
                      <div className="absolute right-1 top-0 bottom-0 flex flex-col justify-between py-1 opacity-20">
                        {Array.from({ length: 4 }).map((_, i) => (
                          <div key={`sprocket-res-r-${i}`} className="w-1.5 h-2 bg-[#1b1012] border border-[#ffd65b]/20 rounded-xs" />
                        ))}
                      </div>

                      <div className="relative w-20 h-28 shrink-0 rounded-md overflow-hidden bg-[#1b1012] border border-[#ffd65b]/25 shadow-md">
                        <img
                          src={getTmdbImageUrl(selectedItem.posterPath, "w185")}
                          alt={selectedItem.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="text-left space-y-2 relative z-10">
                        <div className="flex items-center gap-1.5">
                          {selectedItem.mediaType === "movie" ? (
                            <span className="flex items-center gap-1 text-[9px] px-2 py-0.5 bg-[#debfc3]/10 text-[#debfc3] border border-[#debfc3]/20 rounded-full font-medium">
                              <Film className="w-2.5 h-2.5" /> Película
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-[9px] px-2 py-0.5 bg-[#ffd65b]/10 text-[#ffd65b] border border-[#ffd65b]/20 rounded-full font-medium">
                              <Tv className="w-2.5 h-2.5" /> Serie
                            </span>
                          )}
                        </div>
                        
                        {selectedItem.mediaType === "tv" ? (
                          <p className="text-[10px] text-[#debfc3] font-mono tracking-wider">
                            Progreso: T{selectedItem.currentSeason ?? 1} · E{selectedItem.currentEpisode ?? 0}
                          </p>
                        ) : selectedItem.currentMinute ? (
                          <p className="text-[10px] text-[#debfc3] font-mono tracking-wider">
                            Progreso: {Math.floor(selectedItem.currentMinute / 60)}h {selectedItem.currentMinute % 60}m
                          </p>
                        ) : (
                          <p className="text-[10px] text-[#debfc3] tracking-wide">
                            Estado: Pendiente
                          </p>
                        )}
                        <p className="text-[10px] text-[#9b8e8f] italic font-serif leading-relaxed line-clamp-2 max-w-[200px]">
                          Una gran opción para tu velada cinematográfica hoy.
                        </p>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="space-y-2.5 max-w-xs mx-auto">
                      <Button
                        onClick={handleStartWatching}
                        disabled={saving}
                        className="w-full bg-[#debfc3] text-[#3f2b2e] hover:bg-[#d4b5b9] rounded-md text-[10px] font-semibold tracking-wider uppercase h-10"
                      >
                        <Play className="w-3.5 h-3.5 mr-1.5 fill-current" />
                        Empezar a ver ahora
                      </Button>

                      <div className="flex gap-2">
                        <Link href={`/${selectedItem.id}`} className="flex-1">
                          <Button
                            variant="outline"
                            className="w-full border-[#4f4445] text-[#9b8e8f] hover:text-[#f4dde0] hover:bg-[rgba(159,142,143,0.06)] rounded-md text-[9px] font-semibold tracking-wide uppercase h-9"
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            Detalles
                          </Button>
                        </Link>
                        
                        <Button
                          onClick={startSpin}
                          variant="ghost"
                          className="flex-1 hover:bg-[rgba(159,142,143,0.04)] text-[#9b8e8f] hover:text-[#ffd65b] rounded-md text-[9px] font-semibold tracking-wide uppercase h-9"
                        >
                          <RotateCcw className="w-3 h-3 mr-1" />
                          Girar de nuevo
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )
              )}
            </AnimatePresence>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
