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

const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
})

type LoginFormValues = z.infer<typeof loginSchema>

export interface LoginFormProps {
  onSubmit?: (values: LoginFormValues) => Promise<void>
  className?: string
}

export function LoginForm({ onSubmit, className }: LoginFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = React.useState(false)

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  async function handleSubmit(values: LoginFormValues) {
    setIsLoading(true)

    try {
      if (onSubmit) {
        await onSubmit(values)
      } else {
        // Default implementation - replace with actual auth logic
        console.log("Login form submitted:", values)
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000))
        router.push("/dashboard")
      }
    } catch (error) {
      console.error("Login error:", error)
      form.setError("root", {
        message: "Invalid email or password. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn("space-y-6", className)}>
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold">Sign In</h1>
        <p className="text-sm text-muted-foreground">Enter your credentials to access your account</p>
      </div>

      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
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
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link href="/forgot-password" className="text-xs text-[#1E88E5] hover:underline">
              Forgot password?
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            autoComplete="current-password"
            disabled={isLoading}
            {...form.register("password")}
          />
          {form.formState.errors.password && (
            <p className="text-sm text-red-500">{form.formState.errors.password.message}</p>
          )}
        </div>

        {form.formState.errors.root && (
          <div className="rounded-md bg-red-50 p-3 text-sm text-red-500">{form.formState.errors.root.message}</div>
        )}

        <CustomButton type="submit" variant="brand" className="w-full" isLoading={isLoading}>
          Sign In
        </CustomButton>
      </form>

      <div className="text-center text-sm">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="text-[#1E88E5] hover:underline">
          Sign up
        </Link>
      </div>
    </div>
  )
}
