"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"
import { useAuth } from "@/contexts/AuthContext"
import {
  getOrgs,
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  type Membership,
  type Task,
  type TaskStatus,
  type TaskPriority,
} from "@/lib/api"
import { PriorityBadge } from "@/components/ui/PriorityBadge"
import { TaskDetailModal } from "@/components/TaskDetailModal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ChevronLeft, Plus, LogOut, ArrowRight, Circle } from "lucide-react"
import { cn } from "@/lib/utils"

function isOverdue(dueDate: string): boolean {
  const [y, m, d] = dueDate.split("-").map(Number)
  const due = new Date(y, m - 1, d)  // local midnight
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return due < today
}

const COLUMNS: {
  id: TaskStatus
  label: string
  countVariant: "secondary" | "default" | "success"
  dot: string
  headerColor: string
  colBg: string
  colBorder: string
  cardBorder: string
}[] = [
  {
    id: "todo",
    label: "To Do",
    countVariant: "secondary",
    dot: "bg-muted",
    headerColor: "text-muted",
    colBg: "bg-surface",
    colBorder: "border-border",
    cardBorder: "border-l-border",
  },
  {
    id: "in_progress",
    label: "In Progress",
    countVariant: "default",
    dot: "bg-accent",
    headerColor: "text-accent",
    colBg: "bg-[rgba(249,115,22,0.03)]",
    colBorder: "border-[rgba(249,115,22,0.18)]",
    cardBorder: "border-l-accent",
  },
  {
    id: "done",
    label: "Done",
    countVariant: "success",
    dot: "bg-success",
    headerColor: "text-success",
    colBg: "bg-[rgba(34,209,122,0.03)]",
    colBorder: "border-[rgba(34,209,122,0.18)]",
    cardBorder: "border-l-success",
  },
]

