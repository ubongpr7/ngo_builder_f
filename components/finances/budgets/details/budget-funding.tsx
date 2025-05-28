"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Building2, DollarSign, Plus, CheckCircle, XCircle } from "lucide-react"
import type { Budget } from "@/types/finance"
import { formatDate } from "@/lib/utils"
import { formatCurrency } from "@/lib/currency-utils"
import { BudgetFundingDialog } from "./add-edit-budget-funding-dialog"
import { useState } from "react"

interface BudgetFundingSectionProps {
  budget: Budget
  onAddFunding?: () => void
}

export function BudgetFundingSection({ budget, onAddFunding }: BudgetFundingSectionProps) {
  const [openAddDialog, setOpenAddDialog] = useState(false)
  
  const getFundingTypeIcon = (type: string) => {
    return <DollarSign className="h-4 w-4" />
  }

  const getFundingStatusColor = (status: string) => {
    switch (status) {
      case "Available":
        return "bg-green-100 text-green-800"
      case "Expiring Soon":
        return "bg-orange-100 text-orange-800"
      case "Expired":
        return "bg-red-100 text-red-800"
      case "Inactive":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-blue-100 text-blue-800"
    }
  }

  const getFundingTypeColor = (type: string) => {
    switch (type) {
      case "grant":
        return "bg-indigo-100 text-indigo-800"
      case "donation":
        return "bg-green-100 text-green-800"
      case "campaign":
        return "bg-purple-100 text-purple-800"
      case "internal":
        return "bg-gray-100 text-gray-800"
      case "partnership":
        return "bg-pink-100 text-pink-800"
      case "government":
        return "bg-red-100 text-red-800"
      default:
        return "bg-blue-100 text-blue-800"
    }
  }

  const totalFunding = budget.funding_sources_summary?.reduce(
    (sum, funding) => sum + funding.amount_allocated, 0
  ) || 0

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Funding Sources ({budget.funding_sources_count})</CardTitle>
            <Button onClick={() => setOpenAddDialog(true)} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Funding Source
            </Button>
          </div>
          <BudgetFundingDialog
            open={openAddDialog}
            onOpenChange={() => setOpenAddDialog(false)}
            budgetId={budget.id}
            budgetCurrency={budget.currency}
            onSuccess={onAddFunding}
          />
        </CardHeader>
        <CardContent>
          {/* Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(budget.currency.code, totalFunding)}
              </div>
              <div className="text-sm text-blue-600">Total Funding</div>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {budget.funding_sources_summary?.filter(f => f.is_active).length || 0}
              </div>
              <div className="text-sm text-green-600">Active Sources</div>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {new Set(budget.funding_sources_summary?.map(f => f.funding_type)).size || 0}
              </div>
              <div className="text-sm text-purple-600">Funding Types</div>
            </div>
          </div>

          {/* Funding Sources Table */}
          {budget.funding_sources_summary && budget.funding_sources_summary.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Funding Source</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Amount Allocated</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Currency</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {budget.funding_sources_summary.map((funding) => (
                  <TableRow key={funding.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {getFundingTypeIcon(funding.funding_type)}
                        <div>
                          <div className="font-medium">{funding.name}</div>
                          {funding.available_until && (
                            <div className="text-sm text-gray-500">
                              Until: {formatDate(funding.available_until)}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getFundingTypeColor(funding.funding_type)}>
                        {funding.funding_type_display}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="font-medium">{formatCurrency(funding.currency_code, funding.amount_allocated)}</div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getFundingStatusColor(funding.is_active ? "Available" : "Inactive")}>
                        {funding.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{formatDate(funding.allocation_date)}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-medium">{funding.currency_code}</div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <DollarSign className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No funding sources allocated yet.</p>
              <Button onClick={() => setOpenAddDialog(true)} className="mt-4">
                <Plus className="h-4 w-4 mr-2" />
                Add First Funding Source
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Funding Summary by Type */}
      {budget.funding_breakdown && budget.funding_breakdown.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Funding Breakdown by Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {budget.funding_breakdown.map((breakdown, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getFundingTypeIcon(breakdown.source_type)}
                    <div>
                      <div className="font-medium">{breakdown.source_type_display}</div>
                      <div className="text-sm text-gray-500">
                        {breakdown.count} source{breakdown.count !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">
                      {formatCurrency(budget.currency.code, breakdown.total_amount)}
                    </div>
                    <div className="text-sm text-gray-500">{breakdown.percentage_of_budget.toFixed(1)}% of budget</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}