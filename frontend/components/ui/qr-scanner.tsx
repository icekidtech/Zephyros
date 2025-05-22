"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { CustomButton } from "./custom-button"
import { Camera, X } from "lucide-react"

export interface QRScannerProps {
  onScan: (result: string) => void
  onError?: (error: Error) => void
  className?: string
  scanDelay?: number
  constraints?: MediaTrackConstraints
}

export function QRScanner({
  onScan,
  onError,
  className,
  scanDelay = 500,
  constraints = { facingMode: "environment" },
}: QRScannerProps) {
  const [isScanning, setIsScanning] = React.useState(false)
  const [hasPermission, setHasPermission] = React.useState<boolean | null>(null)
  const videoRef = React.useRef<HTMLVideoElement>(null)
  const streamRef = React.useRef<MediaStream | null>(null)
  const scannerRef = React.useRef<any>(null)

  React.useEffect(() => {
    // Dynamically import the QR scanner library
    const loadScanner = async () => {
      try {
        const QrScanner = (await import("qr-scanner")).default
        scannerRef.current = QrScanner
      } catch (error) {
        console.error("Failed to load QR scanner:", error)
        onError?.(new Error("Failed to load QR scanner"))
      }
    }

    loadScanner()

    return () => {
      stopScanner()
    }
  }, [onError])

  const startScanner = async () => {
    if (!scannerRef.current || !videoRef.current) return

    try {
      setIsScanning(true)

      // Request camera permission
      const stream = await navigator.mediaDevices.getUserMedia({ video: constraints })
      streamRef.current = stream

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()

        // Create QR scanner instance
        const qrScanner = new scannerRef.current(
          videoRef.current,
          (result: { data: string }) => {
            onScan(result.data)
          },
          {
            highlightScanRegion: true,
            highlightCodeOutline: true,
            returnDetailedScanResult: true,
          },
        )

        await qrScanner.start()
        setHasPermission(true)
      }
    } catch (error) {
      console.error("Error starting QR scanner:", error)
      setHasPermission(false)
      onError?.(error instanceof Error ? error : new Error(String(error)))
      setIsScanning(false)
    }
  }

  const stopScanner = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null
    }

    setIsScanning(false)
  }

  return (
    <div className={cn("flex flex-col items-center", className)}>
      {isScanning ? (
        <div className="relative w-full max-w-sm">
          <div className="relative overflow-hidden rounded-lg border bg-black">
            <video ref={videoRef} className="h-64 w-full object-cover" playsInline muted />
            <div className="absolute inset-0 border-[3rem] border-black/50">
              <div className="absolute inset-0 border-2 border-dashed border-white/70" />
            </div>
          </div>

          <CustomButton
            variant="error"
            size="sm"
            className="absolute right-2 top-2 h-8 w-8 rounded-full p-0"
            onClick={stopScanner}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Stop scanning</span>
          </CustomButton>

          <p className="mt-2 text-center text-sm text-muted-foreground">
            Position the QR code within the frame to scan
          </p>
        </div>
      ) : (
        <div className="flex flex-col items-center">
          {hasPermission === false && (
            <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
              Camera permission denied. Please allow camera access to scan QR codes.
            </div>
          )}

          <CustomButton variant="brand" leftIcon={<Camera className="h-4 w-4" />} onClick={startScanner}>
            Scan QR Code
          </CustomButton>
        </div>
      )}
    </div>
  )
}
