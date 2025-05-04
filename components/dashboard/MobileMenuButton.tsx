"use client"

import { Menu } from "lucide-react"

export default function MobileMenuButton() {
  const toggleSidebar = () => {
    const sidebar = document.getElementById("dashboard-sidebar")
    sidebar?.classList.toggle("hidden")
  }

  return (
    <div className="md:hidden mb-4">
      <button
        className="flex items-center gap-2 text-gray-600 justify-end"
        onClick={toggleSidebar}
      >
        <Menu className="h-6 w-6" />
      </button>
    </div>
  )
}