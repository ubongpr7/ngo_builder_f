"use client"

import { useEffect, useRef } from "react"
import { Chart, registerables } from "chart.js"
import { categoryToChartData } from "@/utils/chart-helpers"
import { ChartContainer } from "./chart-container"

// Register Chart.js components
Chart.register(...registerables)

interface CategoryChartProps {
  categoryCounts: Record<string, number>
  isLoading?: boolean
  onRefresh?: () => void
}

export function CategoryChart({ categoryCounts, isLoading = false, onRefresh }: CategoryChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartInstance = useRef<Chart | null>(null)

  useEffect(() => {
    if (!chartRef.current || isLoading) return

    // Destroy previous chart instance if it exists
    if (chartInstance.current) {
      chartInstance.current.destroy()
    }

    const { labels, data, colors } = categoryToChartData(categoryCounts)

    // Create new chart
    const ctx = chartRef.current.getContext("2d")
    if (ctx) {
      chartInstance.current = new Chart(ctx, {
        type: "polarArea",
        data: {
          labels,
          datasets: [
            {
              data,
              backgroundColor: colors.map((color) => `${color}CC`), // Add transparency
              borderColor: colors,
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            r: {
              ticks: {
                display: false,
              },
            },
          },
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
  }, [categoryCounts, isLoading])

  return (
    <ChartContainer
      title="Projects by Category"
      description="Distribution of projects across categories"
      isLoading={isLoading}
      onRefresh={onRefresh}
    >
      <div className="h-[250px] relative">
        <canvas ref={chartRef} />
      </div>
    </ChartContainer>
  )
}
