"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Target, Loader2 } from "lucide-react"
import { useGetAllCampaignsQuery } from "@/redux/features/finance/financeApiSlice"
import { CampaignCard } from "@/components/finance/campaign-card"
import { AddEditCampaignDialog } from "@/components/finance/add-edit-campaign-dialog"
import { usePermissions } from "@/components/permissionHander"
import { useGetLoggedInProfileRolesQuery } from "@/redux/features/profile/readProfileAPISlice"
import { CampaignChart } from "@/components/dashboard/finance/campaign-chart"

export default function CampaignsManagement() {
  const { data: campaigns = [], isLoading, isError, refetch } = useGetAllCampaignsQuery()
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [filteredCampaigns, setFilteredCampaigns] = useState<any[]>([])
  const { data: userRoles } = useGetLoggedInProfileRolesQuery()
  const is_DB_admin = usePermissions(userRoles, { requiredRoles: ["is_DB_admin"], requireKYC: true })
  const is_finance_admin = usePermissions(userRoles, { requiredRoles: ["is_finance_admin"], requireKYC: true })
  const canManageCampaigns = is_DB_admin || is_finance_admin

  // Calculate campaign statistics
  const campaignStats = {
    active_count: campaigns?.filter((c: any) => c.status === "active").length || 0,
    completed_count: campaigns?.filter((c: any) => c.status === "completed").length || 0,
    total_goal: campaigns?.reduce((sum: number, c: any) => sum + Number(c.goal_amount), 0) || 0,
    total_raised: campaigns?.reduce((sum: number, c: any) => sum + Number(c.amount_raised), 0) || 0,
    success_rate: campaigns?.length
      ? (campaigns.filter((c: any) => Number(c.amount_raised) >= Number(c.goal_amount)).length / campaigns.length) * 100
      : 0,
    campaign_progress: campaigns?.map((c: any) => ({
      name: c.name,
      goal: Number(c.goal_amount),
      raised: Number(c.amount_raised),
      progress: c.goal_amount > 0 ? (c.amount_raised / c.goal_amount) * 100 : 0,
    })),
  }

  useEffect(() => {
    if (!campaigns) return

    const filtered = campaigns.filter((campaign: any) => {
      const matchesSearch =
        campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        campaign.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        false

      if (activeTab === "all") return matchesSearch

      return matchesSearch && campaign.status.toLowerCase() === activeTab.toLowerCase()
    })

    setFilteredCampaigns(filtered)
  }, [campaigns, searchTerm, activeTab])

  // Refetch data when component mounts
  useEffect(() => {
    refetch()
  }, [refetch])

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Campaign Management</h1>
          <p className="text-gray-500">Manage and track fundraising campaigns</p>
        </div>
        {canManageCampaigns && (
          <div className="mt-4 md:mt-0">
            <AddEditCampaignDialog />
          </div>
        )}
      </div>

      {/* Campaign Statistics */}
      <div className="mb-6">
        <CampaignChart campaignStats={campaignStats} isLoading={isLoading} onRefresh={() => refetch()} />
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search campaigns..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Tabs defaultValue="all" className="w-full md:w-auto" onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="planned">Planned</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
          <span className="ml-2 text-gray-500">Loading campaigns...</span>
        </div>
      ) : isError ? (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 flex items-center justify-center rounded-full bg-red-100">
            <Target className="h-12 w-12 text-red-400" />
          </div>
          <h3 className="mt-4 text-lg font-medium">Error loading campaigns</h3>
          <p className="mt-2 text-gray-500">There was an error loading the campaigns. Please try again.</p>
          <Button onClick={() => refetch()} className="mt-4">
            Retry
          </Button>
        </div>
      ) : filteredCampaigns?.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCampaigns?.map((campaign) => (
            <CampaignCard key={campaign.id} campaign={campaign} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 flex items-center justify-center rounded-full bg-gray-100">
            <Target className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="mt-4 text-lg font-medium">No campaigns found</h3>
          <p className="mt-2 text-gray-500">Try adjusting your search or filter criteria</p>
        </div>
      )}
    </div>
  )
}
