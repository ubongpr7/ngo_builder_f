"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, FileText } from "lucide-react"
import { useGetAllExpensesQuery } from "@/redux/features/finance/financeApiSlice"
import { Skeleton } from "@/components/ui/skeleton"
import { AddEditExpenseDialog } from "@/components/finance/add-edit-expense-dialog"
import { ExpenseCard } from "@/components/finance/expense-card"
import { ExpenseStatistics } from "@/components/finance/expense-statistics"
import { usePermissions } from "@/components/permissionHander"
import { useGetLoggedInProfileRolesQuery } from "@/redux/features/profile/readProfileAPISlice"
import type { OrganizationalExpense } from "@/types/finance"

export default function ExpenseManagement() {
  const { data: expenses = [], isLoading, isError, refetch } = useGetAllExpensesQuery()
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [filteredExpenses, setFilteredExpenses] = useState<OrganizationalExpense[]>([])
  const { data: userRoles } = useGetLoggedInProfileRolesQuery()
  const is_DB_admin = usePermissions(userRoles, { requiredRoles: ["is_DB_admin"], requireKYC: true })

  useEffect(() => {
    if (!expenses) return

    const filtered = expenses.filter((expense: OrganizationalExpense) => {
      const matchesSearch =
        expense.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expense.description?.toLowerCase()?.includes(searchTerm.toLowerCase()) ||
        expense.vendor?.toLowerCase()?.includes(searchTerm.toLowerCase()) ||
        expense.submitted_by_name?.toLowerCase()?.includes(searchTerm.toLowerCase()) ||
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
        {is_DB_admin && (
          <div className="mt-4 md:mt-0">
            <AddEditExpenseDialog onSuccess={refetch} />
          </div>
        )}
      </div>

      <ExpenseStatistics />

      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search expenses..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            disabled={isLoading}
          />
        </div>
        <Tabs defaultValue="all" className="w-full md:w-auto" onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all" disabled={isLoading}>
              All
            </TabsTrigger>
            <TabsTrigger value="pending" disabled={isLoading}>
              Pending
            </TabsTrigger>
            <TabsTrigger value="approved" disabled={isLoading}>
              Approved
            </TabsTrigger>
            <TabsTrigger value="paid" disabled={isLoading}>
              Paid
            </TabsTrigger>
            <TabsTrigger value="rejected" disabled={isLoading}>
              Rejected
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="bg-white rounded-lg border shadow-sm overflow-hidden">
              <div className="p-4 space-y-3">
                <div className="flex justify-between">
                  <Skeleton className="h-5 w-1/2" />
                  <Skeleton className="h-5 w-1/4" />
                </div>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
              <div className="px-4 pb-4">
                <div className="flex justify-between mt-2">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-4 w-1/4" />
                </div>
                <Skeleton className="h-4 w-1/2 mt-2" />
              </div>
              <div className="bg-gray-50 px-4 py-3 border-t">
                <div className="flex justify-between items-center">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-8 rounded-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 flex items-center justify-center rounded-full bg-red-100">
            <FileText className="h-12 w-12 text-red-400" />
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
            <ExpenseCard key={expense.id} expense={expense} onUpdate={refetch} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 flex items-center justify-center rounded-full bg-gray-100">
            <FileText className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="mt-4 text-lg font-medium">No expenses found</h3>
          <p className="mt-2 text-gray-500">Try adjusting your search or filter criteria</p>
        </div>
      )}
    </div>
  )
}
