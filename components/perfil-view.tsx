"use client"

import { useState } from "react"
import { signOut } from "next-auth/react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import {
  Diamond,
  LogOut,
  User,
  Mail,
  Calendar,
  Tv,
  CheckCircle2,
  Users,
  Trash2,
  Loader2,
} from "lucide-react"

interface PerfilViewProps {
  user: {
    id: string
    name: string | null
    email: string | null
    username: string | null
    image: string | null
  }
  stats: {
    totalItems: number
    completedItems: number
  }
  groupName: string | null
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

function getInitials(name: string | null): string {
  if (!name) return "?"
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
}

function getAvatarColor(name: string | null): string {
  if (!name) return "#3f3133"
  const colors = ["#8B5CF6", "#EC4899", "#F59E0B", "#10B981", "#3B82F6", "#EF4444", "#06B6D4"]
  let hash = 0
  for (let i = 0; i < (name?.length || 0); i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colors[Math.abs(hash) % colors.length]
}

export function PerfilView({ user, stats, groupName }: PerfilViewProps) {
  const [loading, setLoading] = useState(false)
  const initials = getInitials(user.name)
  const avatarBg = getAvatarColor(user.name)

  const handleDeleteAccount = async () => {
    if (!confirm("¿Estás seguro de que deseas eliminar tu cuenta? Esta acción no se puede deshacer.")) return
    setLoading(true)
    // In a real app, call an API to delete the account
    await signOut({ callbackUrl: "/login" })
  }

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
            El Camerino
          </h1>
          <p className="text-sm text-[#9B8E8F] font-serif max-w-md mx-auto">
            Tu espacio personal. Gestiona tu perfil y preferencias.
          </p>
          <ArtDecoLine />
        </motion.div>
      </div>

      {/* Profile Card */}
      <div className="px-4 max-w-lg mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-6 rounded-xl bg-[#291C1E]/60 border border-[#4F4445]/30 space-y-6"
        >
          {/* Avatar */}
          <div className="flex flex-col items-center space-y-3">
            <div className="relative">
              {user.image ? (
                <img
                  src={user.image}
                  alt={user.name || "User"}
                  className="w-24 h-24 rounded-full object-cover ring-2 ring-[#4F4445]"
                />
              ) : (
                <div
                  className="w-24 h-24 rounded-full flex items-center justify-center text-2xl font-bold text-white ring-2 ring-[#4F4445]"
                  style={{ backgroundColor: avatarBg }}
                >
                  {initials}
                </div>
              )}
              <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-[#FFD65B] flex items-center justify-center">
                <User className="w-4 h-4 text-[#3F2B2E]" />
              </div>
            </div>
            <div className="text-center">
              <h2 className="text-xl font-bold text-[#DEBFC3] font-serif">{user.name || "Cinéfilo Anónimo"}</h2>
              {user.username && (
                <p className="text-sm text-[#9B8E8F] mt-0.5">@{user.username}</p>
              )}
            </div>
          </div>

          <div className="h-px bg-[#4F4445]/30" />

          {/* Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-[#9B8E8F]" />
              <span className="text-sm text-[#DEBFC3]">{user.email || "Sin email"}</span>
            </div>
            {groupName && (
              <div className="flex items-center gap-3">
                <Users className="w-4 h-4 text-[#9B8E8F]" />
                <span className="text-sm text-[#DEBFC3]">Cineclub: {groupName}</span>
              </div>
            )}
          </div>

          <div className="h-px bg-[#4F4445]/30" />

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-[#1B1012]/60 text-center">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <Tv className="w-3.5 h-3.5 text-[#DEBFC3]" />
                <span className="text-lg font-bold text-[#DEBFC3] font-serif">{stats.totalItems}</span>
              </div>
              <p className="text-[10px] text-[#4F4445] uppercase tracking-wider">En lista</p>
            </div>
            <div className="p-3 rounded-lg bg-[#1B1012]/60 text-center">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-lg font-bold text-[#DEBFC3] font-serif">{stats.completedItems}</span>
              </div>
              <p className="text-[10px] text-[#4F4445] uppercase tracking-wider">Terminadas</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Actions */}
      <div className="px-4 max-w-lg mx-auto space-y-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Button
            onClick={() => signOut({ callbackUrl: "/login" })}
            variant="outline"
            className="w-full h-12 rounded-xl border-[#4F4445] text-[#9B8E8F] hover:bg-[#291C1E] hover:text-[#DEBFC3] gap-2"
          >
            <LogOut className="w-4 h-4" />
            Cerrar sesión
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <Button
            onClick={handleDeleteAccount}
            disabled={loading}
            variant="outline"
            className="w-full h-12 rounded-xl border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300 gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            Eliminar cuenta
          </Button>
        </motion.div>
      </div>

      {/* Footer Note */}
      <div className="px-4 text-center">
        <p className="text-[10px] text-[#4F4445] font-serif">
          Syncro Cinematic — Curating moments for Art Deco Souls
        </p>
      </div>
    </div>
  )
}
