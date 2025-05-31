"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Target,
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Calendar,
  User,
  Lock,
  Unlock,
  FileText,
} from "lucide-react"
import { formatCurrency } from "@/lib/currency-utils"

interface BudgetItemOverviewProps {
  budgetItem: any
}

export function BudgetItemOverview({ budgetItem }: BudgetItemOverviewProps) {
  const currencyCode = budgetItem?.budget?.currency?.code || "USD"
  const utilization = budgetItem?.spent_percentage || 0

  const getUtilizationStatus = () => {
    if (utilization >= 100) return { status: "Over Budget", color: "text-red-600", icon: AlertTriangle }
    if (utilization >= 85) return { status: "High Usage", color: "text-yellow-600", icon: AlertTriangle }
    if (utilization >= 50) return { status: "On Track", color: "text-green-600", icon: CheckCircle }
    return { status: "Low Usage", color: "text-blue-600", icon: TrendingDown }
  }

  const utilizationStatus = getUtilizationStatus()
  const StatusIcon = utilizationStatus.icon

  return (
    <div className="space-y-6">
      {/* Financial Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Budget Allocation</p>
                <p className="text-2xl font-bold text-blue-900">
                  {formatCurrency(currencyCode, budgetItem.budgeted_amount)}
                </p>
                <p className="text-sm text-blue-600">
                  {(
                    (Number.parseFloat(budgetItem.budgeted_amount) /
                      Number.parseFloat(budgetItem.budget?.total_amount || "1")) *
                    100
                  ).toFixed(1)}
                  % of total budget
                </p>
              </div>
              <Target className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Amount Spent</p>
                <p className="text-2xl font-bold text-orange-900">
                  {formatCurrency(currencyCode, budgetItem.spent_amount)}
                </p>
                <p className="text-sm text-orange-600">{budgetItem.expenses_count || 0} expenses recorded</p>
              </div>
              <DollarSign className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Remaining Budget</p>
                <p className="text-2xl font-bold text-green-900">
                  {formatCurrency(currencyCode, budgetItem.remaining_amount)}
                </p>
                <p className="text-sm text-green-600">{(100 - utilization).toFixed(1)}% remaining</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Utilization Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <StatusIcon className="h-5 w-5" />
            Budget Utilization Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Utilization Rate</span>
              <div className="flex items-center gap-2">
                <span className={`font-bold ${utilizationStatus.color}`}>{utilization.toFixed(1)}%</span>
                <Badge variant={utilization >= 85 ? "destructive" : "default"}>{utilizationStatus.status}</Badge>
              </div>
            </div>
            <Progress value={Math.min(utilization, 100)} className="h-3" />
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Spent:</span>
                <span className="ml-2 font-medium">{formatCurrency(currencyCode, budgetItem.spent_amount)}</span>
              </div>
              <div>
                <span className="text-gray-600">Remaining:</span>
                <span className="ml-2 font-medium">{formatCurrency(currencyCode, budgetItem.remaining_amount)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Item Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Item Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Management & Controls
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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
              <label className="text-sm font-medium text-gray-600">Status</label>
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

            {budgetItem.approval_required_threshold && (
              <div>
                <label className="text-sm font-medium text-gray-600">Approval Threshold</label>
                <p className="mt-1 font-medium">
                  {formatCurrency(currencyCode, budgetItem.approval_required_threshold)}
                </p>
                <p className="text-sm text-gray-600">Expenses above this amount require approval</p>
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-gray-600">Created</label>
              <div className="mt-1 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="font-medium">{new Date(budgetItem.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Budget Context */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Budget Context
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Budget Title</label>
              <p className="mt-1 font-medium">{budgetItem.budget?.title}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Total Budget</label>
              <p className="mt-1 font-medium">{formatCurrency(currencyCode, budgetItem.budget?.total_amount)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Start Date</label>
              <p className="mt-1 font-medium">{budgetItem.budget?.start_date}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">End Date</label>
              <p className="mt-1 font-medium">{budgetItem.budget?.end_date}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
