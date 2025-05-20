import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import NextTopLoader from "nextjs-toploader"
import StoreProvider from "@/redux/provider"
import { ToastContainer } from "react-toastify"
import ConditionalLayout from "@/components/layout/ConditionalLayout"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Destiny Builders Empowerment Foundation",
  description: "Building African Destinies, Transforming Lives",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="light" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/logo.jpg" />
        {/* Font Awesome is now imported in globals.css */}
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <NextTopLoader />
        <ToastContainer position="top-right" autoClose={3000} />

        <StoreProvider>
          <ConditionalLayout>{children}</ConditionalLayout>
        </StoreProvider>
      </body>
    </html>
  )
}
