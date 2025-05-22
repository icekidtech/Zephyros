import { inter } from "@/lib/fonts"
import "@/app/globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { WalletProvider } from "@/components/blockchain/wallet-provider"
import { Toaster } from "sonner"

export const metadata = {
  title: "Zephyros II - Blockchain Supply Chain Verification",
  description: "Secure supply chain verification powered by blockchain technology",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <WalletProvider>
            {children}
            <Toaster position="top-right" />
          </WalletProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
