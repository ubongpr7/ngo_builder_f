"use client"

import { useEffect, useRef } from "react"
import { Chart, registerables } from "chart.js"
import { ChartContainer } from "../chart-container"

// Register Chart.js components
Chart.register(...registerables)

interface ExpenseChartProps {
  expenseStats: any
  isLoading?: boolean
  onRefresh?: () => void
}

export function ExpenseChart({ expenseStats, isLoading = false, onRefresh }: ExpenseChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartInstance = useRef<Chart | null>(null)

  useEffect(() => {
    if (!chartRef.current || isLoading) return

    // Destroy previous chart instance if it exists
    if (chartInstance.current) {
      chartInstance.current.destroy()
    }

    // Prepare data for expense status
    const statusData = [
      { label: "Pending", value: expenseStats?.pending_expenses || 0, color: "#f59e0b" },
      { label: "Approved", value: expenseStats?.approved_expenses || 0, color: "#10b981" },
      { label: "Rejected", value: expenseStats?.rejected_expenses || 0, color: "#ef4444" },
    ]

    const labels = statusData.map((item) => item.label)
    const data = statusData.map((item) => item.value)
    const colors = statusData.map((item) => item.color)

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
  }, [expenseStats, isLoading])

  // Calculate approval rate
  const totalExpenses =
    (expenseStats?.pending_expenses || 0) +
    (expenseStats?.approved_expenses || 0) +
    (expenseStats?.rejected_expenses || 0)
  const approvalRate = totalExpenses > 0 ? ((expenseStats?.approved_expenses || 0) / totalExpenses) * 100 : 0

  return (
    <ChartContainer
      title="Expense Status"
      description="Distribution of expense approvals"
      isLoading={isLoading}
      trend={{
        value: approvalRate,
        isPositive: approvalRate >= 80,
        label: "approval rate",
      }}
      onRefresh={onRefresh}
    >
      <div className="h-[200px] relative">
        <canvas ref={chartRef} />
      </div>
    </ChartContainer>
  )
}
