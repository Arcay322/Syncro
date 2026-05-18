"use client"

import { signOut } from "next-auth/react"
import Link from "next/link"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Film, LogOut, User, Diamond } from "lucide-react"

interface NavbarProps {
  user: {
    name: string | null
    email: string | null
    image: string | null
  } | null
}

export function Navbar({ user }: NavbarProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-[rgba(245,197,24,0.12)] bg-[#1b1012]/90 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="flex items-center gap-1.5">
            <Diamond className="w-4 h-4 text-[#f5c518]" />
            <span className="font-display text-lg font-semibold tracking-[0.15em] text-[#f4dde0] uppercase">Syncro</span>
            <Diamond className="w-4 h-4 text-[#f5c518]" />
          </div>
        </Link>

        {/* Center nav links */}
        <nav className="hidden md:flex items-center gap-8">
          <Link href="/" className="text-xs font-medium tracking-[0.1em] uppercase text-[#f5c518]">
            Dashboard
          </Link>
          <Link href="/?filter=tv" className="text-xs font-medium tracking-[0.1em] uppercase text-[#9b8e8f] hover:text-[#f4dde0] transition-colors">
            Series
          </Link>
          <Link href="/?filter=movie" className="text-xs font-medium tracking-[0.1em] uppercase text-[#9b8e8f] hover:text-[#f4dde0] transition-colors">
            Películas
          </Link>
          <span className="text-xs font-medium tracking-[0.1em] uppercase text-[#9b8e8f] hover:text-[#f4dde0] transition-colors cursor-pointer">
            Calendario
          </span>
        </nav>

        {/* User profile */}
        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger>
              <div className="relative h-8 w-8 rounded-full cursor-pointer ring-1 ring-[rgba(245,197,24,0.3)] hover:ring-[#f5c518] transition-all overflow-hidden">
                {user.image ? (
                  <img src={user.image} alt={user.name || "User"} className="h-8 w-8 rounded-full object-cover" />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-[#3f3133] flex items-center justify-center">
                    <User className="h-4 w-4 text-[#f5c518]" />
                  </div>
                )}
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52 bg-[#2c1a1d] border border-[rgba(245,197,24,0.15)]">
              <div className="px-3 py-2">
                <p className="text-sm font-medium text-[#f4dde0] font-display">{user.name}</p>
                <p className="text-xs text-[#9b8e8f]">{user.email}</p>
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
