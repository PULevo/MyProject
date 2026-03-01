"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
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
} from "@/lib/api"
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
import { ChevronLeft, Plus, Trash2, LogOut, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"

const COLUMNS: { id: TaskStatus; label: string }[] = [
  { id: "todo", label: "To Do" },
  { id: "in_progress", label: "In Progress" },
  { id: "done", label: "Done" },
]

const NEXT_STATUS: Record<TaskStatus, TaskStatus | null> = {
  todo: "in_progress",
  in_progress: "done",
  done: null,
}

const colColors: Record<TaskStatus, string> = {
  todo: "bg-slate-100 border-slate-200",
  in_progress: "bg-blue-50 border-blue-200",
  done: "bg-green-50 border-green-200",
}

const badgeVariants: Record<TaskStatus, "secondary" | "default" | "success"> = {
  todo: "secondary",
  in_progress: "default",
  done: "success",
}

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
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState("")

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
    setCreateError("")
    try {
      const task = await createTask(projectId, newTitle.trim(), newDesc.trim() || undefined)
      setTasks((t) => [...t, task])
      setDialogOpen(false)
      setNewTitle("")
      setNewDesc("")
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : "Failed to create task")
    } finally {
      setCreating(false)
    }
  }

  async function handleAdvanceTask(task: Task) {
    const next = NEXT_STATUS[task.status]
    if (!next) return
    try {
      const updated = await updateTask(task.id, { status: next })
      setTasks((ts) => ts.map((t) => (t.id === updated.id ? updated : t)))
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update task")
    }
  }

  async function handleDeleteTask(task: Task) {
    if (!confirm(`Delete task "${task.title}"?`)) return
    try {
      await deleteTask(task.id)
      setTasks((ts) => ts.filter((t) => t.id !== task.id))
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete task")
    }
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
    <div className="min-h-screen bg-slate-50">
      {/* Navbar */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <Link href={`/orgs/${orgId}`} className="text-slate-500 hover:text-slate-700">
              <ChevronLeft className="h-5 w-5" />
            </Link>
            <span className="text-lg font-semibold text-slate-900">Task board</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-500">{user.name}</span>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        {/* Header row */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold text-slate-900">Tasks</h1>
            <Badge variant="secondary">{tasks.length} total</Badge>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="mr-1 h-4 w-4" />
                Add task
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add task</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateTask} className="space-y-4">
                <div className="space-y-1">
                  <Label htmlFor="task-title">Title</Label>
                  <Input
                    id="task-title"
                    placeholder="Fix login bug"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="task-desc">Description (optional)</Label>
                  <Textarea
                    id="task-desc"
                    placeholder="More details…"
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                  />
                </div>
                {createError && <p className="text-sm text-red-600">{createError}</p>}
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={creating}>
                    {creating ? "Adding…" : "Add task"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Kanban board */}
        {fetching ? (
          <p className="text-sm text-slate-500">Loading…</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {COLUMNS.map((col) => (
              <div key={col.id} className={cn("rounded-xl border p-4", colColors[col.id])}>
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-slate-700">{col.label}</h2>
                  <Badge variant={badgeVariants[col.id]}>
                    {tasksByStatus(col.id).length}
                  </Badge>
                </div>

                <div className="space-y-2">
                  {tasksByStatus(col.id).map((task) => (
                    <div
                      key={task.id}
                      className="rounded-lg border border-white bg-white p-3 shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium text-slate-900">{task.title}</p>
                        <div className="flex shrink-0 gap-1">
                          {NEXT_STATUS[task.status] && (
                            <button
                              onClick={() => handleAdvanceTask(task)}
                              className="rounded p-0.5 text-slate-400 hover:text-blue-600"
                              title={`Move to ${NEXT_STATUS[task.status]}`}
                            >
                              <ArrowRight className="h-3.5 w-3.5" />
                            </button>
                          )}
                          {canDelete(task) && (
                            <button
                              onClick={() => handleDeleteTask(task)}
                              className="rounded p-0.5 text-slate-400 hover:text-red-600"
                              title="Delete task"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                      {task.description && (
                        <p className="mt-1 text-xs text-slate-400">{task.description}</p>
                      )}
                    </div>
                  ))}

                  {tasksByStatus(col.id).length === 0 && (
                    <p className="py-4 text-center text-xs text-slate-400">No tasks</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
