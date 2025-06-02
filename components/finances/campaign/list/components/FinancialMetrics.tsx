import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/currency-utils"
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts"
import { DollarSign, Target, Percent } from "lucide-react"

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"]

interface FinancialMetricsProps {
  analytics: any
  detailed?: boolean
}

export function FinancialMetrics({ analytics, detailed = false }: FinancialMetricsProps) {
  const donationBreakdown = [
    {
      name: "One-time Donations",
      value: analytics.financial_metrics?.total_donations_amount || 0,
      color: COLORS[0],
    },
    {
      name: "Recurring Donations",
      value: analytics.financial_metrics?.total_recurring_amount || 0,
      color: COLORS[1],
    },
    {
      name: "In-kind Donations",
      value: analytics.financial_metrics?.total_in_kind_amount || 0,
      color: COLORS[2],
    },
  ]

  const progressMetrics = [
    {
      name: "Target Progress",
      value: analytics.financial_metrics?.progress_percentage || 0,
      target: 100,
      color: "#0088FE",
    },
    {
      name: "Minimum Goal",
      value: analytics.financial_metrics?.minimum_goal_percentage || 0,
      target: 100,
      color: "#00C49F",
    },
  ]

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {/* Financial Summary Cards */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center">
            <DollarSign className="h-5 w-5 mr-2" />
            Current Amount
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">
            {formatCurrency(analytics.campaign_info?.currency, analytics.financial_metrics?.current_amount)}
          </div>
          <div className="text-sm text-muted-foreground mt-1">
            Net: {formatCurrency(analytics.campaign_info?.currency, analytics.financial_metrics?.net_donations_amount)}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center">
            <Target className="h-5 w-5 mr-2" />
            Remaining
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">
            {formatCurrency(analytics.campaign_info?.currency, analytics.financial_metrics?.amount_remaining)}
          </div>
          <div className="text-sm text-muted-foreground mt-1">
            {analytics.financial_metrics?.is_target_reached ? "Target Exceeded!" : "To reach target"}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center">
            <Percent className="h-5 w-5 mr-2" />
            Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{analytics.financial_metrics?.progress_percentage?.toFixed(2)}%</div>
          <div className="text-sm text-muted-foreground mt-1">
            Min goal: {analytics.financial_metrics?.minimum_goal_percentage?.toFixed(2)}%
          </div>
        </CardContent>
      </Card>

      {/* Donation Breakdown Pie Chart */}
      <Card className="col-span-1 lg:col-span-2">
        <CardHeader>
          <CardTitle>Donation Breakdown</CardTitle>
          <CardDescription>Distribution by donation type</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={donationBreakdown}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(2)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {donationBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(analytics.campaign_info?.currency, value as number)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Progress Comparison */}
      {detailed && (
        <Card>
          <CardHeader>
            <CardTitle>Progress Metrics</CardTitle>
            <CardDescription>Target vs minimum goal progress</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={progressMetrics}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => `${value}%`} />
                  <Bar dataKey="value" fill="#0088FE" />
                  <Bar dataKey="target" fill="#E5E7EB" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
