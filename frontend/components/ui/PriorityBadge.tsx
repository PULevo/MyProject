// frontend/components/ui/PriorityBadge.tsx
import { cn } from "@/lib/utils"
import type { TaskPriority } from "@/lib/api"

const CONFIG: Record<TaskPriority, { label: string; classes: string }> = {
  high: {
    label: "High",
    classes: "bg-[#ef4444]/10 text-[#ef4444] border-[#ef4444]/25",
  },
  medium: {
    label: "Medium",
    classes: "bg-accent/10 text-accent border-accent/25",
  },
  low: {
    label: "Low",
    classes: "bg-[#fde047]/10 text-[#fde047] border-[#fde047]/25",
  },
}

interface PriorityBadgeProps {
  priority: TaskPriority
  className?: string
}

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  const { label, classes } = CONFIG[priority]
  return (
    <span
      role="img"
      aria-label={`Priority: ${label}`}
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide font-[family-name:var(--font-syne)]",
        classes,
        className,
      )}
    >
      {label}
    </span>
  )
}
