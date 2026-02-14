"use client"

import { useRef, useState, useCallback } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Task } from "@/lib/store"

interface TaskItemProps {
  task: Task
  onToggle: (id: string) => void
  onDelete: (id: string) => void
}

export function TaskItem({ task, onToggle, onDelete }: TaskItemProps) {
  const [swiping, setSwiping] = useState(false)
  const [swipeX, setSwipeX] = useState(0)
  const [dismissed, setDismissed] = useState(false)
  const [dismissDirection, setDismissDirection] = useState<"left" | "right" | null>(null)
  const [justChecked, setJustChecked] = useState(false)
  const startXRef = useRef(0)
  const startYRef = useRef(0)
  const isSwipingRef = useRef(false)

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    startXRef.current = e.touches[0].clientX
    startYRef.current = e.touches[0].clientY
    isSwipingRef.current = false
  }, [])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    const dx = e.touches[0].clientX - startXRef.current
    const dy = e.touches[0].clientY - startYRef.current

    if (!isSwipingRef.current && Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 10) {
      isSwipingRef.current = true
      setSwiping(true)
    }

    if (isSwipingRef.current) {
      e.preventDefault()
      setSwipeX(dx)
    }
  }, [])

  const handleTouchEnd = useCallback(() => {
    if (!isSwipingRef.current) {
      setSwiping(false)
      setSwipeX(0)
      return
    }

    const threshold = 80

    if (swipeX > threshold && !task.done) {
      // Swipe right -> mark done
      setDismissDirection("right")
      setDismissed(true)
      setTimeout(() => onToggle(task.id), 300)
    } else if (swipeX < -threshold) {
      // Swipe left -> delete
      setDismissDirection("left")
      setDismissed(true)
      setTimeout(() => onDelete(task.id), 300)
    } else {
      setSwipeX(0)
    }

    setSwiping(false)
  }, [swipeX, task.id, task.done, onToggle, onDelete])

  const handleCheckboxChange = () => {
    setJustChecked(true)
    setTimeout(() => setJustChecked(false), 300)
    onToggle(task.id)
  }

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl",
        dismissed && dismissDirection === "right" && "animate-slide-out-right",
        dismissed && dismissDirection === "left" && "animate-slide-out-left"
      )}
    >
      {/* Swipe indicators */}
      <div className="absolute inset-0 flex items-center md:hidden">
        <div
          className={cn(
            "absolute inset-y-0 left-0 flex items-center justify-start pl-4 bg-success/20 transition-opacity",
            swipeX > 30 ? "opacity-100" : "opacity-0"
          )}
          style={{ width: Math.max(0, swipeX) }}
        >
          <span className="text-sm font-medium text-success">Done</span>
        </div>
        <div
          className={cn(
            "absolute inset-y-0 right-0 flex items-center justify-end pr-4 bg-destructive/20 transition-opacity",
            swipeX < -30 ? "opacity-100" : "opacity-0"
          )}
          style={{ width: Math.max(0, -swipeX) }}
        >
          <span className="text-sm font-medium text-destructive">Delete</span>
        </div>
      </div>

      <div
        className={cn(
          "relative flex items-center gap-3 rounded-2xl border bg-card p-3 md:p-4 transition-all duration-200",
          task.done && "opacity-60",
          justChecked && "scale-[0.98]",
          !swiping && "transition-transform"
        )}
        style={{
          transform: swiping ? `translateX(${swipeX}px)` : undefined,
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <Checkbox
          checked={task.done}
          onCheckedChange={handleCheckboxChange}
          className={cn(
            "h-5 w-5 md:h-4 md:w-4 rounded-md shrink-0 transition-all duration-150",
            justChecked && "scale-110"
          )}
          aria-label={`Mark "${task.text}" as ${task.done ? "not done" : "done"}`}
        />
        <span
          className={cn(
            "flex-1 text-sm md:text-sm leading-relaxed text-card-foreground transition-all duration-200",
            task.done && "line-through text-muted-foreground"
          )}
        >
          {task.text}
        </span>
        <button
          onClick={() => onDelete(task.id)}
          className="opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity p-1 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive hidden md:flex"
          aria-label={`Delete task "${task.text}"`}
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
