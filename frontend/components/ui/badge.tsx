import * as React from "react"
import { cn } from "@/lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "secondary" | "destructive" | "outline" | "success" | "warning"
}

const variantClasses: Record<NonNullable<BadgeProps["variant"]>, string> = {
  default:     "bg-accent/12 text-accent border border-accent/20",
  secondary:   "bg-surface-2 text-muted border border-border",
  destructive: "bg-destructive/10 text-destructive border border-destructive/20",
  outline:     "border border-border text-muted",
  success:     "bg-success/10 text-success border border-success/20",
  warning:     "bg-warning/10 text-warning border border-warning/20",
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold font-[family-name:var(--font-syne)] tracking-wide",
        variantClasses[variant],
        className
      )}
      {...props}
    />
  )
}
