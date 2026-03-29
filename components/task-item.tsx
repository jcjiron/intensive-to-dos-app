"use client"

import { useRef, useState, useCallback, useEffect } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Trash2, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { PRIORITY_LABELS, PRIORITY_COLORS } from "@/lib/task-priority"
import type { Task, TaskPriority } from "@/lib/store"

interface TaskItemProps {
  task: Task
  allTasks: Task[]
  onToggle: (id: string) => void
  onDelete: (id: string) => void
  onSelect: (id: string) => void
  onPriorityChange?: (id: string, priority: TaskPriority) => void
}

export function TaskItem({
  task,
  allTasks,
  onToggle,
  onDelete,
  onSelect,
  onPriorityChange,
}: TaskItemProps) {
  const [swiping, setSwiping] = useState(false)
  const [swipeX, setSwipeX] = useState(0)
  const [dismissed, setDismissed] = useState(false)
  const [dismissDirection, setDismissDirection] = useState<"left" | "right" | null>(null)
  const [justChecked, setJustChecked] = useState(false)
  const startXRef = useRef(0)
  const startYRef = useRef(0)
  const isSwipingRef = useRef(false)

  // Get child tasks info
  const childTasks = (task.childIds || [])
    .map((id) => allTasks.find((t) => t.id === id))
    .filter(Boolean) as Task[]
  
  const hasChildren = childTasks.length > 0
  const completedCount = childTasks.filter((t) => t.done).length
  const progress = hasChildren ? (completedCount / childTasks.length) * 100 : 0

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
      setDismissDirection("right")
      setDismissed(true)
      setTimeout(() => onToggle(task.id), 300)
    } else if (swipeX < -threshold) {
      setDismissDirection("left")
      setDismissed(true)
      setTimeout(() => onDelete(task.id), 300)
    } else {
      setSwipeX(0)
    }

    setSwiping(false)
  }, [swipeX, task.id, task.done, onToggle, onDelete])

  const handleCheckboxChange = (e: React.MouseEvent) => {
    e.stopPropagation()
    setJustChecked(true)
    setTimeout(() => setJustChecked(false), 300)
    onToggle(task.id)
  }

  const handleCardClick = () => {
    onSelect(task.id)
  }

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onDelete(task.id)
  }

  return (
    <div className="animate-fade-in-up">
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
          onClick={handleCardClick}
          className={cn(
            "relative flex items-center gap-3 rounded-2xl border p-3 md:p-4 transition-all duration-200 cursor-pointer hover:shadow-sm",
            // Priority-based colors for parent tasks
            !task.parentId && task.priority === "urgent-important" && "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800 hover:border-red-300",
            !task.parentId && task.priority === "important-not-urgent" && "bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800 hover:border-orange-300",
            !task.parentId && task.priority === "urgent-not-important" && "bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800 hover:border-yellow-300",
            !task.parentId && task.priority === "not-urgent-not-important" && "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800 hover:border-blue-300",
            !task.parentId && !task.priority && "bg-card hover:border-primary/20 border-border",
            task.parentId && "bg-card hover:border-primary/20 border-border",
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
          <div onClick={handleCheckboxChange}>
            <Checkbox
              checked={task.done}
              className={cn(
                "h-5 w-5 md:h-4 md:w-4 rounded-md shrink-0 transition-all duration-150",
                justChecked && "scale-110"
              )}
              aria-label={`Mark "${task.text}" as ${task.done ? "not done" : "done"}`}
            />
          </div>
          
          <div className="flex-1 min-w-0">
            <span
              className={cn(
                "text-sm md:text-sm leading-relaxed text-card-foreground block",
                task.done && "line-through text-muted-foreground"
              )}
            >
              {task.text}
            </span>
          </div>

          {/* Priority Chip */}
          {!task.parentId && (
            <PriorityChip
              priority={task.priority || "not-urgent-not-important"}
              onPriorityChange={(priority) => onPriorityChange?.(task.id, priority)}
            />
          )}

          <button
            onClick={handleDeleteClick}
            className="opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity p-1 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive hidden md:flex"
            aria-label={`Delete task "${task.text}"`}
          >
            <Trash2 className="h-4 w-4" />
          </button>

          <ChevronRight className="h-4 w-4 text-muted-foreground/40 shrink-0" />
        </div>
      </div>
    </div>
  )
}

interface PriorityChipProps {
  priority: TaskPriority
  onPriorityChange: (priority: TaskPriority) => void
}

function PriorityChip({ priority, onPriorityChange }: PriorityChipProps) {
  const [isOpen, setIsOpen] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, right: 0 })
  const priorities: TaskPriority[] = [
    "urgent-important",
    "important-not-urgent",
    "urgent-not-important",
    "not-urgent-not-important",
  ]

  const currentColors = PRIORITY_COLORS[priority]

  const handleButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      setDropdownPosition({
        top: rect.bottom + 4,
        right: window.innerWidth - rect.right,
      })
    }
    setIsOpen(!isOpen)
  }

  const handlePrioritySelect = (e: React.MouseEvent, newPriority: TaskPriority) => {
    e.stopPropagation()
    onPriorityChange(newPriority)
    setIsOpen(false)
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!isOpen) return
    const handleClickOutside = (e: MouseEvent) => {
      if (buttonRef.current && !buttonRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("click", handleClickOutside)
    return () => document.removeEventListener("click", handleClickOutside)
  }, [isOpen])

  return (
    <>
      <button
        ref={buttonRef}
        onClick={handleButtonClick}
        className={cn(
          "w-10 py-1 rounded border text-xs font-medium transition-colors shrink-0 text-center",
          currentColors.bg,
          currentColors.border,
          currentColors.text
        )}
        title={priority}
      >
        {PRIORITY_LABELS[priority]}
      </button>

      {isOpen && (
        <div 
          className="fixed bg-card border rounded-lg shadow-lg z-50 min-w-max"
          style={{ 
            top: dropdownPosition.top, 
            right: dropdownPosition.right,
          }}
        >
          {priorities.map((p) => {
            const colors = PRIORITY_COLORS[p]
            const isSelected = p === priority
            return (
              <button
                key={p}
                onClick={(e) => handlePrioritySelect(e, p)}
                className={cn(
                  "w-full px-3 py-2 text-xs text-left hover:bg-muted transition-colors flex items-center gap-2",
                  "border-b last:border-b-0 first:rounded-t-lg last:rounded-b-lg",
                  isSelected && "bg-muted"
                )}
              >
                <span 
                  className={cn(
                    "w-3 h-3 rounded-full shrink-0",
                    colors.bg,
                    colors.border,
                    "border"
                  )} 
                />
                <span className={cn("font-medium", isSelected && "font-semibold")}>
                  {PRIORITY_LABELS[p]}
                </span>
              </button>
            )
          })}
        </div>
      )}
    </>
  )
}
