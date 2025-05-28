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

export default function BudgetDetailPage() {
  const params = useParams()
  const router = useRouter()

  const budgetId = params.budgetId as string

  const {
    data: budget,
    isLoading: loading,
    error,
  } = useGetBudgetByIdQuery(budgetId, {
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
      <BudgetDetailHeader budget={budget} />

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="funding">Funding</TabsTrigger>
          <TabsTrigger value="items">Items ({budget.items_count || 0})</TabsTrigger>
          <TabsTrigger value="allocations">Allocations ({budget.allocations_count || 0})</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <BudgetFundingBreakdown budget={budget} />
            <BudgetActivityTimeline budget={budget} />
          </div>
        </TabsContent>

        <TabsContent value="funding">
          <BudgetFundingBreakdown budget={budget} />
        </TabsContent>

        <TabsContent value="items">
          <BudgetItemsTable budget={budget} />
        </TabsContent>

        <TabsContent value="allocations">
          <BudgetAllocationsSection budget={budget} />
        </TabsContent>

        <TabsContent value="activity">
          <BudgetActivityTimeline budget={budget} />
        </TabsContent>
        <TabsContent value="analytics">
          <BudgetAnalyticsDashboard budget={budget} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
