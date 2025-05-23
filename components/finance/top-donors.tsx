"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useGetDonationStatisticsQuery } from "@/redux/features/finance/financeApiSlice"
import { User, DollarSign } from "lucide-react"

export function TopDonors() {
  const { data: statistics, isLoading } = useGetDonationStatisticsQuery({})
  const topDonors = statistics?.top_donors || []

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Top Donors</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex justify-between items-center">
                <div className="flex items-center">
                  <Skeleton className="h-8 w-8 rounded-full mr-2" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (topDonors.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Top Donors</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-gray-500">
            <p>No donor data available</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Top Donors</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {topDonors.map((donor: any, index: number) => (
            <div key={index} className="flex justify-between items-center">
              <div className="flex items-center">
                <div className="bg-gray-100 h-8 w-8 rounded-full flex items-center justify-center mr-2">
                  <User className="h-4 w-4 text-gray-600" />
                </div>
                <span className="font-medium">{donor.donor_name}</span>
              </div>
              <div className="flex items-center text-gray-700">
                <DollarSign className="h-4 w-4 mr-1 text-gray-500" />
                <span>{donor.total.toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
