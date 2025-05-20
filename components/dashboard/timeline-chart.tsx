"use client"

import { useEffect, useRef } from "react"
import { Chart, registerables } from "chart.js"
import { timelineToChartData } from "@/utils/chart-helpers"
import { ChartContainer } from "./chart-container"

// Register Chart.js components
Chart.register(...registerables)

interface TimelineChartProps {
  timelineStats: any
  isLoading?: boolean
  onRefresh?: () => void
}

export function TimelineChart({ timelineStats, isLoading = false, onRefresh }: TimelineChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartInstance = useRef<Chart | null>(null)

  useEffect(() => {
    if (!chartRef.current || isLoading) return

    // Destroy previous chart instance if it exists
    if (chartInstance.current) {
      chartInstance.current.destroy()
    }

    const { labels, data, colors } = timelineToChartData(timelineStats)

    // Create new chart
    const ctx = chartRef.current.getContext("2d")
    if (ctx) {
      chartInstance.current = new Chart(ctx, {
        type: "pie",
        data: {
          labels,
          datasets: [
            {
              data,
              backgroundColor: colors,
              borderColor: colors?.map(() => "#fff"),
              borderWidth: 2,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: "bottom",
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
        },
      })
    }

    // Cleanup function
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy()
      }
    }
  }, [timelineStats, isLoading])

  // Calculate on-time percentage
  const total =
    (timelineStats?.completed_on_time || 0) +
    (timelineStats?.delayed_projects || 0) +
    (timelineStats?.completed_late || 0)
  const onTimePercentage = total > 0 ? ((timelineStats?.completed_on_time || 0) / total) * 100 : 0

  return (
    <ChartContainer
      title="Project Timelines"
      description="On-time vs delayed projects"
      isLoading={isLoading}
      trend={{
        value: onTimePercentage,
        isPositive: onTimePercentage >= 70,
        label: "on time",
      }}
      onRefresh={onRefresh}
    >
      <div className="h-[200px] relative">
        <canvas ref={chartRef} />
      </div>
    </ChartContainer>
  )
}
