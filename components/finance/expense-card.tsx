"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Receipt, Calendar, Building, Edit2, Trash2, Check, X } from "lucide-react"
import { toast } from "react-toastify"
import { AddEditExpenseDialog } from "./add-edit-expense-dialog"
import {
  useDeleteOrganizationalExpenseMutation,
  useApproveOrganizationalExpenseMutation,
  useRejectOrganizationalExpenseMutation,
} from "@/redux/features/finance/financeApiSlice"
import type { OrganizationalExpense } from "@/types/finance"

interface ExpenseCardProps {
  expense: OrganizationalExpense
}

export function ExpenseCard({ expense }: ExpenseCardProps) {
  const [deleteExpense] = useDeleteOrganizationalExpenseMutation()
  const [approveExpense] = useApproveOrganizationalExpenseMutation()
  const [rejectExpense] = useRejectOrganizationalExpenseMutation()

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "approved":
        return "bg-green-100 text-green-800 border-green-300"
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-300"
      case "rejected":
        return "bg-red-100 text-red-800 border-red-300"
      case "reimbursed":
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
    if (window.confirm("Are you sure you want to delete this expense?")) {
      try {
        await deleteExpense(expense?.id).unwrap()
        toast.success("Expense deleted successfully")
      } catch (error) {
        console.error("Failed to delete expense:", error)
        toast.error("Failed to delete expense. Please try again.")
      }
    }
  }

  const handleApprove = async () => {
    try {
      await approveExpense(expense?.id).unwrap()
      toast.success("Expense approved successfully")
    } catch (error) {
      console.error("Failed to approve expense:", error)
      toast.error("Failed to approve expense. Please try again.")
    }
  }

  const handleReject = async () => {
    try {
      await rejectExpense(expense?.id).unwrap()
      toast.success("Expense rejected successfully")
    } catch (error) {
      console.error("Failed to reject expense:", error)
      toast.error("Failed to reject expense. Please try again.")
    }
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center space-x-2">
          <Receipt className="h-4 w-4 text-orange-600" />
          <span className="text-sm font-medium text-gray-500 capitalize">
            {expense?.expense_type?.replace("_", " ")}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <Badge className={getStatusColor(expense?.status)}>{expense?.status}</Badge>
          <div className="flex space-x-1">
            {expense?.status === "pending" && (
              <>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-green-500" onClick={handleApprove}>
                  <Check className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={handleReject}>
                  <X className="h-4 w-4" />
                </Button>
              </>
            )}
            <AddEditExpenseDialog
              expense={expense}
              onSuccess={() => {
                toast.success("Expense updated successfully")
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
            <h3 className="font-semibold text-lg line-clamp-1">{expense?.title}</h3>
            <p className="text-sm text-gray-600 line-clamp-2 mt-1">{expense?.description}</p>
          </div>

          <div className="text-2xl font-bold">{formatCurrency(expense?.amount)}</div>

          <div className="flex items-center text-sm text-gray-500">
            <Calendar className="mr-1 h-3 w-3" />
            {formatDate(expense?.expense_date)}
          </div>

          {expense?.vendor && (
            <div className="flex items-center text-sm text-gray-500">
              <Building className="mr-1 h-3 w-3" />
              {expense?.vendor}
            </div>
          )}

          {expense?.category && (
            <div className="text-sm">
              <span className="text-gray-500">Category:</span>
              <span className="ml-1 font-medium capitalize">{expense?.category?.replace("_", " ")}</span>
            </div>
          )}

          {expense?.budget_item_description && (
            <div className="text-sm">
              <span className="text-gray-500">Budget Item:</span>
              <span className="ml-1 font-medium">{expense?.budget_item_description}</span>
            </div>
          )}

          {expense?.submitted_by_name && (
            <div className="text-sm">
              <span className="text-gray-500">Submitted by:</span>
              <span className="ml-1 font-medium">{expense?.submitted_by_name}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
