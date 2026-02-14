"use client"

import { useState } from "react"
import { Archive, AlertTriangle, ChevronRight, X } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { ArchivedBatch } from "@/lib/store"

interface ArchiveSidebarProps {
  batches: ArchivedBatch[]
  className?: string
}

export function ArchiveSidebar({ batches, className }: ArchiveSidebarProps) {
  const [selectedBatch, setSelectedBatch] = useState<ArchivedBatch | null>(null)

  if (batches.length === 0) {
    return (
      <div className={cn("flex flex-col items-center justify-center p-6 text-center", className)}>
        <Archive className="h-10 w-10 text-muted-foreground/40 mb-3" />
        <p className="text-sm text-muted-foreground">No archived batches yet</p>
        <p className="text-xs text-muted-foreground/60 mt-1">
          Complete 20 tasks to create your first batch
        </p>
      </div>
    )
  }

  return (
    <>
      <div className={cn("flex flex-col gap-2", className)}>
        {batches.map((batch) => (
          <button
            key={batch.id}
            onClick={() => setSelectedBatch(batch)}
            className={cn(
              "group flex items-center gap-3 rounded-2xl border p-3 md:p-3 text-left transition-all duration-200 hover:shadow-sm w-full",
              batch.type === "done"
                ? "bg-success/5 border-success/20 hover:bg-success/10"
                : "bg-escalation/5 border-escalation/20 hover:bg-escalation/10"
            )}
          >
            <div
              className={cn(
                "flex h-9 w-9 md:h-8 md:w-8 shrink-0 items-center justify-center rounded-xl",
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
            <ChevronRight className="h-4 w-4 text-muted-foreground/50 shrink-0 group-hover:text-muted-foreground transition-colors" />
          </button>
        ))}
      </div>

      <Dialog open={!!selectedBatch} onOpenChange={() => setSelectedBatch(null)}>
        <DialogContent className="max-w-md max-h-[80vh] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedBatch?.type === "done" ? (
                <>
                  <div className="h-6 w-6 rounded-lg bg-success/15 flex items-center justify-center">
                    <Archive className="h-3.5 w-3.5 text-success" />
                  </div>
                  Done Batch #{selectedBatch?.batchNumber}
                </>
              ) : (
                <>
                  <div className="h-6 w-6 rounded-lg bg-escalation/15 flex items-center justify-center">
                    <AlertTriangle className="h-3.5 w-3.5 text-escalation" />
                  </div>
                  Escalated Item
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {selectedBatch && new Date(selectedBatch.archivedAt).toLocaleString()}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[50vh]">
            <div className="flex flex-col gap-2 pr-4">
              {selectedBatch?.tasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center gap-2 rounded-xl border bg-muted/50 p-3"
                >
                  <div className="h-2 w-2 rounded-full bg-muted-foreground/30 shrink-0" />
                  <span className="text-sm text-foreground">{task.text}</span>
                </div>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  )
}

// Mobile-specific full-screen archive view
export function MobileArchiveView({ batches }: { batches: ArchivedBatch[] }) {
  const [selectedBatch, setSelectedBatch] = useState<ArchivedBatch | null>(null)

  if (selectedBatch) {
    return (
      <div className="flex flex-col h-full animate-fade-in-up">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            {selectedBatch.type === "done" ? (
              <div className="h-8 w-8 rounded-xl bg-success/15 flex items-center justify-center">
                <Archive className="h-4 w-4 text-success" />
              </div>
            ) : (
              <div className="h-8 w-8 rounded-xl bg-escalation/15 flex items-center justify-center">
                <AlertTriangle className="h-4 w-4 text-escalation" />
              </div>
            )}
            <div>
              <p className="text-sm font-semibold text-foreground">
                {selectedBatch.type === "done"
                  ? `Batch #${selectedBatch.batchNumber}`
                  : "Escalated Item"}
              </p>
              <p className="text-xs text-muted-foreground">
                {new Date(selectedBatch.archivedAt).toLocaleString()}
              </p>
            </div>
          </div>
          <button
            onClick={() => setSelectedBatch(null)}
            className="h-8 w-8 rounded-xl flex items-center justify-center hover:bg-muted transition-colors"
            aria-label="Close batch details"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <ScrollArea className="flex-1 p-4">
          <div className="flex flex-col gap-2">
            {selectedBatch.tasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center gap-3 rounded-2xl border bg-card p-4"
              >
                <div className="h-2 w-2 rounded-full bg-muted-foreground/30 shrink-0" />
                <span className="text-sm text-card-foreground">{task.text}</span>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    )
  }

  if (batches.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 p-8 text-center">
        <Archive className="h-12 w-12 text-muted-foreground/30 mb-4" />
        <p className="text-base font-medium text-muted-foreground">No archives yet</p>
        <p className="text-sm text-muted-foreground/60 mt-1">
          Complete 20 tasks to create your first batch
        </p>
      </div>
    )
  }

  return (
    <ScrollArea className="flex-1">
      <div className="flex flex-col gap-3 p-4">
        {batches.map((batch) => (
          <button
            key={batch.id}
            onClick={() => setSelectedBatch(batch)}
            className={cn(
              "flex items-center gap-3 rounded-2xl border p-4 text-left transition-all duration-200 w-full active:scale-[0.98]",
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
    </ScrollArea>
  )
}
