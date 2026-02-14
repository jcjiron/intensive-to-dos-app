"use client"

import { useEffect, useState, useCallback } from "react"
import { useTodoStore } from "@/lib/store"
import { TaskItem } from "@/components/task-item"
import { TaskInput } from "@/components/task-input"
import { ArchiveSidebar, MobileArchiveView } from "@/components/archive-sidebar"
import { EscalationBanner } from "@/components/escalation-banner"
import { RollToast } from "@/components/roll-toast"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import {
  ListTodo,
  Archive,
  Menu,
  RotateCcw,
  Zap,
} from "lucide-react"
import { cn } from "@/lib/utils"

export function IntensiveTodos() {
  const {
    tasks,
    archivedBatches,
    lastRoll,
    lastEscalated,
    showEscalationGlow,
    addTask,
    toggleTask,
    deleteTask,
    resetDemo,
    clearEscalationGlow,
    clearRoll,
  } = useTodoStore()

  const [mounted, setMounted] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [mobileTab, setMobileTab] = useState<"active" | "archive">("active")

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (showEscalationGlow) {
      const timer = setTimeout(clearEscalationGlow, 1000)
      return () => clearTimeout(timer)
    }
  }, [showEscalationGlow, clearEscalationGlow])

  const handleClearRoll = useCallback(() => {
    clearRoll()
  }, [clearRoll])

  if (!mounted) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center">
            <Zap className="h-4 w-4 text-primary animate-pulse" />
          </div>
          <span className="text-sm text-muted-foreground">Loading...</span>
        </div>
      </div>
    )
  }

  const activeTasks = tasks.filter((t) => !t.done)
  const doneTasks = tasks.filter((t) => t.done)
  const isEscalationZone = activeTasks.length >= 20

  return (
    <div
      className={cn(
        "flex h-screen overflow-hidden bg-background transition-all duration-300",
        showEscalationGlow && "animate-escalation-glow"
      )}
    >
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-72 shrink-0 flex-col border-r bg-sidebar">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-primary flex items-center justify-center">
              <Zap className="h-4 w-4 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-sidebar-foreground">Intensive To-Dos</h1>
              <p className="text-xs text-muted-foreground">
                {activeTasks.length}/20 active
              </p>
            </div>
          </div>
          <button
            onClick={resetDemo}
            className="h-8 w-8 rounded-xl flex items-center justify-center hover:bg-sidebar-accent transition-colors text-muted-foreground hover:text-sidebar-foreground"
            aria-label="Reset demo data"
            title="Reset demo data"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>

        <div className="p-3 border-b">
          <div className="flex items-center gap-2 rounded-xl bg-sidebar-accent px-3 py-2">
            <Archive className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs font-medium text-sidebar-foreground">
              Archived Batches ({archivedBatches.length})
            </span>
          </div>
        </div>

        <ScrollArea className="flex-1 p-3">
          <ArchiveSidebar batches={archivedBatches} />
        </ScrollArea>
      </aside>

      {/* Mobile Sheet Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-[85vw] max-w-sm p-0">
          <SheetHeader className="p-4 border-b">
            <SheetTitle className="flex items-center gap-2 text-base">
              <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center">
                <Zap className="h-3.5 w-3.5 text-primary-foreground" />
              </div>
              Intensive To-Dos
            </SheetTitle>
            <SheetDescription className="text-xs">
              {activeTasks.length}/20 active tasks
            </SheetDescription>
          </SheetHeader>

          <div className="p-3 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 rounded-xl bg-muted px-3 py-2">
                <Archive className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs font-medium">
                  Archives ({archivedBatches.length})
                </span>
              </div>
              <button
                onClick={() => {
                  resetDemo()
                  setSidebarOpen(false)
                }}
                className="h-8 w-8 rounded-xl flex items-center justify-center hover:bg-muted transition-colors text-muted-foreground"
                aria-label="Reset demo data"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <ScrollArea className="flex-1 h-[calc(100vh-140px)] p-3">
            <ArchiveSidebar batches={archivedBatches} />
          </ScrollArea>
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 relative">
        {/* Desktop Header */}
        <header className="hidden md:flex items-center justify-between px-6 py-4 border-b bg-card">
          <div>
            <h2 className="text-lg font-bold text-card-foreground">Active Tasks</h2>
            <p className="text-xs text-muted-foreground">
              {activeTasks.length} active, {doneTasks.length} done
            </p>
          </div>
          {isEscalationZone && (
            <div className="flex items-center gap-2 rounded-xl bg-escalation/10 px-3 py-1.5">
              <Zap className="h-3.5 w-3.5 text-escalation" />
              <span className="text-xs font-semibold text-escalation">Escalation Zone</span>
            </div>
          )}
        </header>

        {/* Mobile Header */}
        <header className="flex md:hidden items-center justify-between px-4 py-3 border-b bg-card safe-area-top">
          <button
            onClick={() => setSidebarOpen(true)}
            className="h-9 w-9 rounded-xl flex items-center justify-center hover:bg-muted transition-colors"
            aria-label="Open sidebar menu"
          >
            <Menu className="h-5 w-5 text-foreground" />
          </button>
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center">
              <Zap className="h-3.5 w-3.5 text-primary-foreground" />
            </div>
            <span className="text-sm font-bold text-foreground">Intensive</span>
          </div>
          <button
            onClick={resetDemo}
            className="h-9 w-9 rounded-xl flex items-center justify-center hover:bg-muted transition-colors text-muted-foreground"
            aria-label="Reset demo data"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </header>

        {/* Mobile Tab Content */}
        <div className="flex-1 flex flex-col overflow-hidden md:hidden">
          {mobileTab === "active" ? (
            <MobileActiveView
              tasks={tasks}
              activeTasks={activeTasks}
              doneTasks={doneTasks}
              isEscalationZone={isEscalationZone}
              lastEscalated={lastEscalated}
              onToggle={toggleTask}
              onDelete={deleteTask}
              onAdd={addTask}
            />
          ) : (
            <MobileArchiveView batches={archivedBatches} />
          )}
        </div>

        {/* Desktop Canvas */}
        <div className="hidden md:flex flex-1 flex-col overflow-hidden">
          <div
            className={cn(
              "flex-1 flex flex-col transition-colors duration-500",
              isEscalationZone && "bg-escalation-bg"
            )}
          >
            {isEscalationZone && (
              <div className="px-6 pt-4">
                <EscalationBanner
                  activeCount={activeTasks.length}
                  isEscalated={lastEscalated}
                />
              </div>
            )}

            <ScrollArea className="flex-1 px-6 py-4">
              <div className="flex flex-col gap-2 max-w-2xl mx-auto">
                {activeTasks.length === 0 && doneTasks.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <ListTodo className="h-12 w-12 text-muted-foreground/30 mb-4" />
                    <p className="text-base font-medium text-muted-foreground">No tasks yet</p>
                    <p className="text-sm text-muted-foreground/60 mt-1">
                      Add your first task below to get started
                    </p>
                  </div>
                ) : (
                  <>
                    {activeTasks.map((task) => (
                      <TaskItem
                        key={task.id}
                        task={task}
                        onToggle={toggleTask}
                        onDelete={deleteTask}
                      />
                    ))}
                    {doneTasks.length > 0 && (
                      <>
                        <div className="flex items-center gap-2 pt-4 pb-2">
                          <div className="h-px flex-1 bg-border" />
                          <span className="text-xs text-muted-foreground px-2">
                            Done ({doneTasks.length})
                          </span>
                          <div className="h-px flex-1 bg-border" />
                        </div>
                        {doneTasks.map((task) => (
                          <TaskItem
                            key={task.id}
                            task={task}
                            onToggle={toggleTask}
                            onDelete={deleteTask}
                          />
                        ))}
                      </>
                    )}
                  </>
                )}
              </div>
            </ScrollArea>

            <div className="px-6 py-4 border-t bg-card">
              <div className="max-w-2xl mx-auto">
                <TaskInput onAdd={addTask} isEscalation={isEscalationZone} />
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Bottom Nav */}
        <nav className="flex md:hidden border-t bg-card safe-area-bottom" role="tablist" aria-label="Navigation tabs">
          <button
            role="tab"
            aria-selected={mobileTab === "active"}
            onClick={() => setMobileTab("active")}
            className={cn(
              "flex-1 flex flex-col items-center gap-1 py-2.5 transition-colors relative",
              mobileTab === "active" ? "text-foreground" : "text-muted-foreground"
            )}
          >
            {mobileTab === "active" && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-primary" />
            )}
            <ListTodo className="h-5 w-5" />
            <span className="text-[10px] font-medium">Active</span>
          </button>
          <button
            role="tab"
            aria-selected={mobileTab === "archive"}
            onClick={() => setMobileTab("archive")}
            className={cn(
              "flex-1 flex flex-col items-center gap-1 py-2.5 transition-colors relative",
              mobileTab === "archive" ? "text-foreground" : "text-muted-foreground"
            )}
          >
            {mobileTab === "archive" && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-primary" />
            )}
            <Archive className="h-5 w-5" />
            <span className="text-[10px] font-medium">Archive</span>
            {archivedBatches.length > 0 && (
              <span className="absolute top-1.5 right-1/2 translate-x-4 h-4 min-w-4 rounded-full bg-primary text-primary-foreground text-[9px] font-bold flex items-center justify-center px-1">
                {archivedBatches.length}
              </span>
            )}
          </button>
        </nav>
      </main>

      {/* Roll Toast */}
      <RollToast roll={lastRoll} escalated={lastEscalated} onDismiss={handleClearRoll} />
    </div>
  )
}

