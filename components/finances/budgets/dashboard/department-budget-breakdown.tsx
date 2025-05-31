"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Select from "react-select"
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
import { Building2, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Target, Activity, Coins } from "lucide-react"
import { formatCurrency } from "@/lib/currency-utils"
import { useGetDepartmentalBreakdownQuery } from "@/redux/features/finance/budgets"

interface DepartmentBudgetBreakdownProps {
  queryParams: Record<string, any>
  isLoading: boolean
}

// Safe number validation and conversion
const safeNumber = (value: any, defaultValue = 0): number => {
  if (value === null || value === undefined) return defaultValue
  const num = typeof value === "string" ? Number.parseFloat(value) : Number(value)
  return isNaN(num) || !isFinite(num) ? defaultValue : num
}

// Helper function to determine status based on utilization
const getUtilizationStatus = (utilization: number): string => {
  if (utilization >= 95) return "critical"
  if (utilization >= 85) return "warning"
  if (utilization < 50) return "underutilized"
  return "healthy"
}

// Helper function to determine risk level
const getRiskLevel = (utilization: number, budgetCount: number): string => {
  if (utilization >= 95 || budgetCount === 0) return "high"
  if (utilization >= 85 || budgetCount <= 2) return "medium"
  return "low"
}

// Helper function to calculate efficiency score
const calculateEfficiency = (utilization: number, budgetCount: number): number => {
  // Base efficiency on utilization being close to optimal (75-85%)
  const optimalUtilization = 80
  const utilizationScore = Math.max(0, 100 - Math.abs(utilization - optimalUtilization) * 2)

  // Factor in budget count (more budgets = better planning)
  const budgetCountScore = Math.min(100, budgetCount * 10)

  // Weighted average
  return Math.round(utilizationScore * 0.7 + budgetCountScore * 0.3)
}

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

function getTrendIcon(utilization: number) {
  if (utilization >= 85) return <TrendingUp className="h-4 w-4 text-green-500" />
  if (utilization < 50) return <TrendingDown className="h-4 w-4 text-red-500" />
  return <Activity className="h-4 w-4 text-gray-500" />
}

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#84cc16", "#f97316"]

