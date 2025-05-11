import type { Metadata } from "next"
import AssetForm from "@/components/inventory/AssetForm"
import type { AssetItem } from "@/types/inventory"

// This would be replaced with a real API call
const getAsset = async (id: string): Promise<AssetItem> => {
  // Sample asset data - same as in the detail page
  return {
    id: "1",
    name: "Dell Laptop XPS 13",
    assetTag: "IT-LAP-001",
    barcode: "123456789",
    serialNumber: "XPS13-2023-001",
    category: "Electronics",
    subcategory: "Laptops",
    status: "Available",
    location: "Lagos Office",
    department: "IT",
    assignedTo: "John Smith",
    description: "High-performance laptop for development work",
    manufacturer: "Dell",
    model: "XPS 13",
    purchaseDate: "2023-01-15",
    warrantyExpiration: "2026-01-15",
    notes: "Includes docking station and extra charger",
    quantity: 1,
    lastUpdated: "2023-05-15",
    image: "/assets/laptop.jpg",
    financialDetails: {
      acquisitionCost: 1200,
      acquisitionDate: "2023-01-15",
      fundingSource: "Operating Budget",
      currentValue: 1080,
      depreciationMethod: "straight-line",
      depreciationRate: 10,
      salvageValue: 200,
      usefulLifeYears: 3,
    },
  }
}

export const metadata: Metadata = {
  title: "Edit Asset | Destiny Builders",
  description: "Edit an existing asset in your inventory",
}

export default async function EditAssetPage({ params }: { params: { id: string } }) {
  const asset = await getAsset(params.id)

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="flex-1 p-4 md:p-8 pt-16 md:pt-8">
        <AssetForm asset={asset} isEditing={true} />
      </div>
    </div>
  )
}
