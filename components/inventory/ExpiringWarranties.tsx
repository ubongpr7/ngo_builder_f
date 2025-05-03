"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Calendar } from "lucide-react"
import Link from "next/link"

export default function ExpiringWarranties() {
  // Sample data - would come from your API
  const expiringWarranties = [
    {
      id: 1,
      assetName: "Dell Laptop XPS 13",
      assetTag: "IT-LAP-001",
      expirationDate: "2023-08-15",
      daysRemaining: 34,
      status: "Warning",
    },
    {
      id: 5,
      assetName: "Digital Camera",
      assetTag: "IT-CAM-001",
      expirationDate: "2023-07-30",
      daysRemaining: 18,
      status: "Warning",
    },
    {
      id: 2,
      assetName: "HP LaserJet Printer",
      assetTag: "IT-PRT-001",
      expirationDate: "2023-07-20",
      daysRemaining: 8,
      status: "Critical",
    },
    {
      id: 4,
      assetName: "Projector",
      assetTag: "IT-PRJ-001",
      expirationDate: "2023-07-10",
      daysRemaining: -2,
      status: "Expired",
    },
  ]

  const getStatusBadge = (status: string, daysRemaining: number) => {
    if (daysRemaining < 0) {
      return <Badge className="bg-red-100 text-red-800 border-red-200">Expired</Badge>
    }

    switch (status) {
      case "Critical":
        return <Badge className="bg-red-100 text-red-800 border-red-200">Critical</Badge>
      case "Warning":
        return <Badge className="bg-amber-100 text-amber-800 border-amber-200">Warning</Badge>
      default:
        return <Badge>Unknown</Badge>
    }
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b text-left text-sm font-medium text-gray-500">
            <th className="pb-2">Asset</th>
            <th className="pb-2">Tag</th>
            <th className="pb-2">Expiration</th>
            <th className="pb-2">Status</th>
            <th className="pb-2 text-right">Action</th>
          </tr>
        </thead>
        <tbody>
          {expiringWarranties.map((item) => (
            <tr key={item.id} className="border-b">
              <td className="py-3">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className={`h-4 w-4 ${item.daysRemaining < 0 ? "text-red-500" : "text-amber-500"}`} />
                  <span className="font-medium">{item.assetName}</span>
                </div>
              </td>
              <td className="py-3 text-sm text-gray-500">{item.assetTag}</td>
              <td className="py-3">
                <div className="flex items-center space-x-1 text-sm">
                  <Calendar className="h-3 w-3 text-gray-500" />
                  <span>{item.expirationDate}</span>
                </div>
                <div className="text-xs text-gray-500">
                  {item.daysRemaining < 0 ? (
                    <span className="text-red-600">Expired {Math.abs(item.daysRemaining)} days ago</span>
                  ) : (
                    <span>{item.daysRemaining} days remaining</span>
                  )}
                </div>
              </td>
              <td className="py-3">{getStatusBadge(item.status, item.daysRemaining)}</td>
              <td className="py-3 text-right">
                <Button variant="outline" size="sm" asChild className="hover:bg-green-700 hover:text-white transition-colors">
                  <Link href={`/membership/dashboard/inventory/assets/${item.id}`}>View</Link>
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
