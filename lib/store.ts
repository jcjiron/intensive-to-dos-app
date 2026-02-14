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

interface TodoState {
  tasks: Task[]
  archivedBatches: ArchivedBatch[]
  batchCounter: number
  lastRoll: number | null
  lastEscalated: boolean
  showEscalationGlow: boolean

  addTask: (text: string) => void
  toggleTask: (id: string) => void
  deleteTask: (id: string) => void
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
        const updatedTasks = state.tasks.map((t) =>
          t.id === id ? { ...t, done: !t.done } : t
        )

        // Check if 20 tasks are done
        const doneTasks = updatedTasks.filter((t) => t.done)
        if (doneTasks.length >= 20) {
          const batchNumber = state.batchCounter + 1
          const batch: ArchivedBatch = {
            id: generateId(),
            type: "done",
            batchNumber,
            tasks: doneTasks.slice(0, 20),
            archivedAt: Date.now(),
          }
          const doneIds = new Set(doneTasks.slice(0, 20).map((t) => t.id))
          const remainingTasks = updatedTasks.filter((t) => !doneIds.has(t.id))

          set({
            tasks: remainingTasks,
            archivedBatches: [batch, ...state.archivedBatches],
            batchCounter: batchNumber,
          })
        } else {
          set({ tasks: updatedTasks })
        }
      },

      deleteTask: (id: string) => {
        set({ tasks: get().tasks.filter((t) => t.id !== id) })
      },

      resetDemo: () => {
        set({
          tasks: [],
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
