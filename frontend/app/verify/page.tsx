"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { CustomButton } from "@/components/ui/custom-button"
import { QRScanner } from "@/components/ui/qr-scanner"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { QrCode, Search, ArrowRight } from "lucide-react"

export default function VerifyPage() {
  const router = useRouter()
  const [productId, setProductId] = useState("")
  const [showScanner, setShowScanner] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleScan = (result: string) => {
    setShowScanner(false)

    // Extract product ID from URL if it's a valid product URL
    if (result.includes("/product/")) {
      const scannedId = result.split("/product/")[1]
      router.push(`/verify/${scannedId}`)
    } else {
      // Assume the QR code contains just the product ID
      router.push(`/verify/${result}`)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!productId.trim()) return

    setIsSubmitting(true)
    router.push(`/verify/${productId}`)
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header showWalletConnect={false} />

      <main className="flex flex-1 items-center justify-center bg-gray-50 p-4">
        <Card className="mx-auto w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Verify Product Authenticity</CardTitle>
            <CardDescription>Scan a QR code or enter a product ID to verify its authenticity</CardDescription>
          </CardHeader>
          <CardContent>
            {showScanner ? (
              <div className="space-y-4">
                <QRScanner onScan={handleScan} />
                <CustomButton variant="outline" className="w-full" onClick={() => setShowScanner(false)}>
                  Enter ID Manually
                </CustomButton>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex flex-col items-center justify-center gap-4">
                  <CustomButton
                    variant="outline-brand"
                    className="w-full"
                    leftIcon={<QrCode className="h-5 w-5" />}
                    onClick={() => setShowScanner(true)}
                  >
                    Scan QR Code
                  </CustomButton>

                  <div className="flex w-full items-center">
                    <div className="h-px flex-1 bg-gray-200" />
                    <span className="px-2 text-sm text-muted-foreground">OR</span>
                    <div className="h-px flex-1 bg-gray-200" />
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="productId">Product ID</Label>
                    <Input
                      id="productId"
                      placeholder="Enter product ID (e.g. PRD-12345)"
                      value={productId}
                      onChange={(e) => setProductId(e.target.value)}
                      disabled={isSubmitting}
                    />
                  </div>

                  <CustomButton
                    type="submit"
                    variant="brand"
                    className="w-full"
                    rightIcon={<ArrowRight className="h-4 w-4" />}
                    isLoading={isSubmitting}
                    disabled={!productId.trim()}
                  >
                    Verify Product
                  </CustomButton>
                </form>

                <div className="rounded-lg bg-[#1E88E5]/10 p-4 text-sm text-[#1E88E5]">
                  <p className="flex items-start gap-2">
                    <Search className="mt-0.5 h-4 w-4 flex-shrink-0" />
                    <span>
                      Looking for a specific product? Enter the product ID found on the packaging or scan the QR code.
                    </span>
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  )
}
