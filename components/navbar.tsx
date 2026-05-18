"use client"

import { signOut } from "next-auth/react"
import Link from "next/link"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LogOut, User, Diamond } from "lucide-react"

interface NavbarProps {
  user: {
    name: string | null
    email: string | null
    image: string | null
  } | null
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

export function Navbar({ user }: NavbarProps) {
  const initials = getInitials(user?.name || null)
  const avatarBg = getAvatarColor(user?.name || null)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[rgba(245,197,24,0.08)] bg-[#1b1012]/95 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="flex items-center gap-1.5">
            <Diamond className="w-3.5 h-3.5 text-[#f5c518]" />
            <span className="font-display text-sm font-semibold tracking-[0.2em] text-[#f4dde0] uppercase">Syncro</span>
            <Diamond className="w-3.5 h-3.5 text-[#f5c518]" />
          </div>
        </Link>

        {/* Center nav links */}
        <nav className="hidden md:flex items-center gap-8">
          <Link href="/" className="text-[10px] font-medium tracking-[0.15em] uppercase text-[#f5c518]">
            Dashboard
          </Link>
          <Link href="/?filter=tv" className="text-[10px] font-medium tracking-[0.15em] uppercase text-[#9b8e8f] hover:text-[#f4dde0] transition-colors">
            Series
          </Link>
          <Link href="/?filter=movie" className="text-[10px] font-medium tracking-[0.15em] uppercase text-[#9b8e8f] hover:text-[#f4dde0] transition-colors">
            Películas
          </Link>
          <span className="text-[10px] font-medium tracking-[0.15em] uppercase text-[#9b8e8f] hover:text-[#f4dde0] transition-colors cursor-pointer">
            Calendario
          </span>
        </nav>

        {/* User profile */}
        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger>
              <div className="relative h-8 w-8 rounded-full cursor-pointer ring-2 ring-[rgba(245,197,24,0.2)] hover:ring-[rgba(245,197,24,0.5)] transition-all overflow-hidden">
                {user.image ? (
                  <img src={user.image} alt={user.name || "User"} className="h-8 w-8 rounded-full object-cover" />
                ) : (
                  <div 
                    className="h-8 w-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                    style={{ backgroundColor: avatarBg }}
                  >
                    {initials}
                  </div>
                )}
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52 bg-[#2c1a1d] border border-[rgba(245,197,24,0.12)] rounded-lg">
              <div className="px-3 py-2.5">
                <p className="text-sm font-medium text-[#f4dde0] font-display">{user.name}</p>
                <p className="text-[10px] text-[#9b8e8f] mt-0.5">{user.email}</p>
              </div>
              <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/login" })} className="text-[#ffb4ab] focus:text-[#ffb4ab] cursor-pointer text-xs">
                <LogOut className="mr-2 h-3.5 w-3.5" />
                Cerrar sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  )
}
