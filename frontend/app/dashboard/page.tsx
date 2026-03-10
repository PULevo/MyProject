"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"
import { useAuth } from "@/contexts/AuthContext"
import { getOrgs, createOrg, type Membership } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { LogOut, Plus, Building2, ChevronRight, Layers } from "lucide-react"

export default function DashboardPage() {
  const { user, loading, logout } = useAuth()
  const router = useRouter()
  const [memberships, setMemberships] = useState<Membership[]>([])
  const [fetching, setFetching] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [newOrgName, setNewOrgName] = useState("")
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    if (!loading && !user) router.replace("/")
  }, [user, loading, router])

  useEffect(() => {
    if (user) {
      getOrgs()
        .then(setMemberships)
        .catch(console.error)
        .finally(() => setFetching(false))
    }
  }, [user])

  async function handleCreateOrg(e: React.FormEvent) {
    e.preventDefault()
    setCreating(true)
    try {
      const org = await createOrg(newOrgName.trim())
      const updated = await getOrgs()
      setMemberships(updated)
      setDialogOpen(false)
      setNewOrgName("")
      toast.success(`"${org.name}" created`)
      router.push(`/orgs/${org.id}`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create organization")
    } finally {
      setCreating(false)
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
          <div className="flex items-center gap-2.5">
            <span className="h-2 w-2 rounded-full bg-accent" />
            <span className="text-sm font-bold text-text tracking-tight font-[family-name:var(--font-syne)]">
              My<span className="text-accent">Project</span>
            </span>
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
        {/* Page header */}
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted mb-1 font-[family-name:var(--font-syne)]">
              Workspaces
            </p>
            <h1 className="text-2xl font-bold text-text font-[family-name:var(--font-syne)]">
              Organizations
            </h1>
          </div>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="mr-1.5 h-3.5 w-3.5" />
                New org
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create organization</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateOrg} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="org-name">Name</Label>
                  <Input
                    id="org-name"
                    placeholder="Acme Inc."
                    value={newOrgName}
                    onChange={(e) => setNewOrgName(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={creating || !newOrgName.trim()}>
                    {creating ? "Creating…" : "Create"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Content */}
        {fetching ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 rounded-xl bg-surface animate-pulse" />
            ))}
          </div>
        ) : memberships.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-surface p-16 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-surface-2">
              <Building2 className="h-6 w-6 text-faint" />
            </div>
            <p className="text-sm font-semibold text-text font-[family-name:var(--font-syne)]">No organizations yet</p>
            <p className="mt-1.5 text-xs text-muted">Create one to start managing projects and tasks.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {memberships.map((m) => (
              <Link key={m.id} href={`/orgs/${m.organization.id}`}>
                <div className="group flex items-center justify-between rounded-xl border border-border bg-surface px-5 py-4 transition-all duration-150 hover:border-border-strong hover:bg-surface-2 cursor-pointer">
                  <div className="flex items-center gap-4">
                    {/* Org icon */}
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent/10 border border-accent/20">
                      <Building2 className="h-4 w-4 text-accent" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-text font-[family-name:var(--font-syne)]">
                        {m.organization.name}
                      </p>
                      <p className="text-xs text-muted mt-0.5">
                        {m.role === "admin" ? "You manage this workspace" : "Member"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={m.role === "admin" ? "default" : "secondary"}>
                      {m.role}
                    </Badge>
                    <ChevronRight className="h-4 w-4 text-faint group-hover:text-muted transition-colors" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
