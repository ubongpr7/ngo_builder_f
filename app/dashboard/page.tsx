"use client"

import { useGetLoggedInProfileRolesQuery } from "@/redux/features/profile/readProfileAPISlice"
import { ProjectDashboard } from "@/components/dashboard/project-dashboard"
import { FinanceDashboard } from "@/components/finances/dashboard/finance-dashboard"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, DollarSign, BarChart3, Settings } from "lucide-react"

export default function DashboardPage() {
  const { data: userRoles } = useGetLoggedInProfileRolesQuery()

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-4 mb-6">
          <TabsTrigger value="overview" className="flex items-center justify-center">
            <BarChart3 className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="projects" className="flex items-center justify-center">
            <FileText className="h-4 w-4 mr-2" />
            Projects
          </TabsTrigger>
          <TabsTrigger value="finance" className="flex items-center justify-center">
            <DollarSign className="h-4 w-4 mr-2" />
            Finance
          </TabsTrigger>
          {/*  Add Settings tab
          <TabsTrigger value="settings" className="flex items-center justify-center">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </TabsTrigger>
           */}
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <ProjectDashboard userRoles={userRoles} />
          <FinanceDashboard userRoles={userRoles} />
        </TabsContent>

        <TabsContent value="projects">
          <ProjectDashboard userRoles={userRoles} />
        </TabsContent>

        <TabsContent value="finance">
          <FinanceDashboard userRoles={userRoles} />
        </TabsContent>

        <TabsContent value="settings">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4">Dashboard Settings</h2>
            <p className="text-gray-600">Configure your dashboard preferences here.</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
