"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, PieChart, Loader2 } from "lucide-react"
import { useGetAllBudgetsQuery } from "@/redux/features/finance/financeApiSlice"
import { BudgetCard } from "@/components/finance/budget-card"
import { AddEditBudgetDialog } from "@/components/finance/add-edit-budget-dialog"
import { usePermissions } from "@/components/permissionHander"
import { useGetLoggedInProfileRolesQuery } from "@/redux/features/profile/readProfileAPISlice"
import { BudgetUtilizationChart } from "@/components/dashboard/finance/budget-utilization-chart"

export default function BudgetsManagement() {
  const { data: budgets = [], isLoading, isError, refetch } = useGetAllBudgetsQuery("")
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [filteredBudgets, setFilteredBudgets] = useState<any[]>([])
  const { data: userRoles } = useGetLoggedInProfileRolesQuery()
  const is_DB_admin = usePermissions(userRoles, { requiredRoles: ["is_DB_admin"], requireKYC: true })
  const is_finance_admin = usePermissions(userRoles, { requiredRoles: ["is_finance_admin"], requireKYC: true })
  const canManageBudgets = is_DB_admin || is_finance_admin

  // Calculate budget statistics
  const budgetStats = {
    total_budget: budgets?.reduce((sum: number, budget: any) => sum + Number(budget.amount), 0) || 0,
    total_spent: budgets?.reduce((sum: number, budget: any) => sum + Number(budget.spent), 0) || 0,
    total_remaining:
      budgets?.reduce((sum: number, budget: any) => sum + (Number(budget.amount) - Number(budget.spent)), 0) || 0,
    by_department: budgets?.reduce((acc: Record<string, { amount: number; spent: number }>, budget: any) => {
      const dept = budget.department || "General"
      if (!acc[dept]) {
        acc[dept] = { amount: 0, spent: 0 }
      }
      acc[dept].amount += Number(budget.amount)
      acc[dept].spent += Number(budget.spent)
      return acc
    }, {}),
    utilization_rate:
      budgets?.length && budgets.reduce((sum: number, budget: any) => sum + Number(budget.amount), 0) > 0
        ? (budgets.reduce((sum: number, budget: any) => sum + Number(budget.spent), 0) /
            budgets.reduce((sum: number, budget: any) => sum + Number(budget.amount), 0)) *
          100
        : 0,
  }

  useEffect(() => {
    if (!budgets) return

    const filtered = budgets.filter((budget: any) => {
      const matchesSearch =
        budget.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        budget.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        budget.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        false

      if (activeTab === "all") return matchesSearch

      // Map API status values to UI tabs
      const statusMap: Record<string, string> = {
        active: "active",
        closed: "closed",
        draft: "draft",
      }

      return matchesSearch && statusMap[budget.status.toLowerCase()] === activeTab.toLowerCase()
    })

    setFilteredBudgets(filtered)
  }, [budgets, searchTerm, activeTab])

  // Refetch data when component mounts
  useEffect(() => {
    refetch()
  }, [refetch])

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Budget Management</h1>
          <p className="text-gray-500">Manage and track organizational budgets</p>
        </div>
        {canManageBudgets && (
          <div className="mt-4 md:mt-0">
            <AddEditBudgetDialog />
          </div>
        )}
      </div>

      {/* Budget Statistics */}
      <div className="mb-6">
        <BudgetUtilizationChart budgetStats={budgetStats} isLoading={isLoading} onRefresh={() => refetch()} />
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search budgets..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Tabs defaultValue="all" className="w-full md:w-auto" onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="draft">Draft</TabsTrigger>
            <TabsTrigger value="closed">Closed</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
          <span className="ml-2 text-gray-500">Loading budgets...</span>
        </div>
      ) : isError ? (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 flex items-center justify-center rounded-full bg-red-100">
            <PieChart className="h-12 w-12 text-red-400" />
          </div>
          <h3 className="mt-4 text-lg font-medium">Error loading budgets</h3>
          <p className="mt-2 text-gray-500">There was an error loading the budgets. Please try again.</p>
          <Button onClick={() => refetch()} className="mt-4">
            Retry
          </Button>
        </div>
      ) : filteredBudgets?.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBudgets?.map((budget) => (
            <BudgetCard key={budget.id} budget={budget} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 flex items-center justify-center rounded-full bg-gray-100">
            <PieChart className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="mt-4 text-lg font-medium">No budgets found</h3>
          <p className="mt-2 text-gray-500">Try adjusting your search or filter criteria</p>
        </div>
      )}
    </div>
  )
}
