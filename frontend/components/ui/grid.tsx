import React from "react"
import { cn } from "@/lib/utils"

interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  cols?: number | { sm?: number; md?: number; lg?: number; xl?: number }
  gap?: number | string
}

export function Grid({
  children,
  className,
  cols = { sm: 1, md: 2, lg: 3, xl: 4 },
  gap = 4,
  ...props
}: GridProps) {
  const getColsClass = () => {
    if (typeof cols === "number") {
      return `grid-cols-${cols}`
    }

    const { sm = 1, md, lg, xl } = cols
    return cn(
      `grid-cols-${sm}`,
      md && `md:grid-cols-${md}`,
      lg && `lg:grid-cols-${lg}`,
      xl && `xl:grid-cols-${xl}`
    )
  }

  const gapClass = typeof gap === "number" ? `gap-${gap}` : `gap-${gap}`

  return (
    <div
      className={cn("grid", getColsClass(), gapClass, className)}
      {...props}
    >
      {children}
    </div>
  )
}