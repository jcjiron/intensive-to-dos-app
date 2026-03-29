import type { TaskPriority } from "./store"

export const PRIORITY_ORDER: Record<TaskPriority, number> = {
  "urgent-important": 0,
  "important-not-urgent": 1,
  "urgent-not-important": 2,
  "not-urgent-not-important": 3,
}

export const PRIORITY_COLORS: Record<TaskPriority, { bg: string; border: string; text: string }> = {
  "urgent-important": {
    bg: "bg-red-50 dark:bg-red-950/30",
    border: "border-red-200 dark:border-red-800",
    text: "text-red-700 dark:text-red-300",
  },
  "important-not-urgent": {
    bg: "bg-orange-50 dark:bg-orange-950/30",
    border: "border-orange-200 dark:border-orange-800",
    text: "text-orange-700 dark:text-orange-300",
  },
  "urgent-not-important": {
    bg: "bg-yellow-50 dark:bg-yellow-950/30",
    border: "border-yellow-200 dark:border-yellow-800",
    text: "text-yellow-700 dark:text-yellow-600",
  },
  "not-urgent-not-important": {
    bg: "bg-blue-50 dark:bg-blue-950/30",
    border: "border-blue-200 dark:border-blue-800",
    text: "text-blue-600 dark:text-blue-400",
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
