import type React from "react"
import "./globals.css"
import ClientLayout from './components/ClientLayout'

// This is a server component that handles metadata
export const metadata = {
  title: "Plens - Microplastic Checker",
  description: "Check products for microplastics",
}

// This is the root layout that wraps everything
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  )
}