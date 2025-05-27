"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
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
} from "recharts"
import type { Budget } from "@/types/finance"

interface BudgetAnalyticsDashboardProps {
  budget: Budget
}

// Safe number conversion
const safeNumber = (value: any): number => {
  const num = Number(value)
  return isNaN(num) || !isFinite(num) ? 0 : num
}

// Safe percentage calculation
const safePercentage = (value: any, total: any): number => {
  const val = safeNumber(value)
  const tot = safeNumber(total)
  return tot > 0 ? (val / tot) * 100 : 0
}

export function BudgetAnalyticsDashboard({ budget }: BudgetAnalyticsDashboardProps) {
  // Calculate key metrics
  const totalAmount = safeNumber(budget.total_amount)
  const spentAmount = safeNumber(budget.spent_amount)
  const remainingAmount = safeNumber(budget.remaining_amount)
  const spentPercentage = safeNumber(budget.spent_percentage)
  const totalFunding = safeNumber(budget.total_funding_allocated)

  // Budget health calculation
  const budgetHealth = {
    utilization: spentPercentage,
    fundingCoverage: safePercentage(totalFunding, totalAmount),
    burnRate: spentPercentage / Math.max(1, getDaysElapsed(budget.start_date)),
    projectedCompletion: getProjectedCompletion(budget, spentPercentage),
    riskLevel: getRiskLevel(spentPercentage, remainingAmount, budget.end_date),
  }

  // Spending trend data (simulated based on budget data)
  const spendingTrend = generateSpendingTrend(budget)

  // Category breakdown from budget items
  const categoryBreakdown =
    budget.items?.reduce((acc: any[], item) => {
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
    }, []) || []

  // Funding source analysis
  const fundingAnalysis =
    budget.budget_funding?.map((funding) => ({
      source: funding.funding_source.name,
      type: funding.funding_source.funding_type,
      allocated: safeNumber(funding.amount_allocated),
      available: safeNumber(funding.funding_source.amount_available),
      remaining: safeNumber(funding.funding_source.amount_remaining),
      utilization: safePercentage(funding.amount_allocated, funding.funding_source.amount_available),
    })) || []

  // Performance metrics
  const performanceMetrics = [
    {
      title: "Budget Utilization",
      value: spentPercentage,
      target: 75,
      format: "percentage",
      trend: spentPercentage > 75 ? "up" : "down",
      color: spentPercentage > 90 ? "red" : spentPercentage > 75 ? "yellow" : "green",
    },
    {
      title: "Funding Coverage",
      value: budgetHealth.fundingCoverage,
      target: 100,
      format: "percentage",
      trend: budgetHealth.fundingCoverage >= 100 ? "up" : "down",
      color: budgetHealth.fundingCoverage >= 100 ? "green" : budgetHealth.fundingCoverage >= 80 ? "yellow" : "red",
    },
    {
      title: "Daily Burn Rate",
      value: budgetHealth.burnRate,
      target: 2,
      format: "percentage",
      trend: budgetHealth.burnRate > 2 ? "up" : "down",
      color: budgetHealth.burnRate > 3 ? "red" : budgetHealth.burnRate > 2 ? "yellow" : "green",
    },
    {
      title: "Items Completion",
      value: safePercentage(
        budget.items?.filter((item) => safeNumber(item.spent_percentage) >= 100).length || 0,
        budget.items?.length || 1,
      ),
      target: 80,
      format: "percentage",
      trend: "stable",
      color: "blue",
    },
  ]

  // Risk analysis
  const riskFactors = analyzeRisks(budget, budgetHealth)

  // Forecast data
  const forecastData = generateForecast(budget, spentPercentage, budgetHealth.burnRate)

  return (
    <div className="space-y-6">
      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {performanceMetrics.map((metric, index) => (
          <Card key={index} className="relative overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  {metric.title === "Budget Utilization" && <Target className="h-5 w-5 text-blue-500" />}
                  {metric.title === "Funding Coverage" && <DollarSign className="h-5 w-5 text-green-500" />}
                  {metric.title === "Daily Burn Rate" && <Activity className="h-5 w-5 text-orange-500" />}
                  {metric.title === "Items Completion" && <BarChart3 className="h-5 w-5 text-purple-500" />}
                  <h3 className="text-sm font-medium text-muted-foreground">{metric.title}</h3>
                </div>
                {metric.trend === "up" && <TrendingUp className="h-4 w-4 text-green-500" />}
                {metric.trend === "down" && <TrendingDown className="h-4 w-4 text-red-500" />}
                {metric.trend === "stable" && <Activity className="h-4 w-4 text-blue-500" />}
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

      {/* Charts Section */}
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
                <Tooltip formatter={(value, name) => [`$${Number(value).toLocaleString()}`, name]} />
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
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Funding Sources Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-purple-500" />
              Funding Sources
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={fundingAnalysis} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="source" type="category" width={80} />
                <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, "Amount"]} />
                <Bar dataKey="allocated" fill="#3B82F6" name="Allocated" />
                <Bar dataKey="remaining" fill="#10B981" name="Remaining" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Budget Health Radar */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-orange-500" />
              Budget Health
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <RadarChart
                data={[
                  { metric: "Utilization", value: budgetHealth.utilization, fullMark: 100 },
                  { metric: "Funding", value: budgetHealth.fundingCoverage, fullMark: 100 },
                  { metric: "Timeline", value: getTimelineProgress(budget), fullMark: 100 },
                  { metric: "Efficiency", value: getEfficiencyScore(budget), fullMark: 100 },
                  { metric: "Risk", value: 100 - budgetHealth.riskLevel, fullMark: 100 },
                ]}
              >
                <PolarGrid />
                <PolarAngleAxis dataKey="metric" />
                <PolarRadiusAxis angle={90} domain={[0, 100]} />
                <Radar name="Health Score" dataKey="value" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

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
                      risk.level === "high" ? "bg-red-500" : risk.level === "medium" ? "bg-yellow-500" : "bg-green-500"
                    }`}
                  />
                  <div>
                    <p className="font-medium text-sm">{risk.factor}</p>
                    <p className="text-xs text-muted-foreground">{risk.description}</p>
                  </div>
                </div>
                <Badge
                  variant={risk.level === "high" ? "destructive" : risk.level === "medium" ? "secondary" : "default"}
                >
                  {risk.level}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Forecast and Projections */}
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
            <div className="text-3xl font-bold text-blue-600 mb-2">{getEfficiencyScore(budget).toFixed(0)}%</div>
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

// Helper functions
function getDaysElapsed(startDate: string): number {
  const start = new Date(startDate)
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - start.getTime())
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

function getProjectedCompletion(budget: BudgetDetailResponse, spentPercentage: number): string {
  const daysElapsed = getDaysElapsed(budget.start_date)
  const totalDays =
    Math.abs(new Date(budget.end_date).getTime() - new Date(budget.start_date).getTime()) / (1000 * 60 * 60 * 24)

  if (spentPercentage === 0) return "N/A"

  const projectedDays = (daysElapsed / spentPercentage) * 100
  const projectedDate = new Date(budget.start_date)
  projectedDate.setDate(projectedDate.getDate() + projectedDays)

  return projectedDate.toLocaleDateString()
}

function getRiskLevel(spentPercentage: number, remainingAmount: number, endDate: string): number {
  const daysRemaining = Math.abs(new Date(endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)

  let risk = 0
  if (spentPercentage > 90) risk += 30
  if (remainingAmount < 1000) risk += 25
  if (daysRemaining < 30) risk += 20
  if (spentPercentage > 100) risk += 25

  return Math.min(risk, 100)
}

function generateSpendingTrend(budget: BudgetDetailResponse) {
  const totalAmount = safeNumber(budget.total_amount)
  const spentAmount = safeNumber(budget.spent_amount)

  // Generate 6 months of data
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"]
  return months.map((month, index) => ({
    period: month,
    cumulative: (spentAmount / 6) * (index + 1),
    periodic: spentAmount / 6,
    budget: totalAmount / 6,
  }))
}

function analyzeRisks(budget: BudgetDetailResponse, health: any) {
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

  const daysRemaining = Math.abs(new Date(budget.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  if (daysRemaining < 30) {
    risks.push({
      factor: "Timeline Pressure",
      description: "Less than 30 days remaining",
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

function generateForecast(budget: BudgetDetailResponse, spentPercentage: number, burnRate: number) {
  const months = ["Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  const totalAmount = safeNumber(budget.total_amount)
  const spentAmount = safeNumber(budget.spent_amount)

  return months.map((month, index) => {
    const projectedSpent = spentAmount + (burnRate * 30 * (index + 1) * totalAmount) / 100
    const confidence = Math.max(50, 90 - index * 5)

    return {
      period: month,
      actual: index === 0 ? spentAmount : null,
      projected: projectedSpent,
      budget: totalAmount,
      confidence,
    }
  })
}

function getTimelineProgress(budget: BudgetDetailResponse): number {
  const start = new Date(budget.start_date)
  const end = new Date(budget.end_date)
  const now = new Date()

  const total = end.getTime() - start.getTime()
  const elapsed = now.getTime() - start.getTime()

  return Math.min(100, Math.max(0, (elapsed / total) * 100))
}

function getEfficiencyScore(budget: BudgetDetailResponse): number {
  const utilization = safeNumber(budget.spent_percentage)
  const timelineProgress = getTimelineProgress(budget)
  const fundingCoverage = safePercentage(budget.total_funding_allocated, budget.total_amount)

  // Weighted efficiency score
  const efficiency = utilization * 0.4 + Math.min(100, fundingCoverage) * 0.3 + timelineProgress * 0.3
  return Math.min(100, efficiency)
}

function getColorByIndex(index: number): string {
  const colors = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#06B6D4", "#84CC16", "#F97316"]
  return colors[index % colors.length]
}
