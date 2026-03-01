"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/contexts/AuthContext"
import { getOrgs, createOrg, type Membership } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { LogOut, Plus, Building2, ChevronRight } from "lucide-react"

export default function DashboardPage() {
  const { user, loading, logout } = useAuth()
  const router = useRouter()
  const [memberships, setMemberships] = useState<Membership[]>([])
  const [fetching, setFetching] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [newOrgName, setNewOrgName] = useState("")
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState("")

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
    setError("")
    try {
      const org = await createOrg(newOrgName.trim())
      const updated = await getOrgs()
      setMemberships(updated)
      setDialogOpen(false)
      setNewOrgName("")
      router.push(`/orgs/${org.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create organization")
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
    <div className="min-h-screen bg-slate-50">
      {/* Navbar */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
          <span className="text-lg font-semibold text-slate-900">MyProject</span>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-500">{user.name}</span>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-slate-900">Organizations</h1>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="mr-1 h-4 w-4" />
                New organization
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create organization</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateOrg} className="space-y-4">
                <div className="space-y-1">
                  <Label htmlFor="org-name">Name</Label>
                  <Input
                    id="org-name"
                    placeholder="Acme Inc."
                    value={newOrgName}
                    onChange={(e) => setNewOrgName(e.target.value)}
                    required
                  />
                </div>
                {error && <p className="text-sm text-red-600">{error}</p>}
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setDialogOpen(false)}
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
        </div>

        {fetching ? (
          <p className="text-sm text-slate-500">Loading…</p>
        ) : memberships.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center py-12 text-center">
              <Building2 className="mb-3 h-10 w-10 text-slate-300" />
              <p className="text-slate-500">No organizations yet.</p>
              <p className="mt-1 text-sm text-slate-400">
                Create one to get started.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {memberships.map((m) => (
              <Link key={m.id} href={`/orgs/${m.organization.id}`}>
                <Card className="cursor-pointer transition-shadow hover:shadow-md">
                  <CardHeader className="flex-row items-center justify-between py-4">
                    <div className="flex items-center gap-3">
                      <Building2 className="h-5 w-5 text-slate-400" />
                      <CardTitle className="text-base">{m.organization.name}</CardTitle>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={m.role === "admin" ? "default" : "secondary"}>
                        {m.role}
                      </Badge>
                      <ChevronRight className="h-4 w-4 text-slate-400" />
                    </div>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
