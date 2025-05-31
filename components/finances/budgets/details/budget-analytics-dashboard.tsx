"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Target,
  DollarSign,
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  Zap,
  Clock,
  CheckCircle,
  AlertCircle,
  Download,
  RefreshCw,
  Filter,
  SquareIcon as TrendingFlat,
} from "lucide-react"
import {
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Area,
  ComposedChart,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ScatterChart,
  Scatter,
} from "recharts"
import type { Budget } from "@/types/finance"

interface BudgetAnalyticsDashboardProps {
  budget: Budget
  isLoading?: boolean
}

// Safe number conversion with validation
const safeNumber = (value: any): number => {
  if (value === null || value === undefined || value === "") return 0
  const num = Number(value)
  return isNaN(num) || !isFinite(num) ? 0 : num
}

// Safe percentage calculation with validation
const safePercentage = (value: any, total: any): number => {
  const val = safeNumber(value)
  const tot = safeNumber(total)
  if (tot === 0) return 0
  const percentage = (val / tot) * 100
  return isNaN(percentage) || !isFinite(percentage) ? 0 : Math.min(100, Math.max(0, percentage))
}

// Safe date formatting with error handling
const safeFormatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return "N/A"

  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return "Invalid Date"

    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  } catch (error) {
    console.warn("Date formatting error:", error)
    return "Invalid Date"
  }
}

// Safe date calculation helper
const safeDateCalculation = (startDate: string | null | undefined, endDate: string | null | undefined) => {
  if (!startDate || !endDate) {
    return { daysElapsed: 0, totalDays: 0, daysRemaining: 0, timelineProgress: 0 }
  }

  try {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const now = new Date()

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return { daysElapsed: 0, totalDays: 0, daysRemaining: 0, timelineProgress: 0 }
    }

    const totalDays = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)))
    const daysElapsed = Math.max(0, Math.ceil((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)))
    const daysRemaining = Math.max(0, Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
    const timelineProgress = safePercentage(daysElapsed, totalDays)

    return { daysElapsed, totalDays, daysRemaining, timelineProgress }
  } catch (error) {
    console.warn("Date calculation error:", error)
    return { daysElapsed: 0, totalDays: 0, daysRemaining: 0, timelineProgress: 0 }
  }
}

