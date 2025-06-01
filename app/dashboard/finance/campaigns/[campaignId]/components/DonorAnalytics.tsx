import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/currency-utils"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { Users, UserCheck, Award } from "lucide-react"

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

interface DonorAnalyticsProps {
  donorAnalysis: any
  analytics: any
}

export function DonorAnalytics({ donorAnalysis, analytics }: DonorAnalyticsProps) {
  const segmentData = donorAnalysis?.segments
    ? Object.entries(donorAnalysis.segments).map(([key, value]: [string, any]) => ({
        name: key.charAt(0).toUpperCase() + key.slice(1),
        donors: value.unique_donors,
        total: value.total,
        avg: value.avg,
        count: value.count,
      }))
    : []

  const retentionData = [
    {
      name: "First-time Donors",
      value: donorAnalysis?.donor_retention?.first_time_donors_count || 0,
      color: COLORS[0],
    },
    {
      name: "Repeat Donors",
      value: donorAnalysis?.donor_retention?.repeat_donors_count || 0,
      color: COLORS[1],
    },
  ]

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {/* Donor Summary Cards */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Total Donors
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{analytics.donor_metrics?.total_donors_count}</div>
          <div className="text-sm text-muted-foreground mt-1">
            {analytics.donor_metrics?.total_donations_count} total donations
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center">
            <UserCheck className="h-5 w-5 mr-2" />
            Retention Rate
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{donorAnalysis?.donor_retention?.retention_rate?.toFixed(1)}%</div>
          <div className="text-sm text-muted-foreground mt-1">
            {donorAnalysis?.donor_retention?.repeat_donors_count} repeat donors
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center">
            <Award className="h-5 w-5 mr-2" />
            Average Donation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">
            {formatCurrency(analytics.campaign_info?.currency, analytics.donor_metrics?.average_donation_amount)}
          </div>
          <div className="text-sm text-muted-foreground mt-1">
            Largest:{" "}
            {formatCurrency(analytics.campaign_info?.currency, analytics.donor_metrics?.largest_donation_amount)}
          </div>
        </CardContent>
      </Card>

      {/* Donor Segments */}
      <Card className="col-span-1 lg:col-span-2">
        <CardHeader>
          <CardTitle>Donor Segments</CardTitle>
          <CardDescription>Breakdown by donation amount ranges</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={segmentData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip
                  formatter={(value, name) => {
                    if (name === "total") return formatCurrency(analytics.campaign_info?.currency, value as number)
                    if (name === "avg") return formatCurrency(analytics.campaign_info?.currency, value as number)
                    return value
                  }}
                />
                <Bar dataKey="donors" fill="#0088FE" name="Unique Donors" />
                <Bar dataKey="count" fill="#00C49F" name="Total Donations" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Donor Retention Pie Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Donor Retention</CardTitle>
          <CardDescription>First-time vs repeat donors</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={retentionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {retentionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Top Repeat Donors */}
      <Card className="col-span-1 lg:col-span-2 xl:col-span-3">
        <CardHeader>
          <CardTitle>Top Repeat Donors</CardTitle>
          <CardDescription>Most loyal contributors to this campaign</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {donorAnalysis?.repeat_donors?.slice(0, 5).map((donor: any, index: number) => (
              <div key={donor.donor} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium">#{index + 1}</span>
                  </div>
                  <div>
                    <div className="font-medium">Donor #{donor.donor}</div>
                    <div className="text-sm text-muted-foreground">{donor.donation_count} donations</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">
                    {formatCurrency(analytics.campaign_info?.currency, donor.total_donated)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Avg: {formatCurrency(analytics.campaign_info?.currency, donor.total_donated / donor.donation_count)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
