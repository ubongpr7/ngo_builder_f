"use client"

import type React from "react"

import { useState, useEffect } from "react"
import DashboardSidebar from "@/components/dashboard/DashboardSidebar"
import { useGetLoggedInUserQuery } from "@/redux/features/users/userApiSlice";

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
      {/* Sidebar for desktop */}
      <div className="hidden md:block">
        <DashboardSidebar />
      </div>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
          <div className="fixed inset-y-0 left-0 flex w-full max-w-xs">
            <DashboardSidebar userData={userData} />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile toggle */}
        <div className="md:hidden p-4 border-b">
          <MobileSidebarToggle onToggle={() => setSidebarOpen(true)} />
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-auto bg-gray-50">{children}</main>
      </div>
    </div>
  )
}
