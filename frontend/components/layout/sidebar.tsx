"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { 
  LayoutDashboard, 
  Wallet, 
  BarChart3, 
  Settings, 
  Users, 
  ShoppingCart, 
  Bell, 
  HelpCircle,
  LogOut
} from "lucide-react"

export interface SidebarProps {
  className?: string
}

interface SidebarItem {
  title: string
  href: string
  icon: React.ReactNode
  submenu?: { title: string; href: string }[]
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()
  const [openSubmenu, setOpenSubmenu] = React.useState<string | null>(null)

  const sidebarItems: SidebarItem[] = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      title: "Wallet",
      href: "/wallet",
      icon: <Wallet className="h-5 w-5" />,
      submenu: [
        { title: "Overview", href: "/wallet" },
        { title: "Send", href: "/wallet/send" },
        { title: "Receive", href: "/wallet/receive" },
        { title: "History", href: "/wallet/history" },
      ],
    },
    {
      title: "Analytics",
      href: "/analytics",
      icon: <BarChart3 className="h-5 w-5" />,
    },
    {
      title: "Products",
      href: "/products",
      icon: <ShoppingCart className="h-5 w-5" />,
      submenu: [
        { title: "All Products", href: "/products" },
        { title: "Wallets", href: "/products/wallets" },
        { title: "Exchanges", href: "/products/exchanges" },
        { title: "DeFi", href: "/products/defi" },
      ],
    },
    {
      title: "Notifications",
      href: "/notifications",
      icon: <Bell className="h-5 w-5" />,
    },
    {
      title: "Users",
      href: "/users",
      icon: <Users className="h-5 w-5" />,
    },
    {
      title: "Settings",
      href: "/settings",
      icon: <Settings className="h-5 w-5" />,
    },
    {
      title: "Help & Support",
      href: "/support",
      icon: <HelpCircle className="h-5 w-5" />,
    },
  ]

  const toggleSubmenu = (title: string) => {
    if (openSubmenu === title) {
      setOpenSubmenu(null)
    } else {
      setOpenSubmenu(title)
    }
  }

  return (
    <div className={cn("flex h-full flex-col", className)}>
      <div className="flex h-14 items-center border-b px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          Zephyros
        </Link>
      </div>
      <ScrollArea className="flex-1 px-3 py-2">
        <nav className="flex flex-col gap-1">
          {sidebarItems.map((item) => (
            <React.Fragment key={item.title}>
              {item.submenu ? (
                <div className="flex flex-col">
                  <button
                    onClick={() => toggleSubmenu(item.title)}
                    className={cn(
                      "flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                      pathname.startsWith(item.href) && "bg-accent text-accent-foreground"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      {item.icon}
                      {item.title}
                    </div>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className={cn(
                        "h-4 w-4 transition-transform",
                        openSubmenu === item.title && "rotate-180"
                      )}
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>
                  {openSubmenu === item.title && (
                    <div className="ml-6 mt-1 flex flex-col gap-1">
                      {item.submenu.map((subitem) => (
                        <Link
                          key={subitem.title}
                          href={subitem.href}
                          className={cn(
                            "rounded-md px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground",
                            pathname === subitem.href && "bg-accent/50 font-medium text-accent-foreground"
                          )}
                        >
                          {subitem.title}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                    pathname === item.href && "bg-accent text-accent-foreground"
                  )}
                >
                  {item.icon}
                  {item.title}
                </Link>
              )}
            </React.Fragment>
          ))}
        </nav>
      </ScrollArea>
      <div className="mt-auto border-t p-4">
        <Link
          href="/logout"
          className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/10"
        >
          <LogOut className="h-5 w-5" />
          Logout
        </Link>
      </div>
    </div>
  )
}
