import type { Metadata } from "next"
import DashboardSidebar from "@/components/dashboard/DashboardSidebar"
import DashboardOverview from "@/components/dashboard/DashboardOverview"
import MobileMenuButton from "@/components/dashboard/MobileMenuButton" 

export const metadata: Metadata = {
  title: "Member Dashboard | Destiny Builders",
  description: "Access your membership resources and information",
}

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <DashboardSidebar />
      <div className="flex-1 p-4 md:p-8">
        <MobileMenuButton />
        <DashboardOverview />
      </div>
    </div>
  )
}