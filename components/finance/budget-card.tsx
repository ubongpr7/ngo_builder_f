"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { PieChart, Calendar, Edit2, Trash2, Check, TrendingDown } from "lucide-react"
import { toast } from "react-toastify"
import { AddEditBudgetDialog } from "./add-edit-budget-dialog"
import { useDeleteBudgetMutation, useApproveBudgetMutation } from "@/redux/features/finance/financeApiSlice"
import type { Budget } from "@/types/finance"

interface BudgetCardProps {
  budget: Budget
}

export function BudgetCard({ budget }: BudgetCardProps) {
  const [deleteBudget] = useDeleteBudgetMutation()
  const [approveBudget] = useApproveBudgetMutation()

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-800 border-green-300"
      case "draft":
        return "bg-yellow-100 text-yellow-800 border-yellow-300"
      case "closed":
        return "bg-gray-100 text-gray-800 border-gray-300"
      case "approved":
        return "bg-blue-100 text-blue-800 border-blue-300"
      default:
        return "bg-gray-100 text-gray-800 border-gray-300"
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount || 0)
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this budget?")) {
      try {
        await deleteBudget(budget?.id).unwrap()
        toast.success("Budget deleted successfully")
      } catch (error) {
        console.error("Failed to delete budget:", error)
        toast.error("Failed to delete budget. Please try again.")
      }
    }
  }

  const handleApprove = async () => {
    try {
      await approveBudget(budget?.id).unwrap()
      toast.success("Budget approved successfully")
    } catch (error) {
      console.error("Failed to approve budget:", error)
      toast.error("Failed to approve budget. Please try again.")
    }
  }

  const spentPercentage = budget?.spent_percentage || 0
  const remainingAmount = budget?.remaining_amount || (budget?.total_amount || 0) - (budget?.spent_amount || 0)

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center space-x-2">
          <PieChart className="h-4 w-4 text-purple-600" />
          <span className="text-sm font-medium text-gray-500 capitalize">{budget?.budget_type?.replace("_", " ")}</span>
        </div>
        <div className="flex items-center space-x-2">
          <Badge className={getStatusColor(budget?.status)}>{budget?.status}</Badge>
          <div className="flex space-x-1">
            {budget?.status === "draft" && (
              <Button variant="ghost" size="icon" className="h-8 w-8 text-green-500" onClick={handleApprove}>
                <Check className="h-4 w-4" />
              </Button>
            )}
            <AddEditBudgetDialog
              budget={budget}
              onSuccess={() => {
                toast.success("Budget updated successfully")
              }}
              trigger={
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Edit2 className="h-4 w-4" />
                </Button>
              }
            />
            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={handleDelete}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div>
            <h3 className="font-semibold text-lg line-clamp-1">{budget?.title}</h3>
            {budget?.description && <p className="text-sm text-gray-600 line-clamp-2 mt-1">{budget?.description}</p>}
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Budget Utilization</span>
              <span className="font-medium">{spentPercentage.toFixed(1)}%</span>
            </div>
            <Progress
              value={spentPercentage}
              className="h-2"
              indicatorClassName={spentPercentage > 100 ? "bg-red-500" : "bg-blue-500"}
            />
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Spent: {formatCurrency(budget?.spent_amount || 0)}</span>
              <span className="text-gray-500">Total: {formatCurrency(budget?.total_amount || 0)}</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm">
              <span className="text-gray-500">Remaining:</span>
              <span className={`ml-1 font-medium ${remainingAmount < 0 ? "text-red-600" : "text-green-600"}`}>
                {formatCurrency(remainingAmount)}
              </span>
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <TrendingDown className="mr-1 h-3 w-3" />
              {budget?.items_count || 0} items
            </div>
          </div>

          <div className="flex items-center text-sm text-gray-500">
            <Calendar className="mr-1 h-3 w-3" />
            {formatDate(budget?.start_date)} - {formatDate(budget?.end_date)}
          </div>

          {budget?.department && (
            <div className="text-sm">
              <span className="text-gray-500">Department:</span>
              <span className="ml-1 font-medium capitalize">{budget?.department?.replace("_", " ")}</span>
            </div>
          )}

          {budget?.campaign_title && (
            <div className="text-sm">
              <span className="text-gray-500">Campaign:</span>
              <span className="ml-1 font-medium">{budget?.campaign_title}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
