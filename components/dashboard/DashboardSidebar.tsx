"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Users, FileText, Folder, Calendar, Settings, LogOut, Package, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"

const sidebarItems = [
  {
    title: "Dashboard",
    href: "/membership/dashboard",
    icon: <LayoutDashboard className="h-5 w-5" />,
  },
  {
    title: "My Profile",
    href: "/membership/dashboard/profile",
    icon: <Users className="h-5 w-5" />,
  },
  {
    title: "Projects",
    href: "/membership/dashboard/projects",
    icon: <Folder className="h-5 w-5" />,
  },
  {
    title: "Reports",
    href: "/membership/dashboard/reports",
    icon: <FileText className="h-5 w-5" />,
  },
  {
    title: "Inventory",
    href: "/membership/dashboard/inventory",
    icon: <Package className="h-5 w-5" />,
  },
  {
    title: "Assets",
    href: "/membership/dashboard/inventory/assets",
    icon: <Package className="h-5 w-5" />,
  },
  {
    title: "Events",
    href: "/membership/dashboard/events",
    icon: <Calendar className="h-5 w-5" />,
  },
  {
    title: "Settings",
    href: "/membership/dashboard/settings",
    icon: <Settings className="h-5 w-5" />,
  },
]

export default function DashboardSidebar() {
  const pathname = usePathname()
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const sidebarRef = useRef<HTMLDivElement>(null)
  const toggleButtonRef = useRef<HTMLButtonElement>(null)

  // Close sidebar when clicking outside or pressing escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node) &&
        toggleButtonRef.current &&
        !toggleButtonRef.current.contains(event.target as Node)
      ) {
        setIsMobileOpen(false)
      }
    }

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMobileOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    document.addEventListener("keydown", handleEscapeKey)

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("keydown", handleEscapeKey)
    }
  }, [])

  // Close sidebar when route changes on mobile
  useEffect(() => {
    setIsMobileOpen(false)
  }, [pathname])

  return (
    <>
      {/* Mobile Toggle Button */}
      <div className="md:hidden fixed top-4 left-4 z-30">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          ref={toggleButtonRef}
          aria-label="Toggle sidebar"
        >
          {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile Overlay */}
      {isMobileOpen && <div className="md:hidden fixed inset-0 bg-black/20 z-20" aria-hidden="true" />}

      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className={cn(
          "fixed md:sticky top-0 left-0 z-20 flex flex-col w-64 bg-white border-r h-screen transition-transform duration-300 ease-in-out",
          isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        )}
      >
        <div className="p-4 border-b">
          <h2 className="text-xl font-bold text-green-700">Member Portal</h2>
          <p className="text-sm text-gray-500">Destiny Builders</p>
        </div>

        <div className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
          {sidebarItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
                pathname === item.href ? "bg-green-50 text-green-700" : "text-gray-700 hover:bg-gray-100",
              )}
            >
              {item.icon}
              <span className="ml-3">{item.title}</span>
            </Link>
          ))}
        </div>

        <div className="p-4 border-t">
          <Link
            href="/logout"
            className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="h-5 w-5" />
            <span className="ml-3">Logout</span>
          </Link>
        </div>
      </div>
    </>
  )
}
