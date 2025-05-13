"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import {
  Search,
  Calendar,
  FileText,
  DollarSign,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Loader2,
  Receipt,
  Filter,
} from "lucide-react"
import { AddExpenseDialog } from "./add-expense-dialog"
import { EditExpenseDialog } from "./edit-expense-dialog"
import { ApproveExpenseDialog } from "./approve-expense-dialog"
import { RejectExpenseDialog } from "./reject-expense-dialog"
import { ReimburseExpenseDialog } from "./reimburse-expense-dialog"
import { ViewReceiptDialog } from "./view-receipt-dialog"
import {
  useGetExpensesByProjectQuery,
  useApproveExpenseMutation,
  useRejectExpenseMutation,
  useReimburseExpenseMutation,
  useGetExpenseStatisticsQuery,
} from "@/redux/features/projects/expenseApiSlice"

interface ProjectExpensesProps {
  projectId: number
}

export function ProjectExpenses({ projectId }: ProjectExpensesProps) {
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [filters, setFilters] = useState<any>({})

  // Dialog states
  const [addExpenseOpen, setAddExpenseOpen] = useState(false)
  const [editExpenseOpen, setEditExpenseOpen] = useState(false)
  const [approveExpenseOpen, setApproveExpenseOpen] = useState(false)
  const [rejectExpenseOpen, setRejectExpenseOpen] = useState(false)
  const [reimburseExpenseOpen, setReimburseExpenseOpen] = useState(false)
  const [viewReceiptOpen, setViewReceiptOpen] = useState(false)
  const [filterDialogOpen, setFilterDialogOpen] = useState(false)
  const [selectedExpense, setSelectedExpense] = useState<any>(null)

  // API queries and mutations
  const {
    data: expenses = [],
    isLoading,
    refetch,
  } = useGetExpensesByProjectQuery(
    projectId,
  )

  const { data: statistics } = useGetExpenseStatisticsQuery(projectId)

  const [approveExpense] = useApproveExpenseMutation()
  const [rejectExpense] = useRejectExpenseMutation()
  const [reimburseExpense] = useReimburseExpenseMutation()

  // Filter expenses based on search term and active tab
  const filteredExpenses = expenses.filter((expense) => {
    const matchesSearch =
      expense.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.category.toLowerCase().includes(searchTerm.toLowerCase())

    if (activeTab === "all") return matchesSearch
    return matchesSearch && expense.status.toLowerCase() === activeTab.toLowerCase()
  })

  // Get status badge color
  const getStatusBadgeColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-amber-100 text-amber-800 border-amber-300"
      case "approved":
        return "bg-green-100 text-green-800 border-green-300"
      case "rejected":
        return "bg-red-100 text-red-800 border-red-300"
      case "reimbursed":
        return "bg-blue-100 text-blue-800 border-blue-300"
      default:
        return "bg-gray-100 text-gray-800 border-gray-300"
    }
  }

  // Format status for display
  const formatStatus = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1).replace("_", " ")
  }

  // Calculate total expenses
  const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0)

  // Handle quick approve
  const handleQuickApprove = async (expense: any) => {
    try {
      await approveExpense({ id: expense.id, notes: "" }).unwrap()
      toast({
        title: "Expense Approved",
        description: "The expense has been approved successfully.",
      })
      refetch()
    } catch (error) {
      console.error("Failed to approve expense:", error)
      toast({
        title: "Error",
        description: "Failed to approve expense. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Handle quick reject
  const handleQuickReject = (expense: any) => {
    setSelectedExpense(expense)
    setRejectExpenseOpen(true)
  }

  // Handle quick reimburse
  const handleQuickReimburse = async (expense: any) => {
    try {
      await reimburseExpense({ id: expense.id, notes: "" }).unwrap()
      toast({
        title: "Expense Reimbursed",
        description: "The expense has been marked as reimbursed.",
      })
      refetch()
    } catch (error) {
      console.error("Failed to reimburse expense:", error)
      toast({
        title: "Error",
        description: "Failed to mark expense as reimbursed. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Handle view receipt
  const handleViewReceipt = (expense: any) => {
    setSelectedExpense(expense)
    setViewReceiptOpen(true)
  }

  // Handle edit expense
  const handleEditExpense = (expense: any) => {
    setSelectedExpense(expense)
    setEditExpenseOpen(true)
  }

  // Handle approve with notes
  const handleApproveWithNotes = (expense: any) => {
    setSelectedExpense(expense)
    setApproveExpenseOpen(true)
  }

  // Handle reimburse with notes
  const handleReimburseWithNotes = (expense: any) => {
    setSelectedExpense(expense)
    setReimburseExpenseOpen(true)
  }

  // Handle filter apply
  const handleFilterApply = (newFilters: any) => {
    setFilters(newFilters)
    setFilterDialogOpen(false)
  }

  // Handle filter clear
  const handleFilterClear = () => {
    setFilters({})
    setFilterDialogOpen(false)
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        <span className="ml-2 text-gray-500">Loading expenses...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold mb-1">Project Expenses</h2>
          <p className="text-gray-500">Track and manage project expenditures</p>
        </div>
        <div className="flex gap-2">
       
          <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={() => setAddExpenseOpen(true)}>
            <Receipt className="mr-2 h-4 w-4" />
            Add Expense
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search expenses..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Tabs defaultValue="all" className="w-full md:w-auto" onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
            <TabsTrigger value="reimbursed">Reimbursed</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Summary Card */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="space-y-1">
              <div className="text-sm text-gray-500">Total Expenses</div>
              <div className="text-2xl font-bold">${statistics?.total_expenses?.total?.toLocaleString() || "0.00"}</div>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-gray-500">Pending Approval</div>
              <div className="text-2xl font-bold">
                ${statistics?.total_expenses?.pending?.toLocaleString() || "0.00"}
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-gray-500">Approved</div>
              <div className="text-2xl font-bold">
                ${statistics?.total_expenses?.approved?.toLocaleString() || "0.00"}
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-gray-500">Reimbursed</div>
              <div className="text-2xl font-bold">
                ${statistics?.total_expenses?.reimbursed?.toLocaleString() || "0.00"}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {filteredExpenses.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertTriangle className="h-12 w-12 text-amber-500 mb-4" />
            <h3 className="text-lg font-medium mb-2">No Expenses Found</h3>
            <p className="text-gray-500 text-center mb-4">
              {searchTerm || Object.keys(filters).length > 0
                ? "No expenses match your search criteria. Try different search terms or filters."
                : "No expenses have been recorded for this project yet."}
            </p>
            <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={() => setAddExpenseOpen(true)}>
              <Receipt className="mr-2 h-4 w-4" />
              Record First Expense
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredExpenses.map((expense) => (
            <Card key={expense.id}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{expense.title}</CardTitle>
                    <CardDescription>
                      {expense.category} - {new Date(expense.date_incurred).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <Badge className={getStatusBadgeColor(expense.status)}>{formatStatus(expense.status)}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarImage
                        src={`${expense.incurred_by_details?.profile_image}`}
                      />
                      <AvatarFallback>
                        {expense.incurred_by_details?.first_name?.[0] || ""}
                        {expense.incurred_by_details?.last_name?.[0] || ""}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">
                        {expense.incurred_by_details?.first_name} {expense.incurred_by_details?.last_name}
                      </div>
                      <div className="text-sm text-gray-500">Incurred by</div>
                    </div>
                  </div>
                  <div className="text-2xl font-bold">${expense.amount.toLocaleString()}</div>
                </div>

                <p className="text-gray-700">{expense.description}</p>

                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center text-gray-500">
                    <Calendar className="mr-2 h-4 w-4" />
                    Incurred: {new Date(expense.date_incurred).toLocaleDateString()}
                  </div>

                  {expense.approval_date && (
                    <div className="flex items-center text-gray-500">
                      <Calendar className="mr-2 h-4 w-4" />
                      {expense.status === "approved" || expense.status === "reimbursed" ? "Approved" : "Rejected"}:{" "}
                      {new Date(expense.approval_date).toLocaleDateString()}
                    </div>
                  )}

                  {expense.approved_by_details && (
                    <div className="flex items-center text-gray-500">
                      <CheckCircle className="mr-2 h-4 w-4" />
                      By: {expense.approved_by_details.first_name} {expense.approved_by_details.last_name}
                    </div>
                  )}
                </div>

                {expense.receipt && (
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-gray-500" />
                    <button onClick={() => handleViewReceipt(expense)} className="text-blue-600 hover:underline">
                      View Receipt
                    </button>
                  </div>
                )}

                {expense.notes && (
                  <div className="pt-2 border-t border-gray-100">
                    <div className="text-sm font-medium mb-1">Notes</div>
                    <p className="text-sm text-gray-700">{expense.notes}</p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                {expense.status === "pending" && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-green-500 text-green-600 hover:bg-green-50"
                      onClick={() => handleApproveWithNotes(expense)}
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Approve
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-red-500 text-red-600 hover:bg-red-50"
                      onClick={() => handleQuickReject(expense)}
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      Reject
                    </Button>
                  </>
                )}
                {expense.status === "approved" && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-blue-500 text-blue-600 hover:bg-blue-50"
                    onClick={() => handleReimburseWithNotes(expense)}
                  >
                    <DollarSign className="mr-2 h-4 w-4" />
                    Mark Reimbursed
                  </Button>
                )}
                <Button variant="outline" size="sm" onClick={() => handleEditExpense(expense)}>
                  Edit
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Dialogs */}
      <AddExpenseDialog
        projectId={projectId}
        open={addExpenseOpen}
        onOpenChange={setAddExpenseOpen}
        onSuccess={refetch}
      />

      {selectedExpense && (
        <>
          <EditExpenseDialog
            projectId={projectId}
            expense={selectedExpense}
            open={editExpenseOpen}
            onOpenChange={setEditExpenseOpen}
            onSuccess={refetch}
          />

          <ApproveExpenseDialog
            expense={selectedExpense}
            isOpen={approveExpenseOpen}
            onClose={() => setApproveExpenseOpen(false)}
            onSuccess={refetch}
          />

          <RejectExpenseDialog
            expense={selectedExpense}
            isOpen={rejectExpenseOpen}
            onClose={() => setRejectExpenseOpen(false)}
            onSuccess={refetch}
          />

          <ReimburseExpenseDialog
            expense={selectedExpense}
            isOpen={reimburseExpenseOpen}
            onClose={() => setReimburseExpenseOpen(false)}
            onSuccess={refetch}
          />

          <ViewReceiptDialog expense={selectedExpense} open={viewReceiptOpen} onOpenChange={setViewReceiptOpen} />
        </>
      )}

      
    </div>
  )
}
