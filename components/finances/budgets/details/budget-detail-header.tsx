"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Calendar, DollarSign, TrendingUp, Users, Download, Edit, Share } from "lucide-react"
import type { Budget } from "@/types/finance"
import { formatDate,  } from "@/lib/utils"
import { formatCurrency } from "@/lib/currency-utils"
interface BudgetDetailHeaderProps {
  budget: Budget
  onEdit?: () => void
  onExport?: () => void
  onShare?: () => void
}

export function BudgetDetailHeader({ budget, onEdit, onExport, onShare }: BudgetDetailHeaderProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500"
      case "approved":
        return "bg-blue-500"
      case "pending_approval":
        return "bg-yellow-500"
      case "completed":
        return "bg-purple-500"
      case "cancelled":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const getHealthColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "text-green-600 bg-green-50"
      case "warning":
        return "text-yellow-600 bg-yellow-50"
      case "critical":
        return "text-red-600 bg-red-50"
      default:
        return "text-gray-600 bg-gray-50"
    }
  }

  const spentPercentage = Number.parseFloat(budget.spent_percentage || "0")
  const utilizationRate = budget.budget_health?.utilization_rate || 0
  const daysRemaining = budget.budget_health?.days_remaining || 0

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-gray-900">{budget.title}</h1>
            <Badge className={getStatusColor(budget.status)}>{budget.status.replace("_", " ").toUpperCase()}</Badge>
            <Badge className={getHealthColor(budget.budget_health?.overall_status || "healthy")}>
              {budget.budget_health?.overall_status?.toUpperCase() || "HEALTHY"}
            </Badge>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {formatDate(budget.start_date)} - {formatDate(budget.end_date)}
            </span>
            {budget.fiscal_year && <span>FY {budget.fiscal_year}</span>}
            {budget.project && <span>Project: {budget.project.title}</span>}
            {budget.department && <span>Dept: {budget.department.name}</span>}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onShare}>
            <Share className="h-4 w-4 mr-2" />
            Share
          </Button>
          <Button variant="outline" size="sm" onClick={onExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button size="sm" onClick={onEdit}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Budget
          </Button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency( budget.currency.code,budget.total_amount)}</div>
            <p className="text-xs text-muted-foreground">
              {budget.currency.code} • {budget.budget_type.replace("_", " ")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Amount Spent</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency( budget.currency.code,budget.spent_amount)}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <Progress value={spentPercentage} className="flex-1" />
              <span className="text-xs text-muted-foreground">{spentPercentage}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Remaining</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency( budget.currency.code,budget.remaining_amount)}
            </div>
            <p className="text-xs text-muted-foreground">
              {daysRemaining > 0 ? `${daysRemaining} days left` : "Budget period ended"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utilization</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{utilizationRate}</div>
            <p className="text-xs text-muted-foreground">
              {budget.items_count} items • {budget.expenses_count} expenses
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Health Indicators */}
      {budget.budget_health && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Budget Health Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Funding Coverage</span>
                  <span>{budget.budget_health.funding_coverage}</span>
                </div>
                <Progress value={budget.budget_health.funding_coverage} />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Expense Velocity</span>
                  <span>{budget.budget_health.expense_velocity}</span>
                </div>
                <Progress value={budget.budget_health.expense_velocity} />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Utilization Rate</span>
                  <span>{budget.budget_health.utilization_rate}</span>
                </div>
                <Progress value={budget.budget_health.utilization_rate} />
              </div>
            </div>

            {budget.budget_health.risk_factors && budget.budget_health.risk_factors.length > 0 && (
              <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                <h4 className="text-sm font-medium text-yellow-800 mb-2">Risk Factors</h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  {budget.budget_health.risk_factors.map((risk, index) => (
                    <li key={index}>• {risk}</li>
                  ))}
                </ul>
              </div>
            )}

            {budget.budget_health.recommendations && budget.budget_health.recommendations.length > 0 && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <h4 className="text-sm font-medium text-blue-800 mb-2">Recommendations</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  {budget.budget_health.recommendations.map((rec, index) => (
                    <li key={index}>• {rec}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
