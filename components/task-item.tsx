"use client"

import { useRef, useState, useCallback } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Trash2, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Task } from "@/lib/store"

interface TaskItemProps {
  task: Task
  allTasks: Task[]
  onToggle: (id: string) => void
  onDelete: (id: string) => void
  onUpdate?: (id: string, text: string) => void
  onAddChild?: (parentId: string, text: string) => void
  taskWithError?: string | null
  isChild?: boolean
}

export function TaskItem({
  task,
  allTasks,
  onToggle,
  onDelete,
  onUpdate,
  onAddChild,
  taskWithError,
  isChild = false,
}: TaskItemProps) {
  const [swiping, setSwiping] = useState(false)
  const [swipeX, setSwipeX] = useState(0)
  const [dismissed, setDismissed] = useState(false)
  const [dismissDirection, setDismissDirection] = useState<"left" | "right" | null>(null)
  const [justChecked, setJustChecked] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(task.text)
  const [isAddingChild, setIsAddingChild] = useState(false)
  const [childText, setChildText] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)
  const childInputRef = useRef<HTMLInputElement>(null)
  const startXRef = useRef(0)
  const startYRef = useRef(0)
  const isSwipingRef = useRef(false)

  // Get child tasks for this parent
  const childTasks = (task.childIds || [])
    .map((id) => allTasks.find((t) => t.id === id))
    .filter(Boolean) as Task[]

  // Check if this task or its children have an error
  const hasError = taskWithError === task.parentId

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

  const handleCheckboxChange = () => {
    setJustChecked(true)
    setTimeout(() => setJustChecked(false), 300)
    onToggle(task.id)
  }

  const handleEditStart = () => {
    setIsEditing(true)
    setEditValue(task.text)
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  const handleEditSave = () => {
    const trimmed = editValue.trim()
    if (trimmed && trimmed !== task.text) {
      onUpdate?.(task.id, trimmed)
    }
    setIsEditing(false)
  }

  const handleEditKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleEditSave()
    } else if (e.key === "Escape") {
      setIsEditing(false)
    }
  }

  const handleEditBlur = () => {
    setIsEditing(false)
  }

  const handleAddChildClick = () => {
    setIsAddingChild(true)
    setChildText("")
    setTimeout(() => childInputRef.current?.focus(), 0)
  }

  const handleAddChildSave = () => {
    const trimmed = childText.trim()
    if (trimmed && onAddChild) {
      onAddChild(task.id, trimmed)
    }
    setIsAddingChild(false)
    setChildText("")
  }

  const handleAddChildKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAddChildSave()
    } else if (e.key === "Escape") {
      setIsAddingChild(false)
      setChildText("")
    }
  }

  const handleAddChildBlur = () => {
    if (childText.trim()) {
      handleAddChildSave()
    } else {
      setIsAddingChild(false)
    }
  }

  return (
    <div className={cn("animate-fade-in-up", isChild && "ml-6")}>
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
            !swiping && "transition-transform",
            hasError && "border-destructive border-2 animate-shake bg-destructive/5"
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
          {isEditing ? (
            <input
              ref={inputRef}
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={handleEditKeyDown}
              onBlur={handleEditBlur}
              className="flex-1 text-sm md:text-sm px-2 py-1 rounded border bg-background text-foreground outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
          ) : (
            <span
              onClick={handleEditStart}
              className={cn(
                "flex-1 text-sm md:text-sm leading-relaxed text-card-foreground transition-all duration-200 cursor-text hover:bg-muted/30 rounded px-2 py-1 -mx-2 -my-1",
                task.done && "line-through text-muted-foreground"
              )}
            >
              {task.text}
            </span>
          )}
          {/* Add child button - only for parent tasks */}
          {!isChild && onAddChild && (
            <button
              onClick={handleAddChildClick}
              className="opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity p-1 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary hidden md:flex"
              aria-label={`Add subtask to "${task.text}"`}
              title="Add subtask"
            >
              <Plus className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={() => onDelete(task.id)}
            className="opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity p-1 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive hidden md:flex"
            aria-label={`Delete task "${task.text}"`}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Child task input */}
      {isAddingChild && (
        <div className="ml-6 mt-2 animate-fade-in-up">
          <div className="flex items-center gap-2 rounded-2xl border bg-card p-3 md:p-4">
            <div className="h-5 w-5 md:h-4 md:w-4 shrink-0" />
            <input
              ref={childInputRef}
              type="text"
              value={childText}
              onChange={(e) => setChildText(e.target.value)}
              onKeyDown={handleAddChildKeyDown}
              onBlur={handleAddChildBlur}
              placeholder="Enter subtask..."
              className="flex-1 text-sm md:text-sm bg-transparent outline-none placeholder:text-muted-foreground"
            />
          </div>
        </div>
      )}

      {/* Render child tasks */}
      {childTasks.length > 0 && (
        <div className="flex flex-col gap-2 mt-2">
          {childTasks.map((child) => (
            <TaskItem
              key={child.id}
              task={child}
              allTasks={allTasks}
              onToggle={onToggle}
              onDelete={onDelete}
              onUpdate={onUpdate}
              taskWithError={taskWithError}
              isChild
            />
          ))}
        </div>
      )}
    </div>
  )
}
