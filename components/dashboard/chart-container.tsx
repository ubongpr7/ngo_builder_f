"use client"

import type React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowUpRight, ArrowDownRight, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ChartContainerProps {
  title: string
  description?: string
  isLoading?: boolean
  trend?: {
    value: number
    isPositive: boolean
    label: string
  }
  className?: string
  onRefresh?: () => void
  children: React.ReactNode
}

export function ChartContainer({
  title,
  description,
  isLoading = false,
  trend,
  className = "",
  onRefresh,
  children,
}: ChartContainerProps) {
  return (
    <Card className={`overflow-hidden ${className}`}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-base font-medium">{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </div>

        <div className="flex items-center space-x-2">
          {trend && (
            <div
              className={`flex items-center text-xs font-medium ${
                trend.isPositive ? "text-green-600" : "text-red-600"
              }`}
            >
              {trend.isPositive ? (
                <ArrowUpRight className="mr-1 h-3 w-3" />
              ) : (
                <ArrowDownRight className="mr-1 h-3 w-3" />
              )}
              {trend.value.toFixed(1)}% {trend.label}
            </div>
          )}

          {onRefresh && (
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onRefresh} title="Refresh data">
              <RefreshCw className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-[200px] w-full" />
          </div>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  )
}
