"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Package, AlertTriangle, Clock, DollarSign } from "lucide-react"

export default function InventoryStats() {
  // This would be replaced with real data from your API
  const stats = [
    {
      title: "Total Assets",
      value: "1,284",
      icon: <Package className="h-5 w-5 text-green-600" />,
      change: "+12.5%",
      changeType: "positive",
      changeText: "from last month",
    },
    {
      title: "Maintenance Due",
      value: "23",
      icon: <AlertTriangle className="h-5 w-5 text-amber-600" />,
      change: "+4",
      changeType: "negative",
      changeText: "from last month",
    },
    {
      title: "Expiring Warranties",
      value: "15",
      icon: <Clock className="h-5 w-5 text-blue-600" />,
      change: "-2",
      changeType: "positive",
      changeText: "from last month",
    },
    {
      title: "Asset Value",
      value: "$245,890",
      icon: <DollarSign className="h-5 w-5 text-purple-600" />,
      change: "+$12,450",
      changeType: "positive",
      changeText: "from last month",
    },
  ]

  return (
    <>
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-x-2">
              <div className="flex items-center justify-center rounded-md bg-gray-50 p-2">{stat.icon}</div>
              <div className="flex items-center text-xs text-gray-500">
                <span className={stat.changeType === "positive" ? "text-green-600" : "text-red-600"}>
                  {stat.change}
                </span>
                <span className="ml-1">{stat.changeText}</span>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-500">{stat.title}</p>
              <p className="text-2xl font-bold">{stat.value}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </>
  )
}
