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
import { useAppSelector } from "@/redux/hooks"
import { usePathname } from "next/navigation"
import { useAuth } from "@/redux/features/users/useAuth";

const inter = Inter({ subsets: ["latin"] })

function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { isLoading, isAuthenticated, isPublic } = useAuth();

  const isAuthenticatedRoute =
    pathname.startsWith("/dashboard") || pathname.startsWith("/kyc") || pathname === "/profile"

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    )
  }


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
