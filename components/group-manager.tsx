"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
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
      >
        <Card className="p-6 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
          <div className="flex flex-col items-center text-center gap-3">
            <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-800 flex items-center justify-center">
              <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 className="font-medium">¡Sala creada!</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Comparte este código para que se unan
              </p>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <code className="px-4 py-2 bg-background rounded-lg font-mono text-lg tracking-widest">
                {createdGroup.inviteCode}
              </code>
              <Button size="icon" variant="outline" onClick={copyCode}>
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="p-6">
        <div className="flex flex-col items-center text-center gap-4">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
            <Users className="w-6 h-6 text-muted-foreground" />
          </div>
          <div>
            <h3 className="font-medium">Sala compartida</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm">
              Crea una sala para compartir tu watchlist con amigos o familiares y
              llevar el progreso juntos.
            </p>
          </div>

          {!showCreate && !showJoin && (
            <div className="flex gap-3">
              <Button onClick={() => setShowCreate(true)} className="gap-2 rounded-full">
                <Plus className="w-4 h-4" />
                Crear sala
              </Button>
              <Button variant="outline" onClick={() => setShowJoin(true)} className="gap-2 rounded-full">
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
                placeholder="Nombre de la sala"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              />
              <div className="flex gap-2">
                <Button onClick={handleCreate} disabled={loading} className="flex-1 rounded-full">
                  {loading ? "Creando..." : "Crear"}
                </Button>
                <Button variant="ghost" onClick={() => setShowCreate(false)}>
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
              />
              <div className="flex gap-2">
                <Button onClick={handleJoin} disabled={loading} className="flex-1 rounded-full">
                  {loading ? "Uniendo..." : "Unirse"}
                </Button>
                <Button variant="ghost" onClick={() => setShowJoin(false)}>
                  Cancelar
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </Card>
    </motion.div>
  )
}
