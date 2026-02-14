"use client"

import { AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"

interface EscalationBannerProps {
  activeCount: number
  isEscalated: boolean
  className?: string
}

export function EscalationBanner({ activeCount, isEscalated, className }: EscalationBannerProps) {
  const isEscalationZone = activeCount >= 20

  if (!isEscalationZone) return null

  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-2xl border px-4 py-3 transition-all duration-300",
        isEscalated
          ? "bg-escalation/15 border-escalation/40 animate-shake"
          : "bg-escalation-bg border-escalation/20",
        className
      )}
      role="alert"
    >
      <AlertTriangle
        className={cn(
          "h-4 w-4 shrink-0",
          isEscalated ? "text-escalation" : "text-escalation/70"
        )}
      />
      <div className="flex-1">
        <span className="text-sm font-semibold text-escalation-foreground">
          Escalation Zone
        </span>
        <span className="text-xs text-escalation-foreground/70 ml-2">
          {activeCount} active tasks
        </span>
      </div>
    </div>
  )
}
