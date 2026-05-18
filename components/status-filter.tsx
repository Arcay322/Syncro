"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

const filters = [
  { value: "ALL", label: "Todos" },
  { value: "WATCHING", label: "Viendo" },
  { value: "PLAN_TO_WATCH", label: "Pendientes" },
  { value: "COMPLETED", label: "Terminadas" },
  { value: "ON_HOLD", label: "En pausa" },
  { value: "DROPPED", label: "Abandonadas" },
]

interface StatusFilterProps {
  value: string
  onChange: (value: string) => void
}

export function StatusFilter({ value, onChange }: StatusFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {filters.map((filter) => (
        <button
          key={filter.value}
          onClick={() => onChange(filter.value)}
          className={cn(
            "relative px-4 py-1.5 text-sm font-medium rounded-full transition-colors",
            value === filter.value
              ? "text-primary-foreground"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          )}
        >
          {value === filter.value && (
            <motion.div
              layoutId="activeFilter"
              className="absolute inset-0 bg-primary rounded-full"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
          )}
          <span className="relative z-10">{filter.label}</span>
        </button>
      ))}
    </div>
  )
}
