"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { TrendingUp, DollarSign } from "lucide-react"
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts"

interface DonationTrendsProps {
  data?: any
  isLoading: boolean
  detailed?: boolean
}

export function DonationTrends({ data, isLoading, detailed = false }: DonationTrendsProps) {
  // Ensure data is available and structured correctly
  const currencyData = data?.currencies ? Object.values(data.currencies)[0] : null;

  // Extract daily trends from the currency data
  const dailyTrends = currencyData?.daily_trends || [];
  
  // Prepare chart data
  const chartData = dailyTrends.map(item => ({
    day: item.day,
    donations: item.total,
    donors: item.count,
    campaigns: currencyData.top_campaigns.length // Assuming campaigns are constant for the currency
  }));

  // Safe calculation with fallback
  const totalDonations = chartData?.reduce((sum, item) => sum + (item.donations || 0), 0) || 0;
  const totalDonors = currencyData?.donor_stats?.total_donors || 0;
  const avgDonation = totalDonors > 0 ? (totalDonations / totalDonors).toFixed(2) : "0";

  if (isLoading) {
    return (
      <Card className={detailed ? "col-span-2" : ""}>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    )
  }

  const avgGrowth = 12.5; // Placeholder for average growth calculation

  return (
    <Card className={detailed ? "col-span-2" : ""}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              Donation Trends
            </CardTitle>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Monthly donation performance</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">${totalDonations.toLocaleString()}</div>
            <div className="flex items-center text-sm">
              <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
              <span className="text-green-600 font-medium">+{avgGrowth}%</span>
              <span className="text-gray-600 ml-1">vs last period</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="donationGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="day" axisLine={false} tickLine={false} className="text-xs" />
              <YAxis
                axisLine={false}
                tickLine={false}
                className="text-xs"
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-white dark:bg-gray-800 p-3 border rounded-lg shadow-lg">
                        <p className="font-medium">{label}</p>
                        <p className="text-green-600">Donations: ${payload[0].value?.toLocaleString()}</p>
                        {detailed && (
                          <>
                            <p className="text-blue-600">Donors: {payload[0].payload.donors}</p>
                            <p className="text-purple-600">Campaigns: {payload[0].payload.campaigns}</p>
                          </>
                        )}
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Area
                type="monotone"
                dataKey="donations"
                stroke="#10b981"
                strokeWidth={2}
                fill="url(#donationGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {detailed && (
          <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t">
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                {totalDonors}
              </div>
              <div className="text-xs text-gray-600">Total Donors</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                ${avgDonation}
              </div>
              <div className="text-xs text-gray-600">Avg Donation</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                {currencyData?.top_campaigns.length || 0}
              </div>
              <div className="text-xs text-gray-600">Active Campaigns</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
