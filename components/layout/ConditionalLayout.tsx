"use client"

import type React from "react"

import { useAppSelector } from "@/redux/hooks"
import { usePathname } from "next/navigation"
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import AuthenticatedHeader from "@/components/layout/AuthenticatedHeader"
import AuthenticatedFooter from "@/components/layout/AuthenticatedFooter"
import { useAuth } from "@/redux/features/users/useAuth"

export default function ConditionalLayout({ children }: { children: React.ReactNode }) {
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
