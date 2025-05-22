"use client"
import * as React from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"

export interface FooterProps {
  className?: string
}

export function Footer({ className }: FooterProps) {
  return (
    <div className={cn("w-full", className)}>
      <Separator />
      <div className="grid grid-cols-1 gap-8 py-8 md:grid-cols-4">
        <div className="flex flex-col gap-2">
          <h3 className="text-lg font-semibold">Zephyros</h3>
          <p className="text-sm text-muted-foreground">
            Next-generation blockchain solutions for the modern web.
          </p>
        </div>
        
        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-semibold">Products</h3>
          <nav className="flex flex-col gap-2">
            <Link href="/products/wallets" className="text-sm text-muted-foreground hover:text-foreground">
              Wallets
            </Link>
            <Link href="/products/exchanges" className="text-sm text-muted-foreground hover:text-foreground">
              Exchanges
            </Link>
            <Link href="/products/defi" className="text-sm text-muted-foreground hover:text-foreground">
              DeFi Solutions
            </Link>
            <Link href="/products/nft" className="text-sm text-muted-foreground hover:text-foreground">
              NFT Marketplace
            </Link>
          </nav>
        </div>
        
        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-semibold">Resources</h3>
          <nav className="flex flex-col gap-2">
            <Link href="/docs" className="text-sm text-muted-foreground hover:text-foreground">
              Documentation
            </Link>
            <Link href="/blog" className="text-sm text-muted-foreground hover:text-foreground">
              Blog
            </Link>
            <Link href="/support" className="text-sm text-muted-foreground hover:text-foreground">
              Support
            </Link>
            <Link href="/faq" className="text-sm text-muted-foreground hover:text-foreground">
              FAQ
            </Link>
          </nav>
        </div>
        
        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-semibold">Legal</h3>
          <nav className="flex flex-col gap-2">
            <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground">
              Terms of Service
            </Link>
            <Link href="/cookies" className="text-sm text-muted-foreground hover:text-foreground">
              Cookie Policy
            </Link>
          </nav>
        </div>
      </div>
      
      <Separator />
      <div className="flex flex-col items-center justify-between gap-4 py-6 md:flex-row">
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Zephyros. All rights reserved.
        </p>
        <div className="flex gap-4">
          <Link href="https://twitter.com" className="text-muted-foreground hover:text-foreground">
            Twitter
          </Link>
          <Link href="https://github.com" className="text-muted-foreground hover:text-foreground">
            GitHub
          </Link>
          <Link href="https://discord.com" className="text-muted-foreground hover:text-foreground">
            Discord
          </Link>
        </div>
      </div>
    </div>
  )
}
