"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Users, Plus, LogIn, Copy, Check, Sparkles } from "lucide-react"
import type { Group } from "@prisma/client"

interface GroupManagerProps {
  onGroupChange: (group: Group | null) => void
}

export function GroupManager({ onGroupChange }: GroupManagerProps) {
  const [showCreate, setShowCreate] = useState(false)
  const [showJoin, setShowJoin] = useState(false)
  const [groupName, setGroupName] = useState("")
  const [inviteCode, setInviteCode] = useState("")
  const [loading, setLoading] = useState(false)
  const [createdGroup, setCreatedGroup] = useState<Group | null>(null)
  const [copied, setCopied] = useState(false)

  const handleCreate = async () => {
    if (!groupName.trim()) return
    setLoading(true)
    const res = await fetch("/api/groups", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: groupName }),
    })
    if (res.ok) {
      const data = await res.json()
      setCreatedGroup(data.group)
      onGroupChange(data.group)
    }
    setLoading(false)
  }

  const handleJoin = async () => {
    if (!inviteCode.trim()) return
    setLoading(true)
    const res = await fetch("/api/groups/join", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ inviteCode: inviteCode.trim() }),
    })
    if (res.ok) {
      const data = await res.json()
      onGroupChange(data.group)
    } else {
      alert("Código inválido o ya estás en un grupo")
    }
    setLoading(false)
  }

  const copyCode = () => {
    if (createdGroup) {
      navigator.clipboard.writeText(createdGroup.inviteCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (createdGroup) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-8 rounded-2xl bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/20"
      >
        <div className="flex flex-col items-center text-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
            <Sparkles className="w-7 h-7 text-background" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-foreground">¡Sala creada!</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Comparte este código para que tu pareja se una
            </p>
          </div>
          <div className="flex items-center gap-3 mt-2">
            <code className="px-6 py-3 bg-background/50 rounded-xl font-mono text-2xl tracking-[0.2em] text-amber-400 border border-amber-500/20">
              {createdGroup.inviteCode}
            </code>
            <Button 
              size="icon" 
              variant="outline" 
              onClick={copyCode}
              className="rounded-xl border-amber-500/30 text-amber-400 hover:bg-amber-500/10 h-12 w-12"
            >
              {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-8 rounded-2xl bg-card/50 border border-border/40"
    >
      <div className="flex flex-col items-center text-center gap-5">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center">
          <Users className="w-7 h-7 text-amber-400" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-foreground">Sala compartida</h3>
          <p className="text-sm text-muted-foreground mt-1.5 max-w-sm leading-relaxed">
            Crea una sala para compartir tu watchlist y llevar el progreso junto a alguien especial.
          </p>
        </div>

        {!showCreate && !showJoin && (
          <div className="flex gap-3">
            <Button 
              onClick={() => setShowCreate(true)} 
              className="gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-background hover:from-amber-300 hover:to-amber-400 shadow-lg shadow-amber-500/20"
            >
              <Plus className="w-4 h-4" />
              Crear sala
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setShowJoin(true)} 
              className="gap-2 rounded-xl border-border/40 hover:bg-white/5"
            >
              <LogIn className="w-4 h-4" />
              Unirse
            </Button>
          </div>
        )}

        {showCreate && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="w-full max-w-sm space-y-3"
          >
            <Input
              placeholder="Nombre de la sala (ej: Nuestra Sala)"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              className="h-11 rounded-xl bg-card border-border/40 focus:ring-2 focus:ring-amber-500/30"
            />
            <div className="flex gap-2">
              <Button 
                onClick={handleCreate} 
                disabled={loading} 
                className="flex-1 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-background"
              >
                {loading ? "Creando..." : "Crear"}
              </Button>
              <Button variant="ghost" onClick={() => setShowCreate(false)} className="rounded-xl">
                Cancelar
              </Button>
            </div>
          </motion.div>
        )}

        {showJoin && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="w-full max-w-sm space-y-3"
          >
            <Input
              placeholder="Código de invitación"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === "Enter" && handleJoin()}
              maxLength={6}
              className="h-11 rounded-xl bg-card border-border/40 focus:ring-2 focus:ring-amber-500/30 tracking-[0.2em] text-center font-mono"
            />
            <div className="flex gap-2">
              <Button 
                onClick={handleJoin} 
                disabled={loading} 
                className="flex-1 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-background"
              >
                {loading ? "Uniendo..." : "Unirse"}
              </Button>
              <Button variant="ghost" onClick={() => setShowJoin(false)} className="rounded-xl">
                Cancelar
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}
