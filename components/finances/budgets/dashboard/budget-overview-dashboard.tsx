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

  const monthlyTrends =
    statistics?.monthly_trends?.map((trend) => ({
      month: trend.month_name?.split(" ")[0] || trend.month,
      allocated: trend.total_allocated || 0,
      spent: trend.total_spent || 0,
      remaining: (trend.total_allocated || 0) - (trend.total_spent || 0),
    })) || []

  const budgetTypeData =
    statistics?.by_type?.length > 0
      ? statistics.by_type.map((item: any, index: number) => ({
          name: item.budget_type?.replace("_", " ").toUpperCase() || "Unknown",
          value: Number(item.total_amount) || 0,
          count: item.count || 0,
          color: ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#06B6D4"][index % 6],
        }))
      : [{ name: "No Data", value: 1, count: 0, color: "#E5E7EB" }]

  const statusData =
    statistics?.by_status?.length > 0
      ? statistics.by_status.map((item: any, index: number) => ({
          name: item.status?.replace("_", " ").toUpperCase() || "Unknown",
          value: Number(item.total_amount) || 0,
          count: item.count || 0,
          color: ["#10B981", "#F59E0B", "#3B82F6", "#EF4444", "#8B5CF6"][index % 5],
        }))
      : [{ name: "No Data", value: 1, count: 0, color: "#E5E7EB" }]

  const utilizationData =
    statistics?.utilization_summary?.length > 0
      ? statistics.utilization_summary.slice(0, 10).map((item: any) => ({
          name: (item.budget_title || "Unnamed Budget").substring(0, 20) + "...",
          utilization: Number(item.utilization_percentage) || 0,
          allocated: Number(item.total_amount) || 0,
          spent: Number(item.spent_amount) || 0,
          health:
            Number(item.utilization_percentage) > 90
              ? "critical"
              : Number(item.utilization_percentage) > 75
                ? "warning"
                : "healthy",
        }))
      : []

  return (
    <div className="space-y-6">
      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Active Budgets</p>
                <p className="text-3xl font-bold">{statistics?.summary?.active_budgets || 0}</p>
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
                <p className="text-3xl font-bold">{statistics?.summary?.avg_utilization?.toFixed(1) || "0.0"}%</p>
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
                <p className="text-3xl font-bold">{statistics?.summary?.pending_approval || 0}</p>
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
                <p className="text-3xl font-bold">{statistics?.summary?.avg_utilization?.toFixed(0) || "0"}%</p>
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
            {monthlyTrends.length === 0 ? (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No budget trend data available</p>
                </div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={monthlyTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`$${value}`, ""]} />
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
            )}
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
            {budgetTypeData.length === 1 && budgetTypeData[0].name === "No Data" ? (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No budget type data available</p>
                </div>
              </div>
            ) : (
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
                  <Tooltip formatter={(value) => [`$${value}`, "Amount"]} />
                </PieChart>
              </ResponsiveContainer>
            )}
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
                  name === "utilization" ? `${value}%` : `$${value}`,
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
                <div className="text-sm text-muted-foreground">${status.value || "0"}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
