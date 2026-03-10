"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"
import { useAuth } from "@/contexts/AuthContext"
import {
  getOrgs,
  getProjects,
  getMembers,
  createProject,
  deleteProject,
  type Membership,
  type Project,
  type Member,
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
import { ChevronLeft, Plus, Trash2, FolderOpen, Users, ChevronRight, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"

export default function OrgPage() {
  const { user, loading, logout } = useAuth()
  const router = useRouter()
  const params = useParams()
  const orgId = Number(params.orgId)

  const [membership, setMembership] = useState<Membership | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [fetching, setFetching] = useState(true)

  const [projDialogOpen, setProjDialogOpen] = useState(false)
  const [newProjName, setNewProjName] = useState("")
  const [newProjDesc, setNewProjDesc] = useState("")
  const [creating, setCreating] = useState(false)

  const [activeTab, setActiveTab] = useState<"projects" | "members">("projects")
  const [deletingId, setDeletingId] = useState<number | null>(null)

  useEffect(() => {
    if (!loading && !user) router.replace("/")
  }, [user, loading, router])

  useEffect(() => {
    if (!user) return
    Promise.all([getOrgs(), getProjects(orgId), getMembers(orgId)])
      .then(([orgs, projs, mems]) => {
        const m = orgs.find((o) => o.organization.id === orgId) ?? null
        setMembership(m)
        setProjects(projs)
        setMembers(mems)
      })
      .catch(console.error)
      .finally(() => setFetching(false))
  }, [user, orgId])

  const isAdmin = membership?.role === "admin"
  const orgName = membership?.organization.name ?? "Organization"

  async function handleCreateProject(e: React.FormEvent) {
    e.preventDefault()
    setCreating(true)
    try {
      const proj = await createProject(orgId, newProjName.trim(), newProjDesc.trim() || undefined)
      setProjects((p) => [...p, proj])
      setProjDialogOpen(false)
      setNewProjName("")
      setNewProjDesc("")
      toast.success(`"${proj.name}" created`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create project")
    } finally {
      setCreating(false)
    }
  }

  async function handleDeleteProject(proj: Project) {
    setDeletingId(proj.id)
    try {
      await deleteProject(proj.id)
      setProjects((p) => p.filter((x) => x.id !== proj.id))
      toast.success(`"${proj.name}" deleted`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete project")
    } finally {
      setDeletingId(null)
    }
  }

  function handleLogout() {
    logout()
    router.push("/")
  }

  if (loading || !user) return null

  return (
    <div className="min-h-screen bg-bg">
      {/* Header */}
      <header className="border-b border-border bg-surface/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-5 py-3.5">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="flex h-7 w-7 items-center justify-center rounded-lg text-muted hover:text-text hover:bg-surface-2 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </Link>
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              <span className="text-sm font-bold text-text font-[family-name:var(--font-syne)]">
                {orgName}
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

      <main className="mx-auto max-w-4xl px-5 py-10">
        {/* Tabs */}
        <div className="mb-8 flex gap-1 border-b border-border">
          {(["projects", "members"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.1em] transition-all border-b-2 -mb-px",
                "font-[family-name:var(--font-syne)]",
                activeTab === tab
                  ? "border-accent text-accent"
                  : "border-transparent text-muted hover:text-text"
              )}
            >
              {tab === "projects" ? <FolderOpen className="h-3.5 w-3.5" /> : <Users className="h-3.5 w-3.5" />}
              {tab}
              <span className={cn(
                "ml-0.5 rounded px-1.5 py-0.5 text-[10px]",
                activeTab === tab ? "bg-accent/15 text-accent" : "bg-surface-2 text-muted"
              )}>
                {tab === "projects" ? projects.length : members.length}
              </span>
            </button>
          ))}
        </div>

        {/* Projects tab */}
        {activeTab === "projects" && (
          <>
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-text font-[family-name:var(--font-syne)]">Projects</h2>
                <p className="text-xs text-muted mt-0.5">
                  {projects.length} project{projects.length !== 1 ? "s" : ""} in this org
                </p>
              </div>
              {isAdmin && (
                <Dialog open={projDialogOpen} onOpenChange={setProjDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="mr-1.5 h-3.5 w-3.5" />
                      New project
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create project</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCreateProject} className="space-y-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="proj-name">Name</Label>
                        <Input
                          id="proj-name"
                          placeholder="Website redesign"
                          value={newProjName}
                          onChange={(e) => setNewProjName(e.target.value)}
                          required
                          autoFocus
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="proj-desc">Description (optional)</Label>
                        <Textarea
                          id="proj-desc"
                          placeholder="What is this project about?"
                          value={newProjDesc}
                          onChange={(e) => setNewProjDesc(e.target.value)}
                        />
                      </div>
                      <div className="flex justify-end gap-2 pt-1">
                        <Button type="button" variant="outline" onClick={() => setProjDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button type="submit" disabled={creating || !newProjName.trim()}>
                          {creating ? "Creating…" : "Create"}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              )}
            </div>

            {fetching ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-18 rounded-xl bg-surface animate-pulse" />
                ))}
              </div>
            ) : projects.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border bg-surface p-14 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-surface-2">
                  <FolderOpen className="h-6 w-6 text-faint" />
                </div>
                <p className="text-sm font-semibold text-text font-[family-name:var(--font-syne)]">No projects yet</p>
                {isAdmin && (
                  <p className="mt-1.5 text-xs text-muted">Create a project to start adding tasks.</p>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                {projects.map((proj) => (
                  <div
                    key={proj.id}
                    className="group flex items-center justify-between rounded-xl border border-border bg-surface px-5 py-4 transition-all duration-150 hover:border-border-strong hover:bg-surface-2"
                  >
                    <Link href={`/orgs/${orgId}/projects/${proj.id}`} className="flex flex-1 items-center gap-4 min-w-0">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface-2 border border-border group-hover:border-border-strong transition-colors">
                        <FolderOpen className="h-4 w-4 text-muted group-hover:text-text transition-colors" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-text truncate font-[family-name:var(--font-syne)]">
                          {proj.name}
                        </p>
                        {proj.description ? (
                          <p className="mt-0.5 text-xs text-muted truncate">{proj.description}</p>
                        ) : (
                          <p className="mt-0.5 text-xs text-faint">No description</p>
                        )}
                      </div>
                    </Link>
                    <div className="flex items-center gap-1 shrink-0 ml-3">
                      {isAdmin && (
                        deletingId === proj.id ? (
                          <span className="text-xs text-muted px-2">Deleting…</span>
                        ) : (
                          <button
                            onClick={() => handleDeleteProject(proj)}
                            className="rounded-lg p-1.5 text-faint hover:text-destructive hover:bg-destructive/10 transition-colors opacity-0 group-hover:opacity-100"
                            title="Delete project"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )
                      )}
                      <Link href={`/orgs/${orgId}/projects/${proj.id}`}>
                        <ChevronRight className="h-4 w-4 text-faint group-hover:text-muted transition-colors" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Members tab */}
        {activeTab === "members" && (
          <>
            <div className="mb-5">
              <h2 className="text-lg font-bold text-text font-[family-name:var(--font-syne)]">Members</h2>
              <p className="text-xs text-muted mt-0.5">
                {members.length} member{members.length !== 1 ? "s" : ""} in this org
              </p>
            </div>
            {fetching ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-14 rounded-xl bg-surface animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {members.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center justify-between rounded-xl border border-border bg-surface px-5 py-3.5"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/10 border border-accent/20 text-xs font-bold text-accent font-[family-name:var(--font-syne)] uppercase">
                        {(m.user.name || m.user.email).charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-text">{m.user.name || "—"}</p>
                        <p className="text-xs text-muted">{m.user.email}</p>
                      </div>
                    </div>
                    <Badge variant={m.role === "admin" ? "default" : "secondary"}>
                      {m.role}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
