import React from "react"
import { cn } from "@/lib/utils"
import { Slot } from "@radix-ui/react-slot"

interface TypographyProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode
  asChild?: boolean
}

export function H1({ className, asChild = false, ...props }: TypographyProps) {
  const Comp = asChild ? Slot : "h1"
  return (
    <Comp
      className={cn(
        "scroll-m-20 text-3xl font-bold tracking-tight sm:text-4xl",
        className
      )}
      {...props}
    />
  )
}

export function H2({ className, asChild = false, ...props }: TypographyProps) {
  const Comp = asChild ? Slot : "h2"
  return (
    <Comp
      className={cn(
        "scroll-m-20 text-2xl font-semibold tracking-tight sm:text-3xl",
        className
      )}
      {...props}
    />
  )
}

export function H3({ className, asChild = false, ...props }: TypographyProps) {
  const Comp = asChild ? Slot : "h3"
  return (
    <Comp
      className={cn(
        "scroll-m-20 text-xl font-semibold tracking-tight sm:text-2xl",
        className
      )}
      {...props}
    />
  )
}

export function H4({ className, asChild = false, ...props }: TypographyProps) {
  const Comp = asChild ? Slot : "h4"
  return (
    <Comp
      className={cn(
        "scroll-m-20 text-lg font-semibold tracking-tight",
        className
      )}
      {...props}
    />
  )
}

export function P({ className, asChild = false, ...props }: TypographyProps) {
  const Comp = asChild ? Slot : "p"
  return (
    <Comp
      className={cn("leading-7 [&:not(:first-child)]:mt-6", className)}
      {...props}
    />
  )
}

export function Lead({ className, asChild = false, ...props }: TypographyProps) {
  const Comp = asChild ? Slot : "p"
  return (
    <Comp
      className={cn("text-lg text-muted-foreground sm:text-xl", className)}
      {...props}
    />
  )
}

export function Large({ className, asChild = false, ...props }: TypographyProps) {
  const Comp = asChild ? Slot : "div"
  return (
    <Comp
      className={cn("text-lg font-semibold", className)}
      {...props}
    />
  )
}

export function Small({ className, asChild = false, ...props }: TypographyProps) {
  const Comp = asChild ? Slot : "small"
  return (
    <Comp
      className={cn("text-sm font-medium leading-none", className)}
      {...props}
    />
  )
}

export function Muted({ className, asChild = false, ...props }: TypographyProps) {
  const Comp = asChild ? Slot : "p"
  return (
    <Comp
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}