"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"
import { register } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function RegisterPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [pending, setPending] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setPending(true)
    try {
      await register(email, password, name)
      toast.success("Account created — sign in to continue")
      router.push("/")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Registration failed")
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-12 relative overflow-hidden">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 dot-grid">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-accent/5 blur-[120px]" />
      </div>

      <div className="relative w-full max-w-sm animate-fade-up">
        {/* Brand */}
        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 mb-3">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-muted font-[family-name:var(--font-syne)]">
              MyProject
            </span>
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-text font-[family-name:var(--font-syne)]">
            Create your account
          </h1>
          <p className="mt-2 text-sm text-muted">
            Join your team on MyProject
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-border bg-surface p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Full name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoFocus
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Min. 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
              />
            </div>
            <Button type="submit" className="w-full mt-2" disabled={pending}>
              {pending ? "Creating account…" : "Create account"}
            </Button>
          </form>

          <p className="mt-5 text-center text-xs text-muted">
            Already have an account?{" "}
            <Link href="/" className="text-accent hover:text-accent-hover transition-colors font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
