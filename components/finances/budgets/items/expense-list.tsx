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

const STATUS_CONFIG = {
  all: {
    label: "All",
    icon: FileText,
    color: "text-gray-600",
    bgColor: "bg-gray-100",
  },
  draft: {
    label: "Draft",
    icon: Archive,
    color: "text-gray-600",
    bgColor: "bg-gray-100",
  },
  pending: {
    label: "Pending Approval",
    icon: Clock,
    color: "text-yellow-600",
    bgColor: "bg-yellow-100",
  },
  approved: {
    label: "Approved",
    icon: CheckCircle,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
  },
  paid: {
    label: "Paid",
    icon: CheckCircle,
    color: "text-green-600",
    bgColor: "bg-green-100",
  },
  rejected: {
    label: "Rejected",
    icon: XCircle,
    color: "text-red-600",
    bgColor: "bg-red-100",
  },
}

export function ExpensesList({ expenses, isLoading, onEditExpense, onAddExpense, budgetItem }: ExpensesListProps) {
  const [deleteExpense] = useDeleteOrganizationalExpenseMutation()
  const [approveExpense] = useApproveOrganizationalExpenseMutation()
  const [rejectExpense] = useRejectOrganizationalExpenseMutation()

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

    Object.keys(STATUS_CONFIG).forEach((status) => {
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

  const handleViewDetails = (expense: any) => {
    closeDropdown(expense.id)
    console.log("View details for expense:", expense)
  }

  const currencyCode = budgetItem?.budget?.currency?.code || "USD"

  const renderExpenseTable = (expenseList: any[]) => {
    if (expenseList.length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p>No expenses in this category</p>
          <p className="text-sm">Add your first expense to start tracking</p>
          <Button className="mt-4" onClick={onAddExpense}>
            <Plus className="h-4 w-4 mr-2" />
            Add Expense
          </Button>
        </div>
      )
    }

    return (
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
                    {expense.status === "pending" && (
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
            {Object.entries(STATUS_CONFIG).map(([status, config]) => {
              const Icon = config.icon
              const total = statusTotals[status]

              return (
                <TabsTrigger key={status} value={status} className="flex flex-col gap-1 h-auto py-3 px-2">
                  <div className="flex items-center gap-1">
                    <Icon className="h-4 w-4" />
                    <span className="text-xs font-medium">{config.label}</span>
                  </div>
                  <div className="flex flex-col items-center gap-0.5">
                    <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                      {total.count}
                    </Badge>
                    {total.amount > 0 && (
                      <span className="text-xs text-muted-foreground">
                        {formatCurrency(currencyCode, total.amount)}
                      </span>
                    )}
                  </div>
                </TabsTrigger>
              )
            })}
          </TabsList>

          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            {Object.entries(STATUS_CONFIG).map(([status, config]) => {
              const Icon = config.icon
              const total = statusTotals[status]

              return (
                <Card
                  key={status}
                  className={`border-l-4 ${
                    status === "all"
                      ? "border-l-gray-500"
                      : status === "pending"
                        ? "border-l-yellow-500"
                        : status === "approved"
                          ? "border-l-blue-500"
                          : status === "paid"
                            ? "border-l-green-500"
                            : status === "rejected"
                              ? "border-l-red-500"
                              : "border-l-gray-500"
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`text-sm font-medium ${config.color}`}>{config.label}</p>
                        <p className="text-2xl font-bold">{total.count}</p>
                        {total.amount > 0 && (
                          <p className="text-sm text-muted-foreground">{formatCurrency(currencyCode, total.amount)}</p>
                        )}
                      </div>
                      <Icon className={`h-8 w-8 ${config.color}`} />
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Tab Contents */}
          {Object.keys(STATUS_CONFIG).map((status) => (
            <TabsContent key={status} value={status} className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold">
                    {STATUS_CONFIG[status as keyof typeof STATUS_CONFIG].label} Expenses
                  </h3>
                  <Badge variant="outline">{statusTotals[status].count} items</Badge>
                  {statusTotals[status].amount > 0 && (
                    <Badge variant="secondary">
                      Total: {formatCurrency(currencyCode, statusTotals[status].amount)}
                    </Badge>
                  )}
                </div>
              </div>

              {renderExpenseTable(groupedExpenses[status as keyof typeof groupedExpenses])}
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  )
}
