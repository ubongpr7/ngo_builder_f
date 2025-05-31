"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { TrendingUp, Activity, Calendar, DollarSign, Target } from "lucide-react"
import { formatCurrency } from "@/lib/currency-utils"

interface BudgetItemAnalyticsProps {
  budgetItem: any
  expenses: any[]
}

export function BudgetItemAnalytics({ budgetItem, expenses }: BudgetItemAnalyticsProps) {
  const currencyCode = budgetItem?.budget?.currency?.code || "USD"

  // Process expenses by month
  const expensesByMonth = expenses.reduce((acc, expense) => {
    const month = new Date(expense.expense_date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
    })

    if (!acc[month]) {
      acc[month] = { month, amount: 0, count: 0 }
    }

    acc[month].amount += Number.parseFloat(expense.amount)
    acc[month].count += 1

    return acc
  }, {})

  const monthlyData = Object.values(expensesByMonth).sort(
    (a: any, b: any) => new Date(a.month).getTime() - new Date(b.month).getTime(),
  )

  // Process expenses by type
  const expensesByType = expenses.reduce((acc, expense) => {
    const type = expense.expense_type || "other"

    if (!acc[type]) {
      acc[type] = { type, amount: 0, count: 0 }
    }

    acc[type].amount += Number.parseFloat(expense.amount)
    acc[type].count += 1

    return acc
  }, {})

  const typeData = Object.values(expensesByType)

  // Calculate trends
  const totalSpent = Number.parseFloat(budgetItem.spent_amount || "0")
  const totalBudget = Number.parseFloat(budgetItem.budgeted_amount || "0")
  const utilization = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0

  const averageExpenseAmount = expenses.length > 0 ? totalSpent / expenses.length : 0

  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"]

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Expenses</p>
                <p className="text-2xl font-bold">{expenses.length}</p>
              </div>
              <Activity className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average Expense</p>
                <p className="text-2xl font-bold">{formatCurrency(currencyCode, averageExpenseAmount)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Utilization Rate</p>
                <p className="text-2xl font-bold">{utilization}%</p>
              </div>
              <Target className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Burn Rate</p>
                <p className="text-2xl font-bold">
                  {expenses.length > 0 ? (totalSpent / expenses.length) : "0"}
                </p>
                <p className="text-sm text-gray-600">per expense</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Spending Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Monthly Spending Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            {monthlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value: any) => [formatCurrency(currencyCode, value), "Amount"]} />
                  <Line type="monotone" dataKey="amount" stroke="#3b82f6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>No expense data available</p>
                  <p className="text-sm">Add expenses to see trends</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Expenses by Type */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Expenses by Type
            </CardTitle>
          </CardHeader>
          <CardContent>
            {typeData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={typeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ type, percent }) => `${type}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="amount"
                  >
                    {typeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => [formatCurrency(currencyCode, value), "Amount"]} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <Activity className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>No expense data available</p>
                  <p className="text-sm">Add expenses to see breakdown</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Expense Volume by Month */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Expense Volume by Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            {monthlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>No expense data available</p>
                  <p className="text-sm">Add expenses to see volume</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Expense Type Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Expense Type Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            {typeData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={typeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="type" />
                  <YAxis />
                  <Tooltip formatter={(value: any) => [formatCurrency(currencyCode, value), "Amount"]} />
                  <Bar dataKey="amount" fill="#f59e0b" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <DollarSign className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>No expense data available</p>
                  <p className="text-sm">Add expenses to see breakdown</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Expense Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          {expenses.length > 0 ? (
            <div className="space-y-4">
              {expenses
                .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                .slice(0, 5)
                .map((expense) => (
                  <div key={expense.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{expense.title}</p>
                      <p className="text-sm text-gray-600">
                        {expense.expense_type} • {new Date(expense.expense_date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(currencyCode, expense.amount)}</p>
                      <Badge variant="outline">{expense.status}</Badge>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Activity className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>No recent activity</p>
              <p className="text-sm">Expense activity will appear here</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
