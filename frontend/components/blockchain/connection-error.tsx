"use client"

import * as React from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

interface ConnectionErrorProps {
  message: string
  onRetry?: () => void
}

export function ConnectionError({ message, onRetry }: ConnectionErrorProps) {
  return (
    <Alert variant="destructive" className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Connection Error</AlertTitle>
      <AlertDescription>
        <div className="flex flex-col gap-2">
          <p>{message}</p>
          {onRetry && (
            <button 
              onClick={onRetry}
              className="text-sm underline hover:no-underline"
            >
              Try again
            </button>
          )}
        </div>
      </AlertDescription>
    </Alert>
  )
}