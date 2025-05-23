"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, FileText } from "lucide-react"
import { useGetAllBudgetsQuery } from "@/redux/features/finance/financeApiSlice"
import { Skeleton } from "@/components/ui/skeleton"
import { AddEditBudgetDialog } from "@/components/finance/add-edit-budget-dialog"
import { BudgetCard } from "@/components/finance/budget-card"
import { BudgetStatistics } from "@/components/finance/budget-statistics"
import { usePermissions } from "@/components/permissionHander"
import { useGetLoggedInProfileRolesQuery } from "@/redux/features/profile/readProfileAPISlice"
import type { Budget } from "@/types/finance"

export default function BudgetManagement() {
  const { data: budgets = [], isLoading, isError, refetch } = useGetAllBudgetsQuery()
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [filteredBudgets, setFilteredBudgets] = useState<Budget[]>([])
  const { data: userRoles } = useGetLoggedInProfileRolesQuery()
  const is_DB_admin = usePermissions(userRoles, { requiredRoles: ["is_DB_admin"], requireKYC: true })

  useEffect(() => {
    if (!budgets) return

    const filtered = budgets.filter((budget: Budget) => {
      const matchesSearch =
        budget.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        budget.notes?.toLowerCase()?.includes(searchTerm.toLowerCase()) ||
        budget.project_title?.toLowerCase()?.includes(searchTerm.toLowerCase()) ||
        budget.campaign_title?.toLowerCase()?.includes(searchTerm.toLowerCase()) ||
        false

      if (activeTab === "all") return matchesSearch

      return matchesSearch && budget.status.toLowerCase() === activeTab.toLowerCase()
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
        {is_DB_admin && (
          <div className="mt-4 md:mt-0">
            <AddEditBudgetDialog onSuccess={refetch} />
          </div>
        )}
      </div>

      <BudgetStatistics />

      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search budgets..."
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
            <TabsTrigger value="active" disabled={isLoading}>
              Active
            </TabsTrigger>
            <TabsTrigger value="approved" disabled={isLoading}>
              Approved
            </TabsTrigger>
            <TabsTrigger value="pending_approval" disabled={isLoading}>
              Pending
            </TabsTrigger>
            <TabsTrigger value="completed" disabled={isLoading}>
              Completed
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
                <div className="mt-2">
                  <Skeleton className="h-2.5 w-full rounded-full mb-2" />
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                </div>
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
          <h3 className="mt-4 text-lg font-medium">Error loading budgets</h3>
          <p className="mt-2 text-gray-500">There was an error loading the budgets. Please try again.</p>
          <Button onClick={() => refetch()} className="mt-4">
            Retry
          </Button>
        </div>
      ) : filteredBudgets?.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBudgets?.map((budget) => (
            <BudgetCard key={budget.id} budget={budget} onUpdate={refetch} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 flex items-center justify-center rounded-full bg-gray-100">
            <FileText className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="mt-4 text-lg font-medium">No budgets found</h3>
          <p className="mt-2 text-gray-500">Try adjusting your search or filter criteria</p>
        </div>
      )}
    </div>
  )
}
