"use client"

import * as React from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger, navigationMenuTriggerStyle } from "@/components/ui/navigation-menu"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/ui/mode-toggle"
import { usePathname } from "next/navigation"

export interface HeaderProps {
  className?: string
}

export function SimpleHeader({ className }: HeaderProps) {
  const pathname = usePathname()
  
  return (
    <div className={cn("flex w-full items-center justify-between", className)}>
      <div className="flex items-center gap-6">
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-xl font-bold">Zephyros</span>
        </Link>
        
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <Link href="/dashboard" legacyBehavior passHref>
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                  Dashboard
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Products</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                  <li className="row-span-3">
                    <NavigationMenuLink asChild>
                      <a
                        className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                        href="/products"
                      >
                        <div className="mb-2 mt-4 text-lg font-medium">
                          All Products
                        </div>
                        <p className="text-sm leading-tight text-muted-foreground">
                          Browse our complete catalog of blockchain products and services
                        </p>
                      </a>
                    </NavigationMenuLink>
                  </li>
                  <li>
                    <Link href="/products/wallets" legacyBehavior passHref>
                      <NavigationMenuLink className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                        <div className="text-sm font-medium leading-none">Wallets</div>
                        <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                          Secure digital wallets for your crypto assets
                        </p>
                      </NavigationMenuLink>
                    </Link>
                  </li>
                  <li>
                    <Link href="/products/exchanges" legacyBehavior passHref>
                      <NavigationMenuLink className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                        <div className="text-sm font-medium leading-none">Exchanges</div>
                        <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                          Trade cryptocurrencies with ease and security
                        </p>
                      </NavigationMenuLink>
                    </Link>
                  </li>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link href="/about" legacyBehavior passHref>
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                  About
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </div>
      
      <div className="flex items-center gap-4">
        <ModeToggle />
        {pathname.includes("/dashboard") ? (
          <Button variant="outline" asChild>
            <Link href="/profile">My Account</Link>
          </Button>
        ) : (
          <>
            <Button variant="outline" asChild>
              <Link href="/login">Sign In</Link>
            </Button>
            <Button asChild>
              <Link href="/signup">Sign Up</Link>
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
import { GasEstimator } from "@/components/blockchain/gas-estimator"
import { Bell, Settings, HelpCircle } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
// Button is already imported above, so we can remove this duplicate import
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export interface HeaderProps {
  logo?: React.ReactNode
  title?: string
  showWalletConnect?: boolean
  showGasEstimator?: boolean
  user?: {
    name: string
    email: string
    image?: string
  }
  onSignOut?: () => void
  className?: string
}

export function Header({
  logo,
  title = "Zephyros SupplyChainGuard",
  showWalletConnect = true,
  showGasEstimator = true,
  user,
  onSignOut,
  className,
}: HeaderProps) {
  return (
    <div className={cn("flex w-full items-center justify-between", className)}>
      <div className="flex items-center gap-2">
        {logo || (
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#1E88E5] text-white">
            <span className="font-bold">Z</span>
          </div>
        )}
        <span className="font-semibold">{title}</span>
      </div>

      <div className="flex items-center gap-2">
        {showGasEstimator && <GasEstimator className="mr-2" />}

        {showWalletConnect && (
          <Button variant="outline" className="mr-2">
            Connect Wallet
          </Button>
        )}

        <Button variant="ghost" size="icon" asChild>
          <Link href="/help">
            <HelpCircle className="h-5 w-5" />
            <span className="sr-only">Help</span>
          </Link>
        </Button>

        <Button variant="ghost" size="icon">
          <Bell className="h-5 w-5" />
          <span className="sr-only">Notifications</span>
        </Button>

        <Button variant="ghost" size="icon" asChild>
          <Link href="/settings">
            <Settings className="h-5 w-5" />
            <span className="sr-only">Settings</span>
          </Link>
        </Button>

        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.image || "/placeholder.svg"} alt={user.name} />
                  <AvatarFallback>
                    {user.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile">Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings">Settings</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onSignOut}>Sign out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  )
}
