"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Crown, Star, Heart, ExternalLink } from "lucide-react"

interface TopDonorsProps {
  data: any[]
  isLoading?: boolean
}

export function TopDonors({ data, isLoading }: TopDonorsProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="h-6 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="h-10 w-10 bg-gray-200 rounded-full animate-pulse" />
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded animate-pulse mb-2" />
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  const getDonorTier = (amount: number) => {
    if (amount >= 10000) return { tier: "Platinum", icon: Crown, color: "text-purple-600" }
    if (amount >= 5000) return { tier: "Gold", icon: Star, color: "text-yellow-600" }
    if (amount >= 1000) return { tier: "Silver", icon: Heart, color: "text-gray-600" }
    return { tier: "Bronze", icon: Heart, color: "text-orange-600" }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-yellow-600" />
              Top Donors
            </CardTitle>
            <CardDescription>Highest contributing donors this period</CardDescription>
          </div>
          <Button variant="outline" size="sm">
            <ExternalLink className="h-4 w-4 mr-2" />
            View All
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data?.slice(0, 8).map((donor, index) => {
            const tierInfo = getDonorTier(donor.total_donated)
            const TierIcon = tierInfo.icon

            return (
              <div
                key={index}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={donor.avatar || "/placeholder.svg"} alt={donor.name} />
                      <AvatarFallback>{getInitials(donor.name)}</AvatarFallback>
                    </Avatar>
                    {index < 3 && (
                      <div className="absolute -top-1 -right-1 h-5 w-5 bg-yellow-500 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-white">{index + 1}</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="font-medium text-sm flex items-center gap-2">
                      {donor.name}
                      <TierIcon className={`h-4 w-4 ${tierInfo.color}`} />
                    </div>
                    <div className="text-xs text-gray-600">
                      {donor.donation_count} donations • Member since {donor.member_since}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-sm">${donor.total_donated?.toLocaleString()}</div>
                  <Badge variant="secondary" className="text-xs">
                    {tierInfo.tier}
                  </Badge>
                </div>
              </div>
            )
          })}
        </div>

        {/* Donor Statistics */}
        <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {data?.reduce((sum, donor) => sum + (donor.total_donated || 0), 0).toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Total Contributed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {data?.reduce((sum, donor) => sum + (donor.donation_count || 0), 0)}
            </div>
            <div className="text-sm text-gray-600">Total Donations</div>
          </div>
        </div>

        {data?.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Crown className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <div className="text-sm">No donor data available</div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
