"use client"

import { useState, useEffect, useCallback } from "react"
import { useDebounce } from "use-debounce"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { getTmdbImageUrl } from "@/lib/tmdb"
import { ImageIcon, Loader2, Film, Tv } from "lucide-react"
import type { WatchlistItemWithTmdb } from "@/types"

interface SearchCommandProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onItemAdded: (item: WatchlistItemWithTmdb) => void
  groupId?: string
}

export function SearchCommand({ open, onOpenChange, onItemAdded, groupId }: SearchCommandProps) {
  const [query, setQuery] = useState("")
  const [debouncedQuery] = useDebounce(query, 300)
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [adding, setAdding] = useState<number | null>(null)

  const search = useCallback(async () => {
    if (!debouncedQuery || debouncedQuery.length < 2) {
      setResults([])
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(debouncedQuery)}`)
      const data = await res.json()
      setResults(data.results || [])
    } catch (error) {
      setResults([])
    }
    setLoading(false)
  }, [debouncedQuery])

  useEffect(() => {
    search()
  }, [search])

  const handleAdd = async (result: any) => {
    setAdding(result.id)
    const res = await fetch("/api/watchlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tmdbId: result.id,
        mediaType: result.media_type,
        title: result.title,
        posterPath: result.poster_path,
        backdropPath: result.backdrop_path,
        groupId,
      }),
    })
    if (res.ok) {
      const data = await res.json()
      onItemAdded(data.item)
      onOpenChange(false)
      setQuery("")
    } else if (res.status === 409) {
      alert("Este contenido ya está en tu lista")
    }
    setAdding(null)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-4 pt-4 pb-0">
          <DialogTitle className="text-base font-medium">Buscar películas o series</DialogTitle>
        </DialogHeader>
        <div className="p-4 pt-2">
          <Input
            placeholder="Escribe el nombre..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="h-10"
          />
        </div>
        <div className="px-4 pb-4 max-h-[400px] overflow-y-auto">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          )}

          {!loading && query.length < 2 && (
            <p className="text-center text-sm text-muted-foreground py-8">
              Escribe al menos 2 caracteres para buscar
            </p>
          )}

          {!loading && query.length >= 2 && results.length === 0 && (
            <p className="text-center text-sm text-muted-foreground py-8">
              No se encontraron resultados
            </p>
          )}

          <div className="space-y-1">
            {results.map((result) => (
              <button
                key={result.id}
                onClick={() => handleAdd(result)}
                disabled={adding === result.id}
                className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-muted transition-colors text-left disabled:opacity-50"
              >
                <div className="relative w-10 h-14 rounded-md overflow-hidden bg-muted shrink-0">
                  {result.poster_path ? (
                    <img
                      src={getTmdbImageUrl(result.poster_path, "w92")}
                      alt={result.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="w-4 h-4 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{result.title}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    {result.media_type === "movie" ? (
                      <>
                        <Film className="w-3 h-3" /> Película
                      </>
                    ) : (
                      <>
                        <Tv className="w-3 h-3" /> Serie
                      </>
                    )}
                    {result.release_date && ` · ${result.release_date.substring(0, 4)}`}
                  </p>
                </div>
                {adding === result.id ? (
                  <Loader2 className="h-4 w-4 animate-spin shrink-0" />
                ) : (
                  <span className="text-xs text-muted-foreground shrink-0">Agregar</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
