"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, AlertTriangle, CheckCircle, Clock, Target, Activity, Zap, Building2 } from "lucide-react"
import {
  AreaChart,
  Area,
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
} from "recharts"

interface BudgetOverviewDashboardProps {
  statistics: any
  isLoading: boolean
}

export function BudgetOverviewDashboard({ statistics, isLoading }: BudgetOverviewDashboardProps) {
  if (isLoading) {
    return <div>Loading overview...</div>
  }

  // Mock data for charts - replace with real data
  const monthlyTrends = [
    { month: "Jan", allocated: 120000, spent: 95000, remaining: 25000 },
    { month: "Feb", allocated: 135000, spent: 108000, remaining: 27000 },
    { month: "Mar", allocated: 150000, spent: 125000, remaining: 25000 },
    { month: "Apr", allocated: 165000, spent: 140000, remaining: 25000 },
    { month: "May", allocated: 180000, spent: 155000, remaining: 25000 },
    { month: "Jun", allocated: 195000, spent: 170000, remaining: 25000 },
  ]

  const budgetTypeData =
    statistics?.by_type?.map((item: any, index: number) => ({
      name: item.budget_type,
      value: item.total_amount,
      count: item.count,
      color: ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#06B6D4"][index % 6],
    })) || []

  const statusData =
    statistics?.by_status?.map((item: any, index: number) => ({
      name: item.status,
      value: item.total_amount,
      count: item.count,
      color: ["#10B981", "#F59E0B", "#3B82F6", "#EF4444", "#8B5CF6"][index % 5],
    })) || []

  const utilizationData =
    statistics?.utilization_summary?.slice(0, 10)?.map((item: any) => ({
      name: item.budget_title.substring(0, 20) + "...",
      utilization: Number.parseFloat(item.utilization_percentage),
      allocated: item.total_amount,
      spent: item.spent_amount,
      health:
        Number.parseFloat(item.utilization_percentage) > 90
          ? "critical"
          : Number.parseFloat(item.utilization_percentage) > 75
            ? "warning"
            : "healthy",
    })) || []

  return (
    <div className="space-y-6">
      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Active Budgets</p>
                <p className="text-3xl font-bold">
                  {statistics?.by_status?.find((s: any) => s.status === "active")?.count || 0}
                </p>
              </div>
              <Target className="h-8 w-8 text-blue-200" />
            </div>
            <div className="mt-4 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm">+15% this quarter</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Budget Efficiency</p>
                <p className="text-3xl font-bold">
                  {statistics?.total_allocated > 0
                    ? Math.round((statistics.total_spent / statistics.total_allocated) * 100)
                    : 0}
                  %
                </p>
              </div>
              <Activity className="h-8 w-8 text-green-200" />
            </div>
            <div className="mt-4 flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm">Optimal range</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">Pending Approval</p>
                <p className="text-3xl font-bold">
                  {statistics?.by_status?.find((s: any) => s.status === "pending_approval")?.count || 0}
                </p>
              </div>
              <Clock className="h-8 w-8 text-orange-200" />
            </div>
            <div className="mt-4 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm">Requires attention</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Avg. Utilization</p>
                <p className="text-3xl font-bold">
                  {utilizationData.length > 0
                    ? Math.round(
                        utilizationData.reduce((acc, item) => acc + item.utilization, 0) / utilizationData.length,
                      )
                    : 0}
                  %
                </p>
              </div>
              <Zap className="h-8 w-8 text-purple-200" />
            </div>
            <div className="mt-4 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm">+5% improvement</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Budget Allocation Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              Budget Allocation Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={monthlyTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, ""]} />
                <Area
                  type="monotone"
                  dataKey="allocated"
                  stackId="1"
                  stroke="#3B82F6"
                  fill="#3B82F6"
                  fillOpacity={0.6}
                />
                <Area type="monotone" dataKey="spent" stackId="2" stroke="#10B981" fill="#10B981" fillOpacity={0.6} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Budget Types Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-green-500" />
              Budget Types Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={budgetTypeData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {budgetTypeData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, "Amount"]} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Budget Utilization Matrix */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-purple-500" />
            Budget Utilization Matrix
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={utilizationData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" domain={[0, 100]} />
              <YAxis dataKey="name" type="category" width={150} />
              <Tooltip
                formatter={(value, name) => [
                  name === "utilization" ? `${value}%` : `$${value.toLocaleString()}`,
                  name === "utilization" ? "Utilization" : name === "allocated" ? "Allocated" : "Spent",
                ]}
              />
              <Bar
                dataKey="utilization"
                fill={(entry: any) =>
                  entry.health === "critical" ? "#EF4444" : entry.health === "warning" ? "#F59E0B" : "#10B981"
                }
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {statusData.map((status: any, index: number) => (
          <Card key={index} className="text-center">
            <CardContent className="p-4">
              <div className="flex flex-col items-center gap-2">
                <Badge variant="secondary" style={{ backgroundColor: status.color + "20", color: status.color }}>
                  {status.name.replace("_", " ").toUpperCase()}
                </Badge>
                <div className="text-2xl font-bold">{status.count}</div>
                <div className="text-sm text-muted-foreground">${status.value?.toLocaleString() || "0"}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
