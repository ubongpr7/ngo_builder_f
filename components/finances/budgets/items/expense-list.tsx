"use client"
import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
  Archive,
  CreditCard,
} from "lucide-react"
import { formatCurrency } from "@/lib/currency-utils"
import {
  useDeleteOrganizationalExpenseMutation,
  useApproveOrganizationalExpenseMutation,
  useRejectOrganizationalExpenseMutation,
  useMarkOrganizationalExpensePaidMutation,
} from "@/redux/features/finance/organizational-expenses"
import { toast } from "react-toastify"

interface ExpensesListProps {
  expenses: any[]
  isLoading: boolean
  onEditExpense: (expense: any) => void
  onAddExpense: () => void
  budgetItem: any
}

const STATUS_TABS = [
  { value: "all", label: "All", icon: FileText },
  { value: "draft", label: "Draft", icon: Archive },
  { value: "pending", label: "Pending", icon: Clock },
  { value: "approved", label: "Approved", icon: CheckCircle },
  { value: "paid", label: "Paid", icon: CheckCircle },
  { value: "rejected", label: "Rejected", icon: XCircle },
]

export function ExpensesList({ expenses, isLoading, onEditExpense, onAddExpense, budgetItem }: ExpensesListProps) {
  const [deleteExpense] = useDeleteOrganizationalExpenseMutation()
  const [approveExpense] = useApproveOrganizationalExpenseMutation()
  const [rejectExpense] = useRejectOrganizationalExpenseMutation()
  const [markExpensePaid] = useMarkOrganizationalExpensePaidMutation()

  // Track dropdown open states for each expense
  const [openDropdowns, setOpenDropdowns] = useState<Record<number, boolean>>({})
  const [activeTab, setActiveTab] = useState("all")

  // Group expenses by status
  const groupedExpenses = useMemo(() => {
    const groups = {
      all: expenses,
      draft: expenses.filter((expense) => expense.status === "draft"),
      pending: expenses.filter((expense) => expense.status === "pending"),
      approved: expenses.filter((expense) => expense.status === "approved"),
      paid: expenses.filter((expense) => expense.status === "paid"),
      rejected: expenses.filter((expense) => expense.status === "rejected"),
    }
    return groups
  }, [expenses])

  // Calculate totals by status
  const statusTotals = useMemo(() => {
    const totals: Record<string, { count: number; amount: number }> = {}

    Object.keys(groupedExpenses).forEach((status) => {
      const statusExpenses = groupedExpenses[status as keyof typeof groupedExpenses]
      totals[status] = {
        count: statusExpenses.length,
        amount: statusExpenses.reduce((sum, expense) => sum + Number.parseFloat(expense.amount || "0"), 0),
      }
    })

    return totals
  }, [groupedExpenses])

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
      case "draft":
        return "bg-gray-100 text-gray-800"
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
      case "draft":
        return <Archive className="h-4 w-4 text-gray-500" />
      default:
        return <FileText className="h-4 w-4 text-gray-500" />
    }
  }

  const closeDropdown = (expenseId: number) => {
    setOpenDropdowns((prev) => ({ ...prev, [expenseId]: false }))
  }

  const handleEditExpense = (expense: any) => {
    closeDropdown(expense.id)
    setTimeout(() => {
      onEditExpense(expense)
    }, 100)
  }

  const handleDeleteExpense = async (expenseId: number) => {
    closeDropdown(expenseId)
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
    closeDropdown(expenseId)
    try {
      await approveExpense(expenseId).unwrap()
      toast.success("Expense approved successfully")
    } catch (error) {
      toast.error("Failed to approve expense")
    }
  }

  const handleRejectExpense = async (expenseId: number) => {
    closeDropdown(expenseId)
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

  const handleMarkAsPaid = async (expenseId: number) => {
    closeDropdown(expenseId)

    // Get payment details
    const paymentDate = prompt("Enter payment date (YYYY-MM-DD):", new Date().toISOString().split("T")[0])
    if (!paymentDate) return

    const paymentMethod = prompt("Enter payment method (e.g., Bank Transfer, Cash, Check):", "Bank Transfer")
    if (!paymentMethod) return

    const transactionReference = prompt("Enter transaction reference (optional):", "")

    try {
      await markExpensePaid({
        id: expenseId,
        data: {
          payment_date: paymentDate,
          payment_method: paymentMethod,
          transaction_reference: transactionReference || null,
        },
      }).unwrap()
      toast.success("Expense marked as paid successfully")
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to mark expense as paid")
    }
  }

  const handleViewDetails = (expense: any) => {
    closeDropdown(expense.id)
    console.log("View details for expense:", expense)
  }

  const currencyCode = budgetItem?.budget?.currency?.code || "USD"
  const currentExpenses = groupedExpenses[activeTab as keyof typeof groupedExpenses]
  const currentTotal = statusTotals[activeTab]

  const renderExpenseTable = (expenseList: any[]) => {
    if (expenseList.length === 0) {
      return (
        <div className="text-center py-12 text-muted-foreground">
          <FileText className="h-16 w-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No expenses found</h3>
          <p className="text-sm mb-4">
            {activeTab === "all" ? "No expenses have been recorded yet" : `No ${activeTab} expenses found`}
          </p>
          <Button onClick={onAddExpense}>
            <Plus className="h-4 w-4 mr-2" />
            Add First Expense
          </Button>
        </div>
      )
    }

    return (
      <div className="space-y-4">
        {/* Summary bar */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-600">
              <span className="font-medium">{currentTotal.count}</span>{" "}
              {currentTotal.count === 1 ? "expense" : "expenses"}
            </div>
            {currentTotal.amount > 0 && (
              <div className="text-sm text-gray-600">
                Total: <span className="font-medium">{formatCurrency(currencyCode, currentTotal.amount)}</span>
              </div>
            )}
          </div>
          <Button size="sm" onClick={onAddExpense}>
            <Plus className="h-4 w-4 mr-2" />
            Add Expense
          </Button>
        </div>

        {/* Table */}
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
            {expenseList.map((expense) => (
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
                  <DropdownMenu
                    open={openDropdowns[expense.id] || false}
                    onOpenChange={(open) => setOpenDropdowns((prev) => ({ ...prev, [expense.id]: open }))}
                  >
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEditExpense(expense)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleViewDetails(expense)}>
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      {expense.status in ["pending",'draft']  && (
                        <>
                          <DropdownMenuItem onClick={() => handleApproveExpense(expense.id)} className="text-green-600">
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Approve
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleRejectExpense(expense.id)} className="text-red-600">
                            <XCircle className="h-4 w-4 mr-2" />
                            Reject
                          </DropdownMenuItem>
                        </>
                      )}
                      {expense.status === "approved" && (
                        <DropdownMenuItem onClick={() => handleMarkAsPaid(expense.id)} className="text-blue-600">
                          <CreditCard className="h-4 w-4 mr-2" />
                          Mark as Paid
                        </DropdownMenuItem>
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
      </div>
    )
  }

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
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            {STATUS_TABS.map((tab) => {
              const Icon = tab.icon
              const count = statusTotals[tab.value]?.count || 0

              return (
                <TabsTrigger key={tab.value} value={tab.value} className="flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                  {count > 0 && (
                    <Badge variant="secondary" className="ml-1 text-xs">
                      {count}
                    </Badge>
                  )}
                </TabsTrigger>
              )
            })}
          </TabsList>

          {/* Tab Contents */}
          {STATUS_TABS.map((tab) => (
            <TabsContent key={tab.value} value={tab.value}>
              {renderExpenseTable(groupedExpenses[tab.value as keyof typeof groupedExpenses])}
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  )
}
