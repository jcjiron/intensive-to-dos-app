import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface Task {
  id: string
  text: string
  done: boolean
  createdAt: number
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
  lastRoll: number | null
  lastEscalated: boolean
  showEscalationGlow: boolean

  addTask: (text: string) => void
  toggleTask: (id: string) => void
  deleteTask: (id: string) => void
  deleteCompleted: (id: string) => void
  resetDemo: () => void
  clearEscalationGlow: () => void
  clearRoll: () => void
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
      lastRoll: null,
      lastEscalated: false,
      showEscalationGlow: false,

      addTask: (text: string) => {
        const state = get()
        const activeTasks = state.tasks.filter((t) => !t.done)
        const isEscalationZone = activeTasks.length >= 20

        const newTask: Task = {
          id: generateId(),
          text,
          done: false,
          createdAt: Date.now(),
        }

        if (isEscalationZone) {
          const roll = Math.floor(Math.random() * 5) + 1

          if (roll === 1) {
            // Escalated! Move to sidebar as orange block
            const escalatedBatch: ArchivedBatch = {
              id: generateId(),
              type: "escalated",
              tasks: [newTask],
              archivedAt: Date.now(),
            }
            set({
              archivedBatches: [escalatedBatch, ...state.archivedBatches],
              lastRoll: roll,
              lastEscalated: true,
              showEscalationGlow: true,
            })
          } else {
            // Task stays active
            set({
              tasks: [...state.tasks, newTask],
              lastRoll: roll,
              lastEscalated: false,
            })
          }
        } else {
          set({
            tasks: [...state.tasks, newTask],
            lastRoll: null,
            lastEscalated: false,
          })
        }
      },

      toggleTask: (id: string) => {
        const state = get()
        const task = state.tasks.find((t) => t.id === id)
        if (!task) return

        // Remove from active tasks and move to completed sidebar
        const completedItem: CompletedItem = {
          id: generateId(),
          task: { ...task, done: true },
          completedAt: Date.now(),
        }

        const newCompleted = [completedItem, ...state.completedItems]
        const remainingTasks = state.tasks.filter((t) => t.id !== id)

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
          })
        } else {
          set({
            tasks: remainingTasks,
            completedItems: newCompleted,
          })
        }
      },

      deleteTask: (id: string) => {
        set({ tasks: get().tasks.filter((t) => t.id !== id) })
      },

      deleteCompleted: (id: string) => {
        set({ completedItems: get().completedItems.filter((c) => c.id !== id) })
      },

      resetDemo: () => {
        set({
          tasks: [],
          completedItems: [],
          archivedBatches: [],
          batchCounter: 0,
          lastRoll: null,
          lastEscalated: false,
          showEscalationGlow: false,
        })
      },

      clearEscalationGlow: () => {
        set({ showEscalationGlow: false })
      },

      clearRoll: () => {
        set({ lastRoll: null, lastEscalated: false })
      },
    }),
    {
      name: "intensive-todos",
    }
  )
)
