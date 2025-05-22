"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { usePathname } from "next/navigation"
import { useMobile } from "@/hooks/use-mobile"
import { Menu, X } from "lucide-react"
import { CustomButton } from "../ui/custom-button"
import { motion, AnimatePresence } from "framer-motion"

export interface AppShellProps {
  children: React.ReactNode
  sidebar?: React.ReactNode
  header?: React.ReactNode
  footer?: React.ReactNode
  className?: string
  sidebarWidth?: string
}

export function AppShell({ 
  children, 
  sidebar, 
  header, 
  footer, 
  className,
  sidebarWidth = "w-64" 
}: AppShellProps) {
  const pathname = usePathname()
  const isMobile = useMobile()
  const [sidebarOpen, setSidebarOpen] = React.useState(false)

  // Close sidebar when route changes
  React.useEffect(() => {
    setSidebarOpen(false)
  }, [pathname])

  // Close sidebar when screen size changes from mobile to desktop
  React.useEffect(() => {
    if (!isMobile) {
      setSidebarOpen(false)
    }
  }, [isMobile])

  return (
    <div className="relative flex min-h-screen flex-col bg-background">
      {header && (
        <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-sm">
          <div className="flex h-16 items-center justify-between px-4 md:px-6">
            {sidebar && isMobile && (
              <CustomButton 
                variant="ghost" 
                size="icon" 
                onClick={() => setSidebarOpen(!sidebarOpen)} 
                className="mr-2 transition-all duration-200 hover:bg-accent"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </CustomButton>
            )}
            {header}
          </div>
        </header>
      )}

      <div className="flex flex-1">
        {sidebar && (
          <>
            {/* Mobile sidebar */}
            <AnimatePresence>
              {isMobile && sidebarOpen && (
                <>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
                    onClick={() => setSidebarOpen(false)}
                  />
                  <motion.div
                    initial={{ x: "-100%" }}
                    animate={{ x: 0 }}
                    exit={{ x: "-100%" }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                    className={cn(
                      "fixed inset-y-0 left-0 z-50 w-full max-w-xs border-r bg-background p-6 shadow-lg",
                      sidebarWidth
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-semibold">Menu</span>
                      <CustomButton variant="ghost" size="icon" onClick={() => setSidebarOpen(false)}>
                        <X className="h-5 w-5" />
                        <span className="sr-only">Close menu</span>
                      </CustomButton>
                    </div>
                    <div className="mt-6">{sidebar}</div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>

            {/* Desktop sidebar */}
            {!isMobile && (
              <div className={cn("hidden flex-shrink-0 border-r md:block", sidebarWidth)}>
                <div className="sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-rounded scrollbar-thumb-muted-foreground/20 hover:scrollbar-thumb-muted-foreground/30">
                  {sidebar}
                </div>
              </div>
            )}
          </>
        )}

        <main className={cn("flex-1", className)}>
          <div className="container px-4 py-6 md:px-6 md:py-8">{children}</div>
        </main>
      </div>

      {footer && (
        <footer className="border-t bg-background">
          <div className="container px-4 py-6 md:px-6">{footer}</div>
        </footer>
      )}
    </div>
  )
}
