"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"

const glassCardVariants = cva(
  "rounded-lg border backdrop-blur-md transition-all duration-200",
  {
    variants: {
      variant: {
        default: "bg-background/80 border-border/50",
        primary: "bg-primary/10 border-primary/20 text-primary-foreground",
        secondary: "bg-secondary/30 border-secondary/30 text-secondary-foreground",
        destructive: "bg-destructive/10 border-destructive/20 text-destructive-foreground",
        accent: "bg-accent/40 border-accent/30 text-accent-foreground",
      },
      intensity: {
        light: "backdrop-blur-sm",
        medium: "backdrop-blur-md",
        heavy: "backdrop-blur-lg",
      },
      shadow: {
        none: "",
        sm: "shadow-sm",
        md: "shadow-md",
        lg: "shadow-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      intensity: "medium",
      shadow: "md",
    },
  }
)

export interface GlassCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof glassCardVariants> {
  as?: React.ElementType
}

export const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, variant, intensity, shadow, as: Component = "div", children, ...props }, ref) => {
    return (
      <Component
        ref={ref}
        className={cn(glassCardVariants({ variant, intensity, shadow, className }))}
        {...props}
      >
        {children}
      </Component>
    )
  }
)
GlassCard.displayName = "GlassCard"