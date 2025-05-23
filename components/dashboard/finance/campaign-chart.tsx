"use client"

import { useEffect, useRef } from "react"
import { Chart, registerables } from "chart.js"
import { ChartContainer } from "../chart-container"

// Register Chart.js components
Chart.register(...registerables)

interface CampaignChartProps {
  campaignStats: any
  isLoading?: boolean
  onRefresh?: () => void
}

export function CampaignChart({ campaignStats, isLoading = false, onRefresh }: CampaignChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartInstance = useRef<Chart | null>(null)

  useEffect(() => {
    if (!chartRef.current || isLoading || !campaignStats) return

    // Destroy previous chart instance if it exists
    if (chartInstance.current) {
      chartInstance.current.destroy()
    }

    // Prepare data for campaign status
    const statusData = [
      { label: "Active", value: campaignStats?.active_campaigns || 0, color: "#10b981" },
      { label: "Completed", value: campaignStats?.completed_campaigns || 0, color: "#6b7280" },
      { label: "Featured", value: campaignStats?.featured_campaigns || 0, color: "#f59e0b" },
    ]

    const labels = statusData.map((item) => item.label)
    const data = statusData.map((item) => item.value)
    const colors = statusData.map((item) => item.color)

    // Create new chart
    const ctx = chartRef.current.getContext("2d")
    if (ctx) {
      chartInstance.current = new Chart(ctx, {
        type: "doughnut",
        data: {
          labels,
          datasets: [
            {
              data,
              backgroundColor: colors,
              borderColor: colors.map(() => "#fff"),
              borderWidth: 2,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: "right",
              labels: {
                boxWidth: 12,
                padding: 15,
                font: {
                  size: 11,
                },
              },
            },
            tooltip: {
              callbacks: {
                label: (context) => {
                  const label = context.label || ""
                  const value = context.raw as number
                  const total = data.reduce((a, b) => a + b, 0)
                  const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : "0.0"
                  return `${label}: ${value} (${percentage}%)`
                },
              },
            },
          },
          cutout: "60%",
        },
      })
    }

    // Cleanup function
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy()
      }
    }
  }, [campaignStats, isLoading])

  // Calculate success rate
  const totalCampaigns = (campaignStats?.active_campaigns || 0) + (campaignStats?.completed_campaigns || 0)
  const successRate = totalCampaigns > 0 ? ((campaignStats?.completed_campaigns || 0) / totalCampaigns) * 100 : 0

  return (
    <ChartContainer
      title="Campaign Status"
      description="Distribution of campaign statuses"
      isLoading={isLoading}
      trend={{
        value: successRate,
        isPositive: successRate >= 70,
        label: "success rate",
      }}
      onRefresh={onRefresh}
    >
      <div className="h-[250px] relative">
        <canvas ref={chartRef} />
      </div>
    </ChartContainer>
  )
}
