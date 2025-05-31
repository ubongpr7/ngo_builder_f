"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import Select from "react-select"
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
import { AlertTriangle, CheckCircle, XCircle, Activity, Shield, Bell, Eye, Coins } from "lucide-react"
import { formatCurrency } from "@/lib/currency-utils"
import { useGetBudgetHealthQuery } from "@/redux/features/finance/budgets"

// Type definitions
interface CurrencyInfo {
  id: number
  code: string
  name: string
}

interface HealthMetrics {
  overall_score: number
  critical_issues: number
  warnings: number
  healthy_budgets: number
  total_budgets: number
  risk_distribution: {
    low: number
    medium: number
    high: number
  }
  trends: {
    improving: number
    stable: number
    declining: number
  }
}

interface HealthAlert {
  id: string
  type: "critical" | "warning" | "info"
  title: string
  description: string
  budget: string
  severity: "high" | "medium" | "low"
  action: string
  timestamp: string
  budget_id: number
}

interface HealthTrend {
  month: string
  score: number
  issues: number
  warnings: number
}

interface RiskDistributionItem {
  name: string
  value: number
  color: string
}

interface BudgetHealthItem {
  id: number
  name: string
  health: number
  utilization: number
  efficiency: number
  risk: number
  status: "healthy" | "warning" | "critical"
  risk_level: "low" | "medium" | "high"
  allocated: number
  spent: number
  remaining: number
  days_remaining: number | null
  department: string
  type: string
}

interface CurrencyHealthData {
  currency_info: CurrencyInfo
  health_metrics: HealthMetrics
  health_alerts: HealthAlert[]
  health_trends: HealthTrend[]
  risk_distribution_data: RiskDistributionItem[]
  budget_health_data: BudgetHealthItem[]
}

interface MultiCurrencyHealthData {
  currencies: Record<string, CurrencyHealthData>
  generated_at: string
  filters_applied: Record<string, any>
  error?: string
}

interface BudgetHealthIndicatorsProps {
  queryParams: Record<string, any>
  isLoading: boolean
}

interface CurrencyOption {
  value: string
  label: string
}

