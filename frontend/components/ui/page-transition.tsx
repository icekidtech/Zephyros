"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { usePathname } from "next/navigation"

export interface PageTransitionProps {
  children: React.ReactNode
  mode?: "fade" | "slide" | "scale" | "none" | "slideUp" | "fadeScale"
  duration?: number
  className?: string
  delay?: number
}

export function PageTransition({
  children,
  mode = "fade",
  duration = 0.4,
  delay = 0,
  className,
}: PageTransitionProps) {
  const pathname = usePathname()
  
  // Define animation variants based on mode
  const variants = React.useMemo(() => {
    switch (mode) {
      case "fade":
        return {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          exit: { opacity: 0 },
        }
      case "slide":
        return {
          initial: { x: 15, opacity: 0 },
          animate: { x: 0, opacity: 1 },
          exit: { x: -15, opacity: 0 },
        }
      case "slideUp":
        return {
          initial: { y: 20, opacity: 0 },
          animate: { y: 0, opacity: 1 },
          exit: { y: -20, opacity: 0 },
        }
      case "scale":
        return {
          initial: { scale: 0.96, opacity: 0 },
          animate: { scale: 1, opacity: 1 },
          exit: { scale: 0.96, opacity: 0 },
        }
      case "fadeScale":
        return {
          initial: { scale: 0.98, opacity: 0 },
          animate: { scale: 1, opacity: 1, transition: { duration, delay, staggerChildren: 0.1 } },
          exit: { scale: 0.98, opacity: 0 },
        }
      case "none":
      default:
        return {
          initial: {},
          animate: {},
          exit: {},
        }
    }
  }, [mode, delay, duration])

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={variants}
        transition={{ 
          duration, 
          delay,
          ease: "easeInOut" 
        }}
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}