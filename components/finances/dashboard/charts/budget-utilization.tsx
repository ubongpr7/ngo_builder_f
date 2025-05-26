"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartTooltip } from "@/components/ui/chart"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts"
import { Wallet, AlertTriangle, CheckCircle, Clock } from "lucide-react"
import { Progress } from "@/components/ui/progress"

interface BudgetUtilizationProps {
  data: any[]
  isLoading?: boolean
}

export function BudgetUtilization({ data, isLoading }: BudgetUtilizationProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="h-6 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3" />
        </CardHeader>
        <CardContent>
          <div className="h-[300px] bg-gray-200 rounded animate-pulse" />
        </CardContent>
      </Card>
    )
  }

  // Safe array handling with fallback mock data
  const mockBudgetData = [
    { name: "Program Operations", allocated_amount: 50000, spent_amount: 35000 },
    { name: "Administrative", allocated_amount: 20000, spent_amount: 18000 },
    { name: "Fundraising", allocated_amount: 15000, spent_amount: 8000 },
    { name: "Emergency Fund", allocated_amount: 25000, spent_amount: 5000 },
  ]

  const budgetData = Array.isArray(data)
    ? data?.map((budget) => ({
        name: budget.name || "Unknown Budget",
        allocated: budget.allocated_amount || 0,
        spent: budget.spent_amount || 0,
        remaining: (budget.allocated_amount || 0) - (budget.spent_amount || 0),
        utilization:
          budget.allocated_amount > 0
            ? (((budget.spent_amount || 0) / budget.allocated_amount) * 100).toFixed(1)
            : "0.0",
      })) || []
    : mockBudgetData.map((budget) => ({
        name: budget.name,
        allocated: budget.allocated_amount,
        spent: budget.spent_amount,
        remaining: budget.allocated_amount - budget.spent_amount,
        utilization: ((budget.spent_amount / budget.allocated_amount) * 100).toFixed(1),
      }))

  const pieData = [
    {
      name: "Spent",
      value: budgetData?.reduce((sum, b) => sum + (b.spent || 0), 0) || 0,
      color: "#ef4444",
    },
    {
      name: "Remaining",
      value: budgetData?.reduce((sum, b) => sum + (b.remaining || 0), 0) || 0,
      color: "#22c55e",
    },
  ]

  const getUtilizationColor = (utilization: number) => {
    if (utilization >= 90) return "text-red-600"
    if (utilization >= 75) return "text-yellow-600"
    return "text-green-600"
  }

  const getUtilizationIcon = (utilization: number) => {
    if (utilization >= 90) return <AlertTriangle className="h-4 w-4 text-red-600" />
    if (utilization >= 75) return <Clock className="h-4 w-4 text-yellow-600" />
    return <CheckCircle className="h-4 w-4 text-green-600" />
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5 text-green-600" />
          Budget Utilization
        </CardTitle>
        <CardDescription>Current budget allocation and spending across departments</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pie Chart */}
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <ChartTooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white p-3 border rounded shadow">
                          <p className="font-medium">{payload[0].name}</p>
                          <p className="text-sm text-gray-600">${payload[0].value?.toLocaleString()}</p>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Budget List */}
          <div className="space-y-4">
            <h4 className="font-medium text-sm text-gray-700">Department Budgets</h4>
            {budgetData.slice(0, 5).map((budget, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getUtilizationIcon(Number.parseFloat(budget.utilization))}
                    <span className="text-sm font-medium">{budget.name}</span>
                  </div>
                  <span className={`text-sm font-medium ${getUtilizationColor(Number.parseFloat(budget.utilization))}`}>
                    {budget.utilization}%
                  </span>
                </div>
                <Progress value={Number.parseFloat(budget.utilization)} className="h-2" />
                <div className="flex justify-between text-xs text-gray-600">
                  <span>${budget.spent.toLocaleString()} spent</span>
                  <span>${budget.allocated.toLocaleString()} allocated</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              ${(budgetData?.reduce((sum, b) => sum + (b.allocated || 0), 0) || 0).toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Total Allocated</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              ${(budgetData?.reduce((sum, b) => sum + (b.spent || 0), 0) || 0).toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Total Spent</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              ${(budgetData?.reduce((sum, b) => sum + (b.remaining || 0), 0) || 0).toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Remaining</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
