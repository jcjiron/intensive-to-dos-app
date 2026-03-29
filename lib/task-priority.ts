import type { TaskPriority } from "./store"

export const PRIORITY_ORDER: Record<TaskPriority, number> = {
  "urgent-important": 0,
  "important-not-urgent": 1,
  "urgent-not-important": 2,
  "not-urgent-not-important": 3,
}

export const PRIORITY_COLORS: Record<TaskPriority, { bg: string; border: string; text: string }> = {
  "urgent-important": {
    bg: "bg-red-500",
    border: "border-red-600",
    text: "text-white",
  },
  "important-not-urgent": {
    bg: "bg-orange-500",
    border: "border-orange-600",
    text: "text-white",
  },
  "urgent-not-important": {
    bg: "bg-yellow-400",
    border: "border-yellow-500",
    text: "text-yellow-900",
  },
  "not-urgent-not-important": {
    bg: "bg-blue-500",
    border: "border-blue-600",
    text: "text-white",
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
