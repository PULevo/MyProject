import * as React from "react"
import { cn } from "@/lib/utils"

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      className={cn(
        "flex h-10 w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm text-text",
        "placeholder:text-muted/60",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/35 focus-visible:border-accent/50",
        "transition-all duration-150",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props}
    />
  )
)
Input.displayName = "Input"
