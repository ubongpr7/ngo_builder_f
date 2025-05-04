"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, ChevronDown, ChevronUp } from "lucide-react"
import InventoryStats from "./InventoryStats"
import AssetsByCategory from "./AssetsByCategory"
import AssetsByStatus from "./AssetsByStatus"
import RecentActivity from "./RecentActivity"
import UpcomingMaintenance from "./UpcomingMaintenance"
import ExpiringWarranties from "./ExpiringWarranties"

export default function InventoryDashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const [showMobileTabs, setShowMobileTabs] = useState(false)

  return (
    <div className="space-y-4 md:space-y-6 px-2 md:px-0">
      {/* Header Section */}
      <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-center">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight">Inventory Dashboard</h1>
          <p className="text-sm md:text-base text-gray-500">Overview of your organization's assets and inventory</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button asChild variant="outline" className="border-green-600 hover:bg-green-700 hover:text-white text-xs md:text-sm">
            <a href="#" className="flex items-center">
              <FileText className="mr-2 h-3 w-3 md:h-4 md:w-4" />
              Generate Report
            </a>
          </Button>
          <Button asChild className="text-xs md:text-sm">
            <a href="/membership/dashboard/inventory/assets/new" className="bg-green-600 hover:bg-green-700 text-white hover:text-white">
              Add New Asset
            </a>
          </Button>
        </div>
      </div>

      {/* Mobile Tabs Dropdown */}
      <div className="md:hidden">
        <Button
          variant="outline"
          className="w-full justify-between"
          onClick={() => setShowMobileTabs(!showMobileTabs)}
        >
          {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
          {showMobileTabs ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
        {showMobileTabs && (
          <div className="mt-2 border rounded-lg shadow-lg">
            <TabsList className="grid grid-cols-1 w-full">
              <TabsTrigger value="overview" onClick={() => { setActiveTab("overview"); setShowMobileTabs(false); }}>Overview</TabsTrigger>
              <TabsTrigger value="assets" onClick={() => { setActiveTab("assets"); setShowMobileTabs(false); }}>Assets</TabsTrigger>
              <TabsTrigger value="maintenance" onClick={() => { setActiveTab("maintenance"); setShowMobileTabs(false); }}>Maintenance</TabsTrigger>
              <TabsTrigger value="financial" onClick={() => { setActiveTab("financial"); setShowMobileTabs(false); }}>Financial</TabsTrigger>
              <TabsTrigger value="locations" onClick={() => { setActiveTab("locations"); setShowMobileTabs(false); }}>Locations</TabsTrigger>
              <TabsTrigger value="reports" onClick={() => { setActiveTab("reports"); setShowMobileTabs(false); }}>Reports</TabsTrigger>
            </TabsList>
          </div>
        )}
      </div>

      {/* Main Tabs Component */}
      <Tabs 
        value={activeTab} 
        onValueChange={setActiveTab}
        className="w-full"
      >
        {/* Desktop Tabs */}
        <TabsList className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="assets">Assets</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
          <TabsTrigger value="locations">Locations</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        {/* Tab Contents */}
        <TabsContent value="overview" className="mt-0 md:mt-6">
          <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            <InventoryStats />
          </div>

          <div className="grid gap-4 md:gap-6 mt-4 md:mt-6 grid-cols-1 lg:grid-cols-3">
            <Card className="col-span-1 lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg md:text-xl">Assets by Category</CardTitle>
              </CardHeader>
              <CardContent className="p-2 md:p-6">
                <AssetsByCategory />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg md:text-xl">Assets by Status</CardTitle>
              </CardHeader>
              <CardContent className="p-2 md:p-6">
                <AssetsByStatus />
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:gap-6 mt-4 md:mt-6 grid-cols-1 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg md:text-xl">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent className="p-2 md:p-6">
                <RecentActivity />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg md:text-xl">Upcoming Maintenance</CardTitle>
              </CardHeader>
              <CardContent className="p-2 md:p-6">
                <UpcomingMaintenance />
              </CardContent>
            </Card>
          </div>

          <Card className="mt-4 md:mt-6">
            <CardHeader>
              <CardTitle className="text-lg md:text-xl">Expiring Warranties</CardTitle>
            </CardHeader>
            <CardContent className="p-2 md:p-6">
              <ExpiringWarranties />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assets" className="mt-0 md:mt-6">
          <p className="text-center text-sm md:text-base text-gray-500 py-6 md:py-12">
            Please use the Assets Management page to view and manage all assets.
          </p>
        </TabsContent>

        <TabsContent value="maintenance" className="mt-0 md:mt-6">
          <p className="text-center text-sm md:text-base text-gray-500 py-6 md:py-12">
            Please use the Maintenance Management page to view and manage maintenance schedules.
          </p>
        </TabsContent>

        <TabsContent value="financial" className="mt-0 md:mt-6">
          <p className="text-center text-sm md:text-base text-gray-500 py-6 md:py-12">
            Please use the Financial Management page to view financial details and reports.
          </p>
        </TabsContent>

        <TabsContent value="locations" className="mt-0 md:mt-6">
          <p className="text-center text-sm md:text-base text-gray-500 py-6 md:py-12">
            Please use the Location Management page to view and manage asset locations.
          </p>
        </TabsContent>

        <TabsContent value="reports" className="mt-0 md:mt-6">
          <p className="text-center text-sm md:text-base text-gray-500 py-6 md:py-12">
            Please use the Reports page to generate and view reports.
          </p>
        </TabsContent>
      </Tabs>
    </div>
  )
}