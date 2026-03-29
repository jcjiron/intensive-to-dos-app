"use client"

import { useState, useRef, useEffect } from "react"
import { X, Plus, Trash2, GripVertical, Check, Star, Flag, Calendar, MoreHorizontal } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Task } from "@/lib/store"

interface TaskDetailPanelProps {
  task: Task
  allTasks: Task[]
  onClose: () => void
  onUpdateTask: (id: string, text: string) => void
  onAddChild: (parentId: string, text: string) => void
  onToggleChild: (id: string) => void
  onDeleteChild: (id: string) => void
  onReorderChildren: (parentId: string, childIds: string[]) => void
  showError?: boolean
}

export function TaskDetailPanel({
  task,
  allTasks,
  onClose,
  onUpdateTask,
  onAddChild,
  onToggleChild,
  onDeleteChild,
  onReorderChildren,
  showError = false,
}: TaskDetailPanelProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [titleValue, setTitleValue] = useState(task.text)
  const [subtaskInput, setSubtaskInput] = useState("")
  const [draggedId, setDraggedId] = useState<string | null>(null)
  const titleInputRef = useRef<HTMLInputElement>(null)
  const subtaskInputRef = useRef<HTMLInputElement>(null)

  // Get child tasks
  const childTasks = (task.childIds || [])
    .map((id) => allTasks.find((t) => t.id === id))
    .filter(Boolean) as Task[]

  const completedCount = childTasks.filter((t) => t.done).length
  const totalCount = childTasks.length
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0

  // Focus title input when editing starts
  useEffect(() => {
    if (isEditingTitle) {
      titleInputRef.current?.focus()
      titleInputRef.current?.select()
    }
  }, [isEditingTitle])

  const handleTitleClick = () => {
    setIsEditingTitle(true)
    setTitleValue(task.text)
  }

  const handleTitleSave = () => {
    const trimmed = titleValue.trim()
    if (trimmed && trimmed !== task.text) {
      onUpdateTask(task.id, trimmed)
    }
    setIsEditingTitle(false)
  }

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleTitleSave()
    } else if (e.key === "Escape") {
      setIsEditingTitle(false)
      setTitleValue(task.text)
    }
  }

  const handleAddSubtask = () => {
    const trimmed = subtaskInput.trim()
    if (trimmed) {
      onAddChild(task.id, trimmed)
      setSubtaskInput("")
      // Keep focus on input for consecutive adding
      subtaskInputRef.current?.focus()
    }
  }

  const handleSubtaskKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAddSubtask()
    }
  }

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedId(id)
    e.dataTransfer.effectAllowed = "move"
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
  }

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault()
    if (!draggedId || draggedId === targetId) {
      setDraggedId(null)
      return
    }

    const currentChildIds = task.childIds || []
    const draggedIndex = currentChildIds.indexOf(draggedId)
    const targetIndex = currentChildIds.indexOf(targetId)

    if (draggedIndex === -1 || targetIndex === -1) {
      setDraggedId(null)
      return
    }

    const newChildIds = [...currentChildIds]
    newChildIds.splice(draggedIndex, 1)
    newChildIds.splice(targetIndex, 0, draggedId)

    onReorderChildren(task.id, newChildIds)
    setDraggedId(null)
  }

  const handleDragEnd = () => {
    setDraggedId(null)
  }

  return (
    <div className="w-full md:w-[384px] md:shrink-0 h-full md:border-l flex flex-col overflow-hidden bg-card">
      {/* Progress Bar */}
      {totalCount > 0 && (
        <div className="h-1.5 bg-muted">
          <div
            className="h-full bg-success transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {totalCount > 0 && (
            <span className="font-medium">
              {completedCount}/{totalCount} completed
            </span>
          )}
        </div>
      </div>

      {/* Task Title */}
      <div className="px-4 py-4 border-b">
        {isEditingTitle ? (
          <input
            ref={titleInputRef}
            type="text"
            value={titleValue}
            onChange={(e) => setTitleValue(e.target.value)}
            onKeyDown={handleTitleKeyDown}
            onBlur={handleTitleSave}
            className="w-full text-lg font-semibold bg-transparent border-b-2 border-primary outline-none pb-1"
          />
        ) : (
          <h2
            onClick={handleTitleClick}
            className="text-lg font-semibold text-foreground cursor-text hover:bg-muted/30 rounded px-2 py-1 -mx-2 -my-1 transition-colors"
          >
            {task.text}
          </h2>
        )}
      </div>

      {/* Action Buttons Row */}
      <div className="flex items-center gap-1 px-4 py-2 border-b bg-muted/10">
        <ActionButton
          icon={<Star className="h-4 w-4" />}
          label="Favorite"
          onClick={() => {}}
        />
        <ActionButton
          icon={<Flag className="h-4 w-4" />}
          label="Priority"
          onClick={() => {}}
        />
        <ActionButton
          icon={<Calendar className="h-4 w-4" />}
          label="Schedule"
          onClick={() => {}}
        />
        <ActionButton
          icon={<MoreHorizontal className="h-4 w-4" />}
          label="More options"
          onClick={() => {}}
        />
      </div>

      {/* Subtasks Section */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <h3 className="text-sm font-semibold text-foreground mb-3">Subtasks:</h3>

        {/* Add Subtask Input */}
        <div className="flex items-center gap-2 mb-4">
          <Plus className="h-4 w-4 text-muted-foreground shrink-0" />
          <input
            ref={subtaskInputRef}
            type="text"
            value={subtaskInput}
            onChange={(e) => setSubtaskInput(e.target.value)}
            onKeyDown={handleSubtaskKeyDown}
            placeholder="Add New Subtask"
            className="flex-1 text-sm bg-transparent outline-none placeholder:text-muted-foreground"
          />
        </div>

        {/* Subtask List */}
        <div className="flex flex-col gap-1">
          {childTasks.map((child) => (
            <SubtaskItem
              key={child.id}
              task={child}
              onToggle={() => onToggleChild(child.id)}
              onDelete={() => onDeleteChild(child.id)}
              onUpdate={(text) => onUpdateTask(child.id, text)}
              showError={showError && !child.done}
              isDragging={draggedId === child.id}
              onDragStart={(e) => handleDragStart(e, child.id)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, child.id)}
              onDragEnd={handleDragEnd}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

interface ActionButtonProps {
  icon: React.ReactNode
  label: string
  onClick: () => void
  active?: boolean
}

function ActionButton({ icon, label, onClick, active = false }: ActionButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "h-9 w-9 rounded-lg flex items-center justify-center transition-colors",
        active
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      )}
      aria-label={label}
      title={label}
    >
      {icon}
    </button>
  )
}

interface SubtaskItemProps {
  task: Task
  onToggle: () => void
  onDelete: () => void
  onUpdate: (text: string) => void
  showError?: boolean
  isDragging?: boolean
  onDragStart: (e: React.DragEvent) => void
  onDragOver: (e: React.DragEvent) => void
  onDrop: (e: React.DragEvent) => void
  onDragEnd: () => void
}

function SubtaskItem({
  task,
  onToggle,
  onDelete,
  onUpdate,
  showError = false,
  isDragging = false,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
}: SubtaskItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(task.text)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus()
      inputRef.current?.select()
    }
  }, [isEditing])

  const handleEditStart = () => {
    if (!task.done) {
      setIsEditing(true)
      setEditValue(task.text)
    }
  }

  const handleEditSave = () => {
    const trimmed = editValue.trim()
    if (trimmed && trimmed !== task.text) {
      onUpdate(trimmed)
    }
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleEditSave()
    } else if (e.key === "Escape") {
      setIsEditing(false)
      setEditValue(task.text)
    }
  }

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      className={cn(
        "group flex items-center gap-2 py-2 px-2 rounded-lg transition-all duration-200",
        isDragging && "opacity-50",
        showError && "bg-destructive/10 border border-destructive animate-shake",
        task.done && "bg-success/5"
      )}
    >
      <GripVertical className="h-4 w-4 text-muted-foreground/40 cursor-grab shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <button
        onClick={onToggle}
        className={cn(
          "h-5 w-5 rounded-md border-2 shrink-0 flex items-center justify-center transition-all",
          task.done
            ? "bg-success border-success text-success-foreground"
            : "border-muted-foreground/30 hover:border-muted-foreground/50"
        )}
      >
        {task.done && <Check className="h-3 w-3" />}
      </button>

      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleEditSave}
          className="flex-1 text-sm bg-transparent border-b border-primary outline-none"
        />
      ) : (
        <span
          onClick={handleEditStart}
          className={cn(
            "flex-1 text-sm transition-all cursor-text",
            task.done && "line-through text-muted-foreground"
          )}
        >
          {task.text}
        </span>
      )}

      <button
        onClick={onDelete}
        className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all"
        aria-label="Delete subtask"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}
