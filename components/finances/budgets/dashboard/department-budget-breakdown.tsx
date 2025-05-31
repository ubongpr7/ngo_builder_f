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
import { formatCurrency } from "@/lib/currency-utils"

interface DepartmentData {
  department__name: string
  department__id: number
  count: number
  total_amount: number
  spent_amount: number
  avg_utilization: number
}

interface CurrencyStatistics {
  summary: {
    currency_code: string
    currency_name: string
    total_budgets: number
    total_allocated: number
    total_spent: number
    avg_utilization: number
  }
  by_department: DepartmentData[]
}

interface MultiCurrencyStatistics {
  currencies: Record<string, CurrencyStatistics>
}

interface DepartmentBudgetBreakdownProps {
  statistics: CurrencyStatistics | MultiCurrencyStatistics | null
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

export function DepartmentBudgetBreakdown({ statistics, isLoading }: DepartmentBudgetBreakdownProps) {
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

  if (!statistics) {
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

  // Handle both single currency and multi-currency statistics
  let departmentData: DepartmentData[] = []
  let currencyCode = "USD"

  if ("currencies" in statistics) {
    // Multi-currency: combine all department data
    const multiCurrencyStats = statistics as MultiCurrencyStatistics
    const allCurrencies = Object.values(multiCurrencyStats.currencies || {})

    if (allCurrencies.length > 0) {
      // For now, use the first currency's data
      // TODO: Add currency selection or combine data properly
      const firstCurrency = allCurrencies[0]
      departmentData = firstCurrency.by_department || []
      currencyCode = firstCurrency.summary.currency_code
    }
  } else if ("by_department" in statistics) {
    // Single currency
    const singleCurrencyStats = statistics as CurrencyStatistics
    departmentData = singleCurrencyStats.by_department || []
    currencyCode = singleCurrencyStats.summary.currency_code
  }

  if (departmentData.length === 0) {
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

  // Process department data for display
  const processedDepartments = departmentData.map((dept) => {
    const totalAmount = safeNumber(dept.total_amount)
    const spentAmount = safeNumber(dept.spent_amount)
    const utilization = safeNumber(dept.avg_utilization)
    const budgetCount = safeNumber(dept.count)

    const status = getUtilizationStatus(utilization)
    const riskLevel = getRiskLevel(utilization, budgetCount)
    const efficiency = calculateEfficiency(utilization, budgetCount)

    // Generate department code from name
    const code = dept.department__name
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase())
      .join("")
      .substring(0, 4)

    return {
      id: dept.department__id,
      name: dept.department__name,
      code,
      totalBudget: totalAmount,
      spent: spentAmount,
      utilization,
      budgetCount,
      status,
      riskLevel,
      efficiency,
      remaining: totalAmount - spentAmount,
    }
  })

  // Sort by total budget (descending)
  processedDepartments.sort((a, b) => b.totalBudget - a.totalBudget)

  // Prepare chart data
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

  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#84cc16", "#f97316"]

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

  return (
    <div className="space-y-6">
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
                  <p className="text-2xl font-bold">{formatCurrency(currencyCode, dept.totalBudget)}</p>
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
                  <p className="font-semibold">{formatCurrency(currencyCode, dept.spent)}</p>
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
                  <YAxis tickFormatter={(value) => formatCurrency(currencyCode, value)} />
                  <Tooltip
                    formatter={(value: any, name: string) => [
                      formatCurrency(currencyCode, value),
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
                  <Tooltip formatter={(value: any) => [formatCurrency(currencyCode, value), "Budget"]} />
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
                        <div className="text-xs opacity-90">{formatCurrency(currencyCode, dept.totalBudget)}</div>
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
