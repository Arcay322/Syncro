"use client"

import { signOut } from "next-auth/react"
import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  LogOut,
  User,
  BarChart2,
  LayoutDashboard,
  Library,
  Bookmark,
  Menu,
  X,
  Users,
  Crown,
  ChevronDown,
  Check,
  Home,
} from "lucide-react"
import { useState } from "react"

interface GroupMember {
  id: string
  role: string
  user: { id: string; name: string | null; image: string | null }
}

interface GroupWithRole {
  id: string
  name: string
  inviteCode: string
  role: string
  members: GroupMember[]
}

interface NavbarProps {
  user: {
    name: string | null
    email: string | null
    image: string | null
  } | null
  groups?: GroupWithRole[]
  activeGroupId?: string | null
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

export function Navbar({ user, groups = [], activeGroupId = null }: NavbarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const initials = getInitials(user?.name || null)
  const avatarBg = getAvatarColor(user?.name || null)
  const [mobileOpen, setMobileOpen] = useState(false)

  const navLinks = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/series", label: "Biblioteca", icon: Library },
    { href: "/pendientes", label: "Pendientes", icon: Bookmark },
    { href: "/estadisticas", label: "Estadísticas", icon: BarChart2 },
  ]

  const activeGroup = groups.find((g) => g.id === activeGroupId) ?? null

