"use client"

import { useState, useRef } from "react"
import { Plus } from "lucide-react"
import { cn } from "@/lib/utils"

interface TaskInputProps {
  onAdd: (text: string) => void
  isEscalation: boolean
}

export function TaskInput({ onAdd, isEscalation }: TaskInputProps) {
  const [value, setValue] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = value.trim()
    if (!trimmed) return
    onAdd(trimmed)
    setValue("")
    inputRef.current?.focus()
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <div
        className={cn(
          "flex-1 flex items-center gap-2 rounded-2xl border bg-card px-3 py-2.5 md:px-4 md:py-3 transition-colors duration-200",
          isEscalation && "border-escalation/40 animate-pulse-border"
        )}
      >
        <Plus className="h-4 w-4 shrink-0 text-muted-foreground" />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={isEscalation ? "Add task (Escalation Zone!)..." : "Add a new task..."}
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground text-foreground"
          aria-label="New task text"
        />
      </div>
      <button
        type="submit"
        disabled={!value.trim()}
        className={cn(
          "shrink-0 h-10 w-10 md:h-11 md:w-11 flex items-center justify-center rounded-2xl font-medium text-sm transition-all duration-200",
          "bg-primary text-primary-foreground hover:opacity-90",
          "disabled:opacity-40 disabled:cursor-not-allowed",
          isEscalation && "bg-escalation text-escalation-foreground"
        )}
        aria-label="Add task"
      >
        <Plus className="h-5 w-5" />
      </button>
    </form>
  )
}
