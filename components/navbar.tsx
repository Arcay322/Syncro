"use client"

import { signOut } from "next-auth/react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LogOut, Diamond } from "lucide-react"

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
  const pathname = usePathname()
  const initials = getInitials(user?.name || null)
  const avatarBg = getAvatarColor(user?.name || null)

  const navLinks = [
    { href: "/", label: "Dashboard" },
    { href: "/series", label: "Biblioteca" },
    { href: "/pendientes", label: "Pendientes" },
    { href: "/estadisticas", label: "Estadísticas" },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#4f4445] bg-[#1b1012]/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-1.5">
          <Diamond className="w-3 h-3 text-[#debfc3]" />
          <span className="font-display text-xs font-semibold tracking-[0.25em] text-[#debfc3] uppercase">Syncro</span>
        </Link>

        {/* Center nav links */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || (link.href === "/" && pathname === "/")
            return (
              <Link
                key={link.label}
                href={link.href}
                className={`text-[10px] font-medium tracking-[0.15em] uppercase transition-colors ${
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

        {/* User profile */}
        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger>
              <div className="relative h-7 w-7 rounded-full cursor-pointer ring-1 ring-[#4f4445] hover:ring-[#9b8e8f] transition-all overflow-hidden">
                {user.image ? (
                  <img src={user.image} alt={user.name || "User"} className="h-7 w-7 rounded-full object-cover" />
                ) : (
                  <div 
                    className="h-7 w-7 rounded-full flex items-center justify-center text-[9px] font-bold text-white"
                    style={{ backgroundColor: avatarBg }}
                  >
                    {initials}
                  </div>
                )}
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-[#291c1e] border border-[#4f4445] rounded-md">
              <div className="px-3 py-2">
                <p className="text-sm font-medium text-[#f4dde0] font-display">{user.name}</p>
                <p className="text-[10px] text-[#9b8e8f] mt-0.5">{user.email}</p>
              </div>
              <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/login" })} className="text-[#ffb4ab] focus:text-[#ffb4ab] cursor-pointer text-xs">
                <LogOut className="mr-2 h-3 w-3" />
                Cerrar sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  )
}
