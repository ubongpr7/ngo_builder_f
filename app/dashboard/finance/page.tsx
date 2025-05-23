"use client"

import { Badge } from "@/components/ui/badge"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { DashboardCard } from "@/components/ui/dashboard-card"
import { RefreshCw, DollarSign, Target, Receipt, PieChart, Loader2 } from "lucide-react"
import Link from "next/link"
import { useGetFinanceStatisticsQuery } from "@/redux/features/finance/financeApiSlice"
import { useGetLoggedInProfileRolesQuery } from "@/redux/features/profile/readProfileAPISlice"
import { usePermissions } from "@/components/permissionHander"
import { FinanceDashboard } from "@/components/dashboard/finance/finance-dashboard"

export default function FinanceManagement() {
  const {
    data: financeStats,
    isLoading: statsLoading,
    refetch: refreshStats,
    isFetching: isRefreshingStats,
  } = useGetFinanceStatisticsQuery('')

  const { data: userRoles } = useGetLoggedInProfileRolesQuery()
  const is_DB_admin = usePermissions(userRoles, { requiredRoles: ["is_DB_admin"], requireKYC: true })
  const is_finance_admin = usePermissions(userRoles, { requiredRoles: ["is_DB_executive"], requireKYC: true })
  const canManageFinance = is_DB_admin || is_finance_admin

  const [isRefreshing, setIsRefreshing] = useState(false)

  // Function to refresh all data
  const refreshAllData = async () => {
    setIsRefreshing(true)
    await refreshStats()
    setIsRefreshing(false)
  }

  // Set up auto-refresh for real-time data
  useEffect(() => {
    // Refresh data every 60 seconds
    const interval = setInterval(() => {
      refreshAllData()
    }, 60000)

    return () => clearInterval(interval)
  }, [])

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  // Check if any data is currently being refreshed
  const isAnyDataRefreshing = isRefreshing || isRefreshingStats

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Finance Management</h1>
          <p className="text-gray-500">Manage and track organizational finances</p>
        </div>
        <div className="mt-4 md:mt-0">
          <Button
            variant="outline"
            size="sm"
            onClick={refreshAllData}
            disabled={isAnyDataRefreshing}
            className="transition-all duration-200 hover:bg-gray-100"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isAnyDataRefreshing ? "animate-spin" : ""}`} />
            {isAnyDataRefreshing ? "Refreshing..." : "Refresh Data"}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {/* Donations Card */}
        <DashboardCard
          title="Donations"
          value={statsLoading ? "—" : formatCurrency(financeStats?.donation_stats?.total_amount || 0)}
          description={`${financeStats?.donation_stats?.donor_count || 0} donors`}
          icon={<DollarSign className="h-4 w-4 text-green-600" />}
          trend={{
            value: financeStats?.donation_stats?.growth_rate || 0,
            isPositive: (financeStats?.donation_stats?.growth_rate || 0) >= 0,
            label: "vs. last month",
          }}
          isLoading={statsLoading || isRefreshingStats}
        />

        {/* Campaigns Card */}
        <DashboardCard
          title="Campaigns"
          value={statsLoading ? "—" : financeStats?.campaign_stats?.active_count?.toString() || "0"}
          description={`${formatCurrency(financeStats?.campaign_stats?.total_raised || 0)} raised`}
          icon={<Target className="h-4 w-4 text-purple-600" />}
          trend={{
            value: financeStats?.campaign_stats?.success_rate || 0,
            isPositive: true,
            label: "success rate",
          }}
          isLoading={statsLoading || isRefreshingStats}
        />

        {/* Expenses Card */}
        <DashboardCard
          title="Expenses"
          value={statsLoading ? "—" : formatCurrency(financeStats?.expense_stats?.total_amount || 0)}
          description={`${formatCurrency(financeStats?.expense_stats?.pending_amount || 0)} pending`}
          icon={<Receipt className="h-4 w-4 text-red-600" />}
          trend={{
            value: financeStats?.expense_stats?.approval_rate || 0,
            isPositive: (financeStats?.expense_stats?.approval_rate || 0) >= 80,
            label: "approval rate",
          }}
          isLoading={statsLoading || isRefreshingStats}
        />

        {/* Budget Card */}
        <DashboardCard
          title="Budget"
          value={statsLoading ? "—" : formatCurrency(financeStats?.budget_stats?.total_budget || 0)}
          description={`${formatCurrency(financeStats?.budget_stats?.total_remaining || 0)} remaining`}
          icon={<PieChart className="h-4 w-4 text-blue-600" />}
          trend={{
            value: financeStats?.budget_stats?.utilization_rate || 0,
            isPositive: (financeStats?.budget_stats?.utilization_rate || 0) <= 90,
            label: "utilization",
          }}
          isLoading={statsLoading || isRefreshingStats}
        />
      </div>

      {/* Finance Dashboard */}
      <FinanceDashboard
        financeStats={financeStats}
        isLoading={statsLoading}
        isRefreshing={isRefreshingStats}
        onRefresh={refreshAllData}
      />

      {/* Recent Transactions */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Donations */}
        <Card className="overflow-hidden hover:shadow-md transition-all duration-300">
          <CardContent className="p-0">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 flex justify-between items-center">
              <h2 className="text-lg font-semibold">Recent Donations</h2>
              <Link href="/dashboard/finance/donations" className="text-sm text-green-600 hover:underline">
                View All
              </Link>
            </div>

            {statsLoading ? (
              <div className="flex justify-center items-center p-8">
                <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
              </div>
            ) : financeStats?.recent_donations?.length > 0 ? (
              <div className="divide-y">
                {financeStats.recent_donations.slice(0, 5).map((donation: any) => (
                  <div key={donation.id} className="p-4 hover:bg-gray-50">
                    <div className="flex justify-between">
                      <div>
                        <p className="font-medium">
                          {donation.is_anonymous ? "Anonymous Donor" : donation.donor_details?.name || "Unknown"}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(donation.date).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                      <p className="font-semibold text-green-600">{formatCurrency(donation.amount)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500">No recent donations found</div>
            )}
          </CardContent>
        </Card>

        {/* Recent Expenses */}
        <Card className="overflow-hidden hover:shadow-md transition-all duration-300">
          <CardContent className="p-0">
            <div className="bg-gradient-to-r from-red-50 to-orange-50 p-4 flex justify-between items-center">
              <h2 className="text-lg font-semibold">Recent Expenses</h2>
              <Link href="/dashboard/finance/expenses" className="text-sm text-red-600 hover:underline">
                View All
              </Link>
            </div>

            {statsLoading ? (
              <div className="flex justify-center items-center p-8">
                <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
              </div>
            ) : financeStats?.recent_expenses?.length > 0 ? (
              <div className="divide-y">
                {financeStats.recent_expenses.slice(0, 5).map((expense: any) => (
                  <div key={expense.id} className="p-4 hover:bg-gray-50">
                    <div className="flex justify-between">
                      <div>
                        <p className="font-medium">{expense.description || "Expense"}</p>
                        <div className="flex items-center gap-2">
                          <p className="text-sm text-gray-500">
                            {new Date(expense.date).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </p>
                          <Badge
                            className={
                              expense.status === "approved"
                                ? "bg-green-100 text-green-800"
                                : expense.status === "pending"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                            }
                          >
                            {expense.status.charAt(0).toUpperCase() + expense.status.slice(1)}
                          </Badge>
                        </div>
                      </div>
                      <p className="font-semibold text-red-600">{formatCurrency(expense.amount)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500">No recent expenses found</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
