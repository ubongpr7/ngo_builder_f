"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts"
import type { Budget } from "@/types/finance"
import {  formatDate } from "@/lib/utils"
import { formatCurrency } from "@/lib/currency-utils"

interface BudgetFundingBreakdownProps {
  budget: Budget
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D"]

export function BudgetFundingBreakdown({ budget }: BudgetFundingBreakdownProps) {
  const pieData =
    budget.funding_breakdown?.map((item, index) => ({
      name: item.source,
      value: Number.parseFloat(item.amount),
      percentage: item.percentage,
      color: COLORS[index % COLORS.length],
    })) || []

  const barData =
    budget.budget_funding?.map((funding) => ({
      name:
        funding.funding_source.name.length > 20
          ? funding.funding_source.name.substring(0, 20) + "..."
          : funding.funding_source.name,
      allocated: Number.parseFloat(funding.amount_allocated),
      available: Number.parseFloat(funding.funding_source.amount_available),
      remaining: Number.parseFloat(funding.funding_source.amount_remaining),
    })) || []

  const getFundingTypeColor = (type: string) => {
    switch (type) {
      case "donation":
        return "bg-green-100 text-green-800"
      case "grant":
        return "bg-blue-100 text-blue-800"
      case "campaign":
        return "bg-purple-100 text-purple-800"
      case "internal":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-orange-100 text-orange-800"
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Funding Sources Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pie Chart */}
            <div>
              <h4 className="text-sm font-medium mb-4">Funding Distribution</h4>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percentage }) => `${name}: ${percentage.toFixed(1)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency( budget.currency.code,Number(value),)} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Summary Stats */}
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Total Funding Allocated</span>
                  <span className="font-medium">
                    {formatCurrency( budget.currency.code,Number.parseFloat(budget.total_funding_allocated),)}
                  </span>
                </div>
                <Progress
                  value={
                    (Number.parseFloat(budget.total_funding_allocated) / Number.parseFloat(budget.total_amount||1)) * 100
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="text-lg font-bold text-blue-600">{budget.funding_sources_count}</div>
                  <div className="text-xs text-blue-600">Funding Sources</div>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <div className="text-lg font-bold text-green-600">{budget.allocations_count}</div>
                  <div className="text-xs text-green-600">Allocations</div>
                </div>
              </div>

              {budget.funding_breakdown && budget.funding_breakdown.length > 0 && (
                <div className="space-y-2">
                  <h5 className="text-sm font-medium">Breakdown by Source</h5>
                  {budget.funding_breakdown.map((item, index) => (
                    <div key={index} className="flex justify-between items-center text-sm">
                      <span className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        {item.source}
                      </span>
                      <span className="font-medium">{item.formatted_amount}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Funding Sources */}
      <Card>
        <CardHeader>
          <CardTitle>Funding Sources Detail</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {budget.budget_funding && budget.budget_funding.length > 0 ? (
              budget.budget_funding.map((funding) => (
                <div key={funding.id} className="border rounded-lg p-4">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{funding.funding_source.name}</h4>
                        <Badge className={getFundingTypeColor(funding.funding_source.funding_type)}>
                          {funding.funding_source.funding_type}
                        </Badge>
                        {!funding.funding_source.is_active && <Badge variant="secondary">Inactive</Badge>}
                      </div>

                      {funding.funding_source.donation && (
                        <p className="text-sm text-gray-600">
                          Donation from {funding.funding_source.donation.donor_name_display}
                        </p>
                      )}

                      {funding.funding_source.campaign && (
                        <p className="text-sm text-gray-600">Campaign: {funding.funding_source.campaign.title}</p>
                      )}

                      {funding.funding_source.grant && (
                        <p className="text-sm text-gray-600">
                          Grant: {funding.funding_source.grant.title} from {funding.funding_source.grant.grantor}
                        </p>
                      )}

                      <p className="text-xs text-gray-500">Allocated on {formatDate(funding.allocation_date)}</p>
                    </div>

                    <div className="text-right space-y-1">
                      <div className="text-lg font-bold">{funding.formatted_amount}</div>
                      <div className="text-sm text-gray-600">
                        of {funding.funding_source.formatted_amount} available
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatCurrency(
                          
                          budget.currency.code,
                          Number.parseFloat(funding.funding_source.amount_remaining),
                        )}{" "}
                        remaining
                      </div>
                    </div>
                  </div>

                  {funding.notes && (
                    <div className="mt-3 p-2 bg-gray-50 rounded text-sm">
                      <strong>Notes:</strong> {funding.notes}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No funding sources allocated to this budget yet.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Funding Comparison Chart */}
      {barData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Funding Allocation vs Availability</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency( budget.currency.code,Number(value),)} />
                <Legend />
                <Bar dataKey="allocated" fill="#8884d8" name="Allocated" />
                <Bar dataKey="available" fill="#82ca9d" name="Available" />
                <Bar dataKey="remaining" fill="#ffc658" name="Remaining" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
