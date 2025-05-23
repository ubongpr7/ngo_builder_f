"use client"

import { useEffect, useRef } from "react"
import { Chart, registerables } from "chart.js"
import { ChartContainer } from "../chart-container"
import { formatCurrencyCompact } from "@/utils/chart-helpers"

// Register Chart.js components
Chart.register(...registerables)

interface BudgetUtilizationChartProps {
  budgetStats: any
  isLoading?: boolean
  onRefresh?: () => void
}

export function BudgetUtilizationChart({ budgetStats, isLoading = false, onRefresh }: BudgetUtilizationChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartInstance = useRef<Chart | null>(null)

  useEffect(() => {
    if (!chartRef.current || isLoading) return

    // Destroy previous chart instance if it exists
    if (chartInstance.current) {
      chartInstance.current.destroy()
    }

    // Prepare data for budget utilization
    const totalBudget = Number(budgetStats?.total_budget || 0)
    const spentAmount = Number(budgetStats?.total_spent || 0)
    const remainingAmount = totalBudget - spentAmount

    const data = [spentAmount, remainingAmount]
    const labels = ["Spent", "Remaining"]
    const colors = ["#ef4444", "#10b981"]

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
                  return `${label}: $${formatCurrencyCompact(value)}`
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
  }, [budgetStats, isLoading])

  // Calculate utilization percentage
  const totalBudget = Number(budgetStats?.total_budget || 0)
  const spentAmount = Number(budgetStats?.total_spent || 0)
  const utilization = totalBudget > 0 ? (spentAmount / totalBudget) * 100 : 0

  return (
    <ChartContainer
      title="Budget Utilization"
      description="Budget spent vs remaining"
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
