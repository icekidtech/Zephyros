"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface StaggeredAnimationProps {
  children: React.ReactNode
  className?: string
  delay?: number
  staggerDelay?: number
  direction?: "up" | "down" | "left" | "right"
  as?: React.ElementType
}

export function StaggeredAnimation({
  children,
  className,
  delay = 0,
  staggerDelay = 0.1,
  direction = "up",
  as: Component = "div",
}: StaggeredAnimationProps) {
  const childrenArray = React.Children.toArray(children)
  
  const getVariants = () => {
    switch (direction) {
      case "up":
        return {
          hidden: { opacity: 0, y: 20 },
          visible: (i: number) => ({
            opacity: 1,
            y: 0,
            transition: {
              delay: delay + i * staggerDelay,
              duration: 0.4,
              ease: "easeOut",
            },
          }),
        }
      case "down":
        return {
          hidden: { opacity: 0, y: -20 },
          visible: (i: number) => ({
            opacity: 1,
            y: 0,
            transition: {
              delay: delay + i * staggerDelay,
              duration: 0.4,
              ease: "easeOut",
            },
          }),
        }
      case "left":
        return {
          hidden: { opacity: 0, x: 20 },
          visible: (i: number) => ({
            opacity: 1,
            x: 0,
            transition: {
              delay: delay + i * staggerDelay,
              duration: 0.4,
              ease: "easeOut",
            },
          }),
        }
      case "right":
        return {
          hidden: { opacity: 0, x: -20 },
          visible: (i: number) => ({
            opacity: 1,
            x: 0,
            transition: {
              delay: delay + i * staggerDelay,
              duration: 0.4,
              ease: "easeOut",
            },
          }),
        }
    }
  }

  const variants = getVariants()

  return (
    <Component className={cn("", className)}>
      {childrenArray.map((child, i) => (
        <motion.div
          key={i}
          custom={i}
          initial="hidden"
          animate="visible"
          variants={variants}
        >
          {child}
        </motion.div>
      ))}
    </Component>
  )
}