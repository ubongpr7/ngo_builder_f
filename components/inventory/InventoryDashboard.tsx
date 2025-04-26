"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText } from "lucide-react"
import InventoryStats from "./InventoryStats"
import AssetsByCategory from "./AssetsByCategory"
import AssetsByStatus from "./AssetsByStatus"
import RecentActivity from "./RecentActivity"
import UpcomingMaintenance from "./UpcomingMaintenance"
import ExpiringWarranties from "./ExpiringWarranties"

export default function InventoryDashboard() {
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Inventory Dashboard</h1>
          <p className="text-gray-500">Overview of your organization's assets and inventory</p>
        </div>
        <div className="mt-4 md:mt-0 flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <a href="#" className="flex items-center">
              <FileText className="mr-2 h-4 w-4" />
              Generate Report
            </a>
          </Button>
          <Button asChild>
            <a href="/membership/dashboard/inventory/assets/new" className="bg-green-600 hover:bg-green-700">
              Add New Asset
            </a>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="assets">Assets</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
          <TabsTrigger value="locations">Locations</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <InventoryStats />
          </div>

          <div className="grid gap-6 mt-6 md:grid-cols-2 lg:grid-cols-3">
            <Card className="col-span-1 lg:col-span-2">
              <CardHeader>
                <CardTitle>Assets by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <AssetsByCategory />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Assets by Status</CardTitle>
              </CardHeader>
              <CardContent>
                <AssetsByStatus />
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 mt-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <RecentActivity />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Upcoming Maintenance</CardTitle>
              </CardHeader>
              <CardContent>
                <UpcomingMaintenance />
              </CardContent>
            </Card>
          </div>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Expiring Warranties</CardTitle>
            </CardHeader>
            <CardContent>
              <ExpiringWarranties />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assets" className="mt-6">
          <p className="text-center text-gray-500 py-12">
            Please use the Assets Management page to view and manage all assets.
          </p>
        </TabsContent>

        <TabsContent value="maintenance" className="mt-6">
          <p className="text-center text-gray-500 py-12">
            Please use the Maintenance Management page to view and manage maintenance schedules.
          </p>
        </TabsContent>

        <TabsContent value="financial" className="mt-6">
          <p className="text-center text-gray-500 py-12">
            Please use the Financial Management page to view financial details and reports.
          </p>
        </TabsContent>

        <TabsContent value="locations" className="mt-6">
          <p className="text-center text-gray-500 py-12">
            Please use the Location Management page to view and manage asset locations.
          </p>
        </TabsContent>

        <TabsContent value="reports" className="mt-6">
          <p className="text-center text-gray-500 py-12">Please use the Reports page to generate and view reports.</p>
        </TabsContent>
      </Tabs>
    </div>
  )
}
