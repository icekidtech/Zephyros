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
import { FormStepper } from "../ui/form-stepper"
import { useTransaction } from "@/hooks/use-transaction"
import { TransactionStatus } from "@/components/blockchain/transaction-status"

const productSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  description: z.string().min(10, { message: "Description must be at least 10 characters" }),
  category: z.string().min(1, { message: "Category is required" }),
  sku: z.string().min(1, { message: "SKU is required" }),
  manufacturer: z.string().min(1, { message: "Manufacturer is required" }),
  manufacturingDate: z.string().min(1, { message: "Manufacturing date is required" }),
  expiryDate: z.string().optional(),
  batchNumber: z.string().min(1, { message: "Batch number is required" }),
  additionalInfo: z.string().optional(),
})

type ProductFormValues = z.infer<typeof productSchema>

export interface ProductRegistrationFormProps {
  onSubmit?: (values: ProductFormValues) => Promise<void>
  className?: string
  contract?: any
}

export function ProductRegistrationForm({ onSubmit, className, contract }: ProductRegistrationFormProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const { executeTransaction, status: txStatus, txHash, error: txError } = useTransaction()

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      category: "",
      sku: "",
      manufacturer: "",
      manufacturingDate: "",
      expiryDate: "",
      batchNumber: "",
      additionalInfo: "",
    },
  })

  async function handleSubmit(values: ProductFormValues) {
    setIsSubmitting(true)

    try {
      if (onSubmit) {
        await onSubmit(values)
      } else if (contract) {
        // Use blockchain contract to register product
        await executeTransaction(
          contract.registerProduct.bind(contract),
          values.name,
          values.description,
          values.category,
          values.sku,
          values.manufacturer,
          values.manufacturingDate,
          values.batchNumber,
        )
      } else {
        // Default implementation - replace with actual logic
        console.log("Product registration form submitted:", values)
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000))
      }
    } catch (error) {
      console.error("Product registration error:", error)
      form.setError("root", {
        message: "An error occurred during product registration. Please try again.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className={cn("space-y-6", className)}>
      <FormStepper>
        <FormStepper.Step title="Basic Information">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Product Name</Label>
              <Input id="name" placeholder="Enter product name" disabled={isSubmitting} {...form.register("name")} />
              {form.formState.errors.name && (
                <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Enter product description"
                disabled={isSubmitting}
                {...form.register("description")}
              />
              {form.formState.errors.description && (
                <p className="text-sm text-red-500">{form.formState.errors.description.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                placeholder="Enter product category"
                disabled={isSubmitting}
                {...form.register("category")}
              />
              {form.formState.errors.category && (
                <p className="text-sm text-red-500">{form.formState.errors.category.message}</p>
              )}
            </div>
          </div>
        </FormStepper.Step>

        <FormStepper.Step title="Manufacturing Details">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="manufacturer">Manufacturer</Label>
              <Input
                id="manufacturer"
                placeholder="Enter manufacturer name"
                disabled={isSubmitting}
                {...form.register("manufacturer")}
              />
              {form.formState.errors.manufacturer && (
                <p className="text-sm text-red-500">{form.formState.errors.manufacturer.message}</p>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="manufacturingDate">Manufacturing Date</Label>
                <Input
                  id="manufacturingDate"
                  type="date"
                  disabled={isSubmitting}
                  {...form.register("manufacturingDate")}
                />
                {form.formState.errors.manufacturingDate && (
                  <p className="text-sm text-red-500">{form.formState.errors.manufacturingDate.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="expiryDate">Expiry Date (Optional)</Label>
                <Input id="expiryDate" type="date" disabled={isSubmitting} {...form.register("expiryDate")} />
                {form.formState.errors.expiryDate && (
                  <p className="text-sm text-red-500">{form.formState.errors.expiryDate.message}</p>
                )}
              </div>
            </div>
          </div>
        </FormStepper.Step>

        <FormStepper.Step title="Identification">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="sku">SKU</Label>
              <Input id="sku" placeholder="Enter product SKU" disabled={isSubmitting} {...form.register("sku")} />
              {form.formState.errors.sku && <p className="text-sm text-red-500">{form.formState.errors.sku.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="batchNumber">Batch Number</Label>
              <Input
                id="batchNumber"
                placeholder="Enter batch number"
                disabled={isSubmitting}
                {...form.register("batchNumber")}
              />
              {form.formState.errors.batchNumber && (
                <p className="text-sm text-red-500">{form.formState.errors.batchNumber.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="additionalInfo">Additional Information (Optional)</Label>
              <Textarea
                id="additionalInfo"
                placeholder="Enter any additional information"
                disabled={isSubmitting}
                {...form.register("additionalInfo")}
              />
              {form.formState.errors.additionalInfo && (
                <p className="text-sm text-red-500">{form.formState.errors.additionalInfo.message}</p>
              )}
            </div>
          </div>
        </FormStepper.Step>

        <FormStepper.Step title="Review & Submit">
          <div className="space-y-4">
            <div className="rounded-lg border p-4">
              <h3 className="font-medium">Product Information</h3>
              <div className="mt-2 space-y-2">
                {Object.entries(form.getValues()).map(([key, value]) => (
                  <div key={key} className="grid grid-cols-2 gap-2">
                    <span className="text-sm font-medium capitalize text-muted-foreground">
                      {key.replace(/([A-Z])/g, " $1").trim()}
                    </span>
                    <span className="text-sm">{value || "-"}</span>
                  </div>
                ))}
              </div>
            </div>

            <TransactionStatus status={txStatus} txHash={txHash} errorMessage={txError?.message} />

            {form.formState.errors.root && (
              <div className="rounded-md bg-red-50 p-3 text-sm text-red-500">{form.formState.errors.root.message}</div>
            )}

            <CustomButton
              onClick={form.handleSubmit(handleSubmit)}
              variant="brand"
              className="w-full"
              isLoading={isSubmitting}
            >
              Register Product
            </CustomButton>
          </div>
        </FormStepper.Step>
      </FormStepper>
    </div>
  )
}
