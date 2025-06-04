"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Legend } from "recharts"
import { Target } from "lucide-react"

interface CampaignPerformanceProps {
  data: any
  isLoading?: boolean
}

export function CampaignPerformance({ data, isLoading }: CampaignPerformanceProps) {
  const chartConfig = {
    raised: {
      label: "Amount Raised",
      color: "hsl(var(--chart-1))",
    },
    target: {
      label: "Target Amount",
      color: "hsl(var(--chart-2))",
    },
    donors: {
      label: "Donors",
      color: "hsl(var(--chart-3))",
    },
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="h-6 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3" />
        </CardHeader>
        <CardContent>
          <div className="h-[300px] bg-gray-200 rounded animate-pulse" />
        </CardContent>
      </Card>
    )
  }

  // Extract campaigns from the data
  const campaignData = data?.campaigns || [];

  // Prepare top campaigns for display
  const topCampaigns = campaignData.slice(0, 5);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5 text-blue-600" />
          Campaign Performance
        </CardTitle>
        <CardDescription>Top performing campaigns by amount raised vs target</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topCampaigns} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="title" tick={{ fontSize: 12 }} angle={-45} textAnchor="end" height={80} />
              <YAxis tick={{ fontSize: 12 }} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend />
              <Bar dataKey="total_raised" fill="var(--color-raised)" name="Amount Raised" radius={[4, 4, 0, 0]} />
              <Bar
                dataKey="target_amount"
                fill="var(--color-target)"
                name="Target Amount"
                radius={[4, 4, 0, 0]}
                opacity={0.7}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>

        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {topCampaigns?.reduce((sum, campaign) => sum + (campaign?.total_raised || 0), 0)?.toLocaleString() || "0"}
            </div>
            <div className="text-sm text-gray-600">Total Raised</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {topCampaigns?.reduce((sum, campaign) => sum + (campaign?.target_amount || 0), 0)?.toLocaleString() || "0"}
            </div>
            <div className="text-sm text-gray-600">Total Target</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{topCampaigns?.length || 0}</div>
            <div className="text-sm text-gray-600">Active Campaigns</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
