"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import QRCode from "qrcode"
import { cn } from "@/lib/utils"
import { CustomButton } from "./custom-button"
import { Download } from "lucide-react"

export interface QRGeneratorProps {
  value: string
  size?: number
  level?: "L" | "M" | "Q" | "H"
  includeMargin?: boolean
  className?: string
  bgColor?: string
  fgColor?: string
  downloadable?: boolean
  downloadName?: string
}

export function QRGenerator({
  value,
  size = 200,
  level = "M",
  includeMargin = true,
  className,
  bgColor = "#FFFFFF",
  fgColor = "#000000",
  downloadable = false,
  downloadName = "qrcode",
}: QRGeneratorProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("")
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!value) {
      setError("QR Code value is required")
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    const generateQR = async () => {
      try {
        const url = await QRCode.toDataURL(value, {
          width: size,
          margin: includeMargin ? 4 : 0,
          color: {
            dark: fgColor,
            light: bgColor,
          },
          errorCorrectionLevel: level,
        })
        setQrCodeUrl(url)
        setIsLoading(false)
      } catch (err) {
        console.error("Error generating QR code:", err)
        setError("Failed to generate QR code")
        setIsLoading(false)
      }
    }

    generateQR()
  }, [value, size, level, includeMargin, bgColor, fgColor])

  const handleDownload = () => {
    if (!qrCodeUrl) return

    const link = document.createElement("a")
    link.href = qrCodeUrl
    link.download = `${downloadName}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className={cn("flex flex-col items-center", className)}>
      {isLoading ? (
        <div className="flex h-[200px] w-[200px] items-center justify-center rounded-md border border-dashed">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      ) : error ? (
        <div className="flex h-[200px] w-[200px] items-center justify-center rounded-md border border-dashed text-center text-sm text-muted-foreground">
          {error}
        </div>
      ) : (
        <div className="relative">
          <img
            src={qrCodeUrl}
            alt="QR Code"
            width={size}
            height={size}
            className="rounded-md"
          />
          {downloadable && (
            <CustomButton
              variant="outline"
              size="sm"
              className="absolute -bottom-10 left-1/2 -translate-x-1/2 transform"
              onClick={handleDownload}
            >
              <Download className="mr-2 h-4 w-4" />
              Download
            </CustomButton>
          )}
        </div>
      )}
    </div>
  )
}
