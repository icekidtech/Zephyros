"use client"

export default function TestEnvPage() {
  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Environment Variables Test</h1>
      <pre className="p-4 bg-gray-100 rounded">
        WalletConnect Project ID: {process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ? "✅ Set" : "❌ Not Set"}
      </pre>
    </div>
  )
}