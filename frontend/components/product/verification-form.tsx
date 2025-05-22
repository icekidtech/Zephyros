"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { CustomButton } from "../ui/custom-button"
import { useTransaction } from "@/hooks/use-transaction"
import { TransactionStatus } from "@/components/blockchain/transaction-status"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, CheckCircle } from "lucide-react"

const verificationSchema = z.object({
  verificationNotes: z.string().min(10, { message: "Notes must be at least 10 characters" }),
  location: z.string().min(1, { message: "Location is required" }),
  temperature: z.string().optional(),
  humidity: z.string().optional(),
  inspectorName: z.string().min(1, { message: "Inspector name is required" }),
  inspectorId: z.string().min(1, { message: "Inspector ID is required" }),
})

type VerificationFormValues = z.infer<typeof verificationSchema>

export interface VerificationFormProps {
  productId: string
  productName: string
  verificationStep: string
  onSubmit?: (values: VerificationFormValues) => Promise<void>
  className?: string
  contract?: any
}

export function VerificationForm({
  productId,
  productName,
  verificationStep,
  onSubmit,
  className,
  contract,
}: VerificationFormProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [files, setFiles] = React.useState<File[]>([])
  const { executeTransaction, status: txStatus, txHash, error: txError } = useTransaction()

  const form = useForm<VerificationFormValues>({
    resolver: zodResolver(verificationSchema),
    defaultValues: {
      verificationNotes: "",
      location: "",
      temperature: "",
      humidity: "",
      inspectorName: "",
      inspectorId: "",
    },
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files))
    }
  }

  async function handleSubmit(values: VerificationFormValues) {
    setIsSubmitting(true)

    try {
      if (onSubmit) {
        await onSubmit(values)
      } else if (contract) {
        // Use blockchain contract to verify product
        await executeTransaction(
          contract.verifyProduct.bind(contract),
          productId,
          verificationStep,
          values.verificationNotes,
          values.location,
          values.inspectorName,
          values.inspectorId,
        )
      } else {
        // Default implementation - replace with actual logic
        console.log("Verification form submitted:", { productId, values, files })
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000))
      }
    } catch (error) {
      console.error("Verification error:", error)
      form.setError("root", {
        message: "An error occurred during verification. Please try again.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className={cn("space-y-6", className)}>
      <Card>
        <CardHeader>
          <CardTitle>Verify Product</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 rounded-lg bg-[#1E88E5]/10 p-4">
            <div className="grid gap-1">
              <div className="grid grid-cols-2">
                <span className="text-sm font-medium text-muted-foreground">Product ID:</span>
                <span className="text-sm">{productId}</span>
              </div>
              <div className="grid grid-cols-2">
                <span className="text-sm font-medium text-muted-foreground">Product Name:</span>
                <span className="text-sm">{productName}</span>
              </div>
              <div className="grid grid-cols-2">
                <span className="text-sm font-medium text-muted-foreground">Verification Step:</span>
                <span className="text-sm">{verificationStep}</span>
              </div>
            </div>
          </div>

          <form className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="verificationNotes">Verification Notes</Label>
              <Textarea
                id="verificationNotes"
                placeholder="Enter verification details"
                disabled={isSubmitting}
                {...form.register("verificationNotes")}
              />
              {form.formState.errors.verificationNotes && (
                <p className="text-sm text-red-500">{form.formState.errors.verificationNotes.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="Enter verification location"
                disabled={isSubmitting}
                {...form.register("location")}
              />
              {form.formState.errors.location && (
                <p className="text-sm text-red-500">{form.formState.errors.location.message}</p>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="temperature">Temperature (Optional)</Label>
                <Input
                  id="temperature"
                  placeholder="e.g. 22°C"
                  disabled={isSubmitting}
                  {...form.register("temperature")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="humidity">Humidity (Optional)</Label>
                <Input id="humidity" placeholder="e.g. 45%" disabled={isSubmitting} {...form.register("humidity")} />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="inspectorName">Inspector Name</Label>
                <Input
                  id="inspectorName"
                  placeholder="Enter inspector name"
                  disabled={isSubmitting}
                  {...form.register("inspectorName")}
                />
                {form.formState.errors.inspectorName && (
                  <p className="text-sm text-red-500">{form.formState.errors.inspectorName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="inspectorId">Inspector ID</Label>
                <Input
                  id="inspectorId"
                  placeholder="Enter inspector ID"
                  disabled={isSubmitting}
                  {...form.register("inspectorId")}
                />
                {form.formState.errors.inspectorId && (
                  <p className="text-sm text-red-500">{form.formState.errors.inspectorId.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Supporting Documents (Optional)</Label>
              <div className="rounded-lg border border-dashed p-4">
                <div className="flex flex-col items-center justify-center gap-2">
                  <Upload className="h-8 w-8 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Drag and drop files here or click to browse</p>
                  <Input id="files" type="file" multiple className="hidden" onChange={handleFileChange} />
                  <CustomButton
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById("files")?.click()}
                  >
                    Browse Files
                  </CustomButton>
                </div>

                {files.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <p className="text-sm font-medium">Selected Files:</p>
                    <ul className="space-y-1">
                      {files.map((file, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          {file.name}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            <TransactionStatus status={txStatus} txHash={txHash} errorMessage={txError?.message} />

            {form.formState.errors.root && (
              <div className="rounded-md bg-red-50 p-3 text-sm text-red-500">{form.formState.errors.root.message}</div>
            )}
          </form>
        </CardContent>
        <CardFooter>
          <CustomButton
            onClick={form.handleSubmit(handleSubmit)}
            variant="brand"
            className="w-full"
            isLoading={isSubmitting}
          >
            Submit Verification
          </CustomButton>
        </CardFooter>
      </Card>
    </div>
  )
}
