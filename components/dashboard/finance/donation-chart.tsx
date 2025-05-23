"use client"

import { useEffect, useRef } from "react"
import { Chart, registerables } from "chart.js"
import { ChartContainer } from "../chart-container"
import { formatCurrencyCompact } from "@/utils/chart-helpers"

Chart.register(...registerables)

interface DonationChartProps {
  donationStats: any
  isLoading?: boolean
  onRefresh?: () => void
}

export function DonationChart({ donationStats, isLoading = false, onRefresh }: DonationChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartInstance = useRef<Chart | null>(null)

  useEffect(() => {
    if (!chartRef.current || isLoading) return

    // Destroy previous chart instance if it exists
    if (chartInstance.current) {
      chartInstance.current.destroy()
    }

    // Prepare data for monthly donations trend
    const monthlyData = donationStats?.monthly_trend || []
    const labels = monthlyData.map((item: any) => item.month || "Unknown")
    const data = monthlyData.map((item: any) => Number(item.total_amount) || 0)

    // Create new chart
    const ctx = chartRef.current.getContext("2d")
    if (ctx) {
      chartInstance.current = new Chart(ctx, {
        type: "line",
        data: {
          labels,
          datasets: [
            {
              label: "Monthly Donations",
              data,
              borderColor: "#10b981",
              backgroundColor: "#10b98120",
              borderWidth: 2,
              fill: true,
              tension: 0.4,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false,
            },
            tooltip: {
              callbacks: {
                label: (context) => {
                  const value = context.raw as number
                  return `$${formatCurrencyCompact(value)}`
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
  }, [donationStats, isLoading])

  // Calculate growth rate
  const monthlyTrend = donationStats?.monthly_trend || []
  const currentMonth = monthlyTrend[monthlyTrend.length - 1]?.total_amount || 0
  const previousMonth = monthlyTrend[monthlyTrend.length - 2]?.total_amount || 0
  const growthRate = previousMonth > 0 ? ((currentMonth - previousMonth) / previousMonth) * 100 : 0

  return (
    <ChartContainer
      title="Donation Trends"
      description="Monthly donation performance"
      isLoading={isLoading}
      trend={{
        value: Math.abs(growthRate),
        isPositive: growthRate >= 0,
        label: "vs last month",
      }}
      onRefresh={onRefresh}
    >
      <div className="h-[250px] relative">
        <canvas ref={chartRef} />
      </div>
    </ChartContainer>
  )
}
