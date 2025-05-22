"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CustomButton } from "../ui/custom-button"
import { Checkbox } from "@/components/ui/checkbox"

const signupSchema = z
  .object({
    name: z.string().min(2, { message: "Name must be at least 2 characters" }),
    email: z.string().email({ message: "Please enter a valid email address" }),
    password: z.string().min(8, { message: "Password must be at least 8 characters" }),
    confirmPassword: z.string(),
    acceptTerms: z.boolean().refine((val) => val === true, {
      message: "You must accept the terms and conditions",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

type SignupFormValues = z.infer<typeof signupSchema>

export interface SignupFormProps {
  onSubmit?: (values: SignupFormValues) => Promise<void>
  className?: string
}

export function SignupForm({ onSubmit, className }: SignupFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = React.useState(false)

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      acceptTerms: false,
    },
  })

  async function handleSubmit(values: SignupFormValues) {
    setIsLoading(true)

    try {
      if (onSubmit) {
        await onSubmit(values)
      } else {
        // Default implementation - replace with actual auth logic
        console.log("Signup form submitted:", values)
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000))
        router.push("/dashboard")
      }
    } catch (error) {
      console.error("Signup error:", error)
      form.setError("root", {
        message: "An error occurred during signup. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn("space-y-6", className)}>
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold">Create an Account</h1>
        <p className="text-sm text-muted-foreground">Enter your information to create an account</p>
      </div>

      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input id="name" placeholder="John Doe" autoComplete="name" disabled={isLoading} {...form.register("name")} />
          {form.formState.errors.name && <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="name@example.com"
            autoComplete="email"
            disabled={isLoading}
            {...form.register("email")}
          />
          {form.formState.errors.email && <p className="text-sm text-red-500">{form.formState.errors.email.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            autoComplete="new-password"
            disabled={isLoading}
            {...form.register("password")}
          />
          {form.formState.errors.password && (
            <p className="text-sm text-red-500">{form.formState.errors.password.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="••••••••"
            autoComplete="new-password"
            disabled={isLoading}
            {...form.register("confirmPassword")}
          />
          {form.formState.errors.confirmPassword && (
            <p className="text-sm text-red-500">{form.formState.errors.confirmPassword.message}</p>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox id="acceptTerms" disabled={isLoading} {...form.register("acceptTerms")} />
          <Label htmlFor="acceptTerms" className="text-sm">
            I accept the{" "}
            <Link href="/terms" className="text-[#1E88E5] hover:underline">
              terms and conditions
            </Link>
          </Label>
        </div>
        {form.formState.errors.acceptTerms && (
          <p className="text-sm text-red-500">{form.formState.errors.acceptTerms.message}</p>
        )}

        {form.formState.errors.root && (
          <div className="rounded-md bg-red-50 p-3 text-sm text-red-500">{form.formState.errors.root.message}</div>
        )}

        <CustomButton type="submit" variant="brand" className="w-full" isLoading={isLoading}>
          Create Account
        </CustomButton>
      </form>

      <div className="text-center text-sm">
        Already have an account?{" "}
        <Link href="/login" className="text-[#1E88E5] hover:underline">
          Sign in
        </Link>
      </div>
    </div>
  )
}
