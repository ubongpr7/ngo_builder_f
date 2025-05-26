"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  Pie,
  PieChart,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts"
import { TrendingUp, Target, Calendar, DollarSign } from "lucide-react"
import  { DonationCampaign } from "@/types/finance"
import { format, subDays, eachDayOfInterval } from "date-fns"

interface CampaignStatisticsProps {
  totalCampaigns: number
  activeCampaigns: number
  completedCampaigns: number
  totalRaised: number
  totalTarget: number
  campaigns: DonationCampaign[]
}

export function CampaignStatistics({
  totalCampaigns,
  activeCampaigns,
  completedCampaigns,
  totalRaised,
  totalTarget,
  campaigns,
}: CampaignStatisticsProps) {
  // Performance by status
  const statusData = [
    { name: "Active", value: activeCampaigns, color: "#3b82f6" },
    { name: "Completed", value: completedCampaigns, color: "#10b981" },
    { name: "Inactive", value: totalCampaigns - activeCampaigns - completedCampaigns, color: "#6b7280" },
  ]

  // Top performing campaigns
  const topCampaigns = campaigns
    .sort(
      (a, b) =>
        Number.parseFloat(b.current_amount_in_target_currency) - Number.parseFloat(a.current_amount_in_target_currency),
    )
    .slice(0, 5)
    .map((campaign) => ({
      name: campaign.title.length > 20 ? campaign.title.substring(0, 20) + "..." : campaign.title,
      raised: Number.parseFloat(campaign.current_amount_in_target_currency),
      target: Number.parseFloat(campaign.target_amount),
      progress: Number.parseFloat(campaign.progress_percentage),
    }))

  // Campaign creation trends (last 30 days)
  const last30Days = eachDayOfInterval({
    start: subDays(new Date(), 29),
    end: new Date(),
  })

  const creationTrends = last30Days.map((date) => {
    const dayStr = format(date, "yyyy-MM-dd")
    const campaignsCreated = campaigns.filter(
      (campaign) => format(new Date(campaign.created_at), "yyyy-MM-dd") === dayStr,
    ).length

    return {
      date: format(date, "MMM dd"),
      campaigns: campaignsCreated,
    }
  })

  // Success rate by target amount ranges
  const targetRanges = [
    { range: "< $1K", min: 0, max: 1000 },
    { range: "$1K - $5K", min: 1000, max: 5000 },
    { range: "$5K - $10K", min: 5000, max: 10000 },
    { range: "$10K - $50K", min: 10000, max: 50000 },
    { range: "> $50K", min: 50000, max: Number.POSITIVE_INFINITY },
  ]

  const successByRange = targetRanges.map((range) => {
    const campaignsInRange = campaigns.filter((campaign) => {
      const target = Number.parseFloat(campaign.target_amount)
      return target >= range.min && target < range.max
    })

    const successfulCampaigns = campaignsInRange.filter(
      (campaign) => Number.parseFloat(campaign.progress_percentage) >= 100,
    ).length

    return {
      range: range.range,
      total: campaignsInRange.length,
      successful: successfulCampaigns,
      successRate: campaignsInRange.length > 0 ? (successfulCampaigns / campaignsInRange.length) * 100 : 0,
    }
  })

  const chartConfig = {
    raised: {
      label: "Amount Raised",
      color: "hsl(var(--chart-1))",
    },
    target: {
      label: "Target Amount",
      color: "hsl(var(--chart-2))",
    },
    campaigns: {
      label: "Campaigns Created",
      color: "hsl(var(--chart-3))",
    },
    successRate: {
      label: "Success Rate",
      color: "hsl(var(--chart-4))",
    },
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Campaign Status Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-600" />
            Campaign Status Distribution
          </CardTitle>
          <CardDescription>Breakdown of campaigns by current status</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Top Performing Campaigns */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            Top Performing Campaigns
          </CardTitle>
          <CardDescription>Campaigns with highest amounts raised</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topCampaigns} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="raised" fill="var(--color-raised)" name="Amount Raised" radius={[4, 4, 0, 0]} />
                <Bar
                  dataKey="target"
                  fill="var(--color-target)"
                  name="Target Amount"
                  radius={[4, 4, 0, 0]}
                  opacity={0.7}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Campaign Creation Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-purple-600" />
            Campaign Creation Trends
          </CardTitle>
          <CardDescription>New campaigns created over the last 30 days</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={creationTrends} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey="campaigns"
                  stroke="var(--color-campaigns)"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  name="Campaigns Created"
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Success Rate by Target Amount */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-yellow-600" />
            Success Rate by Target Amount
          </CardTitle>
          <CardDescription>Campaign success rates across different target ranges</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={successByRange} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <ChartTooltip
                  content={<ChartTooltipContent />}
                  formatter={(value, name) => [
                    name === "successRate" ? `${value}%` : value,
                    name === "successRate" ? "Success Rate" : name,
                  ]}
                />
                <Bar
                  dataKey="successRate"
                  fill="var(--color-successRate)"
                  name="Success Rate (%)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}