export function DepartmentBudgetBreakdown({ queryParams, isLoading: parentLoading }: DepartmentBudgetBreakdownProps) {
  const { data: departmentalData, isLoading: deptLoading } = useGetDepartmentalBreakdownQuery(queryParams)
  const [selectedCurrency, setSelectedCurrency] = useState<string | null>(null)

  const isLoading = parentLoading || deptLoading

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

  if (!departmentalData || !departmentalData.departmental_analytics) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            <Building2 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p>No department data available</p>
            <p className="text-sm">Department breakdown will appear when budgets are created</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const departmentalAnalytics = departmentalData.departmental_analytics || []
  const crossDeptSummary = departmentalData.cross_department_summary || {}

  if (departmentalAnalytics.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            <Building2 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p>No department budget data available</p>
            <p className="text-sm">Create budgets assigned to departments to see breakdown</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Group departments by currency
  const departmentsByCurrency: Record<string, any[]> = {}

  departmentalAnalytics.forEach((analytics) => {
    const currencyCode = analytics.department_info.currency_code
    if (!departmentsByCurrency[currencyCode]) {
      departmentsByCurrency[currencyCode] = []
    }
    departmentsByCurrency[currencyCode].push(analytics)
  })

  // Get available currencies
  const availableCurrencies = Object.keys(departmentsByCurrency)

  // Set default selected currency if not already set
  if (!selectedCurrency && availableCurrencies.length > 0) {
    setSelectedCurrency(availableCurrencies[0])
  }

  // Create currency options for dropdown
  const currencyOptions = availableCurrencies.map((currency) => ({
    value: currency,
    label: `${currency} (${departmentsByCurrency[currency].length} departments)`,
  }))

  // Process department data for the selected currency
  const currentCurrency = selectedCurrency || availableCurrencies[0]
  const currentDepartments = departmentsByCurrency[currentCurrency] || []

  // Process department data for display
  const processedDepartments = currentDepartments.map((analytics) => {
    const dept = analytics.department_info
    const summary = analytics.summary
    const risk = analytics.risk_assessment
    const performance = analytics.performance_metrics

    return {
      id: dept.id,
      name: dept.name,
      code:
        dept.code ||
        dept.name
          .split(" ")
          .map((w) => w.charAt(0))
          .join("")
          .substring(0, 4),
      currencyCode: dept.currency_code,
      totalBudget: summary.total_allocated,
      spent: summary.total_spent,
      utilization: summary.avg_utilization,
      budgetCount: summary.total_budgets,
      status: getUtilizationStatus(summary.avg_utilization),
      riskLevel: risk.overall_risk_score > 70 ? "high" : risk.overall_risk_score > 40 ? "medium" : "low",
      efficiency: performance.budget_efficiency,
      remaining: summary.total_remaining,
      analytics: analytics,
    }
  })

  // Sort by total budget (descending)
  processedDepartments.sort((a, b) => b.totalBudget - a.totalBudget)

  // Prepare chart data for the selected currency
  const chartData = processedDepartments.map((dept) => ({
    name: dept.code,
    budget: dept.totalBudget,
    spent: dept.spent,
    utilization: dept.utilization,
    efficiency: dept.efficiency,
  }))

  const pieData = processedDepartments.map((dept) => ({
    name: dept.name,
    value: dept.totalBudget,
    color: getStatusColor(dept.status),
  }))

  const radarData = processedDepartments.map((dept) => ({
    department: dept.code,
    utilization: dept.utilization,
    efficiency: dept.efficiency,
    budgetHealth:
      dept.status === "healthy" ? 100 : dept.status === "warning" ? 70 : dept.status === "critical" ? 40 : 60,
  }))

  return (
    <div className="space-y-6">
      {/* Currency Selector */}
      {availableCurrencies.length > 1 && (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Coins className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-blue-900">Department Budget Analysis</h3>
            <Badge variant="outline">{availableCurrencies.length} currencies</Badge>
          </div>

          <div className="w-full md:w-64">
            <Select
              value={currencyOptions.find((option) => option.value === currentCurrency)}
              onChange={(option) => setSelectedCurrency(option?.value || availableCurrencies[0])}
              options={currencyOptions}
              className="w-full"
              placeholder="Select currency"
              formatOptionLabel={(option) => (
                <div className="flex items-center gap-2">
                  <Coins className="h-4 w-4" />
                  <span>{option.value}</span>
                </div>
              )}
            />
          </div>
        </div>
      )}

      {/* Department Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {processedDepartments.map((dept) => (
          <Card key={dept.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-blue-500" />
                  <CardTitle className="text-lg truncate">{dept.name}</CardTitle>
                </div>
                <Badge variant="outline" className="text-xs">
                  {dept.code}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">{formatCurrency(dept.currencyCode, dept.totalBudget)}</p>
                  <p className="text-sm text-muted-foreground">Total Budget</p>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(dept.status)}
                  {getTrendIcon(dept.utilization)}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Utilization</span>
                  <span className="font-medium">{dept.utilization.toFixed(1)}%</span>
                </div>
                <Progress value={dept.utilization} className="h-2" />
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Spent</p>
                  <p className="font-semibold">{formatCurrency(dept.currencyCode, dept.spent)}</p>
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
              <CardTitle>Department Budget vs Spending Comparison ({currentCurrency})</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(value) => formatCurrency(currentCurrency, value)} />
                  <Tooltip
                    formatter={(value: any, name: string) => [
                      formatCurrency(currentCurrency, value),
                      name === "budget" ? "Budget" : "Spent",
                    ]}
                  />
                  <Bar dataKey="budget" fill="#3b82f6" name="budget" />
                  <Bar dataKey="spent" fill="#10b981" name="spent" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="distribution" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Budget Distribution by Department ({currentCurrency})</CardTitle>
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
                  <Tooltip formatter={(value: any) => [formatCurrency(currentCurrency, value), "Budget"]} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Department Performance Radar ({currentCurrency})</CardTitle>
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
              <CardTitle>Budget Allocation Map ({currentCurrency})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-12 grid-rows-8 gap-1 h-96">
                {processedDepartments.map((dept, index) => {
                  // Calculate grid size based on budget proportion
                  const totalBudget = processedDepartments.reduce((sum, d) => sum + d.totalBudget, 0)
                  const proportion = dept.totalBudget / totalBudget

                  // Determine grid span based on proportion
                  let colSpan = Math.max(2, Math.min(12, Math.round(proportion * 24)))
                  let rowSpan = Math.max(1, Math.min(4, Math.round(proportion * 8)))

                  // Adjust for first few departments to ensure they fit
                  if (index === 0) {
                    colSpan = Math.min(6, colSpan)
                    rowSpan = Math.min(4, rowSpan)
                  } else if (index === 1) {
                    colSpan = Math.min(6, colSpan)
                    rowSpan = Math.min(3, rowSpan)
                  } else {
                    colSpan = Math.min(4, colSpan)
                    rowSpan = Math.min(2, rowSpan)
                  }

                  return (
                    <div
                      key={dept.id}
                      className={`col-span-${colSpan} row-span-${rowSpan} rounded-lg p-2 flex flex-col justify-center items-center text-white font-semibold relative overflow-hidden`}
                      style={{ backgroundColor: getStatusColor(dept.status) }}
                    >
                      <div className="text-center">
                        <div className="text-xs font-bold truncate">{dept.name}</div>
                        <div className="text-xs opacity-90">{formatCurrency(dept.currencyCode, dept.totalBudget)}</div>
                        <div className="text-xs opacity-75">{dept.utilization.toFixed(0)}% utilized</div>
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/20"></div>
                    </div>
                  )
                })}
              </div>

              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: getStatusColor("healthy") }}></div>
                  <span>Healthy (50-85%)</span>
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
                  <span>Under-utilized (&lt;50%)</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
