// frontend/app/orgs/[orgId]/calendar/page.tsx
"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"
import { useAuth } from "@/contexts/AuthContext"
import { getOrgs, getProjects, getTasks, type Membership, type Task } from "@/lib/api"
import { PriorityBadge } from "@/components/ui/PriorityBadge"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfWeek(year: number, month: number) {
  // Monday = 0, Sunday = 6
  const day = new Date(year, month, 1).getDay()
  return day === 0 ? 6 : day - 1
}

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
]

export default function CalendarPage() {
  const { user, loading, logout } = useAuth()
  const router = useRouter()
  const params = useParams()
  const orgId = Number(params.orgId)

  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [allTasks, setAllTasks] = useState<Task[]>([])
  const [membership, setMembership] = useState<Membership | null>(null)
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    if (!loading && !user) router.replace("/")
  }, [user, loading, router])

  useEffect(() => {
    if (!user) return
    async function load() {
      setFetching(true)
      try {
        const [orgs, projects] = await Promise.all([getOrgs(), getProjects(orgId)])
        const m = orgs.find((o) => o.organization.id === orgId) ?? null
        setMembership(m)
        if (!m) { router.replace("/dashboard"); return }
        const taskArrays = await Promise.all(projects.map((p) => getTasks(p.id)))
        setAllTasks(taskArrays.flat().filter((t) => t.due_date !== null && t.status !== "done"))
      } catch {
        toast.error("Failed to load calendar data")
      } finally {
        setFetching(false)
      }
    }
    load()
  }, [user, orgId])

  function prevMonth() {
    if (month === 0) { setYear(y => y - 1); setMonth(11) }
    else setMonth(m => m - 1)
  }
  function nextMonth() {
    if (month === 11) { setYear(y => y + 1); setMonth(0) }
    else setMonth(m => m + 1)
  }

  const daysInMonth = getDaysInMonth(year, month)
  const firstDow = getFirstDayOfWeek(year, month)

  function tasksForDay(day: number): Task[] {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
    return allTasks.filter((t) => t.due_date === dateStr)
  }

  const cells: (number | null)[] = [
    ...Array(firstDow).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]

  if (loading || fetching) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <p className="text-muted text-sm">Loading…</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg">
      <header className="border-b border-border bg-surface px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href={`/orgs/${orgId}`}>
            <Button variant="ghost" size="sm">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
          </Link>
          <span className="text-text font-semibold font-[family-name:var(--font-syne)]">
            {membership?.organization.name} — Calendar
          </span>
        </div>
        <Button variant="ghost" size="sm" onClick={logout} className="text-muted">
          <LogOut className="h-4 w-4 mr-1.5" />
          Sign out
        </Button>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        {/* Month navigation */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-surface transition-colors text-muted hover:text-text">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h2 className="text-xl font-bold text-text font-[family-name:var(--font-syne)]">
            {MONTH_NAMES[month]} {year}
          </h2>
          <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-surface transition-colors text-muted hover:text-text">
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {/* Weekday headers */}
        <div className="grid grid-cols-7 mb-2">
          {WEEKDAYS.map((d) => (
            <div key={d} className="text-center text-[11px] font-semibold uppercase tracking-widest text-muted py-2 font-[family-name:var(--font-syne)]">
              {d}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-px bg-border rounded-xl overflow-hidden">
          {cells.map((day, idx) => {
            const isToday =
              day !== null &&
              day === today.getDate() &&
              month === today.getMonth() &&
              year === today.getFullYear()
            const dayTasks = day ? tasksForDay(day) : []

            return (
              <div
                key={`${year}-${month}-${idx}`}
                className={cn(
                  "min-h-[100px] bg-surface p-2 flex flex-col gap-1",
                  day === null && "bg-surface/40",
                )}
              >
                {day !== null && (
                  <>
                    <span
                      className={cn(
                        "text-xs font-semibold self-start leading-none font-[family-name:var(--font-syne)]",
                        isToday
                          ? "bg-accent text-white rounded-full w-5 h-5 flex items-center justify-center"
                          : "text-muted",
                      )}
                    >
                      {day}
                    </span>
                    <div className="flex flex-col gap-0.5 mt-0.5">
                      {dayTasks.map((task) => (
                        <div
                          key={task.id}
                          className={cn(
                            "rounded px-1.5 py-0.5 text-[10px] font-medium truncate leading-tight",
                            task.priority === "high" && "bg-[#ef4444]/15 text-[#ef4444]",
                            task.priority === "medium" && "bg-accent/15 text-accent",
                            task.priority === "low" && "bg-[#fde047]/15 text-[#fde047]",
                          )}
                          title={task.title}
                        >
                          {task.title}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )
          })}
        </div>

        {/* Legend */}
        <div className="mt-4 flex items-center gap-4">
          <span className="text-xs text-muted font-[family-name:var(--font-syne)]">Priority:</span>
          {(["high", "medium", "low"] as const).map((p) => (
            <PriorityBadge key={p} priority={p} />
          ))}
        </div>
      </main>
    </div>
  )
}
