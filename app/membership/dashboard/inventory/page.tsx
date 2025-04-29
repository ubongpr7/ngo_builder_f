import type { Metadata } from "next"
import DashboardSidebar from "@/components/dashboard/DashboardSidebar"
import InventoryDashboard from "@/components/inventory/InventoryDashboard"

export const metadata: Metadata = {
  title: "Inventory Dashboard | Destiny Builders",
  description: "Manage your organization's assets and inventory",
}

export default function InventoryDashboardPage() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <DashboardSidebar />
      <div className="flex-1 p-4 md:p-8 pt-16 md:pt-8">
        <InventoryDashboard />
      </div>
    </div>
  )
}