  const handleSwitchLibrary = async (groupId: string | null) => {
    await fetch("/api/groups/active", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ groupId }),
    })
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#4f4445] bg-[#1b1012]/95 backdrop-blur-md">
      <div className="w-full px-6 lg:px-12 xl:px-16 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Image 
            src="/logo-nav.webp" 
            alt="Syncro" 
            width={400} 
            height={120} 
            className="w-auto h-16 scale-[2] translate-x-4 translate-y-2 object-contain drop-shadow-[0_0_10px_rgba(255,214,91,0.15)]" 
            priority 
          />
        </Link>

        {/* Center nav links — desktop */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => {
            const isActive = pathname === link.href
            return (
              <Link
                key={link.label}
                href={link.href}
                className={`text-xs font-medium tracking-[0.15em] uppercase transition-colors ${
                  isActive
                    ? "text-[#debfc3]"
                    : "text-[#9b8e8f] hover:text-[#f4dde0]"
                }`}
              >
                {link.label}
              </Link>
            )
          })}
        </nav>

        {/* Right side: library switcher + user */}
        <div className="flex items-center gap-3">

          {/* Library Switcher (only if user has groups) */}
          {groups.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger>
                <div className={`hidden sm:flex items-center gap-2 h-8 px-3 rounded-lg border text-[10px] font-semibold tracking-widest uppercase cursor-pointer transition-all ${
                  activeGroup
                    ? "border-[#FFD65B]/40 text-[#FFD65B] bg-[#FFD65B]/5 hover:bg-[#FFD65B]/10"
                    : "border-[#4f4445] text-[#9b8e8f] bg-transparent hover:bg-[#291c1e] hover:text-[#debfc3]"
                }`}>
                  {activeGroup ? (
                    <Users className="w-3 h-3" />
                  ) : (
                    <Home className="w-3 h-3" />
                  )}
                  <span className="max-w-[120px] truncate">
                    {activeGroup ? activeGroup.name : "Mi Biblioteca"}
                  </span>
                  <ChevronDown className="w-3 h-3 opacity-60" />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-[#291c1e] border border-[#4f4445] rounded-xl shadow-2xl w-52">
                <div className="px-3 py-2">
                  <p className="text-[9px] text-[#9b8e8f] tracking-[0.2em] uppercase font-medium">Cambiar vista</p>
                </div>
                <DropdownMenuSeparator className="bg-[#4f4445]/40" />

                {/* Personal */}
                <DropdownMenuItem
                  onClick={() => handleSwitchLibrary(null)}
                  className="flex items-center gap-2.5 px-3 py-2 text-xs cursor-pointer rounded-lg mx-1 transition-colors text-[#debfc3] hover:bg-[#debfc3]/10"
                >
                  <Home className="w-3.5 h-3.5 shrink-0" />
                  <span className="flex-1 truncate">Mi Biblioteca</span>
                  {!activeGroup && <Check className="w-3 h-3 text-[#FFD65B]" />}
                </DropdownMenuItem>

                {/* Groups */}
                {groups.map((g) => (
                  <DropdownMenuItem
                    key={g.id}
                    onClick={() => handleSwitchLibrary(g.id)}
                    className="flex items-center gap-2.5 px-3 py-2 text-xs cursor-pointer rounded-lg mx-1 mb-0.5 transition-colors text-[#9b8e8f] hover:text-[#debfc3] hover:bg-[#debfc3]/10"
                  >
                    {g.role === "owner" ? (
                      <Crown className="w-3.5 h-3.5 text-[#FFD65B] shrink-0" />
                    ) : (
                      <Users className="w-3.5 h-3.5 shrink-0" />
                    )}
                    <span className="flex-1 truncate">{g.name}</span>
                    {activeGroupId === g.id && <Check className="w-3 h-3 text-[#FFD65B]" />}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Mobile hamburger */}
          <button
            className="md:hidden w-8 h-8 flex items-center justify-center rounded-lg text-[#9b8e8f] hover:text-[#debfc3] transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menú"
          >
            {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>

          {/* User avatar dropdown */}
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger>
                <div className="relative h-10 w-10 rounded-full cursor-pointer ring-2 ring-[#FFD65B]/60 hover:ring-[#FFD65B] transition-all overflow-hidden">
                  {user.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={user.image} alt={user.name || "User"} className="h-10 w-10 rounded-full object-cover" />
                  ) : (
                    <div
                      className="h-10 w-10 rounded-full flex items-center justify-center text-[13px] font-bold text-white"
                      style={{ backgroundColor: avatarBg }}
                    >
                      {initials}
                    </div>
                  )}
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52 bg-[#291c1e] border border-[#4f4445] rounded-xl shadow-2xl">
                {/* User info */}
                <div className="px-3 py-2.5">
                  <p className="text-sm font-medium text-[#f4dde0] font-serif truncate">{user.name || "Cinéfilo"}</p>
                  <p className="text-[10px] text-[#9b8e8f] mt-0.5 truncate">{user.email}</p>
                </div>
                <DropdownMenuSeparator className="bg-[#4f4445]/40" />

                {/* Profile link */}
                <DropdownMenuItem
                  onClick={() => router.push("/perfil")}
                  className="flex items-center gap-2 px-3 py-2 text-xs text-[#debfc3] hover:bg-[#debfc3]/10 cursor-pointer rounded-lg mx-1 transition-colors"
                >
                  <User className="w-3.5 h-3.5" />
                  Mi Perfil · El Camerino
                </DropdownMenuItem>

                {/* Stats link */}
                <DropdownMenuItem
                  onClick={() => router.push("/estadisticas")}
                  className="flex items-center gap-2 px-3 py-2 text-xs text-[#9b8e8f] hover:bg-[#debfc3]/10 hover:text-[#debfc3] cursor-pointer rounded-lg mx-1 transition-colors"
                >
                  <BarChart2 className="w-3.5 h-3.5" />
                  Anuario Cinéfilo
                </DropdownMenuItem>

                <DropdownMenuSeparator className="bg-[#4f4445]/40" />

                {/* Sign out */}
                <DropdownMenuItem
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className="flex items-center gap-2 px-3 py-2 text-xs text-red-400 hover:bg-red-500/10 hover:text-red-300 cursor-pointer rounded-lg mx-1 mb-1 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Cerrar sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Mobile menu overlay */}
      {mobileOpen && (
        <div className="md:hidden border-t border-[#4f4445]/50 bg-[#1b1012]/98 px-6 py-4 space-y-1">
          {navLinks.map((link) => {
            const Icon = link.icon
            const isActive = pathname === link.href
            return (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
                  isActive
                    ? "bg-[#debfc3]/10 text-[#debfc3]"
                    : "text-[#9b8e8f] hover:text-[#debfc3] hover:bg-[#debfc3]/5"
                }`}
              >
                <Icon className="w-4 h-4" />
                {link.label}
              </Link>
            )
          })}
          {/* Mobile library switcher */}
          {groups.length > 0 && (
            <>
              <div className="h-px bg-[#4f4445]/30 my-2" />
              <p className="text-[9px] text-[#9b8e8f] tracking-widest uppercase px-3 mb-1">Cambiar biblioteca</p>
              <button
                onClick={() => { handleSwitchLibrary(null); setMobileOpen(false) }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${!activeGroup ? "text-[#debfc3] bg-[#debfc3]/10" : "text-[#9b8e8f] hover:text-[#debfc3] hover:bg-[#debfc3]/5"}`}
              >
                <Home className="w-4 h-4" />
                Mi Biblioteca Personal
              </button>
              {groups.map((g) => (
                <button
                  key={g.id}
                  onClick={() => { handleSwitchLibrary(g.id); setMobileOpen(false) }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${activeGroupId === g.id ? "text-[#FFD65B] bg-[#FFD65B]/10" : "text-[#9b8e8f] hover:text-[#debfc3] hover:bg-[#debfc3]/5"}`}
                >
                  {g.role === "owner" ? <Crown className="w-4 h-4 text-[#FFD65B]" /> : <Users className="w-4 h-4" />}
                  {g.name}
                </button>
              ))}
            </>
          )}
          <div className="h-px bg-[#4f4445]/30 my-2" />
          <Link
            href="/perfil"
            onClick={() => setMobileOpen(false)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
              pathname === "/perfil"
                ? "bg-[#debfc3]/10 text-[#debfc3]"
                : "text-[#9b8e8f] hover:text-[#debfc3] hover:bg-[#debfc3]/5"
            }`}
          >
            <User className="w-4 h-4" />
            Mi Perfil
          </Link>
        </div>
      )}
    </header>
  )
}
