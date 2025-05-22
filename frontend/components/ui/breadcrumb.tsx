"use client"

import * as React from "react"
import Link from "next/link"
import { ChevronRight, Home } from "lucide-react"
import { cn } from "@/lib/utils"
import { usePathname } from "next/navigation"

export interface BreadcrumbItem {
  label: string
  href: string
  active?: boolean
}

export interface BreadcrumbProps {
  items?: BreadcrumbItem[]
  homeHref?: string
  className?: string
  separator?: React.ReactNode
  autoGenerate?: boolean
}

export function Breadcrumb({
  items: propItems,
  homeHref = "/",
  className,
  separator = <ChevronRight className="h-4 w-4" />,
  autoGenerate = false,
}: BreadcrumbProps) {
  const pathname = usePathname()
  
  // Auto-generate breadcrumbs from pathname if no items provided
  const items = React.useMemo(() => {
    if (propItems && propItems.length > 0) return propItems
    
    if (autoGenerate && pathname) {
      const segments = pathname.split('/').filter(Boolean)
      
      return segments.map((segment, index) => {
        const href = `/${segments.slice(0, index + 1).join('/')}`
        const label = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ')
        
        return {
          label,
          href,
          active: index === segments.length - 1
        }
      })
    }
    
    return []
  }, [propItems, pathname, autoGenerate])

  return (
    <nav className={cn("flex items-center text-sm", className)} aria-label="Breadcrumb">
      <ol className="flex items-center flex-wrap">
        <li className="flex items-center">
          <Link 
            href={homeHref}
            className="flex items-center text-muted-foreground hover:text-foreground"
          >
            <Home className="h-4 w-4" />
            <span className="sr-only">Home</span>
          </Link>
        </li>
        
        {items.map((item, index) => (
          <li key={item.href} className="flex items-center">
            <span className="mx-2 text-muted-foreground" aria-hidden="true">
              {separator}
            </span>
            {item.active ? (
              <span className="font-medium" aria-current="page">
                {item.label}
              </span>
            ) : (
              <Link
                href={item.href}
                className="text-muted-foreground hover:text-foreground"
              >
                {item.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
