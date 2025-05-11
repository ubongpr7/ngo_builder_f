import type { Metadata } from "next"
import DashboardSidebar from "@/components/dashboard/DashboardSidebar"
import AssetForm from "@/components/inventory/AssetForm"

export const metadata: Metadata = {
  title: "Add New Asset | Destiny Builders",
  description: "Add a new asset to your inventory",
}

export default function NewAssetPage() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="flex-1 p-4 md:p-8 pt-8 md:pt-8">
        <AssetForm />
      </div>
    </div>
  )
}
