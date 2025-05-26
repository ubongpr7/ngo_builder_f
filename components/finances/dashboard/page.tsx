import { Suspense } from "react"
import { FinanceDashboard } from "@/components/dashboard/finance-dashboard"
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton"

export default function FinanceDashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Suspense fallback={<DashboardSkeleton />}>
        <FinanceDashboard />
      </Suspense>
    </div>
  )
}
