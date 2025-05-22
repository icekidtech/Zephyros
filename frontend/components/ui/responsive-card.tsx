"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface ResponsiveCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  animation?: "fade" | "slide" | "scale" | "none"
  delay?: number
  className?: string
  hoverEffect?: boolean
}

export function ResponsiveCard({
  children,
  animation = "fade",
  delay = 0,
  className,
  hoverEffect = true,
  ...props
}: ResponsiveCardProps) {
  const getAnimationVariants = () => {
    switch (animation) {
      case "fade":
        return {
          hidden: { opacity: 0 },
          visible: { opacity: 1 }
        }
      case "slide":
        return {
          hidden: { y: 20, opacity: 0 },
          visible: { y: 0, opacity: 1 }
        }
      case "scale":
        return {
          hidden: { scale: 0.95, opacity: 0 },
          visible: { scale: 1, opacity: 1 }
        }
      case "none":
      default:
        return {
          hidden: {},
          visible: {}
        }
    }
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={getAnimationVariants()}
      transition={{ duration: 0.4, delay }}
      className={cn(
        "rounded-lg border bg-card p-4 text-card-foreground shadow-sm transition-all duration-200",
        hoverEffect && "hover:shadow-md hover:border-primary/20",
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  )
}