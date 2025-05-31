"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { toast } from "react-toastify"
import { useDeleteOrganizationalExpenseMutation } from "@/redux/features/finance/organizational-expenses"
import { formatCurrency } from "@/lib/currency-utils"

interface DeleteExpenseDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
  expense: any
}

export function DeleteExpenseDialog({ open, onOpenChange, onSuccess, expense }: DeleteExpenseDialogProps) {
  const [deleteExpense, { isLoading: isDeleting }] = useDeleteOrganizationalExpenseMutation()

  const handleDelete = async () => {
    try {
      await deleteExpense(expense.id).unwrap()
      toast.success("Expense deleted successfully!")
      onSuccess?.()
    } catch (error: any) {
      console.error("Expense deletion error:", error)
      toast.error(error?.data?.message || error?.data?.detail || "Failed to delete expense")
    }
  }

  const currencyCode = expense?.currency?.code || "USD"

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Expense</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this expense? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {expense && (
          <div className="my-4 p-4 bg-gray-50 rounded-lg">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">Title:</span>
                <span>{expense.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Amount:</span>
                <span className="font-mono">{formatCurrency(currencyCode, expense.amount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Date:</span>
                <span>{new Date(expense.expense_date).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
          >
            {isDeleting ? "Deleting..." : "Delete Expense"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
