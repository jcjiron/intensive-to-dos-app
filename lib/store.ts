import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface Task {
  id: string
  text: string
  done: boolean
  createdAt: number
  parentId?: string
  childIds?: string[]
}

export interface ArchivedBatch {
  id: string
  type: "done" | "escalated"
  batchNumber?: number
  tasks: Task[]
  archivedAt: number
}

export interface CompletedItem {
  id: string
  task: Task
  completedAt: number
}

interface TodoState {
  tasks: Task[]
  completedItems: CompletedItem[]
  archivedBatches: ArchivedBatch[]
  batchCounter: number
  taskWithError: string | null
  selectedTaskId: string | null

  addTask: (text: string) => void
  addChildTask: (parentId: string, text: string) => void
  updateTask: (id: string, text: string) => void
  toggleTask: (id: string) => boolean
  toggleChildTask: (id: string) => void
  reorderChildren: (parentId: string, childIds: string[]) => void
  deleteTask: (id: string) => void
  deleteCompleted: (id: string) => void
  canCompleteTask: (id: string) => boolean
  setTaskError: (id: string | null) => void
  setSelectedTask: (id: string | null) => void
  resetDemo: () => void
}

function generateId() {
  return Math.random().toString(36).substring(2, 15) + Date.now().toString(36)
}

export const useTodoStore = create<TodoState>()(
  persist(
    (set, get) => ({
      tasks: [],
      completedItems: [],
      archivedBatches: [],
      batchCounter: 0,
      taskWithError: null,
      selectedTaskId: null,

      addTask: (text: string) => {
        const newTask: Task = {
          id: generateId(),
          text,
          done: false,
          createdAt: Date.now(),
        }

        set({
          tasks: [...get().tasks, newTask],
        })
      },

      addChildTask: (parentId: string, text: string) => {
        const state = get()
        const parent = state.tasks.find((t) => t.id === parentId)
        if (!parent || parent.parentId) return // Can't add child to a child task

        const childTask: Task = {
          id: generateId(),
          text,
          done: false,
          createdAt: Date.now(),
          parentId,
        }

        set({
          tasks: state.tasks.map((t) =>
            t.id === parentId
              ? { ...t, childIds: [...(t.childIds || []), childTask.id] }
              : t
          ).concat(childTask),
        })
      },

      updateTask: (id: string, text: string) => {
        set({
          tasks: get().tasks.map((t) =>
            t.id === id ? { ...t, text } : t
          ),
        })
      },

      toggleTask: (id: string) => {
        const state = get()
        const task = state.tasks.find((t) => t.id === id)
        if (!task) return false

        // Check if task has incomplete children
        const childIds = task.childIds || []
        const incompleteChildren = childIds.filter((cid) => {
          const child = state.tasks.find((t) => t.id === cid)
          return child && !child.done
        })

        if (incompleteChildren.length > 0) {
          // Open panel and show error state on incomplete children
          set({ taskWithError: id, selectedTaskId: id })
          setTimeout(() => set({ taskWithError: null }), 2000)
          return false
        }

        // Remove task and any children from active tasks
        const idsToRemove = new Set([id, ...childIds])
        const remainingTasks = state.tasks.filter((t) => !idsToRemove.has(t.id))

        // Move to completed sidebar (parent only, children are removed)
        const completedItem: CompletedItem = {
          id: generateId(),
          task: { ...task, done: true },
          completedAt: Date.now(),
        }

        const newCompleted = [completedItem, ...state.completedItems]

        // Auto-batch: every 20 completed items, archive them as a batch
        if (newCompleted.length >= 20) {
          const batchNumber = state.batchCounter + 1
          const batch: ArchivedBatch = {
            id: generateId(),
            type: "done",
            batchNumber,
            tasks: newCompleted.slice(0, 20).map((c) => c.task),
            archivedAt: Date.now(),
          }
          set({
            tasks: remainingTasks,
            completedItems: newCompleted.slice(20),
            archivedBatches: [batch, ...state.archivedBatches],
            batchCounter: batchNumber,
            taskWithError: null,
          })
        } else {
          set({
            tasks: remainingTasks,
            completedItems: newCompleted,
            taskWithError: null,
          })
        }
        return true
      },

      toggleChildTask: (id: string) => {
        set({
          tasks: get().tasks.map((t) =>
            t.id === id ? { ...t, done: !t.done } : t
          ),
        })
      },

      reorderChildren: (parentId: string, childIds: string[]) => {
        set({
          tasks: get().tasks.map((t) =>
            t.id === parentId ? { ...t, childIds } : t
          ),
        })
      },

      deleteTask: (id: string) => {
        const state = get()
        const task = state.tasks.find((t) => t.id === id)
        if (!task) return

        // If it's a child, also remove from parent's childIds
        if (task.parentId) {
          set({
            tasks: state.tasks
              .map((t) =>
                t.id === task.parentId
                  ? { ...t, childIds: (t.childIds || []).filter((cid) => cid !== id) }
                  : t
              )
              .filter((t) => t.id !== id),
          })
        } else {
          // If it's a parent, remove it and all its children
          const idsToRemove = new Set([id, ...(task.childIds || [])])
          set({ tasks: state.tasks.filter((t) => !idsToRemove.has(t.id)) })
        }
      },

      deleteCompleted: (id: string) => {
        set({ completedItems: get().completedItems.filter((c) => c.id !== id) })
      },

      canCompleteTask: (id: string) => {
        const state = get()
        const task = state.tasks.find((t) => t.id === id)
        if (!task) return false
        const childIds = task.childIds || []
        return childIds.every((cid) => {
          const child = state.tasks.find((t) => t.id === cid)
          return !child || child.done
        })
      },

      setTaskError: (id: string | null) => {
        set({ taskWithError: id })
      },

      setSelectedTask: (id: string | null) => {
        set({ selectedTaskId: id })
      },

      resetDemo: () => {
        set({
          tasks: [],
          completedItems: [],
          archivedBatches: [],
          batchCounter: 0,
          taskWithError: null,
          selectedTaskId: null,
        })
      },
    }),
    {
      name: "intensive-todos",
    }
  )
)
