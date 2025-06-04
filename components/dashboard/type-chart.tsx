"use client"

import { useEffect, useRef } from "react"
import { Chart, registerables } from "chart.js"
import { typeToChartData } from "@/utils/chart-helpers"
import { ChartContainer } from "./chart-container"

// Register Chart.js components
Chart.register(...registerables)

interface TypeChartProps {
  typeCounts: Record<string, number>
  isLoading?: boolean
  onRefresh?: () => void
  currencyCode?: string
}

export function TypeChart({ typeCounts, isLoading = false, onRefresh, currencyCode }: TypeChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartInstance = useRef<Chart | null>(null)
  console.log("TypeChart rendered with typeCounts:", typeCounts)
  useEffect(() => {
    if (!chartRef.current || isLoading) return

    // Destroy previous chart instance if it exists
    if (chartInstance.current) {
      chartInstance.current.destroy()
    }

    const { labels, data, colors } = typeToChartData(typeCounts)

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
                  const percentage = ((value / total) * 100).toFixed(1)
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
  }, [typeCounts, isLoading])

  return (
    <ChartContainer
      title="Projects by Type"
      description="Distribution of projects by type"
      isLoading={isLoading}
      onRefresh={onRefresh}
    >
      <div className="h-[200px] relative">
        <canvas ref={chartRef} />
      </div>
    </ChartContainer>
  )
}
