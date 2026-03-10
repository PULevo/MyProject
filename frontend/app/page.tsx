"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CheckCircle2, LayoutGrid, Users, Zap } from "lucide-react"

const features = [
  { icon: LayoutGrid, text: "Kanban boards for every project" },
  { icon: Users,      text: "Role-based team collaboration" },
  { icon: Zap,        text: "Simple, fast, no bloat" },
]

export default function LoginPage() {
  const { user, loading, login } = useAuth()
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [pending, setPending] = useState(false)

  useEffect(() => {
    if (!loading && user) router.replace("/dashboard")
  }, [user, loading, router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setPending(true)
    try {
      await login(email, password)
      router.push("/dashboard")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Login failed")
    } finally {
      setPending(false)
    }
  }

  if (loading) return null

  return (
    <div className="flex min-h-screen">
      {/* ── Left panel ────────────────────────────────────────────────── */}
      <div className="relative hidden lg:flex lg:w-[55%] flex-col justify-between p-12 dot-grid overflow-hidden">
        {/* Warm glow behind brand */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-32 -left-32 w-[520px] h-[520px] rounded-full bg-accent/6 blur-[140px]" />
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-accent/4 blur-[120px]" />
        </div>

        {/* Brand */}
        <div className="relative animate-fade-up">
          <div className="inline-flex items-center gap-2.5 mb-1">
            <span className="h-2 w-2 rounded-full bg-accent" />
            <span className="text-xs font-medium text-muted tracking-widest uppercase font-[family-name:var(--font-syne)]">
              MyProject
            </span>
          </div>
        </div>

        {/* Hero text */}
        <div className="relative space-y-8">
          <div className="animate-fade-up delay-100">
            <h1 className="text-[80px] font-extrabold leading-[0.88] tracking-tight font-[family-name:var(--font-syne)]">
              <span className="text-text">TASK</span>
              <br />
              <span className="text-accent">BOARD</span>
              <br />
              <span className="text-text">FOR</span>
              <br />
              <span className="text-border-strong">TEAMS</span>
            </h1>
          </div>

          <div className="animate-fade-up delay-200">
            <p className="text-sm text-muted max-w-xs leading-relaxed">
              Lightweight project management for small teams. No clutter, just clarity.
            </p>
          </div>

          <div className="space-y-3 animate-fade-up delay-300">
            {features.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-accent/10">
                  <Icon className="h-3.5 w-3.5 text-accent" />
                </div>
                <span className="text-xs text-muted">{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="relative animate-fade-in delay-400">
          <p className="text-xs text-faint">
            Built by Pekka Levo · Portfolio project
          </p>
        </div>
      </div>

      {/* ── Right panel (form) ─────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 relative bg-surface/50">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-accent/4 blur-[100px]" />
        </div>

        <div className="relative w-full max-w-sm">
          {/* Mobile brand */}
          <div className="mb-10 text-center lg:hidden">
            <h1 className="text-4xl font-extrabold tracking-tight font-[family-name:var(--font-syne)]">
              My<span className="text-accent">Project</span>
            </h1>
            <p className="mt-2 text-sm text-muted">Task management for small teams</p>
          </div>

          <div className="animate-fade-up">
            <p className="mb-1 text-xs font-semibold uppercase tracking-[0.14em] text-muted font-[family-name:var(--font-syne)]">
              Welcome back
            </p>
            <h2 className="mb-8 text-2xl font-bold text-text font-[family-name:var(--font-syne)]">
              Sign in to continue
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full mt-2" disabled={pending}>
                {pending ? "Signing in…" : "Sign in"}
              </Button>
            </form>

            <p className="mt-6 text-center text-xs text-muted">
              No account?{" "}
              <Link href="/register" className="text-accent hover:text-accent-hover transition-colors font-medium">
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
