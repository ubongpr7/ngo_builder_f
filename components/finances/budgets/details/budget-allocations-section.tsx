"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Building2, CreditCard, Plus, CheckCircle, XCircle } from "lucide-react"
import type { Budget } from "@/types/finance"
import {  formatDate } from "@/lib/utils"
import { formatCurrency } from "@/lib/currency-utils"
import { AddFundAllocationDialog } from "../items/add-fund-allocation-dialog"
import { useState } from "react"
interface BudgetAllocationsSectionProps {
  budget: Budget
  onAddAllocation?: () => void
}

export function BudgetAllocationsSection({ budget, onAddAllocation }: BudgetAllocationsSectionProps) {
  const [openAddDialog,setOpenAddDialog]=useState(false)
  const getAccountTypeIcon = (type: string) => {
    switch (type) {
      case "checking":
      case "savings":
        return <Building2 className="h-4 w-4" />
      case "paypal":
      case "stripe":
        return <CreditCard className="h-4 w-4" />
      default:
        return <Building2 className="h-4 w-4" />
    }
  }

  const getAccountTypeColor = (type: string) => {
    switch (type) {
      case "checking":
        return "bg-blue-100 text-blue-800"
      case "savings":
        return "bg-green-100 text-green-800"
      case "money_market":
        return "bg-purple-100 text-purple-800"
      case "restricted":
        return "bg-red-100 text-red-800"
      case "project":
        return "bg-orange-100 text-orange-800"
      case "grant":
        return "bg-indigo-100 text-indigo-800"
      case "paypal":
        return "bg-blue-100 text-blue-800"
      case "stripe":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const totalAllocated =
    budget.fund_allocations?.reduce((sum, allocation) => sum + Number.parseFloat(allocation.amount_allocated), 0) || 0

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Fund Allocations ({budget.allocations_count})</CardTitle>
            <Button onClick={()=>setOpenAddDialog(true)} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Allocation
            </Button>
          </div>
          <AddFundAllocationDialog 
          open={openAddDialog}
          onOpenChange={()=>setOpenAddDialog(false)}
          budget={budget}
          onSuccess={onAddAllocation}
          />
        </CardHeader>
        <CardContent>
          {/* Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(budget.currency.code,totalAllocated)}
              </div>
              <div className="text-sm text-blue-600">Total Allocated</div>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {budget.fund_allocations?.filter((a) => a.is_active).length || 0}
              </div>
              <div className="text-sm text-green-600">Active Allocations</div>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {new Set(budget.fund_allocations?.map((a) => a.source_account.id)).size || 0}
              </div>
              <div className="text-sm text-purple-600">Bank Accounts</div>
            </div>
          </div>

          {/* Allocations Table */}
          {budget.fund_allocations && budget.fund_allocations.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bank Account</TableHead>
                  <TableHead>Institution</TableHead>
                  <TableHead className="text-right">Amount Allocated</TableHead>
                  <TableHead>Purpose</TableHead>
                  <TableHead>Allocated By</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {budget.fund_allocations.map((allocation) => (
                  <TableRow key={allocation.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {getAccountTypeIcon(allocation.source_account.account_type)}
                        <div>
                          <div className="font-medium">{allocation.source_account.name}</div>
                          <div className="text-sm text-gray-500">{allocation.source_account.account_number}</div>
                          <Badge className={getAccountTypeColor(allocation.source_account.account_type)}>
                            {allocation.source_account.account_type.replace("_", " ")}
                          </Badge>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-medium">{allocation.source_account.financial_institution.name}</div>
                        <div className="text-gray-500">Balance: {formatCurrency(allocation.source_account.currency.code,allocation.source_account.balance)}</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="font-medium">{allocation.formatted_amount}</div>
                      <div className="text-sm text-gray-500">{allocation.source_account.currency.code}</div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs">
                        <p className="text-sm">{allocation.purpose}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{allocation.allocated_by.full_name}</div>
                        {allocation.approved_by && (
                          <div className="text-gray-500">Approved by {allocation.approved_by.full_name}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{formatDate(allocation.allocation_date)}</div>
                    </TableCell>
                    <TableCell className="text-center">
                      {allocation.is_active ? (
                        <Badge className="bg-green-100 text-green-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Active
                        </Badge>
                      ) : (
                        <Badge className="bg-gray-100 text-gray-800">
                          <XCircle className="h-3 w-3 mr-1" />
                          Inactive
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Building2 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No fund allocations created yet.</p>
              <Button onClick={onAddAllocation} className="mt-4">
                <Plus className="h-4 w-4 mr-2" />
                Create First Allocation
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Allocation Summary by Account */}
      {budget.allocation_summary && budget.allocation_summary.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Allocation Summary by Account</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {budget.allocation_summary.map((summary, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getAccountTypeIcon(summary.account_type)}
                    <div>
                      <div className="font-medium">{summary.account_name}</div>
                      <div className="text-sm text-gray-500">
                        {summary.account_type.replace("_", " ")} • {summary.currency}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{summary.total_allocated}</div>
                    <div className="text-sm text-gray-500">{summary.percentage||0}% of total</div>
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
