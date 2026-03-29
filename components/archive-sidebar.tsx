"use client"

import { Archive, AlertTriangle, ChevronRight, CheckCircle2, Trash2, Download } from "lucide-react"
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { ArchivedBatch, CompletedItem, Task } from "@/lib/store"

function downloadBatchAsCSV(batch: ArchivedBatch) {
  const headers = ["Task", "Status", "Created At"]
  const rows = batch.tasks.map((task) => [
    `"${task.text.replace(/"/g, '""')}"`,
    batch.type === "done" ? "Completed" : "Escalated",
    new Date(task.createdAt).toLocaleString(),
  ])

  const csvContent = [
    headers.join(","),
    ...rows.map((row) => row.join(",")),
  ].join("\n")

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
  const link = document.createElement("a")
  const url = URL.createObjectURL(blob)
  const filename = `batch-${batch.type === "done" ? `done-${batch.batchNumber}` : "escalated"}-${Date.now()}.csv`

  link.setAttribute("href", url)
  link.setAttribute("download", filename)
  link.style.visibility = "hidden"
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

interface ArchiveSidebarProps {
  completedItems: CompletedItem[]
  batches: ArchivedBatch[]
  onDeleteCompleted?: (id: string) => void
  onSelectTask?: (taskId: string) => void
  allTasks?: Task[]
  className?: string
}

export function ArchiveSidebar({ completedItems, batches, onDeleteCompleted, onSelectTask, allTasks, className }: ArchiveSidebarProps) {

  const isEmpty = completedItems.length === 0 && batches.length === 0

  if (isEmpty) {
    return (
      <div className={cn("flex flex-col items-center justify-center p-6 text-center", className)}>
        <Archive className="h-10 w-10 text-muted-foreground/40 mb-3" />
        <p className="text-sm text-muted-foreground">Nothing here yet</p>
        <p className="text-xs text-muted-foreground/60 mt-1">
          Completed and escalated tasks will show up here
        </p>
      </div>
    )
  }

  return (
    <>
      <div className={cn("flex flex-col gap-3", className)}>
        {/* Completed Items (individual, not yet batched) */}
        {completedItems.length > 0 && (
          <div>
            <div className="flex items-center gap-2 px-1 mb-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-success" />
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Completed ({completedItems.length}/20)
              </span>
            </div>
            <div className="flex flex-col gap-1.5">
              {completedItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onSelectTask?.(item.task.id)}
                  className="group flex items-center gap-2.5 rounded-xl border bg-success/5 border-success/15 p-2.5 transition-all duration-200 hover:shadow-sm w-full text-left"
                >
                  <div className="h-5 w-5 rounded-md bg-success/15 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="h-3 w-3 text-success" />
                  </div>
                  <span className="flex-1 text-xs text-foreground truncate line-through opacity-70">
                    {item.task.text}
                  </span>
                  {onDeleteCompleted && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onDeleteCompleted(item.id)
                      }}
                      className="opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity p-0.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                      aria-label={`Remove completed task "${item.task.text}"`}
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  )}
                </button>
              ))}
            </div>
            {/* Progress toward next batch */}
            <div className="mt-2 px-1">
              <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-success/50 transition-all duration-500"
                  style={{ width: `${(completedItems.length / 20) * 100}%` }}
                />
              </div>
              <p className="text-[10px] text-muted-foreground/60 mt-1">
                {20 - completedItems.length} more to batch
              </p>
            </div>
          </div>
        )}

        {/* Archived Batches */}
        {batches.length > 0 && (
          <div>
            {completedItems.length > 0 && (
              <div className="flex items-center gap-2 px-1 mb-2 mt-1">
                <Archive className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Batches ({batches.length})
                </span>
              </div>
            )}
            <div className="flex flex-col gap-2">
              {batches.map((batch) => (
                <div
                  key={batch.id}
                  className={cn(
                    "group flex items-center gap-2 rounded-2xl border p-3 transition-all duration-200 hover:shadow-sm w-full",
                    batch.type === "done"
                      ? "bg-success/5 border-success/20 hover:bg-success/10"
                      : "bg-escalation/5 border-escalation/20 hover:bg-escalation/10"
                  )}
                >
                  <div className="flex-1 flex items-center gap-3 text-left">
                    <div
                      className={cn(
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl",
                        batch.type === "done"
                          ? "bg-success/15 text-success"
                          : "bg-escalation/15 text-escalation"
                      )}
                    >
                      {batch.type === "done" ? (
                        <Archive className="h-4 w-4" />
                      ) : (
                        <AlertTriangle className="h-4 w-4" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {batch.type === "done"
                          ? `Batch #${batch.batchNumber}`
                          : "Escalated"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {batch.type === "done"
                          ? `${batch.tasks.length} tasks`
                          : batch.tasks[0]?.text.slice(0, 30)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      downloadBatchAsCSV(batch)
                    }}
                    className="shrink-0 p-1.5 rounded-lg hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="Download batch as CSV"
                    title="Download as CSV"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  )
}

// Mobile-specific full-screen archive view
export function MobileArchiveView({
  completedItems,
  batches,
  onDeleteCompleted,
  onSelectTask,
}: {
  completedItems: CompletedItem[]
  batches: ArchivedBatch[]
  onDeleteCompleted?: (id: string) => void
  onSelectTask?: (taskId: string) => void
}) {

  const isEmpty = completedItems.length === 0 && batches.length === 0

  if (isEmpty) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 p-8 text-center">
        <Archive className="h-12 w-12 text-muted-foreground/30 mb-4" />
        <p className="text-base font-medium text-muted-foreground">No archives yet</p>
        <p className="text-sm text-muted-foreground/60 mt-1">
          Completed and escalated tasks will appear here
        </p>
      </div>
    )
  }

  return (
    <ScrollArea className="flex-1">
      <div className="flex flex-col gap-4 p-4">
        {/* Completed items */}
        {completedItems.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 className="h-4 w-4 text-success" />
              <span className="text-sm font-semibold text-foreground">
                Completed ({completedItems.length}/20)
              </span>
            </div>
            <div className="flex flex-col gap-2">
              {completedItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onSelectTask?.(item.task.id)}
                  className="flex items-center gap-3 rounded-2xl border bg-success/5 border-success/15 p-3.5 transition-all hover:shadow-sm text-left w-full"
                >
                  <div className="h-7 w-7 rounded-lg bg-success/15 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground line-through opacity-70 truncate">
                      {item.task.text}
                    </p>
                    <p className="text-[10px] text-muted-foreground/60 mt-0.5">
                      {new Date(item.completedAt).toLocaleString()}
                    </p>
                  </div>
                  {onDeleteCompleted && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onDeleteCompleted(item.id)
                      }}
                      className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                      aria-label={`Remove completed task "${item.task.text}"`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </button>
              ))}
            </div>
            {/* Progress bar */}
            <div className="mt-3">
              <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-success/50 transition-all duration-500"
                  style={{ width: `${(completedItems.length / 20) * 100}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground/60 mt-1.5">
                {20 - completedItems.length} more to create a batch
              </p>
            </div>
          </div>
        )}

        {/* Archived Batches */}
        {batches.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Archive className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-semibold text-foreground">
                Batches ({batches.length})
              </span>
            </div>
            <div className="flex flex-col gap-3">
              {batches.map((batch) => (
                <div
                  key={batch.id}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl border p-4 text-left transition-all duration-200 w-full",
                    batch.type === "done"
                      ? "bg-success/5 border-success/20"
                      : "bg-escalation/5 border-escalation/20"
                  )}
                >
                  <div
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                      batch.type === "done"
                        ? "bg-success/15 text-success"
                        : "bg-escalation/15 text-escalation"
                    )}
                  >
                    {batch.type === "done" ? (
                      <Archive className="h-5 w-5" />
                    ) : (
                      <AlertTriangle className="h-5 w-5" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-medium text-foreground">
                      {batch.type === "done"
                        ? `Done Batch #${batch.batchNumber}`
                        : "Escalated Item"}
                    </p>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {batch.type === "done"
                        ? `${batch.tasks.length} tasks completed`
                        : batch.tasks[0]?.text}
                    </p>
                    <p className="text-xs text-muted-foreground/60 mt-1">
                      {new Date(batch.archivedAt).toLocaleString()}
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground/40 shrink-0" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </ScrollArea>
  )
}
