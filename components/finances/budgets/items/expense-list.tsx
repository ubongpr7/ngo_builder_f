"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Plus,
  MoreHorizontal,
  Edit,
  Eye,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  Calendar,
  User,
  FileText,
} from "lucide-react"
import { formatCurrency } from "@/lib/currency-utils"
import {
  useDeleteOrganizationalExpenseMutation,
  useApproveOrganizationalExpenseMutation,
  useRejectOrganizationalExpenseMutation,
} from "@/redux/features/finance/organizational-expenses"
import { toast } from "react-toastify"

interface ExpensesListProps {
  expenses: any[]
  isLoading: boolean
  onEditExpense: (expense: any) => void
  onAddExpense: () => void
  budgetItem: any
}

export function ExpensesList({ expenses, isLoading, onEditExpense, onAddExpense, budgetItem }: ExpensesListProps) {
  const [deleteExpense] = useDeleteOrganizationalExpenseMutation()
  const [approveExpense] = useApproveOrganizationalExpenseMutation()
  const [rejectExpense] = useRejectOrganizationalExpenseMutation()

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800"
      case "approved":
        return "bg-blue-100 text-blue-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "paid":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "approved":
        return <CheckCircle className="h-4 w-4 text-blue-500" />
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <FileText className="h-4 w-4 text-gray-500" />
    }
  }

  const handleDeleteExpense = async (expenseId: number) => {
    if (confirm("Are you sure you want to delete this expense?")) {
      try {
        await deleteExpense(expenseId).unwrap()
        toast.success("Expense deleted successfully")
      } catch (error) {
        toast.error("Failed to delete expense")
      }
    }
  }

  const handleApproveExpense = async (expenseId: number) => {
    try {
      await approveExpense(expenseId).unwrap()
      toast.success("Expense approved successfully")
    } catch (error) {
      toast.error("Failed to approve expense")
    }
  }

  const handleRejectExpense = async (expenseId: number) => {
    const reason = prompt("Please provide a reason for rejection:")
    if (reason) {
      try {
        await rejectExpense({ id: expenseId, reason }).unwrap()
        toast.success("Expense rejected successfully")
      } catch (error) {
        toast.error("Failed to reject expense")
      }
    }
  }

  const currencyCode = budgetItem?.budget?.currency?.code || "USD"

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Expenses ({expenses.length})
          </CardTitle>
          <Button onClick={onAddExpense}>
            <Plus className="h-4 w-4 mr-2" />
            Add Expense
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {expenses.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p>No expenses recorded yet</p>
            <p className="text-sm">Add your first expense to start tracking</p>
            <Button className="mt-4" onClick={onAddExpense}>
              <Plus className="h-4 w-4 mr-2" />
              Add First Expense
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Submitted By</TableHead>
                <TableHead className="w-[50px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{expense.title}</div>
                      <div className="text-sm text-muted-foreground truncate max-w-[200px]">{expense.description}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{expense.expense_type?.replace("_", " ")}</Badge>
                  </TableCell>
                  <TableCell className="font-medium">{formatCurrency(currencyCode, expense.amount)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      {new Date(expense.expense_date).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell>{expense.vendor || "—"}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(expense.status)}
                      <Badge className={getStatusColor(expense.status)}>{expense.status}</Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">
                        {expense.submitted_by?.first_name} {expense.submitted_by?.last_name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEditExpense(expense)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        {expense.status === "pending" && (
                          <>
                            <DropdownMenuItem
                              onClick={() => handleApproveExpense(expense.id)}
                              className="text-green-600"
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Approve
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleRejectExpense(expense.id)} className="text-red-600">
                              <XCircle className="h-4 w-4 mr-2" />
                              Reject
                            </DropdownMenuItem>
                          </>
                        )}
                        <DropdownMenuItem onClick={() => handleDeleteExpense(expense.id)} className="text-red-600">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
