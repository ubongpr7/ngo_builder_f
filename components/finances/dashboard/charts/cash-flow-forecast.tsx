"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Line, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Legend, Area, AreaChart } from "recharts"
import { TrendingUp, TrendingDown, DollarSign } from "lucide-react"

interface CashFlowForecastProps {
  data: any[]
  isLoading?: boolean
}

export function CashFlowForecast({ data, isLoading }: CashFlowForecastProps) {
  const chartConfig = {
    inflow: {
      label: "Cash Inflow",
      color: "hsl(var(--chart-1))",
    },
    outflow: {
      label: "Cash Outflow",
      color: "hsl(var(--chart-2))",
    },
    net: {
      label: "Net Cash Flow",
      color: "hsl(var(--chart-3))",
    },
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="h-6 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3" />
        </CardHeader>
        <CardContent>
          <div className="h-[300px] bg-gray-200 rounded animate-pulse" />
        </CardContent>
      </Card>
    )
  }

  // Generate forecast data for next 6 months with safety checks
  const forecastData = Array.isArray(data)
    ? data.map((item) => ({
        month: item.month || "Unknown",
        inflow: item.projected_inflow || 0,
        outflow: item.projected_outflow || 0,
        net: (item.projected_inflow || 0) - (item.projected_outflow || 0),
        cumulative: item.cumulative_balance || 0,
      }))
    : [
        // Mock data fallback
        { month: "Jan 2024", inflow: 50000, outflow: 35000, net: 15000, cumulative: 15000 },
        { month: "Feb 2024", inflow: 45000, outflow: 40000, net: 5000, cumulative: 20000 },
        { month: "Mar 2024", inflow: 60000, outflow: 38000, net: 22000, cumulative: 42000 },
        { month: "Apr 2024", inflow: 55000, outflow: 42000, net: 13000, cumulative: 55000 },
        { month: "May 2024", inflow: 48000, outflow: 36000, net: 12000, cumulative: 67000 },
        { month: "Jun 2024", inflow: 52000, outflow: 39000, net: 13000, cumulative: 80000 },
      ]

  const totalInflow = forecastData?.reduce((sum, item) => sum + (item.inflow || 0), 0) || 0
  const totalOutflow = forecastData?.reduce((sum, item) => sum + (item.outflow || 0), 0) || 0
  const netFlow = totalInflow - totalOutflow

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-blue-600" />
          Cash Flow Forecast
        </CardTitle>
        <CardDescription>6-month cash flow projection based on current trends</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={forecastData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <defs>
                <linearGradient id="colorInflow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-inflow)" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="var(--color-inflow)" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="colorOutflow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-outflow)" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="var(--color-outflow)" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend />
              <Area
                type="monotone"
                dataKey="inflow"
                stackId="1"
                stroke="var(--color-inflow)"
                fillOpacity={1}
                fill="url(#colorInflow)"
                name="Cash Inflow"
              />
              <Area
                type="monotone"
                dataKey="outflow"
                stackId="2"
                stroke="var(--color-outflow)"
                fillOpacity={1}
                fill="url(#colorOutflow)"
                name="Cash Outflow"
              />
              <Line
                type="monotone"
                dataKey="net"
                stroke="var(--color-net)"
                strokeWidth={3}
                dot={{ r: 4 }}
                name="Net Cash Flow"
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="flex items-center justify-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">Total Inflow</span>
            </div>
            <div className="text-2xl font-bold text-green-600">${totalInflow.toLocaleString()}</div>
          </div>

          <div className="text-center p-4 bg-red-50 rounded-lg">
            <div className="flex items-center justify-center gap-2 mb-2">
              <TrendingDown className="h-4 w-4 text-red-600" />
              <span className="text-sm font-medium text-red-800">Total Outflow</span>
            </div>
            <div className="text-2xl font-bold text-red-600">${totalOutflow.toLocaleString()}</div>
          </div>

          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-center gap-2 mb-2">
              <DollarSign className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">Net Flow</span>
            </div>
            <div className={`text-2xl font-bold ${netFlow >= 0 ? "text-green-600" : "text-red-600"}`}>
              ${netFlow.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Cash Flow Insights */}
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-sm text-gray-700 mb-2">Key Insights</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>
              • Expected {netFlow >= 0 ? "positive" : "negative"} cash flow of ${Math.abs(netFlow).toLocaleString()}{" "}
              over 6 months
            </li>
            <li>
              • Peak inflow expected in{" "}
              {forecastData.length > 0
                ? forecastData.reduce((max, item) => (item.inflow > max.inflow ? item : max), forecastData[0])?.month ||
                  "Unknown"
                : "No data available"}
            </li>
            <li>
              • Highest outflow projected for{" "}
              {forecastData.length > 0
                ? forecastData.reduce((max, item) => (item.outflow > max.outflow ? item : max), forecastData[0])
                    ?.month || "Unknown"
                : "No data available"}
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
