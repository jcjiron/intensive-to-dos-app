import type { TaskPriority } from "./store"

export const PRIORITY_ORDER: Record<TaskPriority, number> = {
  "urgent-important": 0,
  "important-not-urgent": 1,
  "urgent-not-important": 2,
  "not-urgent-not-important": 3,
}

export const PRIORITY_COLORS: Record<TaskPriority, { bg: string; border: string; text: string }> = {
  "urgent-important": {
    bg: "bg-muted",
    border: "border-border",
    text: "text-foreground",
  },
  "important-not-urgent": {
    bg: "bg-muted",
    border: "border-border",
    text: "text-foreground",
  },
  "urgent-not-important": {
    bg: "bg-muted",
    border: "border-border",
    text: "text-foreground",
  },
  "not-urgent-not-important": {
    bg: "bg-muted",
    border: "border-border",
    text: "text-foreground",
  },
}

export const PRIORITY_LABELS: Record<TaskPriority, string> = {
  "urgent-important": "U+I",
  "important-not-urgent": "I",
  "urgent-not-important": "U",
  "not-urgent-not-important": "─",
}

export function getPrioritySortKey(priority?: TaskPriority): number {
  if (!priority) return PRIORITY_ORDER["not-urgent-not-important"]
  return PRIORITY_ORDER[priority]
}
