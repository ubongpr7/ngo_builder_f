"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Receipt, Loader2 } from "lucide-react"
import { useGetOrganizationalExpensesQuery } from "@/redux/features/finance/financeApiSlice"
import { ExpenseCard } from "@/components/finance/expense-card"
import { AddEditExpenseDialog } from "@/components/finance/add-edit-expense-dialog"
import { usePermissions } from "@/components/permissionHander"
import { useGetLoggedInProfileRolesQuery } from "@/redux/features/profile/readProfileAPISlice"
import { ExpenseChart } from "@/components/dashboard/finance/expense-chart"

export default function ExpensesManagement() {
  const { data: expenses = [], isLoading, isError, refetch } = useGetOrganizationalExpensesQuery()
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [filteredExpenses, setFilteredExpenses] = useState<any[]>([])
  const { data: userRoles } = useGetLoggedInProfileRolesQuery()
  const is_DB_admin = usePermissions(userRoles, { requiredRoles: ["is_DB_admin"], requireKYC: true })
  const is_finance_admin = usePermissions(userRoles, { requiredRoles: ["is_finance_admin"], requireKYC: true })
  const canManageExpenses = is_DB_admin || is_finance_admin

  // Calculate expense statistics
  const expenseStats = {
    total_amount: expenses?.reduce((sum: number, expense: any) => sum + Number(expense.amount), 0) || 0,
    pending_amount:
      expenses
        ?.filter((e: any) => e.status === "pending")
        .reduce((sum: number, expense: any) => sum + Number(expense.amount), 0) || 0,
    approved_amount:
      expenses
        ?.filter((e: any) => e.status === "approved")
        .reduce((sum: number, expense: any) => sum + Number(expense.amount), 0) || 0,
    rejected_amount:
      expenses
        ?.filter((e: any) => e.status === "rejected")
        .reduce((sum: number, expense: any) => sum + Number(expense.amount), 0) || 0,
    by_category: expenses?.reduce((acc: Record<string, number>, expense: any) => {
      const category = expense.category || "Uncategorized"
      acc[category] = (acc[category] || 0) + Number(expense.amount)
      return acc
    }, {}),
    by_status: {
      pending: expenses?.filter((e: any) => e.status === "pending").length || 0,
      approved: expenses?.filter((e: any) => e.status === "approved").length || 0,
      rejected: expenses?.filter((e: any) => e.status === "rejected").length || 0,
      reimbursed: expenses?.filter((e: any) => e.status === "reimbursed").length || 0,
    },
  }

  useEffect(() => {
    if (!expenses) return

    const filtered = expenses.filter((expense: any) => {
      const matchesSearch =
        expense.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expense.vendor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expense.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        false

      if (activeTab === "all") return matchesSearch

      return matchesSearch && expense.status.toLowerCase() === activeTab.toLowerCase()
    })

    setFilteredExpenses(filtered)
  }, [expenses, searchTerm, activeTab])

  // Refetch data when component mounts
  useEffect(() => {
    refetch()
  }, [refetch])

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Expense Management</h1>
          <p className="text-gray-500">Manage and track organizational expenses</p>
        </div>
        {canManageExpenses && (
          <div className="mt-4 md:mt-0">
            <AddEditExpenseDialog />
          </div>
        )}
      </div>

      {/* Expense Statistics */}
      <div className="mb-6">
        <ExpenseChart expenseStats={expenseStats} isLoading={isLoading} onRefresh={() => refetch()} />
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

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
          <span className="ml-2 text-gray-500">Loading expenses...</span>
        </div>
      ) : isError ? (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 flex items-center justify-center rounded-full bg-red-100">
            <Receipt className="h-12 w-12 text-red-400" />
          </div>
          <h3 className="mt-4 text-lg font-medium">Error loading expenses</h3>
          <p className="mt-2 text-gray-500">There was an error loading the expenses. Please try again.</p>
          <Button onClick={() => refetch()} className="mt-4">
            Retry
          </Button>
        </div>
      ) : filteredExpenses?.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredExpenses?.map((expense) => (
            <ExpenseCard key={expense.id} expense={expense} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 flex items-center justify-center rounded-full bg-gray-100">
            <Receipt className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="mt-4 text-lg font-medium">No expenses found</h3>
          <p className="mt-2 text-gray-500">Try adjusting your search or filter criteria</p>
        </div>
      )}
    </div>
  )
}
