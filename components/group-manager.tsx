"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Users, Plus, LogIn, Copy, Check, LogOut, Crown, ChevronDown } from "lucide-react"
import { useRouter } from "next/navigation"

interface GroupMember {
  id: string
  role: string
  user: {
    id: string
    name: string | null
    image: string | null
  }
}

interface GroupWithRole {
  id: string
  name: string
  inviteCode: string
  role: string
  members: GroupMember[]
}

interface GroupManagerProps {
  groups: GroupWithRole[]
  activeGroupId: string | null
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

export function GroupManager({ groups, activeGroupId }: GroupManagerProps) {
  const router = useRouter()
  const [showCreate, setShowCreate] = useState(false)
  const [showJoin, setShowJoin] = useState(false)
  const [groupName, setGroupName] = useState("")
  const [inviteCode, setInviteCode] = useState("")
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)
  const [error, setError] = useState("")
  const [expanded, setExpanded] = useState<string | null>(activeGroupId)

  const activeGroup = groups.find((g) => g.id === activeGroupId) ?? null

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
      setShowCreate(false)
      setGroupName("")
      router.refresh()
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
      setShowJoin(false)
      setInviteCode("")
      router.refresh()
    } else {
      const data = await res.json()
      setError(data.error || "Código inválido")
    }
    setLoading(false)
  }

  const handleLeave = async (groupId: string) => {
    if (!confirm("¿Salir de esta sala?")) return
    setLoading(true)
    const res = await fetch(`/api/groups/leave?groupId=${groupId}`, {
      method: "DELETE",
    })
    if (res.ok) {
      // If we left the active group, switch to personal
      if (groupId === activeGroupId) {
        await fetch("/api/groups/active", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ groupId: null }),
        })
      }
      router.refresh()
    }
    setLoading(false)
  }

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopied(code)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 border border-[#4f4445] rounded-lg bg-[#291c1e] space-y-3"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-3.5 h-3.5 text-[#9b8e8f]" />
          <span className="text-[10px] tracking-[0.2em] uppercase text-[#9b8e8f] font-medium">Salas compartidas</span>
        </div>
        <div className="flex gap-1.5">
          <button
            onClick={() => { setShowCreate(true); setShowJoin(false); setError("") }}
            className="h-6 px-2 rounded text-[9px] font-semibold tracking-wider uppercase bg-[#debfc3] text-[#3f2b2e] hover:bg-[#d4b5b9] transition-colors flex items-center gap-1"
          >
            <Plus className="w-2.5 h-2.5" /> Crear
          </button>
          <button
            onClick={() => { setShowJoin(true); setShowCreate(false); setError("") }}
            className="h-6 px-2 rounded text-[9px] font-semibold tracking-wider uppercase border border-[#4f4445] text-[#9b8e8f] hover:text-[#f4dde0] hover:bg-[rgba(159,142,143,0.06)] transition-colors flex items-center gap-1"
          >
            <LogIn className="w-2.5 h-2.5" /> Unirse
          </button>
        </div>
      </div>

      {/* Error */}
      {error && <p className="text-[10px] text-[#ffb4ab]">{error}</p>}

      {/* Create / Join forms */}
      <AnimatePresence mode="wait">
        {showCreate && (
          <motion.div
            key="create"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2 overflow-hidden"
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
        )}
        {showJoin && (
          <motion.div
            key="join"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2 overflow-hidden"
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

      {/* Groups list */}
      {groups.length === 0 ? (
        <p className="text-[10px] text-[#9b8e8f] text-center py-2">No perteneces a ninguna sala todavía</p>
      ) : (
        <div className="space-y-2">
          {groups.map((group) => {
            const isExpanded = expanded === group.id
            const isActive = activeGroupId === group.id
            return (
              <div key={group.id} className={`rounded-lg border transition-all ${isActive ? "border-[#FFD65B]/30 bg-[#1b1012]" : "border-[#4f4445]/50 bg-[#1b1012]/50"}`}>
                <button
                  className="w-full flex items-center justify-between px-3 py-2.5 text-left"
                  onClick={() => setExpanded(isExpanded ? null : group.id)}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {group.role === "owner"
                      ? <Crown className="w-3 h-3 text-[#FFD65B] shrink-0" />
                      : <Users className="w-3 h-3 text-[#9b8e8f] shrink-0" />
                    }
                    <span className="text-xs font-medium text-[#f4dde0] truncate">{group.name}</span>
                    {isActive && (
                      <span className="text-[8px] px-1.5 py-0.5 rounded bg-[#FFD65B]/15 text-[#FFD65B] font-semibold tracking-wider uppercase shrink-0">Activa</span>
                    )}
                  </div>
                  <ChevronDown className={`w-3 h-3 text-[#9b8e8f] transition-transform shrink-0 ${isExpanded ? "rotate-180" : ""}`} />
                </button>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-3 pb-3 space-y-3">
                        {/* Invite code */}
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-[#9b8e8f] tracking-wider uppercase">Código:</span>
                          <code className="px-2 py-0.5 bg-[#291c1e] rounded font-mono text-xs text-[#ffd65b] border border-[#4f4445] tracking-wider">
                            {group.inviteCode}
                          </code>
                          <button
                            onClick={() => copyCode(group.inviteCode)}
                            className="text-[#9b8e8f] hover:text-[#ffd65b] transition-colors"
                          >
                            {copied === group.inviteCode ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>

                        {/* Members */}
                        <div className="space-y-1.5">
                          <p className="text-[9px] text-[#9b8e8f] tracking-wider uppercase">Miembros ({group.members.length})</p>
                          {group.members?.map((member) => {
                            const initials = getInitials(member.user.name)
                            const avatarBg = getAvatarColor(member.user.name)
                            const isOwner = member.role === "owner"
                            return (
                              <div key={member.id} className="flex items-center gap-2">
                                <div className="relative">
                                  {member.user.image ? (
                                    <img src={member.user.image} alt={member.user.name || ""} className="w-5 h-5 rounded-full object-cover" />
                                  ) : (
                                    <div
                                      className="w-5 h-5 rounded-full flex items-center justify-center text-[7px] font-bold text-white"
                                      style={{ backgroundColor: avatarBg }}
                                    >
                                      {initials}
                                    </div>
                                  )}
                                  {isOwner && (
                                    <Crown className="w-2 h-2 text-[#ffd65b] absolute -top-0.5 -right-0.5" />
                                  )}
                                </div>
                                <span className="text-[11px] text-[#f4dde0] truncate">{member.user.name}</span>
                              </div>
                            )
                          })}
                        </div>

                        {/* Leave */}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleLeave(group.id)}
                          disabled={loading}
                          className="h-6 text-[9px] text-[#ffb4ab] hover:text-[#ffb4ab] hover:bg-[rgba(255,180,171,0.08)] px-2"
                        >
                          <LogOut className="w-2.5 h-2.5 mr-1" />
                          Salir de la sala
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </div>
      )}
    </motion.div>
  )
}
