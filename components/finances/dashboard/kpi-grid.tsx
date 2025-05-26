"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Target,
  PiggyBank,
  CreditCard,
  AlertTriangle,
  CheckCircle,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface KPIData {
  total_donations: string
  total_grants: string
  total_expenses: string
  total_budget_allocated: string
  total_account_balance: string
  active_campaigns_count: number
  active_grants_count: number
  pending_expenses_count: number
}

interface KPIGridProps {
  data?: KPIData
  isLoading: boolean
}

export function KPIGrid({ data, isLoading }: KPIGridProps) {
  const kpis = [
    {
      title: "Total Donations",
      value: data?.total_donations || "0",
      icon: DollarSign,
      trend: "+12.5%",
      trendDirection: "up" as const,
      description: "vs last month",
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-900/20",
    },
    {
      title: "Active Campaigns",
      value: data?.active_campaigns_count?.toString() || "0",
      icon: Target,
      trend: "+3",
      trendDirection: "up" as const,
      description: "new this month",
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
    },
    {
      title: "Grant Funding",
      value: data?.total_grants || "0",
      icon: PiggyBank,
      trend: "+8.2%",
      trendDirection: "up" as const,
      description: "vs last quarter",
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-900/20",
    },
    {
      title: "Total Expenses",
      value: data?.total_expenses || "0",
      icon: CreditCard,
      trend: "-2.1%",
      trendDirection: "down" as const,
      description: "vs last month",
      color: "text-orange-600",
      bgColor: "bg-orange-50 dark:bg-orange-900/20",
    },
    {
      title: "Account Balance",
      value: data?.total_account_balance || "0",
      icon: DollarSign,
      trend: "+5.7%",
      trendDirection: "up" as const,
      description: "vs last month",
      color: "text-emerald-600",
      bgColor: "bg-emerald-50 dark:bg-emerald-900/20",
    },
    {
      title: "Budget Allocated",
      value: data?.total_budget_allocated || "0",
      icon: Target,
      trend: "78%",
      trendDirection: "neutral" as const,
      description: "utilization rate",
      color: "text-indigo-600",
      bgColor: "bg-indigo-50 dark:bg-indigo-900/20",
    },
    {
      title: "Active Grants",
      value: data?.active_grants_count?.toString() || "0",
      icon: CheckCircle,
      trend: "+2",
      trendDirection: "up" as const,
      description: "approved this month",
      color: "text-teal-600",
      bgColor: "bg-teal-50 dark:bg-teal-900/20",
    },
    {
      title: "Pending Expenses",
      value: data?.pending_expenses_count?.toString() || "0",
      icon: AlertTriangle,
      trend: "-5",
      trendDirection: "down" as const,
      description: "awaiting approval",
      color: "text-red-600",
      bgColor: "bg-red-50 dark:bg-red-900/20",
    },
  ]

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4 rounded" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-20 mb-2" />
              <Skeleton className="h-3 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((kpi, index) => {
        const Icon = kpi.icon
        const TrendIcon = kpi.trendDirection === "up" ? TrendingUp : kpi.trendDirection === "down" ? TrendingDown : null

        return (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">{kpi.title}</CardTitle>
              <div className={cn("p-2 rounded-lg", kpi.bgColor)}>
                <Icon className={cn("h-4 w-4", kpi.color)} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{kpi.value}</div>
              <div className="flex items-center text-xs text-gray-600 dark:text-gray-400">
                {TrendIcon && (
                  <TrendIcon
                    className={cn("h-3 w-3 mr-1", kpi.trendDirection === "up" ? "text-green-600" : "text-red-600")}
                  />
                )}
                <span
                  className={cn(
                    "font-medium mr-1",
                    kpi.trendDirection === "up"
                      ? "text-green-600"
                      : kpi.trendDirection === "down"
                        ? "text-red-600"
                        : "text-gray-600",
                  )}
                >
                  {kpi.trend}
                </span>
                <span>{kpi.description}</span>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
