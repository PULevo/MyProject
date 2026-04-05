// frontend/components/TaskDetailModal.tsx
"use client"

import { useState } from "react"
import { toast } from "sonner"
import { updateTask, deleteTask, type Task, type TaskStatus, type TaskPriority } from "@/lib/api"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { PriorityBadge } from "@/components/ui/PriorityBadge"
import { CommentThread } from "@/components/CommentThread"
import { Trash2, Save } from "lucide-react"
import { cn } from "@/lib/utils"

const STATUS_OPTIONS: {
  id: TaskStatus
  label: string
  dot: string
  activeClass: string
}[] = [
  {
    id: "todo",
    label: "To Do",
    dot: "bg-muted",
    activeClass: "bg-surface-2 border-border-strong text-text",
  },
  {
    id: "in_progress",
    label: "In Progress",
    dot: "bg-accent",
    activeClass: "bg-accent/10 border-accent/35 text-accent",
  },
  {
    id: "done",
    label: "Done",
    dot: "bg-success",
    activeClass: "bg-success/10 border-success/35 text-success",
  },
]

const PRIORITY_OPTIONS: TaskPriority[] = ["low", "medium", "high"]

interface TaskDetailModalProps {
  task: Task | null
  open: boolean
  canDelete: boolean
  currentUserId: number
  isAdmin: boolean
  onClose: () => void
  onUpdate: (updated: Task) => void
  onDelete: (taskId: number) => void
}

export function TaskDetailModal({
  task,
  open,
  canDelete,
  currentUserId,
  isAdmin,
  onClose,
  onUpdate,
  onDelete,
}: TaskDetailModalProps) {
  const [title, setTitle] = useState(task?.title ?? "")
  const [description, setDescription] = useState(task?.description ?? "")
  const [status, setStatus] = useState<TaskStatus>(task?.status ?? "todo")
  const [priority, setPriority] = useState<TaskPriority>(task?.priority ?? "medium")
  const [dueDate, setDueDate] = useState(task?.due_date ?? "")
  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  // Sync local state when task changes
  if (task && !saving && !deleting) {
    if (title !== task.title) setTitle(task.title)
    if (description !== (task.description ?? "")) setDescription(task.description ?? "")
    if (status !== task.status) setStatus(task.status)
    if (priority !== task.priority) setPriority(task.priority)
    if (dueDate !== (task.due_date ?? "")) setDueDate(task.due_date ?? "")
  }

  async function handleSave() {
    if (!task) return
    setSaving(true)
    try {
      const updated = await updateTask(task.id, {
        title: title.trim(),
        description: description.trim() || null,
        status,
        priority,
        due_date: dueDate || null,
      })
      onUpdate(updated)
      toast.success("Task updated")
      onClose()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update task")
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!task) return
    setDeleting(true)
    try {
      await deleteTask(task.id)
      onDelete(task.id)
      toast.success("Task deleted")
      onClose()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete task")
      setDeleting(false)
    }
  }

  const isDirty =
    task &&
    (title.trim() !== task.title ||
      (description.trim() || null) !== task.description ||
      status !== task.status ||
      priority !== task.priority ||
      (dueDate || null) !== task.due_date)

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) {
          setConfirmDelete(false)
          onClose()
        }
      }}
    >
      <DialogContent className="max-w-lg flex flex-col max-h-[90vh] overflow-hidden">
        <DialogHeader className="shrink-0">
          <DialogTitle>Task details</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 min-h-0 pr-1">
          {/* Title */}
          <div className="space-y-1.5">
            <Label htmlFor="detail-title">Title</Label>
            <Input
              id="detail-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Task title"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="detail-desc">Description</Label>
            <Textarea
              id="detail-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a description…"
              className="min-h-[80px]"
            />
          </div>

          {/* Priority + Due date row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Priority</Label>
              <div className="flex gap-1.5">
                {PRIORITY_OPTIONS.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={cn(
                      "flex-1 rounded-lg border px-2 py-1.5 transition-all duration-150",
                      priority === p
                        ? "ring-2 ring-offset-1 ring-offset-surface ring-current opacity-100"
                        : "opacity-50 hover:opacity-75",
                    )}
                  >
                    <PriorityBadge priority={p} className="w-full justify-center" />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="detail-due">Due date</Label>
              <Input
                id="detail-due"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="text-sm"
              />
            </div>
          </div>

          {/* Status */}
          <div className="space-y-1.5">
            <Label>Status</Label>
            <div className="flex gap-2">
              {STATUS_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setStatus(opt.id)}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold transition-all duration-150",
                    "font-[family-name:var(--font-syne)]",
                    status === opt.id
                      ? opt.activeClass
                      : "border-border bg-transparent text-muted hover:border-border-strong hover:text-text",
                  )}
                >
                  <span
                    className={cn(
                      "h-1.5 w-1.5 rounded-full shrink-0",
                      status === opt.id ? opt.dot : "bg-faint",
                    )}
                  />
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="mt-4 flex items-center justify-between">
            {canDelete ? (
              confirmDelete ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted">Delete this task?</span>
                  <Button variant="destructive" size="sm" onClick={handleDelete} disabled={deleting}>
                    {deleting ? "Deleting…" : "Yes, delete"}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setConfirmDelete(false)}>
                    Cancel
                  </Button>
                </div>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setConfirmDelete(true)}
                  className="text-muted hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                  Delete
                </Button>
              )
            ) : (
              <span />
            )}

            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={onClose}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleSave} disabled={saving || !isDirty || !title.trim()}>
                <Save className="h-3.5 w-3.5 mr-1.5" />
                {saving ? "Saving…" : "Save"}
              </Button>
            </div>
          </div>

          {/* Comments */}
          {task && (
            <div className="mt-6 pt-6 border-t border-border">
              <CommentThread taskId={task.id} currentUserId={currentUserId} isAdmin={isAdmin} />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
