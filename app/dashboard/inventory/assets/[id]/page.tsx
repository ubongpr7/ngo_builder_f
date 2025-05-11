import type { Metadata } from "next"
import AssetDetail from "@/components/inventory/AssetDetail"
import type { AssetItem } from "@/types/inventory"

// This would be replaced with a real API call
const getAsset = async (id: string): Promise<AssetItem> => {
  // Sample asset data
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
    customFields: [
      {
        id: "cf1",
        name: "Asset Condition",
        type: "select",
        value: "Excellent",
        options: ["Excellent", "Good", "Fair", "Poor"],
      },
      {
        id: "cf2",
        name: "Insurance Coverage",
        type: "boolean",
        value: true,
      },
    ],
    maintenanceRecords: [
      {
        id: "m1",
        date: "2023-04-10",
        description: "Regular maintenance and software updates",
        cost: 0,
        performedBy: "IT Department",
        nextScheduledDate: "2023-10-10",
      },
    ],
    movementHistory: [
      {
        id: "mv1",
        date: "2023-03-15",
        fromLocation: "IT Storage",
        toLocation: "Lagos Office",
        movedBy: "Admin Staff",
        notes: "Assigned to new developer",
      },
      {
        id: "mv2",
        date: "2023-01-15",
        fromLocation: "Vendor",
        toLocation: "IT Storage",
        movedBy: "Procurement Team",
        notes: "Initial receipt from vendor",
      },
    ],
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
    attachments: [
      {
        id: "a1",
        name: "Invoice.pdf",
        url: "/documents/invoice.pdf",
        type: "application/pdf",
      },
      {
        id: "a2",
        name: "Warranty.pdf",
        url: "/documents/warranty.pdf",
        type: "application/pdf",
      },
    ],
  }
}

export const metadata: Metadata = {
  title: "Asset Details | Destiny Builders",
  description: "View detailed information about an asset",
}

export default async function AssetDetailPage({ params }: { params: { id: string } }) {
  const asset = await getAsset(params.id)

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="flex-1 p-4 md:p-8 pt-16 md:pt-8">
        <AssetDetail asset={asset} />
      </div>
    </div>
  )
}
