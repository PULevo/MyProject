import * as React from "react"
import { cn } from "@/lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "secondary" | "destructive" | "outline" | "success"
}

const variantClasses: Record<NonNullable<BadgeProps["variant"]>, string> = {
  default: "bg-blue-100 text-blue-800",
  secondary: "bg-slate-100 text-slate-700",
  destructive: "bg-red-100 text-red-700",
  outline: "border border-slate-200 text-slate-700",
  success: "bg-green-100 text-green-800",
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        variantClasses[variant],
        className
      )}
      {...props}
    />
  )
}
