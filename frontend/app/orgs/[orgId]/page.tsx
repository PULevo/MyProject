"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  ChevronLeft,
  Plus,
  Trash2,
  FolderOpen,
  Users,
  ChevronRight,
  LogOut,
} from "lucide-react"

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
  const [createError, setCreateError] = useState("")

  const [activeTab, setActiveTab] = useState<"projects" | "members">("projects")

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
    setCreateError("")
    try {
      const proj = await createProject(orgId, newProjName.trim(), newProjDesc.trim() || undefined)
      setProjects((p) => [...p, proj])
      setProjDialogOpen(false)
      setNewProjName("")
      setNewProjDesc("")
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : "Failed to create project")
    } finally {
      setCreating(false)
    }
  }

  async function handleDeleteProject(proj: Project) {
    if (!confirm(`Delete project "${proj.name}"? All tasks must be removed first.`)) return
    try {
      await deleteProject(proj.id)
      setProjects((p) => p.filter((x) => x.id !== proj.id))
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete project")
    }
  }

  function handleLogout() {
    logout()
    router.push("/")
  }

  if (loading || !user) return null

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navbar */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <Link href="/dashboard" className="text-slate-500 hover:text-slate-700">
              <ChevronLeft className="h-5 w-5" />
            </Link>
            <span className="text-lg font-semibold text-slate-900">{orgName}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-500">{user.name}</span>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8">
        {/* Tabs */}
        <div className="mb-6 flex gap-1 rounded-lg border border-slate-200 bg-white p-1 w-fit">
          <button
            onClick={() => setActiveTab("projects")}
            className={`flex items-center gap-1.5 rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
              activeTab === "projects"
                ? "bg-slate-100 text-slate-900"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <FolderOpen className="h-4 w-4" />
            Projects
          </button>
          <button
            onClick={() => setActiveTab("members")}
            className={`flex items-center gap-1.5 rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
              activeTab === "members"
                ? "bg-slate-100 text-slate-900"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <Users className="h-4 w-4" />
            Members
          </button>
        </div>

        {/* Projects tab */}
        {activeTab === "projects" && (
          <>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-medium text-slate-700">Projects</h2>
              {isAdmin && (
                <Dialog open={projDialogOpen} onOpenChange={setProjDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="mr-1 h-4 w-4" />
                      New project
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create project</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCreateProject} className="space-y-4">
                      <div className="space-y-1">
                        <Label htmlFor="proj-name">Name</Label>
                        <Input
                          id="proj-name"
                          placeholder="Website redesign"
                          value={newProjName}
                          onChange={(e) => setNewProjName(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="proj-desc">Description (optional)</Label>
                        <Textarea
                          id="proj-desc"
                          placeholder="What is this project about?"
                          value={newProjDesc}
                          onChange={(e) => setNewProjDesc(e.target.value)}
                        />
                      </div>
                      {createError && (
                        <p className="text-sm text-red-600">{createError}</p>
                      )}
                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setProjDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button type="submit" disabled={creating}>
                          {creating ? "Creating…" : "Create"}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              )}
            </div>

            {fetching ? (
              <p className="text-sm text-slate-500">Loading…</p>
            ) : projects.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center py-12 text-center">
                  <FolderOpen className="mb-3 h-10 w-10 text-slate-300" />
                  <p className="text-slate-500">No projects yet.</p>
                  {isAdmin && (
                    <p className="mt-1 text-sm text-slate-400">Create one to get started.</p>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {projects.map((proj) => (
                  <Card key={proj.id} className="transition-shadow hover:shadow-md">
                    <CardHeader className="flex-row items-center justify-between py-4">
                      <Link
                        href={`/orgs/${orgId}/projects/${proj.id}`}
                        className="flex flex-1 items-center gap-3"
                      >
                        <FolderOpen className="h-5 w-5 text-slate-400" />
                        <div>
                          <CardTitle className="text-base">{proj.name}</CardTitle>
                          {proj.description && (
                            <p className="mt-0.5 text-sm text-slate-400">{proj.description}</p>
                          )}
                        </div>
                      </Link>
                      <div className="flex items-center gap-1">
                        {isAdmin && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteProject(proj)}
                            className="h-8 w-8 text-slate-400 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                        <Link href={`/orgs/${orgId}/projects/${proj.id}`}>
                          <ChevronRight className="h-4 w-4 text-slate-400" />
                        </Link>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}

        {/* Members tab */}
        {activeTab === "members" && (
          <>
            <div className="mb-4">
              <h2 className="font-medium text-slate-700">Members</h2>
            </div>
            {fetching ? (
              <p className="text-sm text-slate-500">Loading…</p>
            ) : (
              <div className="space-y-2">
                {members.map((m) => (
                  <Card key={m.id}>
                    <CardHeader className="flex-row items-center justify-between py-3">
                      <div>
                        <p className="text-sm font-medium text-slate-900">{m.user.name}</p>
                        <p className="text-xs text-slate-400">{m.user.email}</p>
                      </div>
                      <Badge variant={m.role === "admin" ? "default" : "secondary"}>
                        {m.role}
                      </Badge>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
