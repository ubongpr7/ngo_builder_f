import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/currency-utils"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { CreditCard, Banknote, Percent } from "lucide-react"

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

interface PaymentAnalysisProps {
  paymentAnalysis: any
  analytics: any
}

export function PaymentAnalysis({ paymentAnalysis, analytics }: PaymentAnalysisProps) {
  const paymentMethodData =
    paymentAnalysis?.payment_methods?.map((method: any, index: number) => ({
      ...method,
      color: COLORS[index % COLORS.length],
    })) || []

  const statusData =
    paymentAnalysis?.status_breakdown?.map((status: any, index: number) => ({
      ...status,
      color: COLORS[index % COLORS.length],
    })) || []

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {/* Payment Summary Cards */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center">
            <CreditCard className="h-5 w-5 mr-2" />
            Total Processed
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">
            {formatCurrency(analytics.campaign_info?.currency, paymentAnalysis?.processing_efficiency?.total_gross)}
          </div>
          <div className="text-sm text-muted-foreground mt-1">Gross amount processed</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center">
            <Percent className="h-5 w-5 mr-2" />
            Processing Fees
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">
            {paymentAnalysis?.processing_efficiency?.avg_fee_percentage}%
          </div>
          <div className="text-sm text-muted-foreground mt-1">
            {formatCurrency(analytics.campaign_info?.currency, paymentAnalysis?.processing_efficiency?.total_fees)}{" "}
            total fees
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center">
            <Banknote className="h-5 w-5 mr-2" />
            Net Amount
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">
            {formatCurrency(analytics.campaign_info?.currency, paymentAnalysis?.processing_efficiency?.total_net)}
          </div>
          <div className="text-sm text-muted-foreground mt-1">
            {paymentAnalysis?.fee_analysis?.net_efficiency}% efficiency
          </div>
        </CardContent>
      </Card>

      {/* Payment Methods Chart */}
      <Card className="col-span-1 lg:col-span-2">
        <CardHeader>
          <CardTitle>Payment Methods</CardTitle>
          <CardDescription>Breakdown by payment method</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={paymentMethodData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="payment_method" />
                <YAxis />
                <Tooltip
                  formatter={(value, name) => {
                    if (name === "total" || name === "avg" || name === "total_fees") {
                      return formatCurrency(analytics.campaign_info?.currency, value as number)
                    }
                    return value
                  }}
                />
                <Bar dataKey="total" fill="#0088FE" name="Total Amount" />
                <Bar dataKey="count" fill="#00C49F" name="Count" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Payment Status Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Status</CardTitle>
          <CardDescription>Distribution by status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ status, count }) => `${status}: ${count}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Payment Method Details Table */}
      <Card className="col-span-1 lg:col-span-2 xl:col-span-3">
        <CardHeader>
          <CardTitle>Payment Method Details</CardTitle>
          <CardDescription>Detailed breakdown of each payment method</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Payment Method</th>
                  <th className="text-right p-2">Count</th>
                  <th className="text-right p-2">Total Amount</th>
                  <th className="text-right p-2">Average</th>
                  <th className="text-right p-2">Total Fees</th>
                  <th className="text-right p-2">Fee %</th>
                </tr>
              </thead>
              <tbody>
                {paymentMethodData.map((method: any, index: number) => (
                  <tr key={index} className="border-b">
                    <td className="p-2 font-medium">{method.payment_method}</td>
                    <td className="p-2 text-right">{method.count}</td>
                    <td className="p-2 text-right">
                      {formatCurrency(analytics.campaign_info?.currency, method.total)}
                    </td>
                    <td className="p-2 text-right">{formatCurrency(analytics.campaign_info?.currency, method.avg)}</td>
                    <td className="p-2 text-right">
                      {formatCurrency(analytics.campaign_info?.currency, method.total_fees)}
                    </td>
                    <td className="p-2 text-right">{((method.total_fees / method.total) * 100)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
