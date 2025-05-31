"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import Select from "react-select"
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LineChart,
  Line,
  BarChart,
  Bar,
} from "recharts"
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  Target,
  Activity,
  Zap,
  Eye,
  Coins,
} from "lucide-react"
import { formatCurrency } from "@/lib/currency-utils"
import { useGetBudgetUtilizationMatrixQuery } from "@/redux/features/finance/budgets"

// Type definitions
interface CurrencyInfo {
  id: number
  code: string
  name: string
}

interface UtilizationSummary {
  total_budgets: number
  avg_utilization: number
  avg_efficiency: number
  avg_velocity: number
  high_risk_count: number
}

interface UtilizationItem {
  id: number
  name: string
  type: string
  department: string
  allocated: number
  spent: number
  remaining: number
  utilization: number
  efficiency: number
  velocity: number
  days_remaining: number | null
  status: "healthy" | "warning" | "critical" | "underutilized"
  trend: "up" | "down" | "stable"
  risk_score: number
  start_date: string | null
  end_date: string | null
  fiscal_year: number
}

interface ScatterDataItem {
  x: number
  y: number
  z: number
  name: string
  status: string
  risk_score: number
}

interface RiskMatrixItem {
  name: string
  utilization: number
  risk_score: number
  status: string
}

interface VelocityDataItem {
  name: string
  velocity: number
  utilization: number
  efficiency: number
  index: number
}

interface CurrencyUtilizationData {
  currency_info: CurrencyInfo
  summary: UtilizationSummary
  utilization_data: UtilizationItem[]
  scatter_data: ScatterDataItem[]
  risk_matrix: RiskMatrixItem[]
  velocity_data: VelocityDataItem[]
}

interface MultiCurrencyUtilizationData {
  currencies: Record<string, CurrencyUtilizationData>
  generated_at: string
  filters_applied: Record<string, any>
  error?: string
}

interface BudgetUtilizationMatrixProps {
  queryParams: Record<string, any>
  isLoading: boolean
}

interface CurrencyOption {
  value: string
  label: string
}