export function BudgetHealthIndicators({ queryParams, isLoading: parentLoading }: BudgetHealthIndicatorsProps) {
  const { data: healthData, isLoading: dataLoading, error } = useGetBudgetHealthQuery(queryParams)
  const [selectedCurrency, setSelectedCurrency] = useState<string | null>(null)

  const isLoading = parentLoading || dataLoading

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

  if (error || !healthData) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-yellow-500" />
            <p>Error loading health data</p>
            <p className="text-sm">Please try again later</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Handle both single currency and multi-currency data
  let currencyData: CurrencyHealthData | null = null
  let availableCurrencies: string[] = []
  let currencyOptions: CurrencyOption[] = []

  if ("currencies" in healthData) {
    // Multi-currency data
    const multiCurrencyData = healthData as MultiCurrencyHealthData
    availableCurrencies = Object.keys(multiCurrencyData.currencies || {})

    if (availableCurrencies.length === 0) {
      return (
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-muted-foreground">
              <Shield className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>No health data available</p>
              <p className="text-sm">Create budgets to see health indicators</p>
            </div>
          </CardContent>
        </Card>
      )
    }

    // Set default selected currency if not already set
    if (!selectedCurrency && availableCurrencies.length > 0) {
      setSelectedCurrency(availableCurrencies[0])
    }

    const currentCurrency = selectedCurrency || availableCurrencies[0]
    currencyData = multiCurrencyData.currencies[currentCurrency]

    // Create currency options for dropdown
    currencyOptions = availableCurrencies.map((currencyId) => {
      const currency = multiCurrencyData.currencies[currencyId].currency_info
      return {
        value: currencyId,
        label: `${currency.code} (${multiCurrencyData.currencies[currencyId].health_metrics.total_budgets} budgets)`,
      }
    })
  } else if ("currency_info" in healthData) {
    // Single currency data
    currencyData = healthData as CurrencyHealthData
    availableCurrencies = [currencyData.currency_info.id.toString()]

    currencyOptions = [
      {
        value: currencyData.currency_info.id.toString(),
        label: `${currencyData.currency_info.code} (${currencyData.health_metrics.total_budgets} budgets)`,
      },
    ]
  }

  if (!currencyData) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            <Shield className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p>No health data available</p>
            <p className="text-sm">Create budgets to see health indicators</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const { health_metrics, health_alerts, health_trends, risk_distribution_data, budget_health_data, currency_info } =
    currencyData
  const currencyCode = currency_info.code

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

  // Handle currency selection change
  const handleCurrencyChange = (option: CurrencyOption | null): void => {
    setSelectedCurrency(option?.value || availableCurrencies[0])
  }

  const overallHealth = getHealthStatus(health_metrics.overall_score)

  return (
    <div className="space-y-6">
      {/* Currency Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-2">
          <Coins className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-blue-900">Budget Health Analysis</h3>
          {currencyData && (
            <Badge variant="outline">
              {currencyData.currency_info.name} ({currencyData.health_metrics.total_budgets} budgets)
            </Badge>
          )}
        </div>

        <div className="w-full md:w-64">
          {availableCurrencies.length > 1 ? (
            <Select<CurrencyOption>
              value={currencyOptions.find((option) => option.value === selectedCurrency)}
              onChange={handleCurrencyChange}
              options={currencyOptions}
              className="w-full"
              placeholder="Select currency"
              formatOptionLabel={(option) => (
                <div className="flex items-center gap-2">
                  <Coins className="h-4 w-4" />
                  <span>{option.label}</span>
                </div>
              )}
            />
          ) : currencyData ? (
            <div className="flex items-center gap-2 px-3 py-2 border rounded-md bg-gray-50">
              <Coins className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">
                {currencyData.currency_info.code} - {currencyData.currency_info.name}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-2 border rounded-md bg-gray-50">
              <Coins className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-500">No currency data</span>
            </div>
          )}
        </div>
      </div>

      {/* Health Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Overall Health</p>
                <p className={`text-3xl font-bold ${overallHealth.color}`}>{health_metrics.overall_score}</p>
                <p className={`text-sm ${overallHealth.color}`}>{overallHealth.status}</p>
              </div>
              <div className="relative">
                <Shield className="h-12 w-12 text-blue-500" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-bold text-blue-700">{health_metrics.overall_score}</span>
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
                <p className="text-3xl font-bold text-red-900">{health_metrics.critical_issues}</p>
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
                <p className="text-3xl font-bold text-yellow-900">{health_metrics.warnings}</p>
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
                <p className="text-3xl font-bold text-green-900">{health_metrics.healthy_budgets}</p>
                <p className="text-sm text-green-600">
                  {Math.round((health_metrics.healthy_budgets / health_metrics.total_budgets) * 100)}% of total
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
              Health Alerts & Notifications ({currencyCode})
            </CardTitle>
            <Badge variant="outline">{health_alerts.length} active</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {health_alerts.length > 0 ? (
            health_alerts.map((alert) => (
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
                        <span className="text-xs text-muted-foreground">
                          {new Date(alert.timestamp).toLocaleString()}
                        </span>
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
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-400" />
              <p>No active health alerts</p>
              <p className="text-sm">All budgets are performing within healthy parameters</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Health Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Health Score Trends ({currencyCode})</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={health_trends}>
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
            <CardTitle>Risk Distribution ({currencyCode})</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={risk_distribution_data}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {risk_distribution_data.map((entry, index) => (
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
            <CardTitle>Issues & Warnings Tracking ({currencyCode})</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={health_trends}>
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
            <CardTitle>Budget Health Matrix ({currencyCode})</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RadialBarChart cx="50%" cy="50%" innerRadius="20%" outerRadius="90%" data={budget_health_data}>
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
          <CardTitle>Budget Health Summary ({currencyCode})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {budget_health_data.map((budget) => (
              <div key={budget.id} className="flex items-center justify-between p-4 border rounded-lg">
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
                    <p className="text-xs text-muted-foreground">
                      {formatCurrency(currencyCode, budget.allocated)} allocated •{" "}
                      {formatCurrency(currencyCode, budget.spent)} spent
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
