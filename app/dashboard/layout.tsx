"use client"

import type React from "react"

import { useState, useEffect } from "react"
import DashboardSidebar from "@/components/dashboard/DashboardSidebar"
import { useGetLoggedInUserQuery } from "@/redux/features/users/userApiSlice";
import MobileMenuButton from "@/components/dashboard/MobileMenuButton"

import MobileSidebarToggle from "@/components/dashboard/MobileMenuButton"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Close sidebar when screen size changes to prevent issues
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setSidebarOpen(false)
      }
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return (
    <div className="flex h-screen overflow-hidden">
        <DashboardSidebar />
        <MobileMenuButton/>

        {/* Page content */}
        <main className="flex-1 overflow-auto bg-gray-50">{children}</main>
    </div>
  )
}
