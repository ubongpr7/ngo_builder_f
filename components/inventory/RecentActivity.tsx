"use client"

import { Package, ArrowRight, ArrowDown, PenToolIcon as Tool } from "lucide-react"

export default function RecentActivity() {
  // This would be fetched from the API in a real application
  const activities = [
    {
      id: 1,
      type: "check-out",
      asset: "Dell Laptop XPS 13",
      user: "John Smith",
      date: "2023-10-15",
      icon: <ArrowRight className="h-4 w-4 text-blue-500" />,
    },
    {
      id: 2,
      type: "maintenance",
      asset: "Projector BenQ TH685",
      user: "Tech Support",
      date: "2023-10-14",
      icon: <Tool className="h-4 w-4 text-amber-500" />,
    },
    {
      id: 3,
      type: "new-asset",
      asset: "Office Chairs (x5)",
      user: "Admin",
      date: "2023-10-12",
      icon: <Package className="h-4 w-4 text-green-500" />,
    },
    {
      id: 4,
      type: "depreciation",
      asset: "Server Equipment",
      user: "System",
      date: "2023-10-10",
      icon: <ArrowDown className="h-4 w-4 text-purple-500" />,
    },
  ]

  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <div key={activity.id} className="flex items-start space-x-4">
          <div className="bg-gray-100 rounded-full p-2">{activity.icon}</div>
          <div className="flex-1 space-y-1">
            <p className="text-sm font-medium">
              {activity.type === "check-out" && "Asset Checked Out"}
              {activity.type === "maintenance" && "Maintenance Performed"}
              {activity.type === "new-asset" && "New Asset Added"}
              {activity.type === "depreciation" && "Depreciation Applied"}
            </p>
            <p className="text-xs text-gray-500">{activity.asset}</p>
            <div className="flex justify-between text-xs text-gray-400">
              <span>By: {activity.user}</span>
              <span>{activity.date}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