export default function ProjectPage() {
  const { user, loading, logout } = useAuth()
  const router = useRouter()
  const params = useParams()
  const orgId = Number(params.orgId)
  const projectId = Number(params.projectId)

  const [membership, setMembership] = useState<Membership | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [fetching, setFetching] = useState(true)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [newTitle, setNewTitle] = useState("")
  const [newDesc, setNewDesc] = useState("")
  const [newTaskPriority, setNewTaskPriority] = useState<TaskPriority>("medium")
  const [newTaskDueDate, setNewTaskDueDate] = useState("")
  const [creating, setCreating] = useState(false)

  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)

  useEffect(() => {
    if (!loading && !user) router.replace("/")
  }, [user, loading, router])

  useEffect(() => {
    if (!user) return
    Promise.all([getOrgs(), getTasks(projectId)])
      .then(([orgs, taskList]) => {
        const m = orgs.find((o) => o.organization.id === orgId) ?? null
        setMembership(m)
        setTasks(taskList)
      })
      .catch(console.error)
      .finally(() => setFetching(false))
  }, [user, orgId, projectId])

  const isAdmin = membership?.role === "admin"

  async function handleCreateTask(e: React.FormEvent) {
    e.preventDefault()
    setCreating(true)
    try {
      const task = await createTask(projectId, {
        title: newTitle.trim(),
        description: newDesc.trim() || undefined,
        priority: newTaskPriority,
        due_date: newTaskDueDate || undefined,
      })
      setTasks((t) => [...t, task])
      setDialogOpen(false)
      setNewTitle("")
      setNewDesc("")
      setNewTaskPriority("medium")
      setNewTaskDueDate("")
      toast.success("Task created")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create task")
    } finally {
      setCreating(false)
    }
  }

  async function handleAdvanceTask(task: Task, e: React.MouseEvent) {
    e.stopPropagation()
    const nextMap: Record<TaskStatus, TaskStatus | null> = {
      todo: "in_progress",
      in_progress: "done",
      done: null,
    }
    const next = nextMap[task.status]
    if (!next) return
    try {
      const updated = await updateTask(task.id, { status: next })
      setTasks((ts) => ts.map((t) => (t.id === updated.id ? updated : t)))
      const labels: Record<TaskStatus, string> = { todo: "To Do", in_progress: "In Progress", done: "Done" }
      toast.success(`Moved to ${labels[next]}`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update task")
    }
  }

  function openDetail(task: Task) {
    setSelectedTask(task)
    setDetailOpen(true)
  }

  function canDelete(task: Task) {
    return isAdmin || task.created_by === user?.id
  }

  function handleLogout() {
    logout()
    router.push("/")
  }

  if (loading || !user) return null

  const tasksByStatus = (status: TaskStatus) => tasks.filter((t) => t.status === status)

  return (
    <div className="min-h-screen bg-bg">
      {/* Header */}
      <header className="border-b border-border bg-surface/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5">
          <div className="flex items-center gap-3">
            <Link
              href={`/orgs/${orgId}`}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-muted hover:text-text hover:bg-surface-2 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </Link>
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              <span className="text-sm font-bold text-text font-[family-name:var(--font-syne)]">
                Task Board
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted hidden sm:block">{user.name || user.email}</span>
            <button
              onClick={handleLogout}
              title="Sign out"
              className="flex h-7 w-7 items-center justify-center rounded-lg text-muted hover:text-text hover:bg-surface-2 transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-8">
        {/* Toolbar */}
        <div className="mb-7 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted font-[family-name:var(--font-syne)]">
                Board
              </p>
              <h1 className="text-xl font-bold text-text font-[family-name:var(--font-syne)]">Tasks</h1>
            </div>
            <Badge variant="secondary">{tasks.length}</Badge>
          </div>

          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open)
            if (!open) {
              setNewTitle("")
              setNewDesc("")
              setNewTaskPriority("medium")
              setNewTaskDueDate("")
            }
          }}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="mr-1.5 h-3.5 w-3.5" />
                Add task
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add task</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateTask} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="task-title">Title</Label>
                  <Input
                    id="task-title"
                    placeholder="Fix login bug"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="task-desc">Description (optional)</Label>
                  <Textarea
                    id="task-desc"
                    placeholder="More details…"
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Priority</Label>
                  <div className="flex gap-2">
                    {(["low", "medium", "high"] as TaskPriority[]).map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setNewTaskPriority(p)}
                        className={cn(
                          "flex-1 rounded-lg border px-2 py-1.5 transition-all duration-150",
                          newTaskPriority === p ? "ring-2 ring-offset-1 ring-offset-surface ring-accent" : "opacity-50 hover:opacity-75",
                        )}
                      >
                        <PriorityBadge priority={p} className="w-full justify-center" />
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="new-task-due">Due date (optional)</Label>
                  <Input
                    id="new-task-due"
                    type="date"
                    value={newTaskDueDate}
                    onChange={(e) => setNewTaskDueDate(e.target.value)}
                  />
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={creating || !newTitle.trim()}>
                    {creating ? "Adding…" : "Add task"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Kanban */}
        {fetching ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-56 rounded-xl bg-surface animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {COLUMNS.map((col) => {
              const colTasks = tasksByStatus(col.id)
              return (
                <div
                  key={col.id}
                  className={cn("rounded-xl border p-3", col.colBg, col.colBorder)}
                >
                  {/* Column header */}
                  <div className="mb-3 flex items-center justify-between px-1 py-0.5">
                    <div className="flex items-center gap-2">
                      <span className={cn("h-1.5 w-1.5 rounded-full", col.dot)} />
                      <h2 className={cn(
                        "text-xs font-bold uppercase tracking-[0.1em] font-[family-name:var(--font-syne)]",
                        col.headerColor
                      )}>
                        {col.label}
                      </h2>
                    </div>
                    <Badge variant={col.countVariant}>{colTasks.length}</Badge>
                  </div>

                  {/* Task cards */}
                  <div className="space-y-2">
                    {colTasks.map((task) => (
                      <div
                        key={task.id}
                        onClick={() => openDetail(task)}
                        className={cn(
                          "group relative rounded-lg border border-border border-l-2 bg-surface-2 p-3.5 cursor-pointer",
                          "hover:border-border-strong hover:bg-surface transition-all duration-150",
                          col.cardBorder
                        )}
                      >
                        {/* Advance button */}
                        {col.id !== "done" && (
                          <button
                            onClick={(e) => handleAdvanceTask(task, e)}
                            className={cn(
                              "absolute right-2.5 top-2.5 rounded-md p-1 opacity-0 group-hover:opacity-100 transition-all",
                              "text-faint hover:text-accent hover:bg-accent/10",
                              col.id === "in_progress" && "hover:text-success hover:bg-success/10"
                            )}
                            title={col.id === "todo" ? "Move to In Progress" : "Mark as Done"}
                          >
                            <ArrowRight className="h-3.5 w-3.5" />
                          </button>
                        )}

                        <p className="text-sm font-medium text-text pr-6 leading-snug">
                          {task.title}
                        </p>
                        {/* Priority + due date */}
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          <PriorityBadge priority={task.priority} />
                          {task.due_date && (
                            <span
                              className={cn(
                                "text-[10px] font-medium",
                                isOverdue(task.due_date) && task.status !== "done"
                                  ? "text-[#ef4444]"
                                  : "text-muted",
                              )}
                            >
                              {new Date(task.due_date).toLocaleDateString("fi-FI")}
                            </span>
                          )}
                        </div>
                        {task.description && (
                          <p className="mt-2 text-xs text-muted line-clamp-2 leading-relaxed">
                            {task.description}
                          </p>
                        )}
                      </div>
                    ))}

                    {colTasks.length === 0 && (
                      <div className="rounded-lg border border-dashed border-border py-8 text-center">
                        <p className="text-xs text-faint">No tasks</p>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>

      {/* Task detail modal */}
      <TaskDetailModal
        task={selectedTask}
        open={detailOpen}
        canDelete={selectedTask ? canDelete(selectedTask) : false}
        currentUserId={user?.id ?? 0}
        isAdmin={membership?.role === "admin"}
        onClose={() => { setDetailOpen(false); setSelectedTask(null) }}
        onUpdate={(updated) => setTasks((ts) => ts.map((t) => (t.id === updated.id ? updated : t)))}
        onDelete={(id) => setTasks((ts) => ts.filter((t) => t.id !== id))}
      />
    </div>
  )
}
