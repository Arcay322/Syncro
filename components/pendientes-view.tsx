"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { getTmdbImageUrl } from "@/lib/tmdb"
import { Diamond, Sparkles, Users, Bookmark, Trash2, Heart, Smile, HelpCircle, Loader2 } from "lucide-react"
import type { WatchlistItemWithTmdb } from "@/types"

interface PendientesViewProps {
  pendingItems: WatchlistItemWithTmdb[]
  moodMatches: any[] // We'll keep compatibility, but compute dynamic interactive matches as well!
  groupName: string | null
}

const VIBES = [
  { name: "Cansado/a 😴", genres: ["Comedia", "Animación", "Familia"], description: "Algo ligero, divertido y sin dramas." },
  { name: "Ganas de acción 🍿", genres: ["Acción", "Aventura", "Ciencia ficción", "Fantasía"], description: "Adrenalina pura, efectos especiales y emoción." },
  { name: "Romántico/a 💖", genres: ["Romance", "Drama"], description: "Puro sentimiento, amor e historias profundas." },
  { name: "Misterioso/a 🕵️‍♂️", genres: ["Misterio", "Suspenso", "Crimen", "Terror"], description: "Intrigas que resolver y giros inesperados." },
  { name: "Asustado/a 👻", genres: ["Terror", "Suspenso"], description: "Noche de palomitas, tensión y sustos." },
  { name: "Intelectual 🧠", genres: ["Documental", "Historia", "Guerra"], description: "Para aprender, reflexionar o descubrir hechos reales." }
]

