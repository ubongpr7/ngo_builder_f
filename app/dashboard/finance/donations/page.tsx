"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, DollarSign, Loader2 } from "lucide-react"
import { useGetAllDonationsQuery } from "@/redux/features/finance/financeApiSlice"
import { DonationCard } from "@/components/finance/donation-card"
import { AddEditDonationDialog } from "@/components/finance/add-edit-donation-dialog"
import { usePermissions } from "@/components/permissionHander"
import { useGetLoggedInProfileRolesQuery } from "@/redux/features/profile/readProfileAPISlice"
import { DonationChart } from "@/components/dashboard/finance/donation-chart"

export default function DonationsManagement() {
  const { data: donations = [], isLoading, isError, refetch } = useGetAllDonationsQuery()
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [filteredDonations, setFilteredDonations] = useState<any[]>([])
  const { data: userRoles } = useGetLoggedInProfileRolesQuery()
  const is_DB_admin = usePermissions(userRoles, { requiredRoles: ["is_DB_admin"], requireKYC: true })
  const is_finance_admin = usePermissions(userRoles, { requiredRoles: ["is_finance_admin"], requireKYC: true })
  const canManageDonations = is_DB_admin || is_finance_admin

  // Statistics for the donation chart
  const donationStats = {
    monthly_totals: donations?.reduce((acc: Record<string, number>, donation: any) => {
      const date = new Date(donation.date)
      const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
      acc[monthYear] = (acc[monthYear] || 0) + Number(donation.amount)
      return acc
    }, {}),
    total_amount: donations?.reduce((sum: number, donation: any) => sum + Number(donation.amount), 0),
    donor_count: new Set(donations?.map((d: any) => d.donor)).size,
    average_donation: donations?.length
      ? donations.reduce((sum: number, donation: any) => sum + Number(donation.amount), 0) / donations.length
      : 0,
  }

  useEffect(() => {
    if (!donations) return

    const filtered = donations.filter((donation: any) => {
      const matchesSearch =
        donation.donor_details?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        donation.campaign_details?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        donation.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        false

      if (activeTab === "all") return matchesSearch

      // Map API status values to UI tabs
      const statusMap: Record<string, string> = {
        pending: "pending",
        completed: "completed",
        recurring: "recurring",
        cancelled: "cancelled",
      }

      return matchesSearch && statusMap[donation.status.toLowerCase()] === activeTab.toLowerCase()
    })

    setFilteredDonations(filtered)
  }, [donations, searchTerm, activeTab])

  // Refetch data when component mounts
  useEffect(() => {
    refetch()
  }, [refetch])

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Donation Management</h1>
          <p className="text-gray-500">Manage and track organizational donations</p>
        </div>
        {canManageDonations && (
          <div className="mt-4 md:mt-0">
            <AddEditDonationDialog />
          </div>
        )}
      </div>

      {/* Donation Statistics */}
      <div className="mb-6">
        <DonationChart donationStats={donationStats} isLoading={isLoading} onRefresh={() => refetch()} />
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search donations..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Tabs defaultValue="all" className="w-full md:w-auto" onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="recurring">Recurring</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
          <span className="ml-2 text-gray-500">Loading donations...</span>
        </div>
      ) : isError ? (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 flex items-center justify-center rounded-full bg-red-100">
            <DollarSign className="h-12 w-12 text-red-400" />
          </div>
          <h3 className="mt-4 text-lg font-medium">Error loading donations</h3>
          <p className="mt-2 text-gray-500">There was an error loading the donations. Please try again.</p>
          <Button onClick={() => refetch()} className="mt-4">
            Retry
          </Button>
        </div>
      ) : filteredDonations?.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDonations?.map((donation) => (
            <DonationCard key={donation.id} donation={donation} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 flex items-center justify-center rounded-full bg-gray-100">
            <DollarSign className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="mt-4 text-lg font-medium">No donations found</h3>
          <p className="mt-2 text-gray-500">Try adjusting your search or filter criteria</p>
        </div>
      )}
    </div>
  )
}
