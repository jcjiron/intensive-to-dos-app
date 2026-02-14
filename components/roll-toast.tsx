"use client"

import { useEffect } from "react"
import { cn } from "@/lib/utils"
import { Zap, Dices } from "lucide-react"

interface RollToastProps {
  roll: number | null
  escalated: boolean
  onDismiss: () => void
}

export function RollToast({ roll, escalated, onDismiss }: RollToastProps) {
  useEffect(() => {
    if (roll === null) return
    const timer = setTimeout(onDismiss, 2500)
    return () => clearTimeout(timer)
  }, [roll, onDismiss])

  if (roll === null) return null

  return (
    <div
      className={cn(
        "fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-50 animate-fade-in-up",
        "flex items-center gap-3 rounded-2xl border px-5 py-3 shadow-lg",
        escalated
          ? "bg-escalation text-escalation-foreground border-escalation/50"
          : "bg-card text-card-foreground border-border"
      )}
      role="status"
      aria-live="polite"
    >
      {escalated ? (
        <Zap className="h-5 w-5" />
      ) : (
        <Dices className="h-5 w-5 text-muted-foreground" />
      )}
      <div>
        <span className="text-sm font-semibold">
          {escalated ? "ESCALATED!" : `Rolled ${roll}`}
        </span>
        {!escalated && (
          <span className="text-xs text-muted-foreground ml-2">
            Safe this time
          </span>
        )}
      </div>
    </div>
  )
}
