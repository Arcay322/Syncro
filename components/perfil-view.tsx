"use client"

import { useState, useRef } from "react"
import { signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import {
  Diamond,
  LogOut,
  User,
  Mail,
  Tv,
  CheckCircle2,
  Users,
  Trash2,
  Loader2,
  Pencil,
  Check,
  X,
  Image as ImageIcon,
  Link as LinkIcon,
  Sparkles,
  Upload,
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

// Art Déco Hollywood preset avatars (placeholder emoji-based)
const HOLLYWOOD_AVATARS = [
  { id: "star", emoji: "🎬", label: "El Director", color: "#FFD65B" },
  { id: "diva", emoji: "👑", label: "La Diva", color: "#DEBFC3" },
  { id: "detective", emoji: "🕵️", label: "El Detective", color: "#9B8E8F" },
  { id: "vampire", emoji: "🧛", label: "Conde Drácula", color: "#8B5CF6" },
  { id: "robot", emoji: "🤖", label: "El Androide", color: "#06B6D4" },
  { id: "wizard", emoji: "🧙", label: "El Mago", color: "#10B981" },
  { id: "spy", emoji: "🥷", label: "El Espía", color: "#EF4444" },
  { id: "astronaut", emoji: "👨‍🚀", label: "El Astronauta", color: "#F59E0B" },
  { id: "ghost", emoji: "👻", label: "El Fantasma", color: "#4F4445" },
  { id: "alien", emoji: "👽", label: "El Alienígena", color: "#EC4899" },
  { id: "pirate", emoji: "🏴‍☠️", label: "El Pirata", color: "#3B82F6" },
  { id: "ninja", emoji: "🐱‍👤", label: "El Ninja", color: "#1B1012" },
]

function generateEmojiAvatar(emoji: string, color: string): string {
  // Encode as a data URL SVG
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><rect width='120' height='120' rx='60' fill='${color}22'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-size='52'>${emoji}</text></svg>`
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

// ─── Avatar Picker Modal ───
function AvatarPicker({
  current,
  userName,
  onSelect,
  onClose,
}: {
  current: string | null
  userName: string | null
  onSelect: (url: string) => void
  onClose: () => void
}) {
  const [tab, setTab] = useState<"presets" | "url" | "upload">("presets")
  const [urlInput, setUrlInput] = useState("")
  const [urlError, setUrlError] = useState("")
  const [uploadPreview, setUploadPreview] = useState<string | null>(null)
  const [uploadError, setUploadError] = useState("")
  const [compressing, setCompressing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleUrlSubmit = () => {
    if (!urlInput.trim()) {
      setUrlError("Introduce una URL válida")
      return
    }
    try {
      new URL(urlInput)
      onSelect(urlInput.trim())
    } catch {
      setUrlError("URL no válida. Usa https://...")
    }
  }

  // Compress image via canvas and return base64 JPEG
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const img = new window.Image()
        img.onload = () => {
          // Find the largest central square in the original image
          const minOriginalSide = Math.min(img.width, img.height)
          const sx = (img.width - minOriginalSide) / 2
          const sy = (img.height - minOriginalSide) / 2

          // Target dimensions (max 220x220)
          const targetSide = Math.min(220, minOriginalSide)
          
          const canvas = document.createElement("canvas")
          canvas.width = targetSide
          canvas.height = targetSide
          const ctx = canvas.getContext("2d")!
          
          // Fill with dark background in case of transparent PNGs
          ctx.fillStyle = "#1B1012"
          ctx.fillRect(0, 0, targetSide, targetSide)
          
          // Draw the square crop from the original image into the resized canvas
          ctx.drawImage(img, sx, sy, minOriginalSide, minOriginalSide, 0, 0, targetSide, targetSide)
          
          resolve(canvas.toDataURL("image/jpeg", 0.85))
        }
        img.onerror = reject
        img.src = e.target?.result as string
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadError("")

    if (!file.type.startsWith("image/")) {
      setUploadError("Solo se admiten imágenes (JPG, PNG, GIF, WEBP)")
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      setUploadError("La imagen debe pesar menos de 10MB")
      return
    }

    setCompressing(true)
    try {
      const compressed = await compressImage(file)
      setUploadPreview(compressed)
    } catch {
      setUploadError("No se pudo procesar la imagen. Intenta con otra.")
    }
    setCompressing(false)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ type: "spring", damping: 26, stiffness: 320 }}
        className="w-full max-w-md bg-[#1B1012] border border-[#4F4445]/50 rounded-2xl overflow-hidden shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#4F4445]/30">
          <div>
            <h2 className="text-base font-bold text-[#DEBFC3] font-serif">Elegir Avatar</h2>
            <p className="text-xs text-[#4F4445] mt-0.5">Tu máscara de estrella de cine</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-[#291C1E] text-[#9B8E8F] hover:text-[#DEBFC3] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-0 border-b border-[#4F4445]/30">
          {[
            { id: "presets" as const, label: "Hollywood", icon: Sparkles },
            { id: "upload" as const, label: "Mi foto", icon: Upload },
            { id: "url" as const, label: "Por URL", icon: LinkIcon },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-3 text-xs font-medium transition-all ${
                tab === id
                  ? "text-[#FFD65B] border-b-2 border-[#FFD65B]"
                  : "text-[#9B8E8F] hover:text-[#DEBFC3]"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>

        <div className="p-5">
          {/* ── Presets Tab ── */}
          {tab === "presets" && (
            <div className="grid grid-cols-4 gap-3">
              {/* Initials option */}
              <button
                onClick={() => onSelect("")}
                className="flex flex-col items-center gap-1.5 p-2 rounded-xl border border-[#4F4445]/40 hover:border-[#DEBFC3]/30 transition-all group"
              >
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold text-white"
                  style={{ backgroundColor: getAvatarColor(userName) }}
                >
                  {getInitials(userName)}
                </div>
                <span className="text-[9px] text-[#4F4445] group-hover:text-[#9B8E8F] text-center leading-tight">
                  Iniciales
                </span>
              </button>

              {HOLLYWOOD_AVATARS.map((a) => {
                const avatarUrl = generateEmojiAvatar(a.emoji, a.color)
                return (
                  <button
                    key={a.id}
                    onClick={() => onSelect(avatarUrl)}
                    className={`flex flex-col items-center gap-1.5 p-2 rounded-xl border transition-all group ${
                      current === avatarUrl
                        ? "border-[#FFD65B]/50 bg-[#FFD65B]/5"
                        : "border-[#4F4445]/40 hover:border-[#DEBFC3]/30"
                    }`}
                  >
                    <div
                      className="w-14 h-14 rounded-full flex items-center justify-center text-3xl"
                      style={{ backgroundColor: `${a.color}22` }}
                    >
                      {a.emoji}
                    </div>
                    <span className="text-[9px] text-[#4F4445] group-hover:text-[#9B8E8F] text-center leading-tight">
                      {a.label}
                    </span>
                  </button>
                )
              })}
            </div>
          )}

          {/* ── Upload Tab ── */}
          {tab === "upload" && (
            <div className="space-y-4">
              <p className="text-xs text-[#9B8E8F] font-serif">
                Selecciona una foto desde tu dispositivo. Se comprimirá automáticamente.
              </p>

              {/* Drop zone / file button */}
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={compressing}
                className="w-full h-28 rounded-xl border-2 border-dashed border-[#4F4445]/50 hover:border-[#FFD65B]/40 hover:bg-[#FFD65B]/5 transition-all flex flex-col items-center justify-center gap-2 text-[#9B8E8F] hover:text-[#FFD65B] cursor-pointer"
              >
                {compressing ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin text-[#FFD65B]" />
                    <span className="text-xs">Comprimiendo imagen...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-6 h-6" />
                    <span className="text-xs font-medium">Toca para elegir foto</span>
                    <span className="text-[10px] text-[#4F4445]">JPG, PNG, WEBP · máx. 10MB</span>
                  </>
                )}
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />

              {uploadError && (
                <p className="text-xs text-red-400 text-center">{uploadError}</p>
              )}

              {/* Preview */}
              {uploadPreview && !compressing && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center gap-3"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={uploadPreview}
                    alt="Preview"
                    className="w-24 h-24 rounded-full object-cover ring-2 ring-[#FFD65B]/60"
                  />
                  <div className="flex gap-2 w-full">
                    <button
                      onClick={() => { setUploadPreview(null); if (fileInputRef.current) fileInputRef.current.value = "" }}
                      className="flex-1 h-9 rounded-xl border border-[#4F4445]/50 text-xs text-[#9B8E8F] hover:text-[#DEBFC3] hover:border-[#DEBFC3]/30 transition-all"
                    >
                      Elegir otra
                    </button>
                    <Button
                      onClick={() => onSelect(uploadPreview)}
                      className="flex-1 h-9 rounded-xl bg-[#DEBFC3] text-[#3F2B2E] hover:bg-[#d4b5b9] text-xs"
                    >
                      Usar esta foto
                    </Button>
                  </div>
                </motion.div>
              )}
            </div>
          )}

          {/* ── URL Tab ── */}
          {tab === "url" && (
            <div className="space-y-4">
              <p className="text-xs text-[#9B8E8F] font-serif">
                Introduce la URL directa de tu imagen (HTTPS)
              </p>
              <div className="space-y-2">
                <input
                  type="url"
                  value={urlInput}
                  onChange={(e) => { setUrlInput(e.target.value); setUrlError("") }}
                  placeholder="https://ejemplo.com/mi-foto.jpg"
                  className="w-full px-4 py-3 rounded-xl bg-[#291C1E] border border-[#4F4445]/50 text-sm text-[#DEBFC3] placeholder:text-[#4F4445] focus:ring-2 focus:ring-[#FFD65B]/30 focus:border-[#FFD65B]/50 outline-none transition-all"
                />
                {urlError && (
                  <p className="text-xs text-red-400">{urlError}</p>
                )}
              </div>
              {urlInput && !urlError && (
                <div className="flex justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={urlInput}
                    alt="Preview"
                    className="w-20 h-20 rounded-full object-cover ring-2 ring-[#4F4445]"
                    onError={() => setUrlError("No se pudo cargar la imagen. Verifica la URL.")}
                  />
                </div>
              )}
              <Button
                onClick={handleUrlSubmit}
                className="w-full rounded-xl bg-[#DEBFC3] text-[#3F2B2E] hover:bg-[#d4b5b9] text-sm"
              >
                Usar esta imagen
              </Button>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}

// ─── Main Component ───
export function PerfilView({ user, stats, groupName }: PerfilViewProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showAvatarPicker, setShowAvatarPicker] = useState(false)

  // Editable state
  const [editingName, setEditingName] = useState(false)
  const [editingUsername, setEditingUsername] = useState(false)
  const [nameValue, setNameValue] = useState(user.name || "")
  const [usernameValue, setUsernameValue] = useState(user.username || "")
  const [currentImage, setCurrentImage] = useState(user.image || "")
  const [saving, setSaving] = useState<"name" | "username" | "avatar" | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null)

  const initials = getInitials(nameValue || user.name)
  const avatarBg = getAvatarColor(nameValue || user.name)

  const callProfileApi = async (data: { name?: string; username?: string; image?: string }) => {
    const res = await fetch("/api/user/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    const json = await res.json()
    if (!res.ok) throw new Error(json.error || "Error al guardar")
    return json
  }

  const handleSaveName = async () => {
    setSaving("name")
    setSaveError(null)
    try {
      await callProfileApi({ name: nameValue.trim() })
      setSaveSuccess("Nombre actualizado ✓")
      setEditingName(false)
      router.refresh()
      setTimeout(() => setSaveSuccess(null), 3000)
    } catch (e: any) {
      setSaveError(e.message)
    }
    setSaving(null)
  }

  const handleSaveUsername = async () => {
    setSaving("username")
    setSaveError(null)
    try {
      await callProfileApi({ username: usernameValue.trim() })
      setSaveSuccess("Alias actualizado ✓")
      setEditingUsername(false)
      router.refresh()
      setTimeout(() => setSaveSuccess(null), 3000)
    } catch (e: any) {
      setSaveError(e.message)
    }
    setSaving(null)
  }

  const handleAvatarSelect = async (url: string) => {
    setShowAvatarPicker(false)
    setSaving("avatar")
    setSaveError(null)
    try {
      await callProfileApi({ image: url })
      setCurrentImage(url)
      setSaveSuccess("Avatar actualizado ✓")
      router.refresh()
      setTimeout(() => setSaveSuccess(null), 3000)
    } catch (e: any) {
      setSaveError(e.message)
    }
    setSaving(null)
  }

  const handleDeleteAccount = async () => {
    if (!confirm("¿Estás seguro de que deseas eliminar tu cuenta? Esta acción no se puede deshacer.")) return
    setLoading(true)
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

      {/* Toast */}
      <AnimatePresence>
        {(saveSuccess || saveError) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`mx-4 max-w-2xl mx-auto px-4 py-3 rounded-xl text-sm font-serif text-center ${
              saveSuccess
                ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-400"
                : "bg-red-500/15 border border-red-500/30 text-red-400"
            }`}
          >
            {saveSuccess || saveError}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Profile Card */}
      <div className="px-4 max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-6 rounded-xl bg-[#291C1E]/60 border border-[#4F4445]/30 space-y-6"
        >
          {/* Avatar */}
          <div className="flex flex-col items-center space-y-3">
            <div className="relative group">
              {currentImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={currentImage}
                  alt={nameValue || "User"}
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
              <button
                onClick={() => setShowAvatarPicker(true)}
                className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
              >
                {saving === "avatar"
                  ? <Loader2 className="w-5 h-5 text-white animate-spin" />
                  : <Pencil className="w-5 h-5 text-white" />
                }
              </button>
              <button
                onClick={() => setShowAvatarPicker(true)}
                className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-[#FFD65B] flex items-center justify-center hover:bg-[#FFD65B]/80 transition-colors"
              >
                <ImageIcon className="w-3.5 h-3.5 text-[#3F2B2E]" />
              </button>
            </div>
            <p className="text-xs text-[#9B8E8F] font-serif">Toca el avatar para cambiarlo</p>
          </div>

          <div className="h-px bg-[#4F4445]/30" />

          {/* Editable Fields */}
          <div className="space-y-4">
            {/* Display Name */}
            <div className="space-y-1.5">
              <label className="text-xs text-[#9B8E8F] uppercase tracking-wider font-serif">Nombre en pantalla</label>
              {editingName ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={nameValue}
                    onChange={(e) => setNameValue(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") handleSaveName(); if (e.key === "Escape") { setEditingName(false); setNameValue(user.name || "") } }}
                    autoFocus
                    className="flex-1 px-3 py-2 rounded-lg bg-[#1B1012] border border-[#4F4445]/50 text-sm text-[#DEBFC3] focus:ring-2 focus:ring-[#FFD65B]/30 focus:border-[#FFD65B]/50 outline-none transition-all"
                  />
                  <button
                    onClick={handleSaveName}
                    disabled={saving === "name"}
                    className="w-9 h-9 rounded-lg bg-[#DEBFC3] flex items-center justify-center hover:bg-[#d4b5b9] transition-colors"
                  >
                    {saving === "name" ? <Loader2 className="w-3.5 h-3.5 text-[#3F2B2E] animate-spin" /> : <Check className="w-3.5 h-3.5 text-[#3F2B2E]" />}
                  </button>
                  <button
                    onClick={() => { setEditingName(false); setNameValue(user.name || "") }}
                    className="w-9 h-9 rounded-lg border border-[#4F4445]/50 flex items-center justify-center text-[#9B8E8F] hover:text-[#DEBFC3] transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div
                  className="flex items-center justify-between px-3 py-2 rounded-lg bg-[#1B1012]/60 border border-[#4F4445]/30 group cursor-pointer hover:border-[#DEBFC3]/30 transition-all"
                  onClick={() => setEditingName(true)}
                >
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-[#9B8E8F]" />
                    <span className="text-sm text-[#DEBFC3]">{nameValue || "Sin nombre"}</span>
                  </div>
                  <Pencil className="w-3.5 h-3.5 text-[#4F4445] group-hover:text-[#9B8E8F] transition-colors" />
                </div>
              )}
            </div>

            {/* Username / Alias */}
            <div className="space-y-1.5">
              <label className="text-xs text-[#9B8E8F] uppercase tracking-wider font-serif">Alias del Cineclub</label>
              {editingUsername ? (
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4F4445] text-sm">@</span>
                    <input
                      type="text"
                      value={usernameValue}
                      onChange={(e) => setUsernameValue(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                      onKeyDown={(e) => { if (e.key === "Enter") handleSaveUsername(); if (e.key === "Escape") { setEditingUsername(false); setUsernameValue(user.username || "") } }}
                      autoFocus
                      placeholder="tu_alias"
                      className="w-full pl-7 pr-3 py-2 rounded-lg bg-[#1B1012] border border-[#4F4445]/50 text-sm text-[#DEBFC3] focus:ring-2 focus:ring-[#FFD65B]/30 focus:border-[#FFD65B]/50 outline-none transition-all"
                    />
                  </div>
                  <button
                    onClick={handleSaveUsername}
                    disabled={saving === "username"}
                    className="w-9 h-9 rounded-lg bg-[#DEBFC3] flex items-center justify-center hover:bg-[#d4b5b9] transition-colors"
                  >
                    {saving === "username" ? <Loader2 className="w-3.5 h-3.5 text-[#3F2B2E] animate-spin" /> : <Check className="w-3.5 h-3.5 text-[#3F2B2E]" />}
                  </button>
                  <button
                    onClick={() => { setEditingUsername(false); setUsernameValue(user.username || "") }}
                    className="w-9 h-9 rounded-lg border border-[#4F4445]/50 flex items-center justify-center text-[#9B8E8F] hover:text-[#DEBFC3] transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div
                  className="flex items-center justify-between px-3 py-2 rounded-lg bg-[#1B1012]/60 border border-[#4F4445]/30 group cursor-pointer hover:border-[#DEBFC3]/30 transition-all"
                  onClick={() => setEditingUsername(true)}
                >
                  <span className="text-sm text-[#DEBFC3]">
                    {usernameValue ? `@${usernameValue}` : <span className="text-[#4F4445] italic">Sin alias</span>}
                  </span>
                  <Pencil className="w-3.5 h-3.5 text-[#4F4445] group-hover:text-[#9B8E8F] transition-colors" />
                </div>
              )}
              <p className="text-[10px] text-[#4F4445] font-serif">Solo letras, números y guiones bajos.</p>
            </div>

            {/* Email (read only) */}
            <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-[#1B1012]/30 border border-[#4F4445]/20">
              <Mail className="w-4 h-4 text-[#9B8E8F] shrink-0" />
              <span className="text-sm text-[#9B8E8F]">{user.email || "Sin email"}</span>
            </div>

            {/* Group */}
            {groupName && (
              <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-[#FFD65B]/5 border border-[#FFD65B]/20">
                <Users className="w-4 h-4 text-[#FFD65B] shrink-0" />
                <span className="text-sm text-[#DEBFC3]">Cineclub: <span className="font-medium text-[#FFD65B]">{groupName}</span></span>
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
      <div className="px-4 max-w-2xl mx-auto space-y-3">
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

      {/* Avatar Picker Modal */}
      <AnimatePresence>
        {showAvatarPicker && (
          <AvatarPicker
            current={currentImage}
            userName={nameValue || user.name}
            onSelect={handleAvatarSelect}
            onClose={() => setShowAvatarPicker(false)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
