"use client"

import { useEffect, useRef } from "react"
import { Chart, registerables } from "chart.js"
import { ChartContainer } from "../chart-container"
import { formatCurrencyCompact } from "@/utils/chart-helpers"

// Register Chart.js components
Chart.register(...registerables)

interface GrantChartProps {
  grantStats: any
  isLoading?: boolean
  onRefresh?: () => void
}

export function GrantChart({ grantStats, isLoading = false, onRefresh }: GrantChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartInstance = useRef<Chart | null>(null)

  useEffect(() => {
    if (!chartRef.current || isLoading) return

    // Destroy previous chart instance if it exists
    if (chartInstance.current) {
      chartInstance.current.destroy()
    }

    // Prepare data for grant amounts by status
    const grantData = [
      { label: "Active", value: Number(grantStats?.active_grant_amount || 0), color: "#10b981" },
      { label: "Pending", value: Number(grantStats?.pending_grant_amount || 0), color: "#f59e0b" },
      { label: "Completed", value: Number(grantStats?.completed_grant_amount || 0), color: "#6b7280" },
    ]

    const labels = grantData.map((item) => item.label)
    const data = grantData.map((item) => item.value)
    const colors = grantData.map((item) => item.color)

    // Create new chart
    const ctx = chartRef.current.getContext("2d")
    if (ctx) {
      chartInstance.current = new Chart(ctx, {
        type: "bar",
        data: {
          labels,
          datasets: [
            {
              data,
              backgroundColor: colors,
              borderColor: colors,
              borderWidth: 1,
              borderRadius: 4,
              barThickness: 40,
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
  }, [grantStats, isLoading])

  // Calculate utilization rate
  const totalGrantAmount = Number(grantStats?.total_grant_amount || 0)
  const receivedAmount = Number(grantStats?.total_received_amount || 0)
  const utilizationRate = totalGrantAmount > 0 ? (receivedAmount / totalGrantAmount) * 100 : 0

  return (
    <ChartContainer
      title="Grant Overview"
      description="Grant amounts by status"
      isLoading={isLoading}
      trend={{
        value: utilizationRate,
        isPositive: utilizationRate >= 80,
        label: "utilization",
      }}
      onRefresh={onRefresh}
    >
      <div className="h-[250px] relative">
        <canvas ref={chartRef} />
      </div>
    </ChartContainer>
  )
}
