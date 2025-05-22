"use client"

import { useState } from "react"
import Link from "next/link"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { CustomButton } from "@/components/ui/custom-button"
import { QRScanner } from "@/components/ui/qr-scanner"
import { Shield, CheckCircle, Truck, QrCode, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button";

export default function HomePage() {
  const [showScanner, setShowScanner] = useState(false)
  const [scannedCode, setScannedCode] = useState<string | null>(null)

  const handleScan = (result: string) => {
    setScannedCode(result)
    setShowScanner(false)

    // Extract product ID from URL if it's a valid product URL
    if (result.includes("/product/")) {
      const productId = result.split("/product/")[1]
      window.location.href = `/verify/${productId}`
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header showWalletConnect={false} />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-white to-gray-50">
          <div className="container px-4 py-16 md:py-24">
            <div className="grid gap-8 md:grid-cols-2 md:gap-12">
              <div className="flex flex-col justify-center">
                <h1 className="text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
                  <span className="text-[#1E88E5]">Verify</span> Product Authenticity with Blockchain
                </h1>
                <p className="mt-4 text-lg text-muted-foreground md:text-xl">
                  Zephyros SupplyChainGuard provides end-to-end supply chain verification powered by blockchain
                  technology.
                </p>
                <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                  <CustomButton
                    variant="brand"
                    size="lg"
                    leftIcon={<QrCode className="h-5 w-5" />}
                    onClick={() => setShowScanner(true)}
                  >
                    Scan QR Code
                  </CustomButton>
                  <CustomButton variant="outline-brand" size="lg" asChild>
                    <Link href="/verify">Manual Lookup</Link>
                  </CustomButton>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="relative h-64 w-64 md:h-80 md:w-80">
                  <div className="absolute inset-0 rounded-full bg-[#1E88E5]/10" />
                  <div className="absolute inset-4 rounded-full bg-[#1E88E5]/20" />
                  <div className="absolute inset-8 flex items-center justify-center rounded-full bg-[#1E88E5]">
                    <Shield className="h-20 w-20 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* QR Scanner Modal */}
        {showScanner && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-lg bg-white p-6">
              <h2 className="mb-4 text-xl font-bold">Scan Product QR Code</h2>
              <QRScanner onScan={handleScan} />
              <div className="mt-4 flex justify-end">
                <CustomButton variant="outline" onClick={() => setShowScanner(false)}>
                  Cancel
                </CustomButton>
              </div>
            </div>
          </div>
        )}

        {/* Features Section */}
        <section className="py-16">
          <div className="container px-4">
            <h2 className="text-center text-3xl font-bold md:text-4xl">How It Works</h2>
            <p className="mx-auto mt-4 max-w-2xl text-center text-muted-foreground">
              Our blockchain-powered platform ensures transparency and trust throughout the entire supply chain.
            </p>

            <div className="mt-12 grid gap-8 md:grid-cols-3">
              <div className="rounded-lg border p-6 transition-all hover:shadow-md">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#1E88E5]/10 text-[#1E88E5]">
                  <Shield className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-medium">Secure Registration</h3>
                <p className="mt-2 text-muted-foreground">
                  Products are securely registered on the blockchain with unique identifiers and detailed information.
                </p>
              </div>

              <div className="rounded-lg border p-6 transition-all hover:shadow-md">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#00ACC1]/10 text-[#00ACC1]">
                  <Truck className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-medium">Supply Chain Tracking</h3>
                <p className="mt-2 text-muted-foreground">
                  Every step in the supply chain is recorded and verified by authorized partners.
                </p>
              </div>

              <div className="rounded-lg border p-6 transition-all hover:shadow-md">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#43A047]/10 text-[#43A047]">
                  <CheckCircle className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-medium">Instant Verification</h3>
                <p className="mt-2 text-muted-foreground">
                  Consumers can instantly verify product authenticity by scanning a QR code or entering a product ID.
                </p>
              </div>
            </div>

            <div className="mt-12 text-center">
              <CustomButton variant="outline-brand" rightIcon={<ArrowRight className="h-4 w-4" />} asChild>
                <Link href="/about">Learn More About Our Technology</Link>
              </CustomButton>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-[#1E88E5]">
          <div className="container px-4 py-16">
            <div className="mx-auto max-w-3xl text-center text-white">
              <h2 className="text-3xl font-bold md:text-4xl">Ready to Secure Your Supply Chain?</h2>
              <p className="mt-4 text-lg opacity-90">
                Join leading brands using Zephyros SupplyChainGuard to ensure product authenticity and build consumer
                trust.
              </p>
              <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
                <CustomButton variant="default" size="lg" className="bg-white text-[#1E88E5] hover:bg-gray-100" asChild>
                  <Link href="/signup">Get Started</Link>
                </CustomButton>
                <CustomButton variant="outline" size="lg" className="border-white text-white hover:bg-white/10" asChild>
                  <Link href="/contact">Contact Sales</Link>
                </CustomButton>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

// Delete or comment out these lines that are causing the error
// <CustomButton variant="brand" size="lg">
//   Connect Wallet
// </CustomButton>
