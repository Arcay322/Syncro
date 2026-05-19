"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Users, Plus, LogIn, Copy, Check, LogOut, Crown } from "lucide-react"
import type { Group } from "@prisma/client"

interface GroupMember {
  id: string
  role: string
  user: {
    id: string
    name: string | null
    image: string | null
  }
}

interface GroupWithMembers extends Group {
  members: GroupMember[]
}

interface GroupManagerProps {
  group: GroupWithMembers | null
  onGroupChange: (group: GroupWithMembers | null) => void
}

function getInitials(name: string | null): string {
  if (!name) return "?"
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
}

function getAvatarColor(name: string | null): string {
  if (!name) return "#3f3133"
  const colors = ["#8B5CF6", "#EC4899", "#F59E0B", "#10B981", "#3B82F6", "#EF4444", "#06B6D4"]
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colors[Math.abs(hash) % colors.length]
}

export function GroupManager({ group, onGroupChange }: GroupManagerProps) {
  const [showCreate, setShowCreate] = useState(false)
  const [showJoin, setShowJoin] = useState(false)
  const [groupName, setGroupName] = useState("")
  const [inviteCode, setInviteCode] = useState("")
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState("")

  const handleCreate = async () => {
    if (!groupName.trim() || groupName.trim().length < 2) {
      setError("El nombre debe tener al menos 2 caracteres")
      return
    }
    setError("")
    setLoading(true)
    const res = await fetch("/api/groups", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: groupName }),
    })
    if (res.ok) {
      const data = await res.json()
      onGroupChange(data.group)
      setShowCreate(false)
      setGroupName("")
    } else {
      const data = await res.json()
      setError(data.error || "Error al crear la sala")
    }
    setLoading(false)
  }

  const handleJoin = async () => {
    if (!inviteCode.trim() || inviteCode.trim().length !== 6) {
      setError("El código debe tener 6 caracteres")
      return
    }
    setError("")
    setLoading(true)
    const res = await fetch("/api/groups/join", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ inviteCode: inviteCode.trim() }),
    })
    if (res.ok) {
      const data = await res.json()
      onGroupChange(data.group)
      setShowJoin(false)
      setInviteCode("")
    } else {
      const data = await res.json()
      setError(data.error || "Código inválido")
    }
    setLoading(false)
  }

  const handleLeave = async () => {
    if (!confirm("¿Salir de la sala?")) return
    setLoading(true)
    const res = await fetch("/api/groups/leave", {
      method: "DELETE",
    })
    if (res.ok) {
      onGroupChange(null)
    }
    setLoading(false)
  }

  const copyCode = () => {
    if (group) {
      navigator.clipboard.writeText(group.inviteCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  // Show group info if user is in a group
  if (group) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 border border-[#4f4445] rounded-lg bg-[#291c1e]"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#ffd65b]" />
            <span className="text-xs font-medium text-[#f4dde0]">Sala compartida activa</span>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleLeave}
            disabled={loading}
            className="h-6 text-[10px] text-[#ffb4ab] hover:text-[#ffb4ab] hover:bg-[rgba(255,180,171,0.08)] px-2"
          >
            <LogOut className="w-3 h-3 mr-1" />
            Salir
          </Button>
        </div>

        {/* Group name */}
        <h3 className="text-sm font-display font-semibold text-[#f4dde0] mb-3">{group.name}</h3>

        {/* Invite code */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-[10px] text-[#9b8e8f] tracking-wider uppercase">Código:</span>
          <code className="px-2 py-1 bg-[#1b1012] rounded-sm font-mono text-xs text-[#ffd65b] border border-[#4f4445] tracking-wider">
            {group.inviteCode}
          </code>
          <Button size="icon" variant="ghost" onClick={copyCode} className="h-6 w-6 text-[#9b8e8f] hover:text-[#ffd65b]">
            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
          </Button>
        </div>

        {/* Members */}
        <div className="space-y-2">
          <p className="text-[10px] text-[#9b8e8f] tracking-wider uppercase mb-2">Miembros</p>
          {group.members?.map((member) => {
            const initials = getInitials(member.user.name)
            const avatarBg = getAvatarColor(member.user.name)
            const isOwner = member.role === "owner"
            return (
              <div key={member.id} className="flex items-center gap-2 py-1">
                <div className="relative">
                  {member.user.image ? (
                    <img src={member.user.image} alt={member.user.name || ""} className="w-6 h-6 rounded-full object-cover" />
                  ) : (
                    <div 
                      className="w-6 h-6 rounded-full flex items-center justify-center text-[8px] font-bold text-white"
                      style={{ backgroundColor: avatarBg }}
                    >
                      {initials}
                    </div>
                  )}
                  {isOwner && (
                    <Crown className="w-2.5 h-2.5 text-[#ffd65b] absolute -top-0.5 -right-0.5" />
                  )}
                </div>
                <span className="text-xs text-[#f4dde0]">{member.user.name}</span>
              </div>
            )
          })}
        </div>
      </motion.div>
    )
  }

  // Show create/join UI if not in a group
  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 border border-[#4f4445] rounded-lg bg-[#291c1e]"
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="w-8 h-8 rounded-sm bg-[#342729] flex items-center justify-center shrink-0">
          <Users className="w-4 h-4 text-[#9b8e8f]" />
        </div>
        <div>
          <h3 className="text-sm font-medium text-[#f4dde0]">Sala compartida</h3>
          <p className="text-[10px] text-[#9b8e8f]">Comparte tu watchlist</p>
        </div>
      </div>

      {error && (
        <p className="text-[10px] text-[#ffb4ab] mb-2">{error}</p>
      )}

      <AnimatePresence mode="wait">
        {!showCreate && !showJoin ? (
          <motion.div
            key="buttons"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex gap-2"
          >
            <Button size="sm" onClick={() => { setShowCreate(true); setError("") }} className="h-8 rounded-sm bg-[#debfc3] text-[#3f2b2e] text-[10px] hover:bg-[#d4b5b9] tracking-wider uppercase">
              <Plus className="w-3 h-3 mr-1" /> Crear
            </Button>
            <Button size="sm" variant="outline" onClick={() => { setShowJoin(true); setError("") }} className="h-8 rounded-sm text-[10px] border-[#4f4445] text-[#9b8e8f] hover:text-[#f4dde0] hover:bg-[rgba(159,142,143,0.06)] tracking-wider uppercase">
              <LogIn className="w-3 h-3 mr-1" /> Unirse
            </Button>
          </motion.div>
        ) : showCreate ? (
          <motion.div
            key="create"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            <Input
              placeholder="Nombre de la sala"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              className="h-8 text-xs bg-[#1b1012] border-[#4f4445] text-[#f4dde0] rounded-sm"
              autoFocus
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleCreate} disabled={loading} className="h-7 rounded-sm bg-[#debfc3] text-[#3f2b2e] text-[10px] hover:bg-[#d4b5b9]">
                Crear sala
              </Button>
              <Button size="sm" variant="ghost" onClick={() => { setShowCreate(false); setError("") }} className="h-7 text-[10px] text-[#9b8e8f] hover:text-[#f4dde0]">
                Cancelar
              </Button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="join"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            <Input
              placeholder="Código de 6 caracteres"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === "Enter" && handleJoin()}
              maxLength={6}
              className="h-8 text-xs text-center font-mono tracking-wider bg-[#1b1012] border-[#4f4445] text-[#f4dde0] rounded-sm"
              autoFocus
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleJoin} disabled={loading} className="h-7 rounded-sm bg-[#debfc3] text-[#3f2b2e] text-[10px] hover:bg-[#d4b5b9]">
                Unirse
              </Button>
              <Button size="sm" variant="ghost" onClick={() => { setShowJoin(false); setError("") }} className="h-7 text-[10px] text-[#9b8e8f] hover:text-[#f4dde0]">
                Cancelar
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
