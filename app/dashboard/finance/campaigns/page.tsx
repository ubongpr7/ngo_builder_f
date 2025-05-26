import { Suspense } from "react"
import { CampaignListView } from "@/components/finances/campaign/campaign-list-view"
import { DashboardSkeleton } from "@/components/finances/dashboard/dashboard-skeleton"

export default function CampaignsPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <Suspense fallback={<DashboardSkeleton />}>
          <CampaignListView />
        </Suspense>
      </div>
    </div>
  )
}
