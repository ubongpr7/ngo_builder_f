"use client"

import type React from "react"
import { Inter } from "next/font/google"
import "./globals.css"
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import AuthenticatedHeader from "@/components/layout/AuthenticatedHeader"
import AuthenticatedFooter from "@/components/layout/AuthenticatedFooter"
import { ThemeProvider } from "@/components/theme-provider"
import StoreProvider from "@/redux/provider"
import { useSelector } from "react-redux"
import { usePathname } from "next/navigation"

const inter = Inter({ subsets: ["latin"] })

// Client component that conditionally renders based on auth state
function LayoutContent({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useSelector((state: any) => state.auth)
  const pathname = usePathname()

  // Check if the current path is in the dashboard or other authenticated routes
  const isAuthenticatedRoute =
    pathname.startsWith("/dashboard") || pathname.startsWith("/kyc") || pathname === "/profile"

  // If still loading auth state, you could show a loading indicator
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    )
  }

  // If user is not authenticated but trying to access authenticated routes,
  // you might want to redirect them (this would typically be handled by middleware)

  return (
    <div className="text-gray-900 bg-gray-50 flex min-h-screen flex-col">
      {isAuthenticated ? <AuthenticatedHeader /> : <Header />}
      <main className="flex-1">{children}</main>
      {isAuthenticated ? <AuthenticatedFooter /> : <Footer />}
    </div>
  )
}

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <StoreProvider>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <LayoutContent>{children}</LayoutContent>
      </ThemeProvider>
    </StoreProvider>
  )
}