// Mobile Active View extracted for clarity
function MobileActiveView({
  tasks,
  activeTasks,
  doneTasks,
  isEscalationZone,
  lastEscalated,
  onToggle,
  onDelete,
  onAdd,
}: {
  tasks: typeof useTodoStore extends () => infer R ? R["tasks"] : never
  activeTasks: { id: string; text: string; done: boolean; createdAt: number }[]
  doneTasks: { id: string; text: string; done: boolean; createdAt: number }[]
  isEscalationZone: boolean
  lastEscalated: boolean
  onToggle: (id: string) => void
  onDelete: (id: string) => void
  onAdd: (text: string) => void
}) {
  return (
    <div
      className={cn(
        "flex-1 flex flex-col overflow-hidden transition-colors duration-500",
        isEscalationZone && "bg-escalation-bg"
      )}
    >
      {isEscalationZone && (
        <div className="px-4 pt-3">
          <EscalationBanner
            activeCount={activeTasks.length}
            isEscalated={lastEscalated}
          />
        </div>
      )}

      <ScrollArea className="flex-1 px-4 py-3">
        <div className="flex flex-col gap-2">
          {activeTasks.length === 0 && doneTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <ListTodo className="h-10 w-10 text-muted-foreground/30 mb-3" />
              <p className="text-base font-medium text-muted-foreground">No tasks yet</p>
              <p className="text-sm text-muted-foreground/60 mt-1">
                Tap below to add your first task
              </p>
            </div>
          ) : (
            <>
              {activeTasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onToggle={onToggle}
                  onDelete={onDelete}
                />
              ))}
              {doneTasks.length > 0 && (
                <>
                  <div className="flex items-center gap-2 pt-3 pb-1.5">
                    <div className="h-px flex-1 bg-border" />
                    <span className="text-xs text-muted-foreground px-2">
                      Done ({doneTasks.length})
                    </span>
                    <div className="h-px flex-1 bg-border" />
                  </div>
                  {doneTasks.map((task) => (
                    <TaskItem
                      key={task.id}
                      task={task}
                      onToggle={onToggle}
                      onDelete={onDelete}
                    />
                  ))}
                </>
              )}
            </>
          )}
        </div>
      </ScrollArea>

      <div className="px-4 py-3 border-t bg-card">
        <TaskInput onAdd={onAdd} isEscalation={isEscalationZone} />
      </div>
    </div>
  )
}
