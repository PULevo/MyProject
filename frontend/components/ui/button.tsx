"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cn } from "@/lib/utils"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
  asChild?: boolean
}

const variantClasses: Record<NonNullable<ButtonProps["variant"]>, string> = {
  default:
    "bg-accent text-white hover:bg-accent-hover shadow-[0_0_20px_rgba(249,115,22,0.25)] hover:shadow-[0_0_28px_rgba(249,115,22,0.4)] active:scale-[0.98]",
  destructive:
    "bg-destructive/10 text-destructive border border-destructive/30 hover:bg-destructive/20",
  outline:
    "border border-border bg-transparent text-text hover:bg-surface-2 hover:border-border-strong",
  ghost:
    "hover:bg-surface-2 text-muted hover:text-text",
  link:
    "text-accent underline-offset-4 hover:underline",
}

const sizeClasses: Record<NonNullable<ButtonProps["size"]>, string> = {
  default: "h-10 px-4 py-2 text-sm",
  sm:      "h-8 px-3 text-xs",
  lg:      "h-11 px-8 text-base",
  icon:    "h-10 w-10",
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(
          "inline-flex items-center justify-center rounded-lg font-semibold transition-all duration-150",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50",
          "disabled:pointer-events-none disabled:opacity-40",
          "font-[family-name:var(--font-syne)]",
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"
