"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Area,
  AreaChart,
} from "recharts"
import { TrendingUp, Activity, CheckCircle, Target, DollarSign, Calendar } from "lucide-react"
import type { DonationCampaign } from "@/types/finance"
import { format, subDays, eachDayOfInterval } from "date-fns"

interface CampaignAnalyticsDashboardProps {
  campaigns: DonationCampaign[]
  dashboardStats?: any
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D"]

const HEALTH_COLORS = {
  EXCELLENT: "#10B981",
  VERY_GOOD: "#3B82F6",
  ON_TRACK: "#059669",
  SLIGHTLY_BEHIND: "#F59E0B",
  BEHIND: "#F97316",
  SIGNIFICANTLY_BEHIND: "#EF4444",
  NOT_STARTED: "#6B7280",
}

export function CampaignAnalyticsDashboard({ campaigns, dashboardStats }: CampaignAnalyticsDashboardProps) {
  // Health Distribution
  const healthDistribution = campaigns.reduce((acc: any, campaign) => {
    const health = campaign.fundraising_health || "NOT_STARTED"
    acc[health] = (acc[health] || 0) + 1
    return acc
  }, {})

  const healthData = Object.entries(healthDistribution).map(([health, count]) => ({
    name: health.replace("_", " "),
    value: count,
    color: HEALTH_COLORS[health as keyof typeof HEALTH_COLORS] || "#6B7280",
  }))

  // Status Distribution
  const statusDistribution = campaigns.reduce((acc: any, campaign) => {
    const status = campaign.campaign_status || campaign.status || "UNKNOWN"
    acc[status] = (acc[status] || 0) + 1
    return acc
  }, {})

  const statusData = Object.entries(statusDistribution).map(([status, count]) => ({
    name: status.replace("_", " "),
    value: count,
  }))

  // Campaign Type Distribution
  const typeDistribution = campaigns.reduce((acc: any, campaign) => {
    const type = campaign.campaign_type || "general"
    acc[type] = (acc[type] || 0) + 1
    return acc
  }, {})

  const typeData = Object.entries(typeDistribution).map(([type, count]) => ({
    name: type.replace("_", " "),
    value: count,
  }))

  // Progress Distribution
  const progressRanges = {
    "0-25%": 0,
    "26-50%": 0,
    "51-75%": 0,
    "76-99%": 0,
    "100%+": 0,
  }

  campaigns.forEach((campaign) => {
    const progress = campaign.progress_percentage || 0
    if (progress <= 25) progressRanges["0-25%"]++
    else if (progress <= 50) progressRanges["26-50%"]++
    else if (progress <= 75) progressRanges["51-75%"]++
    else if (progress < 100) progressRanges["76-99%"]++
    else progressRanges["100%+"]++
  })

  const progressData = Object.entries(progressRanges).map(([range, count]) => ({
    range,
    count,
  }))

  // Time-based Analysis
  const now = new Date()
  const last30Days = eachDayOfInterval({
    start: subDays(now, 29),
    end: now,
  })

  const dailyData = last30Days.map((date) => {
    const campaignsStartingThisDay = campaigns.filter(
      (c) => format(new Date(c.start_date), "yyyy-MM-dd") === format(date, "yyyy-MM-dd"),
    ).length

    const campaignsEndingThisDay = campaigns.filter(
      (c) => format(new Date(c.end_date), "yyyy-MM-dd") === format(date, "yyyy-MM-dd"),
    ).length

    return {
      date: format(date, "MMM dd"),
      starting: campaignsStartingThisDay,
      ending: campaignsEndingThisDay,
    }
  })

  // Performance Metrics
  const activeCampaigns = campaigns.filter((c) => c.campaign_status === "ACTIVE")
  const completedCampaigns = campaigns.filter((c) => ["COMPLETED", "SUCCESSFUL"].includes(c.campaign_status || ""))
  const healthyCampaigns = campaigns.filter((c) =>
    ["EXCELLENT", "VERY_GOOD", "ON_TRACK"].includes(c.fundraising_health || ""),
  )

  const avgProgress =
    campaigns.length > 0 ? campaigns.reduce((sum, c) => sum + (c.progress_percentage || 0), 0) / campaigns.length : 0

  const totalTarget = campaigns.reduce((sum, c) => sum + (c.target_amount || 0), 0)
  const totalRaised = campaigns.reduce((sum, c) => sum + (c.current_amount || 0), 0)
  const overallProgress = totalTarget > 0 ? (totalRaised / totalTarget) * 100 : 0

  return (
    <div className="space-y-6">
      {/* Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Progress</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallProgress.toFixed(1)}%</div>
            <Progress value={overallProgress} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              ${totalRaised.toLocaleString()} of ${totalTarget.toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Healthy Campaigns</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{healthyCampaigns.length}</div>
            <p className="text-xs text-muted-foreground">
              {campaigns.length > 0 ? ((healthyCampaigns.length / campaigns.length) * 100).toFixed(1) : 0}% of total
            </p>
            <div className="flex items-center space-x-1 mt-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-xs text-green-600">On track or better</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
            <Activity className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeCampaigns.length}</div>
            <p className="text-xs text-muted-foreground">Currently accepting donations</p>
            <div className="flex items-center space-x-1 mt-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-xs text-blue-600">Live campaigns</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <Target className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {campaigns.length > 0 ? ((completedCampaigns.length / campaigns.length) * 100).toFixed(1) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              {completedCampaigns.length} of {campaigns.length} completed
            </p>
            <div className="flex items-center space-x-1 mt-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span className="text-xs text-purple-600">Completion rate</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Health Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Campaign Health Distribution</CardTitle>
            <CardDescription>Performance health across all campaigns</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={healthData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {healthData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Campaign Status</CardTitle>
            <CardDescription>Current status of all campaigns</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Progress Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Progress Distribution</CardTitle>
            <CardDescription>How campaigns are performing against their goals</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={progressData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#00C49F" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Campaign Timeline */}
        <Card>
          <CardHeader>
            <CardTitle>Campaign Timeline (Last 30 Days)</CardTitle>
            <CardDescription>Campaign start and end dates</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="starting" stackId="1" stroke="#8884d8" fill="#8884d8" />
                <Area type="monotone" dataKey="ending" stackId="1" stroke="#82ca9d" fill="#82ca9d" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Campaign Type Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Campaign Types</CardTitle>
          <CardDescription>Distribution of campaign types in your organization</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {typeData.map((type, index) => (
              <div key={type.name} className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{type.value}</div>
                <div className="text-sm text-muted-foreground capitalize">{type.name}</div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{
                      width: `${campaigns.length > 0 ? (type.value / campaigns.length) * 100 : 0}%`,
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Key Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Key Insights</CardTitle>
          <CardDescription>Important observations about your campaigns</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">
                  <strong>{healthyCampaigns.length}</strong> campaigns are performing well
                </span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-blue-500" />
                <span className="text-sm">
                  Average progress is <strong>{avgProgress.toFixed(1)}%</strong>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-purple-500" />
                <span className="text-sm">
                  <strong>{completedCampaigns.length}</strong> campaigns completed successfully
                </span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-orange-500" />
                <span className="text-sm">
                  <strong>{activeCampaigns.length}</strong> campaigns currently active
                </span>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-green-500" />
                <span className="text-sm">
                  <strong>${totalRaised.toLocaleString()}</strong> total raised
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-500" />
                <span className="text-sm">
                  <strong>
                    {
                      campaigns.filter((c) => {
                        const daysLeft = Math.ceil(
                          (new Date(c.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
                        )
                        return daysLeft <= 7 && daysLeft > 0
                      }).length
                    }
                  </strong>{" "}
                  campaigns ending within 7 days
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
