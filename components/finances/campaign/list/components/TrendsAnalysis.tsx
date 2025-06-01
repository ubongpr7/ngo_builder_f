import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/currency-utils"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  ComposedChart,
  Bar,
} from "recharts"
import { TrendingUp, TrendingDown, Activity, Calendar } from "lucide-react"
import { format, parseISO } from "date-fns"

interface TrendsAnalysisProps {
  trends: any
  analytics: any
}

export function TrendsAnalysis({ trends, analytics }: TrendsAnalysisProps) {
  const chartData =
    trends?.daily_trends?.map((day: any) => ({
      date: format(parseISO(day.day), "MMM dd"),
      fullDate: day.day,
      amount: day.total,
      count: day.count,
      avg: day.avg,
    })) || []

  // Calculate trend indicators
  const recentWeek = chartData.slice(-7)
  const previousWeek = chartData.slice(-14, -7)

  const recentAvg = recentWeek.reduce((sum, day) => sum + day.amount, 0) / recentWeek.length
  const previousAvg = previousWeek.reduce((sum, day) => sum + day.amount, 0) / previousWeek.length
  const trendPercentage = previousAvg > 0 ? ((recentAvg - previousAvg) / previousAvg) * 100 : 0

  const recentCountAvg = recentWeek.reduce((sum, day) => sum + day.count, 0) / recentWeek.length
  const previousCountAvg = previousWeek.reduce((sum, day) => sum + day.count, 0) / previousWeek.length
  const countTrendPercentage = previousCountAvg > 0 ? ((recentCountAvg - previousCountAvg) / previousCountAvg) * 100 : 0

  return (
    <div className="space-y-6">
      {/* Trend Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Weekly Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <div className="text-2xl font-bold">
                {trendPercentage > 0 ? "+" : ""}
                {trendPercentage}%
              </div>
              {trendPercentage > 0 ? (
                <TrendingUp className="h-5 w-5 text-green-500" />
              ) : (
                <TrendingDown className="h-5 w-5 text-red-500" />
              )}
            </div>
            <div className="text-sm text-muted-foreground mt-1">Amount vs previous week</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              Donation Frequency
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <div className="text-2xl font-bold">
                {countTrendPercentage > 0 ? "+" : ""}
                {countTrendPercentage}%
              </div>
              {countTrendPercentage > 0 ? (
                <TrendingUp className="h-5 w-5 text-green-500" />
              ) : (
                <TrendingDown className="h-5 w-5 text-red-500" />
              )}
            </div>
            <div className="text-sm text-muted-foreground mt-1">Count vs previous week</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Daily Average
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(analytics.campaign_info?.currency, recentAvg)}</div>
            <div className="text-sm text-muted-foreground mt-1">Last 7 days</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              Best Day
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(analytics.campaign_info?.currency, Math.max(...chartData.map((d) => d.amount)))}
            </div>
            <div className="text-sm text-muted-foreground mt-1">Highest single day</div>
          </CardContent>
        </Card>
      </div>

      {/* Donation Trends Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Donation Trends</CardTitle>
          <CardDescription>Amount and count of donations over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip
                  formatter={(value, name) => {
                    if (name === "amount") return formatCurrency(analytics.campaign_info?.currency, value as number)
                    return value
                  }}
                  labelFormatter={(label) => `Date: ${label}`}
                />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="amount"
                  stroke="#0088FE"
                  fill="#0088FE"
                  fillOpacity={0.3}
                  name="Amount"
                />
                <Bar yAxisId="right" dataKey="count" fill="#00C49F" name="Count" opacity={0.7} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Average Donation Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Average Donation Trend</CardTitle>
          <CardDescription>Average donation amount per day</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip
                  formatter={(value) => formatCurrency(analytics.campaign_info?.currency, value as number)}
                  labelFormatter={(label) => `Date: ${label}`}
                />
                <Line
                  type="monotone"
                  dataKey="avg"
                  stroke="#FFBB28"
                  strokeWidth={3}
                  dot={{ fill: "#FFBB28", strokeWidth: 2, r: 4 }}
                  name="Average Donation"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
