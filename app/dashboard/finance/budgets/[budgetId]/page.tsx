"use client"

import { BudgetDetailHeader } from "@/components/finances/budgets/details/budget-detail-header"
import { BudgetFundingBreakdown } from "@/components/finances/budgets/details/budget-funding-breakdown"
import { BudgetItemsTable } from "@/components/finances/budgets/details/budget-items-table"
import { BudgetAllocationsSection } from "@/components/finances/budgets/details/budget-allocations-section"
import { BudgetActivityTimeline } from "@/components/finances/budgets/details/budget-activity-timeline"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { useGetBudgetByIdQuery } from "@/redux/features/finance/budgets"
import { BudgetAnalyticsDashboard } from "@/components/finances/budgets/details/budget-analytics-dashboard"
import { useParams, useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { BudgetInsights } from "@/components/finances/budgets/details/analytics"
import { BudgetFundingSection } from "@/components/finances/budgets/details/budget-funding"


export default function BudgetDetailPage() {
  const params = useParams()
  const router = useRouter()

  const budgetId = params.budgetId as string

  const {
    data: budget,
    isLoading: loading,
    refetch,
    error,
  } = useGetBudgetByIdQuery(Number(budgetId), {
    skip: !budgetId,
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error || !budget) {
    const errorMessage = error && "error" in error ? error.error : "The budget you are looking for does not exist"
    return (
      <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Budget Not Found</h2>
          <p className="text-gray-600 mt-2">{errorMessage}</p>
        </div>
        <Button onClick={() => router.push("/dashboard/finance/budgets")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Budgets
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Navigation */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={() => router.push("/dashboard/finance/budgets")}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Budgets
        </Button>
      </div>

      {/* Header */}
      <BudgetDetailHeader budget={budget} onEdit={()=>refetch()} />

      {/* Main Content */}
      <Tabs defaultValue="items" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4"> 
        {/* 
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
           */}
           <TabsTrigger value="items">Items ({budget.items_count || 0})</TabsTrigger>
          <TabsTrigger value="funding">Funding</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="insight">Insight</TabsTrigger>
        </TabsList>
          {/* Overview Tab         
            <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <BudgetFundingBreakdown budget={budget} />
          </div>
        </TabsContent>
          */}

        {/* Funding Section with Nested Tabs */}
        <TabsContent value="funding" className="space-y-6">
          <Tabs defaultValue="breakdown">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="breakdown">Breakdown</TabsTrigger>
              <TabsTrigger value="funding-source">
                Sources ({budget.funding_sources_count || 0})
              </TabsTrigger>
              <TabsTrigger value="allocations">
                Allocations ({budget.allocations_count || 0})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="breakdown" className="pt-4">
              <BudgetFundingBreakdown budget={budget} />
            </TabsContent>
            
            <TabsContent value="funding-source" className="pt-4">
              <BudgetFundingSection 
                budget={budget} 
                onAddFunding={refetch} 
              />
            </TabsContent>
            
            <TabsContent value="allocations" className="pt-4">
              <BudgetAllocationsSection 
                budget={budget} 
                onAddAllocation={() => refetch()} 
              />
            </TabsContent>
          </Tabs>
        </TabsContent>

        <TabsContent value="items">
          <BudgetItemsTable budget={budget} onAddItem={refetch} />
        </TabsContent>

        <TabsContent value="activity">
          <BudgetActivityTimeline budget={budget} />
        </TabsContent>
        
        <TabsContent value="analytics">
          <BudgetAnalyticsDashboard budget={budget} />
        </TabsContent>
        
        <TabsContent value="insight">
          <BudgetInsights  budget={budget} isLoading={loading} />
        </TabsContent>
      </Tabs>
    </div>
  )
}