"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { SupplyChainTimeline } from "@/components/ui/supply-chain-timeline"
import { VerificationBadge } from "@/components/ui/verification-badge"
import { QRGenerator } from "@/components/ui/qr-generator"
import { CustomButton } from "@/components/ui/custom-button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Share2, Download, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function VerifyProductPage() {
  const params = useParams()
  const productId = params.id as string
  const [isLoading, setIsLoading] = useState(true)

  // Mock product data
  const [product, setProduct] = useState<any>(null)

  useEffect(() => {
    // Simulate API call to fetch product data
    const fetchProduct = async () => {
      setIsLoading(true)

      try {
        // In a real app, this would be an API call
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Mock data
        setProduct({
          id: productId,
          name: "Premium Coffee Beans",
          description: "Single-origin arabica coffee beans from Ethiopia",
          manufacturer: "Zephyros Coffee Co.",
          manufacturingDate: "2023-05-15",
          batchNumber: "BATCH-2023-05-15-001",
          status: "verified",
          verificationCount: 5,
          lastVerified: "2023-06-10",
          supplyChainSteps: [
            {
              title: "Manufacturing",
              description: "Product manufactured at Zephyros Coffee Co. facility",
              timestamp: "May 15, 2023",
              status: "verified",
              verifier: "0x1234567890abcdef1234567890abcdef12345678",
              transactionHash: "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
            },
            {
              title: "Quality Control",
              description: "Product passed quality control inspection",
              timestamp: "May 16, 2023",
              status: "verified",
              verifier: "0x1234567890abcdef1234567890abcdef12345678",
              transactionHash: "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
            },
            {
              title: "Distribution Center",
              description: "Product arrived at distribution center",
              timestamp: "May 20, 2023",
              status: "verified",
              verifier: "0x1234567890abcdef1234567890abcdef12345678",
              transactionHash: "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
            },
            {
              title: "Retailer",
              description: "Product received by retailer",
              timestamp: "June 1, 2023",
              status: "verified",
              verifier: "0x1234567890abcdef1234567890abcdef12345678",
              transactionHash: "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
            },
            {
              title: "Final Verification",
              description: "Product verified at point of sale",
              timestamp: "June 10, 2023",
              status: "verified",
              verifier: "0x1234567890abcdef1234567890abcdef12345678",
              transactionHash: "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
            },
          ],
        })
      } catch (error) {
        console.error("Error fetching product:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProduct()
  }, [productId])

  return (
    <div className="flex min-h-screen flex-col">
      <Header showWalletConnect={false} />

      <main className="flex-1 bg-gray-50 py-8">
        <div className="container px-4">
          <div className="mb-6">
            <Link
              href="/verify"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="mr-1 h-4 w-4" />
              Back to Verification
            </Link>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              <div className="h-8 w-1/3 animate-pulse rounded-md bg-gray-200" />
              <div className="h-64 animate-pulse rounded-lg bg-gray-200" />
            </div>
          ) : product ? (
            <div className="space-y-8">
              <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                  <h1 className="text-3xl font-bold">{product.name}</h1>
                  <p className="text-muted-foreground">Product ID: {product.id}</p>
                </div>
                <VerificationBadge 
                  variant={product.status} 
                  className="text-base"
                  productId={product.id} // Enable real-time updates
                  pollingInterval={15000} // Check every 15 seconds
                />
              </div>

              <Tabs defaultValue="details">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="details">Product Details</TabsTrigger>
                  <TabsTrigger value="supply-chain">Supply Chain</TabsTrigger>
                  <TabsTrigger value="verification">Verification</TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Product Information</CardTitle>
                      <CardDescription>Detailed information about this product</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-4">
                          <div>
                            <h3 className="text-sm font-medium text-muted-foreground">Description</h3>
                            <p>{product.description}</p>
                          </div>

                          <div>
                            <h3 className="text-sm font-medium text-muted-foreground">Manufacturer</h3>
                            <p>{product.manufacturer}</p>
                          </div>

                          <div>
                            <h3 className="text-sm font-medium text-muted-foreground">Manufacturing Date</h3>
                            <p>{product.manufacturingDate}</p>
                          </div>

                          <div>
                            <h3 className="text-sm font-medium text-muted-foreground">Batch Number</h3>
                            <p>{product.batchNumber}</p>
                          </div>
                        </div>

                        <div className="flex flex-col items-center justify-center">
                          <QRGenerator
                            value={`https://zephyros.verify/product/${product.id}`}
                            size={200}
                            title="Product QR Code"
                          />
                          <div className="mt-4 flex gap-2">
                            <CustomButton variant="outline" size="sm" leftIcon={<Download className="h-4 w-4" />}>
                              Download
                            </CustomButton>
                            <CustomButton variant="outline" size="sm" leftIcon={<Share2 className="h-4 w-4" />}>
                              Share
                            </CustomButton>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="supply-chain" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Supply Chain Journey</CardTitle>
                      <CardDescription>Track this product's journey from manufacturing to retail</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <SupplyChainTimeline steps={product.supplyChainSteps} />
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="verification" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Verification Details</CardTitle>
                      <CardDescription>Information about this product's blockchain verification</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <div className="rounded-lg border p-4">
                          <h3 className="font-medium">Verification Summary</h3>
                          <div className="mt-2 grid gap-2 md:grid-cols-2">
                            <div>
                              <p className="text-sm text-muted-foreground">Verification Status</p>
                              <VerificationBadge variant={product.status} className="mt-1" />
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Verification Count</p>
                              <p className="font-medium">{product.verificationCount} verifications</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Last Verified</p>
                              <p className="font-medium">{product.lastVerified}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Blockchain Network</p>
                              <p className="font-medium">Avalanche</p>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h3 className="font-medium">Verification Certificates</h3>
                          <div className="mt-2 space-y-2">
                            {product.supplyChainSteps.map((step: any, index: number) => (
                              <div key={index} className="rounded-lg border p-3">
                                <div className="flex items-center justify-between">
                                  <h4 className="font-medium">{step.title} Certificate</h4>
                                  <VerificationBadge variant={step.status} />
                                </div>
                                <p className="mt-1 text-sm text-muted-foreground">Verified on {step.timestamp}</p>
                                <div className="mt-2 flex gap-2">
                                  <CustomButton variant="outline" size="sm">
                                    View Certificate
                                  </CustomButton>
                                  <CustomButton variant="outline" size="sm">
                                    Verify on Blockchain
                                  </CustomButton>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            ) : (
              <div className="rounded-lg border bg-white p-8 text-center">
                <h2 className="text-xl font-bold">Product Not Found</h2>
                <p className="mt-2 text-muted-foreground">We couldn't find a product with ID: {productId}</p>
                <CustomButton variant="brand" className="mt-4" asChild>
                  <Link href="/verify">Try Another Product</Link>
                </CustomButton>
              </div>
            )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
