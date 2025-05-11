import type { Metadata } from "next"
import InventoryDashboard from "@/components/inventory/InventoryDashboard"

export const metadata: Metadata = {
  title: "Inventory Dashboard | Destiny Builders",
  description: "Manage your organization's assets and inventory",
}

export default function InventoryDashboardPage() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="flex-1 p-4 md:p-8 pt-8 md:pt-8">
        <InventoryDashboard />
      </div>
    </div>
  )
}
