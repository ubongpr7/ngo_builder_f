"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export default function ExpiringWarranties() {
  // This would be fetched from the API in a real application
  const warranties = [
    {
      id: 1,
      asset: "Dell Laptop XPS 13",
      expiryDate: "2023-11-15",
      daysLeft: 30,
      purchaseDate: "2020-11-15",
      vendor: "Dell Inc.",
    },
    {
      id: 2,
      asset: "HP LaserJet Printer",
      expiryDate: "2023-11-30",
      daysLeft: 45,
      purchaseDate: "2021-11-30",
      vendor: "HP Inc.",
    },
    {
      id: 3,
      asset: "Projector BenQ TH685",
      expiryDate: "2023-12-10",
      daysLeft: 55,
      purchaseDate: "2022-12-10",
      vendor: "BenQ",
    },
  ]

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b">
            <th className="text-left py-3 px-4">Asset</th>
            <th className="text-left py-3 px-4">Expiry Date</th>
            <th className="text-left py-3 px-4">Days Left</th>
            <th className="text-left py-3 px-4">Vendor</th>
            <th className="text-left py-3 px-4">Actions</th>
          </tr>
        </thead>
        <tbody>
          {warranties.map((warranty) => (
            <tr key={warranty.id} className="border-b hover:bg-gray-50">
              <td className="py-3 px-4">{warranty.asset}</td>
              <td className="py-3 px-4">{warranty.expiryDate}</td>
              <td className="py-3 px-4">
                <Badge variant={warranty.daysLeft <= 30 ? "destructive" : "outline"}>{warranty.daysLeft} days</Badge>
              </td>
              <td className="py-3 px-4">{warranty.vendor}</td>
              <td className="py-3 px-4">
                <Button variant="outline" size="sm">
                  Renew
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
