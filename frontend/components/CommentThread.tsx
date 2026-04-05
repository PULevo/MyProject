// frontend/components/CommentThread.tsx
"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { getComments, addComment, deleteComment, type Comment } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface CommentThreadProps {
  taskId: number
  currentUserId: number
  isAdmin: boolean
}

export function CommentThread({ taskId, currentUserId, isAdmin }: CommentThreadProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [body, setBody] = useState("")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    getComments(taskId)
      .then(setComments)
      .catch((err) => toast.error(err instanceof Error ? err.message : "Failed to load comments"))
  }, [taskId])

  async function handleSubmit() {
    if (!body.trim()) return
    setSubmitting(true)
    try {
      const comment = await addComment(taskId, body.trim())
      setComments((prev) => [...prev, comment])
      setBody("")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add comment")
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(commentId: number) {
    try {
      await deleteComment(commentId)
      setComments((prev) => prev.filter((c) => c.id !== commentId))
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete comment")
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="text-xs font-semibold uppercase tracking-widest text-muted font-[family-name:var(--font-syne)]">
        Comments
      </h3>

      {comments.length === 0 ? (
        <p className="text-xs text-muted">No comments yet.</p>
      ) : (
        <div className="space-y-3">
          {comments.map((c) => (
            <div key={c.id} className="group flex gap-2">
              <div className="flex-1 rounded-lg bg-surface-2 border border-border px-3 py-2 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-text font-[family-name:var(--font-syne)]">
                    {c.user.name ?? c.user.email}
                  </span>
                  <span className="text-[10px] text-muted">
                    {new Date(c.created_at).toLocaleDateString("fi-FI")}
                  </span>
                </div>
                <p className="text-xs text-text/80 whitespace-pre-wrap">{c.body}</p>
              </div>
              {(c.user_id === currentUserId || isAdmin) && (
                <button
                  type="button"
                  onClick={() => handleDelete(c.id)}
                  className={cn(
                    "opacity-0 group-hover:opacity-100 transition-opacity",
                    "text-muted hover:text-destructive p-1 rounded",
                  )}
                  aria-label="Delete comment"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="space-y-2">
        <Textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Add a comment…"
          className="min-h-[72px] text-sm"
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSubmit()
          }}
        />
        <Button size="sm" onClick={handleSubmit} disabled={submitting || !body.trim()}>
          {submitting ? "Posting…" : "Post comment"}
        </Button>
      </div>
    </div>
  )
}
