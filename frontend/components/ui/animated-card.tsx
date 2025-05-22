"use client"

import * as React from "react"
import { motion, HTMLMotionProps } from "framer-motion"
import { cn } from "@/lib/utils"

interface AnimatedCardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 
  'onDrag' | 'onDragStart' | 'onDragEnd' | 'onAnimationStart' | 'onAnimationComplete'> {
  children: React.ReactNode
  className?: string
  hoverEffect?: "lift" | "glow" | "border" | "scale" | "tilt" | "none"
  clickEffect?: boolean
}

export function AnimatedCard({
  children,
  className,
  hoverEffect = "lift",
  clickEffect = true,
  ...props
}: AnimatedCardProps) {
  const getHoverAnimation = () => {
    switch (hoverEffect) {
      case "lift":
        return { y: -8, transition: { duration: 0.2 } }
      case "glow":
        return { boxShadow: "0 0 20px rgba(var(--card-foreground-rgb) / 0.15)" }
      case "border":
        return { boxShadow: "0 0 0 2px var(--primary)" }
      case "scale":
        return { scale: 1.02, transition: { duration: 0.2 } }
      case "tilt":
        return {}
      case "none":
        return {}
      default:
        return { y: -8 }
    }
  }

  const [isTilting, setIsTilting] = React.useState(false)
  const [tiltPosition, setTiltPosition] = React.useState({ x: 0, y: 0 })
  const cardRef = React.useRef<HTMLDivElement>(null)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (hoverEffect !== "tilt" || !cardRef.current) return
    
    const rect = cardRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    
    const tiltX = (y - centerY) / 10
    const tiltY = (centerX - x) / 10
    
    setTiltPosition({ x: tiltX, y: tiltY })
  }

  return (
    <motion.div
      ref={cardRef}
      className={cn(
        "rounded-lg border bg-card text-card-foreground shadow-sm transition-all duration-200",
        className
      )}
      whileHover={getHoverAnimation()}
      whileTap={clickEffect ? { scale: 0.98 } : undefined}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsTilting(true)}
      onMouseLeave={() => {
        setIsTilting(false)
        setTiltPosition({ x: 0, y: 0 })
      }}
      style={{
        transform: isTilting 
          ? `perspective(1000px) rotateX(${tiltPosition.x}deg) rotateY(${tiltPosition.y}deg)` 
          : undefined
      }}
      {...props}
    >
      {children}
    </motion.div>
  )
}