"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts"
import { Building2, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Target, Activity } from "lucide-react"

interface DepartmentBudgetBreakdownProps {
  statistics: any
  isLoading: boolean
}

export function DepartmentBudgetBreakdown({ statistics, isLoading }: DepartmentBudgetBreakdownProps) {
  // Mock department data - replace with real API data
  const departmentData = [
    {
      id: 1,
      name: "Programs & Services",
      code: "PROG",
      totalBudget: 2500000,
      spent: 1875000,
      utilization: 75,
      budgetCount: 12,
      status: "healthy",
      trend: "up",
      efficiency: 92,
      riskLevel: "low",
    },
    {
      id: 2,
      name: "Operations",
      code: "OPS",
      totalBudget: 800000,
      spent: 720000,
      utilization: 90,
      budgetCount: 8,
      status: "warning",
      trend: "up",
      efficiency: 88,
      riskLevel: "medium",
    },
    {
      id: 3,
      name: "Marketing & Outreach",
      code: "MKTG",
      totalBudget: 450000,
      spent: 315000,
      utilization: 70,
      budgetCount: 6,
      status: "healthy",
      trend: "down",
      efficiency: 85,
      riskLevel: "low",
    },
    {
      id: 4,
      name: "Administration",
      code: "ADMIN",
      totalBudget: 600000,
      spent: 540000,
      utilization: 90,
      budgetCount: 5,
      status: "warning",
      trend: "stable",
      efficiency: 78,
      riskLevel: "medium",
    },
    {
      id: 5,
      name: "Research & Development",
      code: "RND",
      totalBudget: 350000,
      spent: 175000,
      utilization: 50,
      budgetCount: 4,
      status: "underutilized",
      trend: "down",
      efficiency: 95,
      riskLevel: "low",
    },
    {
      id: 6,
      name: "Emergency Response",
      code: "EMRG",
      totalBudget: 1200000,
      spent: 1080000,
      utilization: 90,
      budgetCount: 3,
      status: "critical",
      trend: "up",
      efficiency: 82,
      riskLevel: "high",
    },
  ]

  const chartData = departmentData.map((dept) => ({
    name: dept.code,
    budget: dept.totalBudget / 1000,
    spent: dept.spent / 1000,
    utilization: dept.utilization,
    efficiency: dept.efficiency,
  }))

  const pieData = departmentData.map((dept) => ({
    name: dept.name,
    value: dept.totalBudget,
    color: getStatusColor(dept.status),
  }))

  const radarData = departmentData.map((dept) => ({
    department: dept.code,
    utilization: dept.utilization,
    efficiency: dept.efficiency,
    budgetHealth: dept.status === "healthy" ? 100 : dept.status === "warning" ? 70 : 40,
  }))

  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"]

  function getStatusColor(status: string) {
    switch (status) {
      case "healthy":
        return "#10b981"
      case "warning":
        return "#f59e0b"
      case "critical":
        return "#ef4444"
      case "underutilized":
        return "#6b7280"
      default:
        return "#3b82f6"
    }
  }

  function getStatusIcon(status: string) {
    switch (status) {
      case "healthy":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case "critical":
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      case "underutilized":
        return <TrendingDown className="h-4 w-4 text-gray-500" />
      default:
        return <Activity className="h-4 w-4 text-blue-500" />
    }
  }

  function getTrendIcon(trend: string) {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-green-500" />
      case "down":
        return <TrendingDown className="h-4 w-4 text-red-500" />
      default:
        return <Activity className="h-4 w-4 text-gray-500" />
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-2 bg-gray-200 rounded w-full"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Department Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {departmentData.map((dept) => (
          <Card key={dept.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-blue-500" />
                  <CardTitle className="text-lg">{dept.name}</CardTitle>
                </div>
                <Badge variant="outline" className="text-xs">
                  {dept.code}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">${(dept.totalBudget / 1000).toFixed(0)}K</p>
                  <p className="text-sm text-muted-foreground">Total Budget</p>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(dept.status)}
                  {getTrendIcon(dept.trend)}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Utilization</span>
                  <span className="font-medium">{dept.utilization}%</span>
                </div>
                <Progress value={dept.utilization} className="h-2" />
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Spent</p>
                  <p className="font-semibold">${(dept.spent / 1000).toFixed(0)}K</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Budgets</p>
                  <p className="font-semibold">{dept.budgetCount}</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t">
                <div className="flex items-center gap-1">
                  <Target className="h-4 w-4 text-blue-500" />
                  <span className="text-sm">Efficiency: {dept.efficiency}%</span>
                </div>
                <Badge
                  variant={
                    dept.riskLevel === "low" ? "default" : dept.riskLevel === "medium" ? "secondary" : "destructive"
                  }
                  className="text-xs"
                >
                  {dept.riskLevel} risk
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Analytics Tabs */}
      <Tabs defaultValue="comparison" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="comparison">Budget Comparison</TabsTrigger>
          <TabsTrigger value="distribution">Distribution</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="allocation">Allocation Map</TabsTrigger>
        </TabsList>

        <TabsContent value="comparison" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Department Budget vs Spending Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip
                    formatter={(value: any, name: string) => [`$${value}K`, name === "budget" ? "Budget" : "Spent"]}
                  />
                  <Bar dataKey="budget" fill="#3b82f6" name="Budget" />
                  <Bar dataKey="spent" fill="#10b981" name="Spent" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="distribution" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Budget Distribution by Department</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => [`$${(value / 1000).toFixed(0)}K`, "Budget"]} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Department Performance Radar</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="department" />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} />
                  <Radar name="Utilization" dataKey="utilization" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                  <Radar name="Efficiency" dataKey="efficiency" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                  <Radar name="Health" dataKey="budgetHealth" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.3} />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="allocation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Budget Allocation Map</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-12 grid-rows-8 gap-1 h-96">
                {/* Programs & Services - Largest allocation */}
                <div
                  className="col-span-6 row-span-4 rounded-lg p-4 flex flex-col justify-center items-center text-white font-semibold relative overflow-hidden"
                  style={{ backgroundColor: getStatusColor("healthy") }}
                >
                  <div className="text-center">
                    <div className="text-lg font-bold">Programs & Services</div>
                    <div className="text-sm opacity-90">$2,500K</div>
                    <div className="text-xs opacity-75">75% utilized</div>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/20"></div>
                </div>

                {/* Emergency Response - Second largest */}
                <div
                  className="col-span-6 row-span-3 rounded-lg p-3 flex flex-col justify-center items-center text-white font-semibold relative overflow-hidden"
                  style={{ backgroundColor: getStatusColor("critical") }}
                >
                  <div className="text-center">
                    <div className="text-base font-bold">Emergency Response</div>
                    <div className="text-sm opacity-90">$1,200K</div>
                    <div className="text-xs opacity-75">90% utilized</div>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/20"></div>
                </div>

                {/* Operations */}
                <div
                  className="col-span-4 row-span-3 rounded-lg p-3 flex flex-col justify-center items-center text-white font-semibold relative overflow-hidden"
                  style={{ backgroundColor: getStatusColor("warning") }}
                >
                  <div className="text-center">
                    <div className="text-sm font-bold">Operations</div>
                    <div className="text-xs opacity-90">$800K</div>
                    <div className="text-xs opacity-75">90% used</div>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/20"></div>
                </div>

                {/* Administration */}
                <div
                  className="col-span-4 row-span-3 rounded-lg p-3 flex flex-col justify-center items-center text-white font-semibold relative overflow-hidden"
                  style={{ backgroundColor: getStatusColor("warning") }}
                >
                  <div className="text-center">
                    <div className="text-sm font-bold">Administration</div>
                    <div className="text-xs opacity-90">$600K</div>
                    <div className="text-xs opacity-75">90% used</div>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/20"></div>
                </div>

                {/* Marketing & Outreach */}
                <div
                  className="col-span-4 row-span-3 rounded-lg p-3 flex flex-col justify-center items-center text-white font-semibold relative overflow-hidden"
                  style={{ backgroundColor: getStatusColor("healthy") }}
                >
                  <div className="text-center">
                    <div className="text-sm font-bold">Marketing</div>
                    <div className="text-xs opacity-90">$450K</div>
                    <div className="text-xs opacity-75">70% used</div>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/20"></div>
                </div>

                {/* Research & Development */}
                <div
                  className="col-span-6 row-span-1 rounded-lg p-2 flex items-center justify-center text-white font-semibold relative overflow-hidden"
                  style={{ backgroundColor: getStatusColor("underutilized") }}
                >
                  <div className="text-center">
                    <div className="text-xs font-bold">R&D - $350K (50%)</div>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/20"></div>
                </div>

                {/* Emergency Response continuation */}
                <div
                  className="col-span-6 row-span-1 rounded-lg p-2 flex items-center justify-center text-white text-xs font-semibold relative overflow-hidden"
                  style={{ backgroundColor: getStatusColor("critical"), opacity: 0.8 }}
                >
                  <div>High Priority - Immediate Attention Required</div>
                  <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/20"></div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: getStatusColor("healthy") }}></div>
                  <span>Healthy (70-85%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: getStatusColor("warning") }}></div>
                  <span>Warning (85-95%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: getStatusColor("critical") }}></div>
                  <span>Critical (95%+)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: getStatusColor("underutilized") }}></div>
                  <span>Under-utilized (&lt;70%)</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