function ArtDecoLine({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center gap-4 ${className}`}>
      <div className="h-px flex-1 max-w-[100px] bg-gradient-to-r from-transparent via-[#4F4445] to-[#4F4445]" />
      <Diamond className="w-2 h-2 text-[#FFD65B] rotate-45 fill-[#FFD65B]" />
      <div className="h-px flex-1 max-w-[100px] bg-gradient-to-l from-transparent via-[#4F4445] to-[#4F4445]" />
    </div>
  )
}

export function PendientesView({ pendingItems, groupName }: PendientesViewProps) {
  const [items, setItems] = useState(pendingItems)
  const [removingId, setRemovingId] = useState<string | null>(null)
  const [activeGenre, setActiveGenre] = useState<string>("ALL")
  
  // Vibe matcher states
  const [userVibe, setUserVibe] = useState<string>("")
  const [partnerVibe, setPartnerVibe] = useState<string>("")
  const [partnerName, setPartnerName] = useState<string>("Tu pareja")
  const [loadingVibe, setLoadingVibe] = useState<boolean>(false)
  const [savingVibe, setSavingVibe] = useState<boolean>(false)

  // Fetch vibes on mount
  useEffect(() => {
    const fetchVibes = async () => {
      setLoadingVibe(true)
      try {
        const res = await fetch("/api/user/vibe")
        if (res.ok) {
          const data = await res.json()
          setUserVibe(data.vibe || "")
          setPartnerVibe(data.partnerVibe || "")
          setPartnerName(data.partnerName || "Tu pareja")
        }
      } catch (err) {
        console.error("Error fetching vibes:", err)
      }
      setLoadingVibe(false)
    }
    fetchVibes()
  }, [])

  const handleVibeSelect = async (vibeName: string) => {
    setSavingVibe(true)
    const newVibe = userVibe === vibeName ? "" : vibeName
    setUserVibe(newVibe)
    
    try {
      const res = await fetch("/api/user/vibe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vibe: newVibe }),
      })
      if (res.ok) {
        // Trigger partner update as well if possible
        const data = await res.json()
      }
    } catch (err) {
      console.error("Error updating vibe:", err)
    }
    setSavingVibe(false)
  }

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

  // Extract all unique genres from backlog
  const availableGenres = useMemo(() => {
    const genresSet = new Set<string>()
    items.forEach((item) => {
      if (item.genres && item.genres.length > 0) {
        item.genres.forEach((g) => genresSet.add(g))
      }
    })
    return ["ALL", ...Array.from(genresSet)]
  }, [items])

  // Filter main backlog list by active genre
  const filteredBacklog = useMemo(() => {
    if (activeGenre === "ALL") return items
    return items.filter((item) => item.genres && item.genres.includes(activeGenre))
  }, [items, activeGenre])

  // Dynamic Mood Matcher calculations
  const dynamicMoodMatcher = useMemo(() => {
    if (!userVibe) return { matches: [], explanation: "Selecciona tu vibe para cruzar gustos con tu pareja." }
    
    const userGenres = VIBES.find((v) => v.name === userVibe)?.genres || []
    const partnerGenres = partnerVibe ? VIBES.find((v) => v.name === partnerVibe)?.genres || [] : []

    let matchedGenres: string[] = []
    let explanation = ""

    if (partnerVibe) {
      // Find intersection
      const intersection = userGenres.filter((g) => partnerGenres.includes(g))
      if (intersection.length > 0) {
        matchedGenres = intersection
        explanation = `¡Match perfecto! Ambos coinciden en géneros de: ${intersection.join(", ")}.`
      } else {
        // Fallback to Union
        matchedGenres = [...new Set([...userGenres, ...partnerGenres])]
        explanation = `Vibras cruzadas (${userVibe} + ${partnerVibe}). Recomendando películas de ambos espectros.`
      }
    } else {
      matchedGenres = userGenres
      explanation = `Recomendando por tu vibe: ${userVibe}. Esperando la vibra de ${partnerName}...`
    }

    // Filter backlog items by matched genres
    const matches = items.filter((item) => {
      const itemGenres = item.genres || []
      return itemGenres.some((ig) => matchedGenres.includes(ig))
    })

    return { matches, explanation, matchedGenres }
  }, [items, userVibe, partnerVibe, partnerName])

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
            El Baúl de Ideas
          </h1>
          <p className="text-sm text-[#9B8E8F] font-serif max-w-md mx-auto">
            Vuestro catálogo conjunto de pendientes. Guardadas para disfrutar más tarde.
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

      {/* Mood Matcher (Interactive Panel) */}
      {groupName && (
        <div className="px-4 max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="p-6 rounded-xl bg-gradient-to-br from-[#291C1E] to-[#1B1012] border border-[#FFD65B]/20 space-y-6 shadow-2xl relative overflow-hidden"
          >
            {/* Soft decorative background glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#FFD65B]/5 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#4F4445]/30 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#FFD65B]/10 flex items-center justify-center border border-[#FFD65B]/20">
                  <Sparkles className="w-5 h-5 text-[#FFD65B] animate-pulse" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#FFD65B] font-serif">El Mood Matcher</h2>
                  <p className="text-xs text-[#9B8E8F]">Cruce inteligente de ánimos en {groupName}</p>
                </div>
              </div>
              
              {loadingVibe && <Loader2 className="w-4 h-4 text-[#FFD65B] animate-spin self-end" />}
            </div>

            {/* Vibe Selection Panel */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* My Vibe Selection */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#DEBFC3] uppercase tracking-wider font-serif">
                  <Smile className="w-3.5 h-3.5 text-[#FFD65B]" />
                  <span>Tu vibe actual:</span>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  {VIBES.map((v) => {
                    const isSelected = userVibe === v.name
                    return (
                      <button
                        key={v.name}
                        onClick={() => handleVibeSelect(v.name)}
                        disabled={savingVibe}
                        className={`p-2.5 rounded-lg border text-left text-xs transition-all relative ${
                          isSelected
                            ? "bg-[#FFD65B]/15 border-[#FFD65B] text-[#FFD65B] shadow-[0_0_8px_rgba(255,214,91,0.1)]"
                            : "bg-[#1B1012]/80 border-[#4F4445]/40 text-[#9B8E8F] hover:border-[#DEBFC3]/30 hover:text-[#DEBFC3]"
                        }`}
                      >
                        <div className="font-semibold">{v.name}</div>
                        <div className="text-[9px] text-[#4F4445] mt-0.5 leading-tight">{v.description}</div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Partner's Vibe Display */}
              <div className="p-4 rounded-xl bg-[#1B1012]/60 border border-[#4F4445]/30 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#DEBFC3] uppercase tracking-wider font-serif">
                    <Heart className="w-3.5 h-3.5 text-red-400 fill-red-400/10" />
                    <span>El vibe de {partnerName}:</span>
                  </div>

                  {partnerVibe ? (
                    <motion.div
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="p-4 rounded-lg bg-[#FFD65B]/5 border border-[#FFD65B]/10 text-center space-y-1"
                    >
                      <span className="text-2xl">{partnerVibe.split(" ").pop()}</span>
                      <p className="text-sm font-semibold text-[#FFD65B] font-serif">{partnerVibe}</p>
                      <p className="text-[10px] text-[#9B8E8F] italic leading-tight">
                        {VIBES.find((v) => v.name === partnerVibe)?.description}
                      </p>
                    </motion.div>
                  ) : (
                    <div className="py-8 text-center text-[#4F4445] flex flex-col items-center gap-2">
                      <HelpCircle className="w-8 h-8 text-[#4F4445]/60 animate-bounce" />
                      <p className="text-xs font-serif italic">Esperando que {partnerName} elija su estado de ánimo...</p>
                    </div>
                  )}
                </div>

                {userVibe && (
                  <div className="mt-4 pt-3 border-t border-[#4F4445]/20">
                    <p className="text-[10px] text-[#9B8E8F] italic leading-tight font-serif">
                      💡 {dynamicMoodMatcher.explanation}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Crossed Matches Results */}
            {userVibe && (
              <div className="pt-2">
                <h3 className="text-xs font-semibold text-[#DEBFC3] uppercase tracking-wider font-serif mb-3 flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-[#FFD65B]" />
                  <span>Recomendado para ver hoy ({dynamicMoodMatcher.matches.length}):</span>
                </h3>

                {dynamicMoodMatcher.matches.length > 0 ? (
                  <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
                    <AnimatePresence mode="popLayout">
                      {dynamicMoodMatcher.matches.map((match) => (
                        <motion.div
                          key={`match-${match.id}`}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="flex items-center gap-3 p-2.5 rounded-lg bg-[#1B1012] border border-[#4F4445]/40 hover:border-[#DEBFC3]/20 transition-all group"
                        >
                          <div className="relative w-10 h-14 rounded overflow-hidden shrink-0">
                            <Image
                              src={getTmdbImageUrl(match.posterPath, "w200")}
                              alt={match.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <Link href={`/${match.id}`}>
                              <p className="text-xs font-medium text-[#DEBFC3] group-hover:text-[#FFD65B] truncate font-serif transition-colors">
                                {match.title}
                              </p>
                            </Link>
                            <div className="flex gap-1.5 flex-wrap mt-1">
                              {match.genres.slice(0, 2).map((g: string) => (
                                <span key={g} className="text-[8px] px-1 py-0.5 rounded bg-[#4F4445]/20 text-[#9B8E8F]">
                                  {g}
                                </span>
                              ))}
                            </div>
                          </div>
                          <button
                            onClick={() => handleStartWatching(match.id)}
                            className="px-2 py-1 rounded bg-[#DEBFC3] hover:bg-[#d4b5b9] text-[#3F2B2E] text-[9px] font-bold tracking-wider uppercase shrink-0 transition-colors"
                          >
                            Ver
                          </button>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                ) : (
                  <div className="py-4 text-center border border-dashed border-[#4F4445]/30 rounded-lg">
                    <p className="text-xs text-[#4F4445] font-serif italic">
                      No hay producciones guardadas en el baúl que encajen con estos géneros. ¡Añadid más películas!
                    </p>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </div>
      )}

      {/* Decorative Line */}
      <div className="px-4">
        <ArtDecoLine />
      </div>

      {/* Genre Filter Bar (El Baúl de Ideas Backlog) */}
      <div className="px-4 max-w-5xl mx-auto space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#4F4445]/30 pb-3">
          <h2 className="text-xl font-bold text-[#DEBFC3] font-serif">Todas las propuestas</h2>
          
          {/* Genre selector pills */}
          <div className="flex flex-wrap items-center gap-1.5 max-w-full overflow-x-auto pb-1">
            <button
              onClick={() => setActiveGenre("ALL")}
              className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase transition-all ${
                activeGenre === "ALL"
                  ? "bg-[#DEBFC3] text-[#3F2B2E]"
                  : "bg-[#291C1E] text-[#9B8E8F] border border-[#4F4445]/30 hover:text-[#DEBFC3]"
              }`}
            >
              Todos los Géneros
            </button>
            {availableGenres.filter(g => g !== "ALL").map((genre) => {
              const isSelected = activeGenre === genre
              return (
                <button
                  key={genre}
                  onClick={() => setActiveGenre(genre)}
                  className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase transition-all ${
                    isSelected
                      ? "bg-[#FFD65B]/15 text-[#FFD65B] border border-[#FFD65B]/30"
                      : "bg-[#291C1E] text-[#9B8E8F] border border-[#4F4445]/30 hover:text-[#DEBFC3]"
                  }`}
                >
                  {genre}
                </button>
              )
            })}
          </div>
        </div>

        {/* Backlog Grid */}
        <div className="space-y-3">
          {filteredBacklog.length > 0 ? (
            <AnimatePresence mode="popLayout">
              {filteredBacklog.map((item, index) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.02 }}
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
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className={`text-[9px] px-2 py-0.5 rounded-full border ${
                        item.mediaType === "tv"
                          ? "bg-[#DEBFC3]/15 text-[#DEBFC3] border-[#DEBFC3]/20"
                          : "bg-[#9B8E8F]/15 text-[#9B8E8F] border-[#9B8E8F]/20"
                      }`}>
                        {item.mediaType === "tv" ? "Serie" : "Película"}
                      </span>
                      {item.genres && item.genres.slice(0, 3).map((g) => (
                        <span key={g} className="text-[9px] text-[#4F4445] font-medium font-serif bg-[#1B1012]/35 px-1.5 py-0.5 rounded border border-[#4F4445]/15">
                          {g}
                        </span>
                      ))}
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
              ))}
            </AnimatePresence>
          ) : (
            <div className="text-center py-16">
              <Bookmark className="w-12 h-12 text-[#4F4445] mx-auto mb-4" />
              <p className="text-[#9B8E8F] font-serif">No se encontraron películas en el baúl.</p>
              <p className="text-xs text-[#4F4445] mt-1">Prueba seleccionando otro filtro de género.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
