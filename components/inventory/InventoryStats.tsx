"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, AlertTriangle, Clock, TrendingDown } from "lucide-react"

export default function InventoryStats() {
  // This would be fetched from the API in a real application
  const stats = [
    {
      title: "Total Assets",
      value: "1,284",
      icon: <Package className="h-8 w-8 text-green-600" />,
      change: "+12% from last month",
      trend: "up",
    },
    {
      title: "Maintenance Due",
      value: "23",
      icon: <AlertTriangle className="h-8 w-8 text-amber-500" />,
      change: "5 critical",
      trend: "neutral",
    },
    {
      title: "Expiring Warranties",
      value: "8",
      icon: <Clock className="h-8 w-8 text-blue-500" />,
      change: "Next 30 days",
      trend: "neutral",
    },
    {
      title: "Depreciation",
      value: "$12,450",
      icon: <TrendingDown className="h-8 w-8 text-purple-500" />,
      change: "This quarter",
      trend: "down",
    },
  ]

  return (
    <>
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            {stat.icon}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p
              className={`text-xs ${
                stat.trend === "up" ? "text-green-500" : stat.trend === "down" ? "text-red-500" : "text-gray-500"
              }`}
            >
              {stat.change}
            </p>
          </CardContent>
        </Card>
      ))}
    </>
  )
}
