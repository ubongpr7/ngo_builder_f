"use client"

import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Edit, Eye, Calendar, DollarSign, User, Building } from "lucide-react"
import { AddEditExpenseDialog } from "./add-edit-expense-dialog"
import { usePermissions } from "@/components/permissionHander"
import { useGetLoggedInProfileRolesQuery } from "@/redux/features/profile/readProfileAPISlice"
import { format } from "date-fns"
import type { OrganizationalExpense } from "@/types/finance"

interface ExpenseCardProps {
  expense: OrganizationalExpense
  onUpdate?: () => void
}

export function ExpenseCard({ expense, onUpdate }: ExpenseCardProps) {
  const { data: userRoles } = useGetLoggedInProfileRolesQuery()
  const is_DB_admin = usePermissions(userRoles, { requiredRoles: ["is_DB_admin"], requireKYC: true })

  // Format date
  const expenseDate = expense.expense_date ? format(new Date(expense.expense_date), "MMM d, yyyy") : "N/A"

  // Status badge variant
  const getStatusVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved":
        return "success"
      case "pending":
        return "warning"
      case "paid":
        return "default"
      case "rejected":
        return "destructive"
      case "draft":
        return "secondary"
      default:
        return "secondary"
    }
  }

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <h3 className="font-semibold text-lg line-clamp-1">{expense.title}</h3>
          <Badge variant={getStatusVariant(expense.status) as any}>{expense.status}</Badge>
        </div>

        <p className="text-sm text-gray-500 mt-2 line-clamp-2">{expense.description}</p>

        <div className="mt-3 space-y-2">
          <div className="flex items-center text-sm">
            <DollarSign className="h-3.5 w-3.5 mr-1.5 text-gray-500" />
            <span className="text-gray-700">${Number(expense.amount).toFixed(2)}</span>
          </div>

          <div className="flex items-center text-sm">
            <Calendar className="h-3.5 w-3.5 mr-1.5 text-gray-500" />
            <span className="text-gray-700">{expenseDate}</span>
          </div>

          {expense.vendor && (
            <div className="flex items-center text-sm">
              <Building className="h-3.5 w-3.5 mr-1.5 text-gray-500" />
              <span className="text-gray-700">{expense.vendor}</span>
            </div>
          )}

          {expense.submitted_by_name && (
            <div className="flex items-center text-sm">
              <User className="h-3.5 w-3.5 mr-1.5 text-gray-500" />
              <span className="text-gray-700">Submitted by: {expense.submitted_by_name}</span>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="bg-gray-50 px-4 py-3 border-t flex justify-between">
        <div className="text-sm text-gray-500">
          <Badge variant="outline">{expense.expense_type}</Badge>
        </div>

        <div className="flex space-x-2">
          <Button variant="ghost" size="sm" asChild>
            <a href={`/dashboard/finance/expenses/${expense.id}`}>
              <Eye className="h-4 w-4 mr-1" />
              View
            </a>
          </Button>

          {is_DB_admin && (
            <AddEditExpenseDialog
              expense={expense}
              onSuccess={onUpdate}
              trigger={
                <Button variant="ghost" size="sm">
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
              }
            />
          )}
        </div>
      </CardFooter>
    </Card>
  )
}