export function BudgetUtilizationMatrix({ queryParams, isLoading: parentLoading }: BudgetUtilizationMatrixProps) {
  const { data: utilizationData, isLoading: dataLoading, error } = useGetBudgetUtilizationMatrixQuery(queryParams)
  const [selectedCurrency, setSelectedCurrency] = useState<string | null>(null)

  const isLoading = parentLoading || dataLoading

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-64 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error || !utilizationData) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-yellow-500" />
            <p>Error loading utilization data</p>
            <p className="text-sm">Please try again later</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Handle both single currency and multi-currency data
  let currencyData: CurrencyUtilizationData | null = null
  let availableCurrencies: string[] = []
  let currencyOptions: CurrencyOption[] = []

  if ("currencies" in utilizationData) {
    // Multi-currency data
    const multiCurrencyData = utilizationData as MultiCurrencyUtilizationData
    availableCurrencies = Object.keys(multiCurrencyData.currencies || {})

    if (availableCurrencies.length === 0) {
      return (
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-muted-foreground">
              <Target className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>No utilization data available</p>
              <p className="text-sm">Create budgets to see utilization metrics</p>
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
        label: `${currency.code} (${multiCurrencyData.currencies[currencyId].summary.total_budgets} budgets)`,
      }
    })
  } else if ("currency_info" in utilizationData) {
    // Single currency data
    currencyData = utilizationData as CurrencyUtilizationData
    availableCurrencies = [currencyData.currency_info.id.toString()]

    // Create a single option for the dropdown (even though it won't be used)
    currencyOptions = [
      {
        value: currencyData.currency_info.id.toString(),
        label: `${currencyData.currency_info.code} (${currencyData.summary.total_budgets} budgets)`,
      },
    ]
  } else {
    // Handle unexpected data structure
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-yellow-500" />
            <p>Invalid utilization data format</p>
            <p className="text-sm">Please check the API response structure</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!currencyData) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            <Target className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p>No utilization data available</p>
            <p className="text-sm">Create budgets to see utilization metrics</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const { summary, utilization_data, scatter_data, risk_matrix, velocity_data, currency_info } = currencyData
  const currencyCode = currency_info.code

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

  function getRiskLevel(score: number) {
    if (score >= 70) return { level: "High", color: "destructive" }
    if (score >= 40) return { level: "Medium", color: "secondary" }
    return { level: "Low", color: "default" }
  }

  // Handle currency selection change
  const handleCurrencyChange = (option: CurrencyOption | null): void => {
    setSelectedCurrency(option?.value || availableCurrencies[0])
  }

  return (
    <div className="space-y-6">
      {/* Currency Selector - Always show */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-2">
          <Coins className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-blue-900">Budget Utilization Analysis</h3>
          {currencyData && (
            <Badge variant="outline">
              {currencyData.currency_info.name} ({currencyData.summary.total_budgets} budgets)
            </Badge>
          )}
        </div>

        {/* Always show currency selector */}
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

      {/* Utilization Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Avg Utilization</p>
                <p className="text-3xl font-bold text-blue-900">{summary.avg_utilization}%</p>
              </div>
              <Target className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Avg Efficiency</p>
                <p className="text-3xl font-bold text-green-900">{summary.avg_efficiency}%</p>
              </div>
              <Zap className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">High Risk</p>
                <p className="text-3xl font-bold text-orange-900">{summary.high_risk_count}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Avg Velocity</p>
                <p className="text-3xl font-bold text-purple-900">
                  {formatCurrency(currencyCode, summary.avg_velocity)}/day
                </p>
              </div>
              <Activity className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Utilization vs Efficiency Scatter */}
        <Card>
          <CardHeader>
            <CardTitle>Utilization vs Efficiency Matrix ({currencyCode})</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid />
                <XAxis type="number" dataKey="x" name="Utilization" unit="%" domain={[0, 100]} />
                <YAxis type="number" dataKey="y" name="Efficiency" unit="%" domain={[0, 100]} />
                <Tooltip
                  cursor={{ strokeDasharray: "3 3" }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload
                      return (
                        <div className="bg-white p-3 border rounded shadow-lg">
                          <p className="font-semibold">{data.name}</p>
                          <p>Utilization: {data.x}%</p>
                          <p>Efficiency: {data.y}%</p>
                          <p>Risk Score: {data.risk_score}</p>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Scatter name="Budgets" data={scatter_data} fill="#3b82f6">
                  {scatter_data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getStatusColor(entry.status)} />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Spending Velocity */}
        <Card>
          <CardHeader>
            <CardTitle>Spending Velocity Analysis ({currencyCode})</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={velocity_data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip formatter={(value: any) => [formatCurrency(currencyCode, value) + "/day", "Velocity"]} />
                <Bar dataKey="velocity" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Risk Assessment Matrix */}
        <Card>
          <CardHeader>
            <CardTitle>Risk Assessment Matrix ({currencyCode})</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid />
                <XAxis type="number" dataKey="utilization" name="Utilization" unit="%" domain={[0, 100]} />
                <YAxis type="number" dataKey="risk_score" name="Risk Score" domain={[0, 100]} />
                <Tooltip
                  cursor={{ strokeDasharray: "3 3" }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload
                      return (
                        <div className="bg-white p-3 border rounded shadow-lg">
                          <p className="font-semibold">{data.name}</p>
                          <p>Utilization: {data.utilization}%</p>
                          <p>Risk Score: {data.risk_score}</p>
                          <p>Status: {data.status}</p>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Scatter name="Risk" data={risk_matrix} fill="#ef4444">
                  {risk_matrix.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getStatusColor(entry.status)} />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Utilization Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Utilization Efficiency Trends ({currencyCode})</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={velocity_data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="utilization" stroke="#3b82f6" name="Utilization %" />
                <Line type="monotone" dataKey="efficiency" stroke="#10b981" name="Efficiency %" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Utilization Table */}
      <Card>
        <CardHeader>
          <CardTitle>Budget Utilization Details ({currencyCode})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Budget Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Allocated</TableHead>
                <TableHead>Spent</TableHead>
                <TableHead>Utilization</TableHead>
                <TableHead>Efficiency</TableHead>
                <TableHead>Velocity</TableHead>
                <TableHead>Days Left</TableHead>
                <TableHead>Risk</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {utilization_data.map((budget) => {
                const risk = getRiskLevel(budget.risk_score)
                return (
                  <TableRow key={budget.id}>
                    <TableCell className="font-medium">{budget.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{budget.type}</Badge>
                    </TableCell>
                    <TableCell>{formatCurrency(currencyCode, budget.allocated)}</TableCell>
                    <TableCell>{formatCurrency(currencyCode, budget.spent)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={budget.utilization} className="w-16 h-2" />
                        <span className="text-sm font-medium">{budget.utilization}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Zap className="h-4 w-4 text-yellow-500" />
                        <span>{budget.efficiency}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Activity className="h-4 w-4 text-blue-500" />
                        <span>{formatCurrency(currencyCode, budget.velocity)}/day</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span>{budget.days_remaining ?? "N/A"} days</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={risk.color as any}>{risk.level}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(budget.status)}
                        {getTrendIcon(budget.trend)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