export function BudgetAnalyticsDashboard({ budget, isLoading = false }: BudgetAnalyticsDashboardProps) {
  if (isLoading) {
    return <BudgetAnalyticsLoading />
  }

  if (!budget) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            <AlertCircle className="h-12 w-12 mx-auto mb-4" />
            <p>No budget data available</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Calculate key metrics with safe operations
  const totalAmount = safeNumber(budget.total_amount)
  const spentAmount = safeNumber(budget.spent_amount)
  const remainingAmount = safeNumber(budget.remaining_amount)
  const spentPercentage = safeNumber(budget.spent_percentage)
  const totalFunding = safeNumber(budget.total_funding_allocated)

  // Safe date calculations
  const dateCalcs = safeDateCalculation(budget.start_date, budget.end_date)

  // Budget health calculation with validation
  const budgetHealth = {
    utilization: spentPercentage,
    fundingCoverage: safePercentage(totalFunding, totalAmount),
    burnRate: dateCalcs.daysElapsed > 0 ? spentPercentage / dateCalcs.daysElapsed : 0,
    projectedCompletion: getProjectedCompletion(budget, spentPercentage, dateCalcs),
    riskLevel: getRiskLevel(spentPercentage, remainingAmount, dateCalcs.daysRemaining),
    timelineProgress: dateCalcs.timelineProgress,
    efficiency: getEfficiencyScore(budget, dateCalcs),
  }

  // Process spending trend data safely
  const spendingTrend = generateSpendingTrend(budget, dateCalcs)

  // Process category breakdown safely
  const categoryBreakdown = processCategoryBreakdown(budget)

  // Process funding analysis safely
  const fundingAnalysis = processFundingAnalysis(budget)

  // Performance metrics with safe calculations
  const performanceMetrics = [
    {
      title: "Budget Utilization",
      value: budgetHealth.utilization,
      target: 75,
      format: "percentage" as const,
      trend:
        budgetHealth.utilization > 75
          ? ("up" as const)
          : budgetHealth.utilization < 50
            ? ("down" as const)
            : ("stable" as const),
      color: budgetHealth.utilization > 90 ? "red" : budgetHealth.utilization > 75 ? "yellow" : "green",
      icon: Target,
      description: "Percentage of budget spent",
    },
    {
      title: "Funding Coverage",
      value: budgetHealth.fundingCoverage,
      target: 100,
      format: "percentage" as const,
      trend: budgetHealth.fundingCoverage >= 100 ? ("up" as const) : ("down" as const),
      color: budgetHealth.fundingCoverage >= 100 ? "green" : budgetHealth.fundingCoverage >= 80 ? "yellow" : "red",
      icon: DollarSign,
      description: "Funding allocated vs budget",
    },
    {
      title: "Timeline Progress",
      value: budgetHealth.timelineProgress,
      target: budgetHealth.utilization,
      format: "percentage" as const,
      trend: budgetHealth.timelineProgress > budgetHealth.utilization ? ("up" as const) : ("down" as const),
      color: Math.abs(budgetHealth.timelineProgress - budgetHealth.utilization) < 10 ? "green" : "yellow",
      icon: Clock,
      description: "Time elapsed vs spending rate",
    },
    {
      title: "Efficiency Score",
      value: budgetHealth.efficiency,
      target: 80,
      format: "percentage" as const,
      trend: budgetHealth.efficiency > 80 ? ("up" as const) : ("down" as const),
      color: budgetHealth.efficiency > 80 ? "green" : budgetHealth.efficiency > 60 ? "yellow" : "red",
      icon: Activity,
      description: "Overall budget performance",
    },
  ]

  // Risk analysis with comprehensive factors
  const riskFactors = analyzeRisks(budget, budgetHealth, dateCalcs)

  // Forecast data with confidence intervals
  const forecastData = generateForecast(budget, budgetHealth, dateCalcs)

  // Budget items analysis
  const itemsAnalysis = analyzeItems(budget)

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Budget Analytics Dashboard</h2>
          <p className="text-muted-foreground">
            Comprehensive analysis for {budget.name} • {safeFormatDate(budget.start_date)} -{" "}
            {safeFormatDate(budget.end_date)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {performanceMetrics.map((metric, index) => (
          <Card key={index} className="relative overflow-hidden hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div
                    className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                      metric.color === "green"
                        ? "bg-green-100"
                        : metric.color === "yellow"
                          ? "bg-yellow-100"
                          : metric.color === "red"
                            ? "bg-red-100"
                            : "bg-blue-100"
                    }`}
                  >
                    <metric.icon
                      className={`h-5 w-5 ${
                        metric.color === "green"
                          ? "text-green-600"
                          : metric.color === "yellow"
                            ? "text-yellow-600"
                            : metric.color === "red"
                              ? "text-red-600"
                              : "text-blue-600"
                      }`}
                    />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">{metric.title}</h3>
                    <p className="text-xs text-muted-foreground">{metric.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {metric.trend === "up" && <TrendingUp className="h-4 w-4 text-green-500" />}
                  {metric.trend === "down" && <TrendingDown className="h-4 w-4 text-red-500" />}
                  {metric.trend === "stable" && <TrendingFlat className="h-4 w-4 text-blue-500" />}
                </div>
              </div>

              <div className="space-y-3">
                <div className="text-3xl font-bold">
                  {metric.format === "percentage" ? `${metric.value.toFixed(1)}%` : metric.value.toFixed(2)}
                </div>
                <Progress value={Math.min(metric.value, 100)} className="h-2" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>
                    Target: {metric.target}
                    {metric.format === "percentage" ? "%" : ""}
                  </span>
                  <Badge
                    variant={
                      metric.color === "green" ? "default" : metric.color === "yellow" ? "secondary" : "destructive"
                    }
                  >
                    {metric.color === "green" ? "Good" : metric.color === "yellow" ? "Warning" : "Critical"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Analytics Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="spending">Spending</TabsTrigger>
          <TabsTrigger value="funding">Funding</TabsTrigger>
          <TabsTrigger value="items">Items</TabsTrigger>
          <TabsTrigger value="forecast">Forecast</TabsTrigger>
          <TabsTrigger value="risks">Risks</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Spending Trend */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-500" />
                  Spending Trend Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart data={spendingTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis />
                    <Tooltip
                      formatter={(value, name) => [
                        `$${Number(value).toLocaleString()}`,
                        name === "cumulative"
                          ? "Cumulative Spent"
                          : name === "periodic"
                            ? "Period Spending"
                            : "Budget Line",
                      ]}
                    />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="cumulative"
                      fill="#3B82F6"
                      fillOpacity={0.3}
                      stroke="#3B82F6"
                      name="Cumulative Spent"
                    />
                    <Bar dataKey="periodic" fill="#10B981" name="Period Spending" />
                    <Line
                      type="monotone"
                      dataKey="budget"
                      stroke="#F59E0B"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      name="Budget Line"
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Budget Health Radar */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-orange-500" />
                  Budget Health Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart
                    data={[
                      { metric: "Utilization", value: budgetHealth.utilization, fullMark: 100 },
                      { metric: "Funding", value: budgetHealth.fundingCoverage, fullMark: 100 },
                      { metric: "Timeline", value: budgetHealth.timelineProgress, fullMark: 100 },
                      { metric: "Efficiency", value: budgetHealth.efficiency, fullMark: 100 },
                      { metric: "Risk Control", value: 100 - budgetHealth.riskLevel, fullMark: 100 },
                    ]}
                  >
                    <PolarGrid />
                    <PolarAngleAxis dataKey="metric" />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} />
                    <Radar name="Health Score" dataKey="value" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} />
                    <Tooltip formatter={(value) => [`${Number(value).toFixed(1)}%`, "Score"]} />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Spending Tab */}
        <TabsContent value="spending" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Category Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5 text-green-500" />
                  Category Utilization
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={categoryBreakdown}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="spent"
                      label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}
                    >
                      {categoryBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={getColorByIndex(index)} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, "Spent"]} />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Spending vs Budget by Category */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-purple-500" />
                  Category Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={categoryBreakdown}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, "Amount"]} />
                    <Legend />
                    <Bar dataKey="budgeted" fill="#E5E7EB" name="Budgeted" />
                    <Bar dataKey="spent" fill="#3B82F6" name="Spent" />
                    <Bar dataKey="remaining" fill="#10B981" name="Remaining" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Funding Tab */}
        <TabsContent value="funding" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-purple-500" />
                Funding Sources Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={fundingAnalysis} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="source" type="category" width={120} />
                  <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, "Amount"]} />
                  <Legend />
                  <Bar dataKey="allocated" fill="#3B82F6" name="Allocated" />
                  <Bar dataKey="available" fill="#10B981" name="Available" />
                  <Bar dataKey="remaining" fill="#F59E0B" name="Remaining" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Items Tab */}
        <TabsContent value="items" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Items Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-blue-500" />
                  Items Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <ScatterChart data={itemsAnalysis}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="budgeted" name="Budgeted" />
                    <YAxis dataKey="spent" name="Spent" />
                    <Tooltip
                      formatter={(value, name) => [`$${Number(value).toLocaleString()}`, name]}
                      labelFormatter={(label) => `Item: ${label}`}
                    />
                    <Scatter name="Budget Items" dataKey="spent" fill="#3B82F6" />
                  </ScatterChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Items Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  Items Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {getItemsStatusSummary(budget).map((status, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${status.color}`} />
                      <div>
                        <p className="font-medium text-sm">{status.label}</p>
                        <p className="text-xs text-muted-foreground">{status.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">{status.count}</p>
                      <p className="text-xs text-muted-foreground">{status.percentage}%</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Forecast Tab */}
        <TabsContent value="forecast" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-indigo-500" />
                Budget Forecast & Projections
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <ComposedChart data={forecastData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip
                    formatter={(value, name) => [
                      name === "confidence" ? `${value}%` : `$${Number(value).toLocaleString()}`,
                      name === "projected"
                        ? "Projected Spending"
                        : name === "budget"
                          ? "Budget Allocation"
                          : name === "actual"
                            ? "Actual Spending"
                            : "Confidence",
                    ]}
                  />
                  <Legend />
                  <Area type="monotone" dataKey="budget" fill="#E5E7EB" stroke="#9CA3AF" name="Budget Allocation" />
                  <Line type="monotone" dataKey="actual" stroke="#10B981" strokeWidth={3} name="Actual Spending" />
                  <Line
                    type="monotone"
                    dataKey="projected"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    name="Projected Spending"
                  />
                  <Line
                    type="monotone"
                    dataKey="confidence"
                    stroke="#F59E0B"
                    strokeWidth={2}
                    yAxisId="right"
                    name="Confidence %"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Risks Tab */}
        <TabsContent value="risks" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Risk Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  Risk Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {riskFactors.map((risk, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          risk.level === "high"
                            ? "bg-red-500"
                            : risk.level === "medium"
                              ? "bg-yellow-500"
                              : "bg-green-500"
                        }`}
                      />
                      <div>
                        <p className="font-medium text-sm">{risk.factor}</p>
                        <p className="text-xs text-muted-foreground">{risk.description}</p>
                      </div>
                    </div>
                    <Badge
                      variant={
                        risk.level === "high" ? "destructive" : risk.level === "medium" ? "secondary" : "default"
                      }
                    >
                      {risk.level}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Risk Mitigation */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  Risk Mitigation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {getRiskMitigationStrategies(riskFactors).map((strategy, index) => (
                  <div key={index} className="p-3 rounded-lg border bg-green-50">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                      <div>
                        <p className="font-medium text-sm">{strategy.action}</p>
                        <p className="text-xs text-muted-foreground">{strategy.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Efficiency Score</h3>
                <p className="text-sm text-muted-foreground">Overall budget performance</p>
              </div>
            </div>
            <div className="text-3xl font-bold text-blue-600 mb-2">{budgetHealth.efficiency.toFixed(0)}%</div>
            <p className="text-sm text-muted-foreground">Based on utilization, timeline, and funding metrics</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Target className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Projected Completion</h3>
                <p className="text-sm text-muted-foreground">Estimated completion date</p>
              </div>
            </div>
            <div className="text-lg font-bold text-green-600 mb-2">{budgetHealth.projectedCompletion}</div>
            <p className="text-sm text-muted-foreground">Based on current spending rate</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Zap className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Budget Velocity</h3>
                <p className="text-sm text-muted-foreground">Spending acceleration</p>
              </div>
            </div>
            <div className="text-3xl font-bold text-orange-600 mb-2">{(budgetHealth.burnRate * 30).toFixed(1)}%</div>
            <p className="text-sm text-muted-foreground">Monthly spending rate</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Loading component
function BudgetAnalyticsLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-20" />
          <Skeleton className="h-9 w-20" />
          <Skeleton className="h-9 w-20" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-20 w-full mb-4" />
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-2 w-full mb-2" />
              <Skeleton className="h-4 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-80 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

// Helper functions with improved error handling
function getProjectedCompletion(budget: Budget, spentPercentage: number, dateCalcs: any): string {
  try {
    if (spentPercentage === 0 || dateCalcs.daysElapsed === 0) return "N/A"

    const projectedDays = (dateCalcs.daysElapsed / spentPercentage) * 100
    const projectedDate = new Date(budget.start_date)
    projectedDate.setDate(projectedDate.getDate() + projectedDays)

    if (isNaN(projectedDate.getTime())) return "N/A"

    return projectedDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  } catch (error) {
    console.warn("Projected completion calculation error:", error)
    return "N/A"
  }
}

function getRiskLevel(spentPercentage: number, remainingAmount: number, daysRemaining: number): number {
  let risk = 0

  if (spentPercentage > 90) risk += 30
  if (remainingAmount < 1000) risk += 25
  if (daysRemaining < 30) risk += 20
  if (spentPercentage > 100) risk += 25

  return Math.min(risk, 100)
}

function getEfficiencyScore(budget: Budget, dateCalcs: any): number {
  const utilization = safeNumber(budget.spent_percentage)
  const timelineProgress = dateCalcs.timelineProgress
  const fundingCoverage = safePercentage(budget.total_funding_allocated, budget.total_amount)

  // Weighted efficiency score
  const efficiency = utilization * 0.4 + Math.min(100, fundingCoverage) * 0.3 + timelineProgress * 0.3
  return Math.min(100, Math.max(0, efficiency))
}

function generateSpendingTrend(budget: Budget, dateCalcs: any) {
  const totalAmount = safeNumber(budget.total_amount)
  const spentAmount = safeNumber(budget.spent_amount)

  // Generate monthly data based on timeline
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"]
  return months.map((month, index) => ({
    period: month,
    cumulative: Math.min(spentAmount, (spentAmount / 6) * (index + 1)),
    periodic: spentAmount / 6,
    budget: totalAmount / 6,
  }))
}

function processCategoryBreakdown(budget: Budget) {
  if (!budget.items || budget.items.length === 0) {
    return [{ category: "No Data", budgeted: 0, spent: 0, remaining: 0, items: 0, utilization: 0 }]
  }

  return budget.items.reduce((acc: any[], item) => {
    const category = item.category || "Uncategorized"
    const existing = acc.find((c) => c.category === category)

    if (existing) {
      existing.budgeted += safeNumber(item.budgeted_amount)
      existing.spent += safeNumber(item.spent_amount)
      existing.remaining += safeNumber(item.remaining_amount)
      existing.items += 1
    } else {
      acc.push({
        category,
        budgeted: safeNumber(item.budgeted_amount),
        spent: safeNumber(item.spent_amount),
        remaining: safeNumber(item.remaining_amount),
        items: 1,
        utilization: safeNumber(item.spent_percentage),
      })
    }
    return acc
  }, [])
}

function processFundingAnalysis(budget: Budget) {
  if (!budget.budget_funding || budget.budget_funding.length === 0) {
    return [{ source: "No Funding Data", type: "N/A", allocated: 0, available: 0, remaining: 0, utilization: 0 }]
  }

  return budget.budget_funding.map((funding) => ({
    source: funding.funding_source?.name || "Unknown",
    type: funding.funding_source?.funding_type || "N/A",
    allocated: safeNumber(funding.amount_allocated),
    available: safeNumber(funding.funding_source?.amount_available),
    remaining: safeNumber(funding.funding_source?.amount_remaining),
    utilization: safePercentage(funding.amount_allocated, funding.funding_source?.amount_available),
  }))
}

function analyzeItems(budget: Budget) {
  if (!budget.items || budget.items.length === 0) {
    return [{ name: "No Items", budgeted: 0, spent: 0, utilization: 0 }]
  }

  return budget.items.map((item) => ({
    name: item.name || "Unnamed Item",
    budgeted: safeNumber(item.budgeted_amount),
    spent: safeNumber(item.spent_amount),
    utilization: safeNumber(item.spent_percentage),
  }))
}

function getItemsStatusSummary(budget: Budget) {
  if (!budget.items || budget.items.length === 0) {
    return [{ label: "No Items", description: "No budget items found", count: 0, percentage: 0, color: "bg-gray-500" }]
  }

  const total = budget.items.length
  const completed = budget.items.filter((item) => safeNumber(item.spent_percentage) >= 100).length
  const inProgress = budget.items.filter((item) => {
    const spent = safeNumber(item.spent_percentage)
    return spent > 0 && spent < 100
  }).length
  const notStarted = budget.items.filter((item) => safeNumber(item.spent_percentage) === 0).length

  return [
    {
      label: "Completed",
      description: "Fully utilized items",
      count: completed,
      percentage: safePercentage(completed, total),
      color: "bg-green-500",
    },
    {
      label: "In Progress",
      description: "Partially utilized items",
      count: inProgress,
      percentage: safePercentage(inProgress, total),
      color: "bg-blue-500",
    },
    {
      label: "Not Started",
      description: "Unused items",
      count: notStarted,
      percentage: safePercentage(notStarted, total),
      color: "bg-gray-500",
    },
  ]
}

function analyzeRisks(budget: Budget, health: any, dateCalcs: any) {
  const risks = []

  if (health.utilization > 90) {
    risks.push({
      factor: "Budget Overrun",
      description: "Spending exceeds 90% of budget",
      level: "high" as const,
    })
  }

  if (health.fundingCoverage < 100) {
    risks.push({
      factor: "Funding Gap",
      description: "Insufficient funding allocated",
      level: "medium" as const,
    })
  }

  if (health.burnRate > 3) {
    risks.push({
      factor: "High Burn Rate",
      description: "Spending rate is accelerating",
      level: "high" as const,
    })
  }

  if (dateCalcs.daysRemaining < 30) {
    risks.push({
      factor: "Timeline Pressure",
      description: "Less than 30 days remaining",
      level: "medium" as const,
    })
  }

  if (Math.abs(health.timelineProgress - health.utilization) > 20) {
    risks.push({
      factor: "Pace Mismatch",
      description: "Spending pace doesn't match timeline",
      level: "medium" as const,
    })
  }

  if (risks.length === 0) {
    risks.push({
      factor: "Low Risk",
      description: "Budget is performing well",
      level: "low" as const,
    })
  }

  return risks
}

function getRiskMitigationStrategies(risks: any[]) {
  const strategies = []

  if (risks.some((r) => r.factor === "Budget Overrun")) {
    strategies.push({
      action: "Implement Spending Controls",
      description: "Review and approve all expenditures above threshold",
    })
  }

  if (risks.some((r) => r.factor === "Funding Gap")) {
    strategies.push({
      action: "Secure Additional Funding",
      description: "Identify and allocate additional funding sources",
    })
  }

  if (risks.some((r) => r.factor === "High Burn Rate")) {
    strategies.push({
      action: "Reduce Spending Velocity",
      description: "Defer non-critical expenses to later periods",
    })
  }

  if (risks.some((r) => r.factor === "Timeline Pressure")) {
    strategies.push({
      action: "Prioritize Critical Items",
      description: "Focus resources on high-priority budget items",
    })
  }

  if (strategies.length === 0) {
    strategies.push({
      action: "Continue Monitoring",
      description: "Maintain current oversight and reporting practices",
    })
  }

  return strategies
}

function generateForecast(budget: Budget, health: any, dateCalcs: any) {
  const months = ["Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  const totalAmount = safeNumber(budget.total_amount)
  const spentAmount = safeNumber(budget.spent_amount)

  return months.map((month, index) => {
    const projectedSpent = spentAmount + (health.burnRate * 30 * (index + 1) * totalAmount) / 100
    const confidence = Math.max(50, 90 - index * 5)

    return {
      period: month,
      actual: index === 0 ? spentAmount : null,
      projected: Math.min(projectedSpent, totalAmount),
      budget: totalAmount,
      confidence,
    }
  })
}

function getColorByIndex(index: number): string {
  const colors = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#06B6D4", "#84CC16", "#F97316"]
  return colors[index % colors.length]
}
