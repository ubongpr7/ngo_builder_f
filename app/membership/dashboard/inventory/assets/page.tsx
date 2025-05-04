import type { Metadata } from "next"
import DashboardSidebar from "@/components/dashboard/DashboardSidebar"
import InventoryManagement from "@/components/inventory/InventoryManagement"
import MobileMenuButton from "@/components/dashboard/MobileMenuButton"

export const metadata: Metadata = {
  title: "Asset Management | Destiny Builders",
  description: "Manage your organization's assets",
}

export default function AssetManagementPage() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <DashboardSidebar />
      <div className="flex-1 p-4 md:p-8 pt-8 md:pt-8">
        <MobileMenuButton/>
        <InventoryManagement />
      </div>
    </div>
  )
}
