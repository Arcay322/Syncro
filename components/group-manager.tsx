"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Users, Plus, LogIn, Copy, Check } from "lucide-react"
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
      alert("Código inválido")
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
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 rounded-sm bg-[rgba(245,197,24,0.08)] border border-[rgba(245,197,24,0.15)] flex items-center gap-4"
      >
        <Users className="w-5 h-5 text-[#f5c518] shrink-0" />
        <div className="flex-1">
          <h3 className="text-sm font-medium text-[#f4dde0]">Sala creada: {createdGroup.name}</h3>
          <p className="text-xs text-[#9b8e8f]">Comparte el código</p>
        </div>
        <code className="px-3 py-1.5 bg-[#1b1012]/50 rounded-sm font-mono text-sm text-[#f5c518] border border-[rgba(245,197,24,0.15)] tracking-wider">
          {createdGroup.inviteCode}
        </code>
        <Button size="icon" variant="ghost" onClick={copyCode} className="h-8 w-8 shrink-0 text-[#f5c518]">
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
        </Button>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 rounded-xl bg-card/50 border border-border-soft"
    >
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-sm bg-[rgba(245,197,24,0.08)] flex items-center justify-center shrink-0">
          <Users className="w-5 h-5 text-[#f5c518]" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-medium text-[#f4dde0]">Sala compartida</h3>
          <p className="text-xs text-[#9b8e8f]">Comparte tu watchlist con alguien</p>
        </div>
        
        {!showCreate && !showJoin ? (
          <div className="flex gap-2">
            <Button size="sm" onClick={() => setShowCreate(true)} className="h-8 rounded-sm bg-[#debfc3] text-[#1b1012] text-xs hover:bg-[#d4b5b9]">
              <Plus className="w-3.5 h-3.5 mr-1" /> Crear
            </Button>
            <Button size="sm" variant="outline" onClick={() => setShowJoin(true)} className="h-8 rounded-sm text-xs border-[rgba(244,221,224,0.15)] text-[#f4dde0] hover:bg-[rgba(244,221,224,0.05)]">
              <LogIn className="w-3.5 h-3.5 mr-1" /> Unirse
            </Button>
          </div>
        ) : showCreate ? (
          <div className="flex gap-2">
            <Input
              placeholder="Nombre"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              className="h-8 text-sm w-40 bg-[#1b1012] border-[rgba(244,221,224,0.1)] text-[#f4dde0] rounded-sm"
              autoFocus
            />
            <Button size="sm" onClick={handleCreate} disabled={loading} className="h-8 rounded-sm bg-[#debfc3] text-[#1b1012] text-xs hover:bg-[#d4b5b9]">
              Crear
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setShowCreate(false)} className="h-8 text-xs text-[#9b8e8f] hover:text-[#f4dde0]">
              Cancelar
            </Button>
          </div>
        ) : (
          <div className="flex gap-2">
            <Input
              placeholder="Código"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === "Enter" && handleJoin()}
              maxLength={6}
              className="h-8 text-sm w-28 text-center font-mono tracking-wider bg-[#1b1012] border-[rgba(244,221,224,0.1)] text-[#f4dde0] rounded-sm"
              autoFocus
            />
            <Button size="sm" onClick={handleJoin} disabled={loading} className="h-8 rounded-sm bg-[#debfc3] text-[#1b1012] text-xs hover:bg-[#d4b5b9]">
              Unirse
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setShowJoin(false)} className="h-8 text-xs text-[#9b8e8f] hover:text-[#f4dde0]">
              Cancelar
            </Button>
          </div>
        )}
      </div>
    </motion.div>
  )
}
