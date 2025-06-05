"use client"

import { useEffect, useRef } from "react"
import { Chart, registerables } from "chart.js"
import { formatBudgetData,  } from "@/utils/chart-helpers"

import { ChartContainer } from "./chart-container"
import { formatCurrencyCompact } from "@/lib/currency-utils"

// Register Chart.js components
Chart.register(...registerables)

interface BudgetChartProps {
  budgetStats: any
  isLoading?: boolean
  onRefresh?: () => void
  currencyCode?: string
}

export function BudgetChart({ budgetStats, isLoading = false, onRefresh, currencyCode }: BudgetChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartInstance = useRef<Chart | null>(null)

  useEffect(() => {
    if (!chartRef.current || isLoading) return

    // Destroy previous chart instance if it exists
    if (chartInstance.current) {
      chartInstance.current.destroy()
    }

    const { labels, data, colors } = formatBudgetData(budgetStats)

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
                  return `${new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: currencyCode || "USD",
                  }).format(value)}`
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
                callback: (value) => formatCurrencyCompact(currencyCode || "USD",Number(value)),
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
  }, [budgetStats, isLoading])

  // Calculate budget utilization
  const utilization = budgetStats?.total_budget
    ? (Number(budgetStats.total_spent || 0) / Number(budgetStats.total_budget)) * 100
    : 0

  return (
    <ChartContainer
      title="Budget Overview"
      description="Budget allocation and utilization"
      isLoading={isLoading}
      trend={{
        value: utilization,
        isPositive: utilization <= 90,
        label: "utilized",
      }}
      onRefresh={onRefresh}
    >
      <div className="h-[250px] relative">
        <canvas ref={chartRef} />
      </div>
    </ChartContainer>
  )
}
