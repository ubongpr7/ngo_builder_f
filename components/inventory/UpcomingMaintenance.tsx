"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, PenToolIcon as Tool } from "lucide-react"
import Link from "next/link"

export default function UpcomingMaintenance() {
  // Sample data - would come from your API
  const maintenanceItems = [
    {
      id: 1,
      assetName: "Projector",
      assetTag: "IT-PRJ-001",
      scheduledDate: "2023-07-15",
      daysRemaining: 3,
      priority: "High",
      assignedTo: "IT Department",
    },
    {
      id: 2,
      assetName: "Transport Van",
      assetTag: "VEH-VAN-001",
      scheduledDate: "2023-07-20",
      daysRemaining: 8,
      priority: "Medium",
      assignedTo: "Logistics Team",
    },
    {
      id: 3,
      assetName: "HP LaserJet Printer",
      assetTag: "IT-PRT-001",
      scheduledDate: "2023-07-25",
      daysRemaining: 13,
      priority: "Low",
      assignedTo: "Admin Staff",
    },
  ]

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "High":
        return <Badge className="bg-red-100 text-red-800 border-red-200">High</Badge>
      case "Medium":
        return <Badge className="bg-amber-100 text-amber-800 border-amber-200">Medium</Badge>
      case "Low":
        return <Badge className="bg-green-100 text-green-800 border-green-200">Low</Badge>
      default:
        return <Badge>Unknown</Badge>
    }
  }

  return (
    <div className="space-y-4">
      {maintenanceItems.length > 0 ? (
        maintenanceItems.map((item) => (
          <div key={item.id} className="flex items-start justify-between border-b pb-3">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <Tool className="h-4 w-4 text-gray-500" />
                <p className="font-medium">{item.assetName}</p>
                {getPriorityBadge(item.priority)}
              </div>
              <p className="text-sm text-gray-500">{item.assetTag}</p>
              <div className="flex items-center space-x-1 text-xs text-gray-500">
                <Calendar className="h-3 w-3" />
                <span>{item.scheduledDate}</span>
                <span className="font-medium text-amber-600">({item.daysRemaining} days remaining)</span>
              </div>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href={`/membership/dashboard/inventory/assets/${item.id}`}>View</Link>
            </Button>
          </div>
        ))
      ) : (
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <Tool className="mb-2 h-10 w-10 text-gray-400" />
          <p className="text-sm text-gray-500">No upcoming maintenance scheduled</p>
        </div>
      )}
    </div>
  )
}
