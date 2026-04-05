"use client"

import { useState, useEffect, useRef } from "react"
import { searchTasks, type Task } from "@/lib/api"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { PriorityBadge } from "@/components/ui/PriorityBadge"
import { Search } from "lucide-react"

interface SearchModalProps {
  open: boolean
  orgId: number
  onClose: () => void
}

export function SearchModal({ open, orgId, onClose }: SearchModalProps) {
  const [q, setQ] = useState("")
  const [results, setResults] = useState<Task[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!open) { setQ(""); setResults([]); setError(null) }
  }, [open])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!q.trim()) { setResults([]); return }
    debounceRef.current = setTimeout(async () => {
      setError(null)
      setLoading(true)
      try {
        const data = await searchTasks(orgId, { q: q.trim() })
        setResults(data)
      } catch {
        setError("Search failed. Please try again.")
        setResults([])
      } finally {
        setLoading(false)
      }
    }, 300)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [q, orgId])

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose() }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="sr-only">Search tasks</DialogTitle>
        </DialogHeader>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
          <Input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search tasks…"
            className="pl-9"
          />
        </div>

        {loading && <p className="text-xs text-muted py-4 text-center">Searching…</p>}

        {error && <p className="text-xs text-[#ef4444] py-4 text-center">{error}</p>}

        {!loading && q && results.length === 0 && (
          <p className="text-xs text-muted py-4 text-center">No tasks found for "{q}"</p>
        )}

        {results.length > 0 && (
          <div className="mt-2 space-y-1 max-h-72 overflow-y-auto">
            {results.map((task) => (
              <div
                key={task.id}
                className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-surface-2 transition-colors"
              >
                <PriorityBadge priority={task.priority} />
                <span className="flex-1 text-sm text-text truncate">{task.title}</span>
                {task.due_date && (
                  <span className="text-[10px] text-muted shrink-0">
                    {new Date(task.due_date).toLocaleDateString("fi-FI")}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
