"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { TrendingUp, PieChartIcon, BarChart3, Activity } from "lucide-react"
import type { DonationCampaign } from "@/types/finance"

interface DonationAnalyticsChartsProps {
  campaign: DonationCampaign
}

export function DonationAnalyticsCharts({ campaign }: DonationAnalyticsChartsProps) {
  // Use actual campaign data
  const donationTypeData = [
    {
      type: "Regular",
      count: campaign.donation_breakdown?.regular_donations?.count || 0,
      total: campaign.donation_breakdown?.regular_donations?.total || 0,
    },
    {
      type: "Recurring",
      count: campaign.donation_breakdown?.recurring_donations?.count || 0,
      total: campaign.donation_breakdown?.recurring_donations?.total || 0,
    },
    {
      type: "In-Kind",
      count: campaign.donation_breakdown?.in_kind_donations?.count || 0,
      total: campaign.donation_breakdown?.in_kind_donations?.total || 0,
    },
  ].filter((item) => item.count > 0 || item.total > 0) // Only show types with data

  // Use actual payment method data from campaign
  const paymentMethodData =
    campaign.payment_method_breakdown?.map((method, index) => ({
      name: method.payment_method?.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase()) || "Unknown",
      value: method.count || 0,
      total: method.total || 0,
      color: ["#3b82f6", "#8b5cf6", "#f59e0b", "#10b981", "#ef4444"][index % 5],
    })) || []

  // Use actual daily trends data
  const dailyTrendsData =
    campaign.donation_trends?.map((trend, index) => ({
      day: trend.day,
      count: trend.count || 0,
      total: trend.total || 0,
      id: `trend-${index}`,
    })) || []

  // Use actual donor segments
  const donorSegmentsData = campaign.donor_segments
    ? Object.entries(campaign.donor_segments).map(([segment, count], index) => ({
        segment: segment.charAt(0).toUpperCase() + segment.slice(1),
        count: count as number,
        id: `segment-${index}`,
      }))
    : []

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: campaign.target_currency?.code || "USD",
      minimumFractionDigits: 0,
    }).format(value)
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" })
  }

  // Show message if no data available
  if (donationTypeData.length === 0 && paymentMethodData.length === 0 && dailyTrendsData.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">
            No analytics data available for this campaign yet. Data will appear once donations are received.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Daily Trends - only show if data exists */}
      {dailyTrendsData.length > 0 && (
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Daily Donation Trends
            </CardTitle>
            <CardDescription>Recent donation activity</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dailyTrendsData} key="daily-trends-chart">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" tickFormatter={formatDate} />
                <YAxis />
                <Tooltip
                  labelFormatter={formatDate}
                  formatter={(value, name) => [
                    name === "total" ? formatCurrency(value as number) : value,
                    name === "total" ? "Amount" : "Count",
                  ]}
                />
                <Bar dataKey="total" fill="#3b82f6" key="daily-total-bar" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Donation Count by Type - only show if data exists */}
      {donationTypeData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Donation Count by Type
            </CardTitle>
            <CardDescription>Number of donations by type</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={donationTypeData} key="donation-count-chart">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="type" />
                <YAxis />
                <Tooltip formatter={(value) => [value, "Donations"]} />
                <Bar dataKey="count" fill="#3b82f6" key="count-bar" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Payment Methods - only show if data exists */}
      {paymentMethodData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChartIcon className="h-5 w-5" />
              Payment Methods
            </CardTitle>
            <CardDescription>Distribution of payment methods</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart key="payment-methods-chart">
                <Pie data={paymentMethodData} cx="50%" cy="50%" outerRadius={80} dataKey="value" key="payment-pie">
                  {paymentMethodData.map((entry, index) => (
                    <Cell key={`payment-cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [value, "Count"]} />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {paymentMethodData.map((method, index) => (
                <div key={`payment-legend-${index}`} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: method.color }} />
                    <span>{method.name}</span>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="outline">{method.value}</Badge>
                    <span className="text-muted-foreground">{formatCurrency(method.total)}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Donation Amount by Type - only show if data exists */}
      {donationTypeData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Total Amount by Type
            </CardTitle>
            <CardDescription>Total amount raised by donation type</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={donationTypeData} key="donation-amount-chart">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="type" />
                <YAxis />
                <Tooltip formatter={(value) => [formatCurrency(value as number), "Amount"]} />
                <Bar dataKey="total" fill="#8b5cf6" key="total-bar" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Donor Segments - only show if data exists */}
      {donorSegmentsData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Donor Segments
            </CardTitle>
            <CardDescription>Donors by contribution level</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={donorSegmentsData} key="donor-segments-chart">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="segment" />
                <YAxis />
                <Tooltip formatter={(value) => [value, "Donors"]} />
                <Bar dataKey="count" fill="#f59e0b" key="segments-bar" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Campaign Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Campaign Summary</CardTitle>
          <CardDescription>Key metrics for this campaign</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Total Donors</span>
              <Badge variant="secondary">{campaign.donors_count || 0}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Total Donations</span>
              <Badge variant="secondary">{campaign.donations_count || 0}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Amount Raised</span>
              <Badge variant="secondary">{formatCurrency(campaign.current_amount_in_target_currency || 0)}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Goal Progress</span>
              <Badge variant="secondary">{Number(campaign.progress_percentage)?.toFixed(1) || 0}%</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
