"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
  RadialBarChart,
  RadialBar,
  Legend,
} from "recharts"
import {
  TrendingUp,
  Users,
  DollarSign,
  Target,
  Gift,
  Repeat,
  CreditCard,
  Award,
  Activity,
  PieChartIcon,
  BarChart3,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
  Star,
  Building,
  Download,
  Share2,
  Edit,
  RefreshCw,
} from "lucide-react"
import type { CampaignDetailData } from "@/types/finance"

interface CampaignDetailDashboardProps {
  campaign: CampaignDetailData
  onRefresh: () => void
  onEdit: () => void
}

export function CampaignDetailDashboard({ campaign, onRefresh, onEdit }: CampaignDetailDashboardProps) {
  const [activeTab, setActiveTab] = useState("overview")

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: campaign.target_currency?.code || "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500"
      case "completed":
        return "bg-blue-500"
      case "paused":
        return "bg-yellow-500"
      default:
        return "bg-gray-500"
    }
  }

  const getHealthStatus = () => {
    const progress = campaign.progress_percentage
    const daysRemaining = campaign.days_remaining

    if (progress >= 100) return { status: "completed", color: "text-green-600", icon: CheckCircle }
    if (progress >= 75) return { status: "on-track", color: "text-blue-600", icon: TrendingUp }
    if (daysRemaining <= 7) return { status: "urgent", color: "text-red-600", icon: AlertTriangle }
    if (progress >= 50) return { status: "good", color: "text-green-600", icon: TrendingUp }
    return { status: "needs-attention", color: "text-yellow-600", icon: Clock }
  }

  const healthStatus = getHealthStatus()
  const HealthIcon = healthStatus.icon

  // Prepare chart data
  const donationTrendsData =
    campaign.donation_trends?.map((trend) => ({
      ...trend,
      day: formatDate(trend.day),
      formattedTotal: formatCurrency(trend.total),
    })) || []

  const donorSegmentData = campaign.donor_segments
    ? [
        { name: "Micro (<$50)", value: campaign.donor_segments.micro, color: "#8884d8" },
        { name: "Small ($50-$250)", value: campaign.donor_segments.small, color: "#82ca9d" },
        { name: "Medium ($250-$1K)", value: campaign.donor_segments.medium, color: "#ffc658" },
        { name: "Large ($1K-$5K)", value: campaign.donor_segments.large, color: "#ff7300" },
        { name: "Major ($5K+)", value: campaign.donor_segments.major, color: "#8dd1e1" },
      ].filter((segment) => segment.value > 0)
    : []

  const paymentMethodData =
    campaign.payment_method_breakdown?.map((method, index) => ({
      name: method.payment_method?.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase()) || "Unknown",
      value: method.count,
      total: method.total,
      color: ["#3b82f6", "#8b5cf6", "#f59e0b", "#10b981", "#ef4444"][index % 5],
    })) || []

  const donationBreakdownData = campaign.donation_breakdown
    ? [
        {
          type: "Regular",
          count: campaign.donation_breakdown.regular_donations.count,
          total: campaign.donation_breakdown.regular_donations.total,
          color: "#3b82f6",
        },
        {
          type: "Recurring",
          count: campaign.donation_breakdown.recurring_donations.count,
          total: campaign.donation_breakdown.recurring_donations.total,
          color: "#8b5cf6",
        },
        {
          type: "In-Kind",
          count: campaign.donation_breakdown.in_kind_donations.count,
          total: campaign.donation_breakdown.in_kind_donations.total,
          color: "#f59e0b",
        },
      ].filter((item) => item.count > 0 || item.total > 0)
    : []

  // Calculate performance metrics
  const dailyAverage = campaign.current_amount_in_target_currency / Math.max(campaign.days_active, 1)
  const projectedTotal = dailyAverage * (campaign.days_active + campaign.days_remaining)
  const velocityTrend =
    donationTrendsData.length > 1
      ? (donationTrendsData[donationTrendsData.length - 1].total - donationTrendsData[0].total) /
        donationTrendsData.length
      : 0

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold">{campaign.title}</h1>
              <Badge
                variant={campaign.is_active ? "default" : "secondary"}
                className={`${getStatusColor(campaign.is_active ? "active" : "inactive")} text-white`}
              >
                {campaign.is_active ? "Active" : "Inactive"}
              </Badge>
              {campaign.is_featured && (
                <Badge variant="outline" className="border-yellow-300 text-yellow-300">
                  <Star className="h-3 w-3 mr-1" />
                  Featured
                </Badge>
              )}
              <div className={`flex items-center gap-1 ${healthStatus.color}`}>
                <HealthIcon className="h-4 w-4" />
                <span className="text-sm font-medium capitalize">{healthStatus.status.replace("-", " ")}</span>
              </div>
            </div>
            <p className="text-blue-100 text-lg mb-4">{campaign.description}</p>

            {/* Progress Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Campaign Progress</span>
                <span className="text-sm">
                  {formatCurrency(campaign.current_amount_in_target_currency)} of{" "}
                  {formatCurrency(campaign.target_amount)} raised
                </span>
              </div>
              <Progress value={campaign.progress_percentage} className="h-3 bg-blue-200" />
              <div className="flex justify-between text-sm">
                <span>{campaign.progress_percentage.toFixed(1)}% Complete</span>
                <span>{campaign.days_remaining} days remaining</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 ml-6">
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              className="text-white border-white hover:bg-white hover:text-blue-600"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onEdit}
              className="text-white border-white hover:bg-white hover:text-blue-600"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" className="text-white border-white hover:bg-white hover:text-blue-600">
              <Share2 className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" className="text-white border-white hover:bg-white hover:text-blue-600">
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <div className="text-center p-3 bg-white/10 rounded-lg backdrop-blur-sm">
            <div className="flex items-center justify-center mb-1">
              <Users className="h-4 w-4 mr-1" />
              <span className="text-2xl font-bold">{campaign.donors_count}</span>
            </div>
            <span className="text-xs">Total Donors</span>
          </div>
          <div className="text-center p-3 bg-white/10 rounded-lg backdrop-blur-sm">
            <div className="flex items-center justify-center mb-1">
              <DollarSign className="h-4 w-4 mr-1" />
              <span className="text-2xl font-bold">{campaign.donations_count}</span>
            </div>
            <span className="text-xs">Donations</span>
          </div>
          <div className="text-center p-3 bg-white/10 rounded-lg backdrop-blur-sm">
            <div className="flex items-center justify-center mb-1">
              <Repeat className="h-4 w-4 mr-1" />
              <span className="text-2xl font-bold">{campaign.recurring_donors_count}</span>
            </div>
            <span className="text-xs">Recurring</span>
          </div>
          <div className="text-center p-3 bg-white/10 rounded-lg backdrop-blur-sm">
            <div className="flex items-center justify-center mb-1">
              <Gift className="h-4 w-4 mr-1" />
              <span className="text-2xl font-bold">{campaign.in_kind_donors_count}</span>
            </div>
            <span className="text-xs">In-Kind</span>
          </div>
          <div className="text-center p-3 bg-white/10 rounded-lg backdrop-blur-sm">
            <div className="flex items-center justify-center mb-1">
              <TrendingUp className="h-4 w-4 mr-1" />
              <span className="text-2xl font-bold">{formatCurrency(dailyAverage)}</span>
            </div>
            <span className="text-xs">Daily Avg</span>
          </div>
          <div className="text-center p-3 bg-white/10 rounded-lg backdrop-blur-sm">
            <div className="flex items-center justify-center mb-1">
              <Target className="h-4 w-4 mr-1" />
              <span className="text-2xl font-bold">{formatCurrency(projectedTotal)}</span>
            </div>
            <span className="text-xs">Projected</span>
          </div>
        </div>
      </div>

      {/* Main Dashboard Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-white p-1 h-auto shadow-sm">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="donations" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Donations
          </TabsTrigger>
          <TabsTrigger value="donors" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Donors
          </TabsTrigger>
          <TabsTrigger value="banking" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            Banking
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Performance
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Donation Trends Chart */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Donation Trends (Last 30 Days)
                </CardTitle>
                <CardDescription>Daily donation activity and amounts</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={donationTrendsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip
                      formatter={(value, name) => [
                        name === "total" ? formatCurrency(value as number) : value,
                        name === "total" ? "Amount" : "Count",
                      ]}
                    />
                    <Area
                      type="monotone"
                      dataKey="total"
                      stackId="1"
                      stroke="#3b82f6"
                      fill="#3b82f6"
                      fillOpacity={0.6}
                    />
                    <Area
                      type="monotone"
                      dataKey="count"
                      stackId="2"
                      stroke="#8b5cf6"
                      fill="#8b5cf6"
                      fillOpacity={0.6}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Campaign Health */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Campaign Health
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className={`text-6xl font-bold ${healthStatus.color} mb-2`}>
                    {campaign.progress_percentage.toFixed(0)}%
                  </div>
                  <div className="text-sm text-muted-foreground">Goal Achievement</div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Velocity</span>
                    <div className="flex items-center gap-1">
                      {velocityTrend > 0 ? (
                        <TrendingUp className="h-4 w-4 text-green-500" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-500" />
                      )}
                      <span className="text-sm font-medium">{formatCurrency(Math.abs(velocityTrend))}/day</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm">Time Remaining</span>
                    <Badge variant={campaign.days_remaining <= 7 ? "destructive" : "secondary"}>
                      {campaign.days_remaining} days
                    </Badge>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm">Avg per Donor</span>
                    <span className="text-sm font-medium">
                      {formatCurrency(campaign.current_amount_in_target_currency / Math.max(campaign.donors_count, 1))}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Donation Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChartIcon className="h-5 w-5" />
                  Donation Types Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={donationBreakdownData} cx="50%" cy="50%" outerRadius={80} dataKey="total">
                      {donationBreakdownData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  {donationBreakdownData.map((item, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                        <span>{item.type}</span>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant="outline">{item.count}</Badge>
                        <span className="text-muted-foreground">{formatCurrency(item.total)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Methods
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={paymentMethodData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip
                      formatter={(value, name) => [
                        name === "total" ? formatCurrency(value as number) : value,
                        name === "total" ? "Amount" : "Count",
                      ]}
                    />
                    <Bar dataKey="value" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Donor Segments */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Donor Segments
                </CardTitle>
                <CardDescription>Donors by contribution level</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RadialBarChart cx="50%" cy="50%" innerRadius="20%" outerRadius="90%" data={donorSegmentData}>
                    <RadialBar dataKey="value" cornerRadius={10} fill="#8884d8" />
                    <Tooltip />
                    <Legend />
                  </RadialBarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Performance Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{campaign.days_active}</div>
                    <div className="text-xs text-blue-600">Days Active</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {((campaign.current_amount_in_target_currency / campaign.target_amount) * 100).toFixed(1)}%
                    </div>
                    <div className="text-xs text-green-600">Goal Progress</div>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {formatCurrency(campaign.average_donation_amount)}
                    </div>
                    <div className="text-xs text-purple-600">Avg Donation</div>
                  </div>
                  <div className="text-center p-3 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">
                      {Math.round((campaign.donors_count / campaign.days_active) * 10) / 10}
                    </div>
                    <div className="text-xs text-orange-600">Donors/Day</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Other tabs would continue here... */}
        <TabsContent value="donations">
          <Card>
            <CardContent className="p-6">
              <p className="text-center text-muted-foreground">Donations management interface coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="donors">
          <Card>
            <CardContent className="p-6">
              <p className="text-center text-muted-foreground">Donor management interface coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="banking">
          <Card>
            <CardContent className="p-6">
              <p className="text-center text-muted-foreground">Banking management interface coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance">
          <Card>
            <CardContent className="p-6">
              <p className="text-center text-muted-foreground">Performance analytics coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
