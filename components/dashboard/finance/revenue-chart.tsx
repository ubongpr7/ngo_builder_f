"use client"

import { useEffect, useRef } from "react"
import { Chart, registerables } from "chart.js"
import { ChartContainer } from "../chart-container"
import { formatCurrencyCompact } from "@/utils/chart-helpers"

// Register Chart.js components
Chart.register(...registerables)

interface RevenueChartProps {
  donationStats: any
  grantStats: any
  isLoading?: boolean
  onRefresh?: () => void
}

export function RevenueChart({ donationStats, grantStats, isLoading = false, onRefresh }: RevenueChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartInstance = useRef<Chart | null>(null)

  useEffect(() => {
    if (!chartRef.current || isLoading) return

    // Destroy previous chart instance if it exists
    if (chartInstance.current) {
      chartInstance.current.destroy()
    }

    // Prepare combined revenue data
    const monthlyDonations = donationStats?.monthly_trend || []
    const monthlyGrants = grantStats?.monthly_trend || []

    // Create a combined dataset for the last 6 months
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"]
    const donationData = months.map((month, index) => {
      const found = monthlyDonations.find((item: any) => item.month?.includes(month))
      return Number(found?.total_amount || 0)
    })
    const grantData = months.map((month, index) => {
      const found = monthlyGrants.find((item: any) => item.month?.includes(month))
      return Number(found?.total_amount || 0)
    })

    // Create new chart
    const ctx = chartRef.current.getContext("2d")
    if (ctx) {
      chartInstance.current = new Chart(ctx, {
        type: "bar",
        data: {
          labels: months,
          datasets: [
            {
              label: "Donations",
              data: donationData,
              backgroundColor: "#10b981",
              borderColor: "#10b981",
              borderWidth: 1,
            },
            {
              label: "Grants",
              data: grantData,
              backgroundColor: "#3b82f6",
              borderColor: "#3b82f6",
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: "top",
            },
            tooltip: {
              callbacks: {
                label: (context) => {
                  const value = context.raw as number
                  return `${context.dataset.label}: $${formatCurrencyCompact(value)}`
                },
              },
            },
          },
          scales: {
            x: {
              grid: {
                display: false,
              },
            },
            y: {
              beginAtZero: true,
              stacked: true,
              ticks: {
                callback: (value) => `$${formatCurrencyCompact(Number(value))}`,
              },
              grid: {
                borderDash: [2, 4],
              },
            },
          },
        },
      })
    }

    // Cleanup function
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy()
      }
    }
  }, [donationStats, grantStats, isLoading])

  // Calculate total revenue growth
  const totalDonations = Number(donationStats?.total_amount || 0)
  const totalGrants = Number(grantStats?.total_amount || 0)
  const totalRevenue = totalDonations + totalGrants

  return (
    <ChartContainer
      title="Revenue Overview"
      description="Monthly donations and grants"
      isLoading={isLoading}
      trend={{
        value: totalRevenue,
        isPositive: true,
        label: "total revenue",
      }}
      onRefresh={onRefresh}
    >
      <div className="h-[400px] relative">
        <canvas ref={chartRef} />
      </div>
    </ChartContainer>
  )
}
