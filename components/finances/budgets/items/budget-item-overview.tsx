"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Target,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Calendar,
  User,
  Lock,
  Unlock,
  Clock,
  Shield,
  Activity,
  PieChart,
} from "lucide-react"
import { formatCurrency } from "@/lib/currency-utils"

interface BudgetItemOverviewProps {
  budgetItem: any
}

export function BudgetItemOverview({ budgetItem }: BudgetItemOverviewProps) {
  const currencyCode = budgetItem?.budget?.currency?.code || "USD"

  const getHealthColor = (health: string) => {
    switch (health) {
      case "OVERCOMMITTED":
        return "text-red-600 bg-red-50 border-red-200"
      case "AT_RISK":
        return "text-red-500 bg-red-50 border-red-200"
      case "CAUTION":
        return "text-yellow-600 bg-yellow-50 border-yellow-200"
      case "HEALTHY":
        return "text-green-600 bg-green-50 border-green-200"
      case "UNDERUTILIZED":
        return "text-blue-600 bg-blue-50 border-blue-200"
      default:
        return "text-gray-600 bg-gray-50 border-gray-200"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "OVER_BUDGET":
        return "text-red-600"
      case "CRITICAL":
        return "text-red-500"
      case "WARNING":
        return "text-yellow-600"
      case "MODERATE":
        return "text-blue-600"
      case "NORMAL":
        return "text-green-600"
      default:
        return "text-gray-600"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "OVER_BUDGET":
      case "CRITICAL":
        return <AlertTriangle className="h-4 w-4" />
      case "WARNING":
        return <AlertTriangle className="h-4 w-4" />
      case "MODERATE":
      case "NORMAL":
        return <CheckCircle className="h-4 w-4" />
      default:
        return <Activity className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Budget Health Alert */}
      {(budgetItem.is_over_budget || budgetItem.is_overcommitted || budgetItem.has_pending_requests) && (
        <Alert className={getHealthColor(budgetItem.budget_health)}>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1">
              {budgetItem.is_over_budget && <p>⚠️ Budget exceeded by actual spending</p>}
              {budgetItem.is_overcommitted && <p>⚠️ Budget overcommitted with approved expenses</p>}
              {budgetItem.has_pending_requests && <p>📋 Has pending expense requests awaiting approval</p>}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Budgeted</p>
                <p className="text-2xl font-bold text-blue-900">
                  {formatCurrency(currencyCode, budgetItem.budgeted_amount)}
                </p>
                <p className="text-sm text-blue-600">Total allocation</p>
              </div>
              <Target className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Spent (Paid)</p>
                <p className="text-2xl font-bold text-green-900">
                  {formatCurrency(currencyCode, budgetItem.spent_amount)}
                </p>
                <p className="text-sm text-green-600">{budgetItem.spent_percentage?.toFixed(1)}% of budget</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Committed</p>
                <p className="text-2xl font-bold text-orange-900">
                  {formatCurrency(currencyCode, budgetItem.committed_amount)}
                </p>
                <p className="text-sm text-orange-600">{budgetItem.committed_percentage?.toFixed(1)}% of budget</p>
              </div>
              <Shield className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Available</p>
                <p className="text-2xl font-bold text-purple-900">
                  {formatCurrency(currencyCode, budgetItem.truly_available_amount)}
                </p>
                <p className="text-sm text-purple-600">After all obligations</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Financial Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Financial Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Paid Expenses</span>
                <div className="text-right">
                  <span className="font-medium">{formatCurrency(currencyCode, budgetItem.spent_amount)}</span>
                  <span className="text-sm text-gray-500 ml-2">({budgetItem.paid_expenses_count})</span>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Approved (Pending Payment)</span>
                <div className="text-right">
                  <span className="font-medium">{formatCurrency(currencyCode, budgetItem.approved_amount)}</span>
                  <span className="text-sm text-gray-500 ml-2">({budgetItem.approved_expenses_count})</span>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Pending Approval</span>
                <div className="text-right">
                  <span className="font-medium">{formatCurrency(currencyCode, budgetItem.pending_amount)}</span>
                  <span className="text-sm text-gray-500 ml-2">({budgetItem.pending_expenses_count})</span>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Rejected</span>
                <div className="text-right">
                  <span className="font-medium text-red-600">
                    {formatCurrency(currencyCode, budgetItem.rejected_amount)}
                  </span>
                </div>
              </div>

              <hr />

              <div className="flex justify-between items-center font-semibold">
                <span>Total Requested</span>
                <div className="text-right">
                  <span>{formatCurrency(currencyCode, budgetItem.total_requested_amount)}</span>
                  <span className="text-sm text-gray-500 ml-2">({budgetItem.total_expenses_count})</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Budget Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Overall Health</span>
                <Badge className={getHealthColor(budgetItem.budget_health)}>
                  {budgetItem.budget_health?.replace("_", " ")}
                </Badge>
              </div>

              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Utilization Status</span>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-medium ${getStatusColor(budgetItem.utilization_status)}`}>
                    {budgetItem.utilization_status?.replace("_", " ")}
                  </span>
                  {getStatusIcon(budgetItem.utilization_status)}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Total Utilization</span>
                  <span className="font-medium">{budgetItem.utilization_percentage?.toFixed(1)}%</span>
                </div>
                <Progress value={Math.min(budgetItem.utilization_percentage || 0, 100)} className="h-2" />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Spending Progress</span>
                <span className="font-medium">{budgetItem.spent_percentage?.toFixed(1)}%</span>
              </div>
              <Progress value={Math.min(budgetItem.spent_percentage || 0, 100)} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Commitment Level</span>
                <span className="font-medium">{budgetItem.committed_percentage?.toFixed(1)}%</span>
              </div>
              <Progress value={Math.min(budgetItem.committed_percentage || 0, 100)} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Variance Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Variance Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-sm text-gray-600">Spending Variance</p>
              <p className={`text-2xl font-bold ${budgetItem.variance >= 0 ? "text-green-600" : "text-red-600"}`}>
                {formatCurrency(currencyCode, budgetItem.variance)}
              </p>
              <p className="text-sm text-gray-500">
                {budgetItem.variance_percentage?.toFixed(1)}% {budgetItem.variance >= 0 ? "under" : "over"} budget
              </p>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600">Commitment Variance</p>
              <p
                className={`text-2xl font-bold ${budgetItem.committed_variance >= 0 ? "text-green-600" : "text-red-600"}`}
              >
                {formatCurrency(currencyCode, budgetItem.committed_variance)}
              </p>
              <p className="text-sm text-gray-500">After commitments</p>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600">Encumbered Amount</p>
              <p className="text-2xl font-bold text-orange-600">
                {formatCurrency(currencyCode, budgetItem.encumbered_amount)}
              </p>
              <p className="text-sm text-gray-500">Pending + Approved</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Spending Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Spending Controls & Availability
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Current Status</label>
                <div className="mt-1 flex items-center gap-2">
                  {budgetItem.is_locked ? (
                    <>
                      <Lock className="h-4 w-4 text-red-500" />
                      <Badge variant="destructive">Locked</Badge>
                    </>
                  ) : (
                    <>
                      <Unlock className="h-4 w-4 text-green-500" />
                      <Badge variant="default">Active</Badge>
                    </>
                  )}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">Can Spend</label>
                <div className="mt-1 flex items-center gap-2">
                  {budgetItem.can_spend ? (
                    <>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-green-600 font-medium">Yes</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                      <span className="text-red-600 font-medium">No</span>
                    </>
                  )}
                </div>
              </div>

              {budgetItem.approval_required_threshold && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Approval Threshold</label>
                  <p className="mt-1 font-medium">
                    {formatCurrency(currencyCode, budgetItem.approval_required_threshold)}
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Available Without Approval</label>
                <p className="mt-1 text-lg font-bold text-green-600">
                  {formatCurrency(currencyCode, budgetItem.available_without_approval)}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">Truly Available</label>
                <p className="mt-1 text-lg font-bold text-blue-600">
                  {formatCurrency(currencyCode, budgetItem.truly_available_amount)}
                </p>
                <p className="text-sm text-gray-500">After all pending requests</p>
              </div>

              {budgetItem.requires_approval_for_remaining && (
                <div className="flex items-center gap-2 text-yellow-600">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm">Remaining expenses require approval</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Management Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Management Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Category</label>
                <p className="mt-1 font-medium">{budgetItem.category}</p>
              </div>

              {budgetItem.subcategory && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Subcategory</label>
                  <p className="mt-1 font-medium">{budgetItem.subcategory}</p>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-gray-600">Description</label>
                <p className="mt-1 text-gray-900">{budgetItem.description}</p>
              </div>

              {budgetItem.notes && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Notes</label>
                  <p className="mt-1 text-gray-900">{budgetItem.notes}</p>
                </div>
              )}
            </div>

            <div className="space-y-4">
              {budgetItem.responsible_person && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Responsible Person</label>
                  <div className="mt-1 flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">
                      {budgetItem.responsible_person.first_name} {budgetItem.responsible_person.last_name}
                    </span>
                  </div>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-gray-600">Created</label>
                <div className="mt-1 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">{new Date(budgetItem.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">Budget Context</label>
                <div className="mt-1 space-y-1">
                  <p className="font-medium">{budgetItem.budget?.title}</p>
                  <p className="text-sm text-gray-600">
                    {budgetItem.budget?.start_date} - {budgetItem.budget?.end_date}
                  </p>
                  <p className="text-sm text-gray-600">
                    Total: {formatCurrency(currencyCode, budgetItem.budget?.total_amount)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
