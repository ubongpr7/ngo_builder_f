"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  RadialBarChart,
  RadialBar,
} from "recharts"
import { AlertTriangle, CheckCircle, XCircle, Activity, Shield, Bell, Eye } from "lucide-react"

interface BudgetHealthIndicatorsProps {
  statistics: any
  budgets: any[]
  isLoading: boolean
}

export function BudgetHealthIndicators({ statistics, budgets, isLoading }: BudgetHealthIndicatorsProps) {
  // Mock health data - replace with real calculations
  const healthMetrics = {
    overallScore: 78,
    criticalIssues: 3,
    warnings: 7,
    healthyBudgets: 15,
    totalBudgets: 25,
    riskDistribution: {
      low: 15,
      medium: 7,
      high: 3,
    },
    trends: {
      improving: 12,
      stable: 8,
      declining: 5,
    },
  }

  const healthAlerts = [
    {
      id: 1,
      type: "critical",
      title: "Emergency Fund Depletion",
      description: "Emergency Relief Fund will be depleted in 15 days at current spending rate",
      budget: "Emergency Relief Fund",
      severity: "high",
      action: "Immediate funding required",
      timestamp: "2 hours ago",
    },
    {
      id: 2,
      type: "warning",
      title: "Budget Overrun Risk",
      description: "Education Program 2024 is 90% utilized with 30 days remaining",
      budget: "Education Program 2024",
      severity: "medium",
      action: "Review spending patterns",
      timestamp: "4 hours ago",
    },
    {
      id: 3,
      type: "critical",
      title: "Administrative Budget Critical",
      description: "Administrative Operations budget exceeded by $15,000",
      budget: "Administrative Operations",
      severity: "high",
      action: "Budget reallocation needed",
      timestamp: "6 hours ago",
    },
    {
      id: 4,
      type: "warning",
      title: "Underutilization Alert",
      description: "Research & Development budget only 50% utilized",
      budget: "Research & Development",
      severity: "low",
      action: "Accelerate spending or reallocate",
      timestamp: "1 day ago",
    },
    {
      id: 5,
      type: "info",
      title: "Efficiency Improvement",
      description: "Healthcare Initiative showing 95% efficiency rating",
      budget: "Healthcare Initiative",
      severity: "low",
      action: "Share best practices",
      timestamp: "2 days ago",
    },
  ]

  const healthTrends = [
    { month: "Jan", score: 72, issues: 8, warnings: 12 },
    { month: "Feb", score: 75, issues: 6, warnings: 10 },
    { month: "Mar", score: 73, issues: 7, warnings: 11 },
    { month: "Apr", score: 78, issues: 5, warnings: 9 },
    { month: "May", score: 76, issues: 6, warnings: 8 },
    { month: "Jun", score: 78, issues: 3, warnings: 7 },
  ]

  const riskDistributionData = [
    { name: "Low Risk", value: healthMetrics.riskDistribution.low, color: "#10b981" },
    { name: "Medium Risk", value: healthMetrics.riskDistribution.medium, color: "#f59e0b" },
    { name: "High Risk", value: healthMetrics.riskDistribution.high, color: "#ef4444" },
  ]

  const budgetHealthData = [
    {
      name: "Emergency Relief",
      health: 45,
      utilization: 85,
      efficiency: 92,
      risk: 85,
    },
    {
      name: "Education Program",
      health: 65,
      utilization: 90,
      efficiency: 88,
      risk: 65,
    },
    {
      name: "Healthcare Initiative",
      health: 95,
      utilization: 70,
      efficiency: 95,
      risk: 20,
    },
    {
      name: "Administration",
      health: 35,
      utilization: 95,
      efficiency: 78,
      risk: 85,
    },
    {
      name: "Research & Dev",
      health: 80,
      utilization: 50,
      efficiency: 96,
      risk: 15,
    },
  ]

  function getAlertIcon(type: string) {
    switch (type) {
      case "critical":
        return <XCircle className="h-5 w-5 text-red-500" />
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      case "info":
        return <CheckCircle className="h-5 w-5 text-blue-500" />
      default:
        return <Activity className="h-5 w-5 text-gray-500" />
    }
  }

  function getAlertVariant(type: string) {
    switch (type) {
      case "critical":
        return "destructive"
      case "warning":
        return "default"
      default:
        return "default"
    }
  }

  function getHealthColor(score: number) {
    if (score >= 80) return "#10b981"
    if (score >= 60) return "#f59e0b"
    return "#ef4444"
  }

  function getHealthStatus(score: number) {
    if (score >= 80) return { status: "Excellent", color: "text-green-600" }
    if (score >= 60) return { status: "Good", color: "text-yellow-600" }
    if (score >= 40) return { status: "Fair", color: "text-orange-600" }
    return { status: "Poor", color: "text-red-600" }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-32 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  const overallHealth = getHealthStatus(healthMetrics.overallScore)

  return (
    <div className="space-y-6">
      {/* Health Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Overall Health</p>
                <p className={`text-3xl font-bold ${overallHealth.color}`}>{healthMetrics.overallScore}</p>
                <p className={`text-sm ${overallHealth.color}`}>{overallHealth.status}</p>
              </div>
              <div className="relative">
                <Shield className="h-12 w-12 text-blue-500" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-bold text-blue-700">{healthMetrics.overallScore}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600">Critical Issues</p>
                <p className="text-3xl font-bold text-red-900">{healthMetrics.criticalIssues}</p>
                <p className="text-sm text-red-600">Require immediate attention</p>
              </div>
              <XCircle className="h-12 w-12 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950 dark:to-yellow-900">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600">Warnings</p>
                <p className="text-3xl font-bold text-yellow-900">{healthMetrics.warnings}</p>
                <p className="text-sm text-yellow-600">Need monitoring</p>
              </div>
              <AlertTriangle className="h-12 w-12 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Healthy Budgets</p>
                <p className="text-3xl font-bold text-green-900">{healthMetrics.healthyBudgets}</p>
                <p className="text-sm text-green-600">
                  {Math.round((healthMetrics.healthyBudgets / healthMetrics.totalBudgets) * 100)}% of total
                </p>
              </div>
              <CheckCircle className="h-12 w-12 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Health Alerts */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Health Alerts & Notifications
            </CardTitle>
            <Badge variant="outline">{healthAlerts.length} active</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {healthAlerts.map((alert) => (
            <Alert key={alert.id} variant={getAlertVariant(alert.type) as any}>
              <div className="flex items-start gap-3">
                {getAlertIcon(alert.type)}
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">{alert.title}</h4>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {alert.budget}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{alert.timestamp}</span>
                    </div>
                  </div>
                  <AlertDescription>{alert.description}</AlertDescription>
                  <div className="flex items-center justify-between pt-2">
                    <Badge
                      variant={
                        alert.severity === "high"
                          ? "destructive"
                          : alert.severity === "medium"
                            ? "secondary"
                            : "default"
                      }
                      className="text-xs"
                    >
                      {alert.severity} priority
                    </Badge>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button size="sm">{alert.action}</Button>
                    </div>
                  </div>
                </div>
              </div>
            </Alert>
          ))}
        </CardContent>
      </Card>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Health Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Health Score Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={healthTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Area type="monotone" dataKey="score" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Risk Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Risk Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={riskDistributionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {riskDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Issues Tracking */}
        <Card>
          <CardHeader>
            <CardTitle>Issues & Warnings Tracking</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={healthTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="issues" fill="#ef4444" name="Critical Issues" />
                <Bar dataKey="warnings" fill="#f59e0b" name="Warnings" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Budget Health Matrix */}
        <Card>
          <CardHeader>
            <CardTitle>Budget Health Matrix</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RadialBarChart cx="50%" cy="50%" innerRadius="20%" outerRadius="90%" data={budgetHealthData}>
                <RadialBar
                  minAngle={15}
                  label={{ position: "insideStart", fill: "#fff" }}
                  background
                  clockWise
                  dataKey="health"
                  fill="#3b82f6"
                />
                <Tooltip />
              </RadialBarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Health Summary Table */}
      <Card>
        <CardHeader>
          <CardTitle>Budget Health Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {budgetHealthData.map((budget, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: getHealthColor(budget.health) + "20" }}
                  >
                    <span className="font-bold" style={{ color: getHealthColor(budget.health) }}>
                      {budget.health}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-semibold">{budget.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {budget.utilization}% utilized • {budget.efficiency}% efficient
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-medium">Risk Score</p>
                    <p className="text-lg font-bold" style={{ color: getHealthColor(100 - budget.risk) }}>
                      {budget.risk}
                    </p>
                  </div>
                  <Progress value={budget.health} className="w-24" />
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
