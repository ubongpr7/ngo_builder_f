"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ChevronDown, ChevronRight, Eye, Plus, AlertTriangle, Lock } from "lucide-react"
import type { Budget, BudgetItem } from "@/types/finance"
import {  formatDate } from "@/lib/utils"
import { formatCurrency } from "@/lib/currency-utils"
import { AddBudgetItemDialog } from "../items/add-budget-item-dialog"
import { useRouter } from "next/navigation"
interface BudgetItemsTableProps {
  budget: Budget
  onAddItem?: () => void
  onEditItem?: (item: BudgetItem) => void
}

export function BudgetItemsTable({ budget, onAddItem, onEditItem }: BudgetItemsTableProps) {
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set())
  const [selectedItem, setSelectedItem] = useState<BudgetItem | null>(null)
  const [openAddDialog, setOpenAddDialog] = useState<boolean>(false)
  const toggleExpanded = (itemId: number) => {
    const newExpanded = new Set(expandedItems)
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId)
    } else {
      newExpanded.add(itemId)
    }
    setExpandedItems(newExpanded)
  }
  const router = useRouter()

  const getStatusColor = (percentage: number, isLocked: boolean) => {
    if (isLocked) return "text-gray-500"
    if (percentage >= 90) return "text-red-600"
    if (percentage >= 75) return "text-yellow-600"
    return "text-green-600"
  }

  const getExpenseStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800"
      case "paid":
        return "bg-blue-100 text-blue-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Budget Items ({budget.items_count})</CardTitle>
            <Button onClick={() => setOpenAddDialog(true)} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
            <AddBudgetItemDialog open={openAddDialog}
            onSuccess={onAddItem}
            onOpenChange={() => setOpenAddDialog(false)} 
            budgetId={budget.id}
            budgetCurrency={budget.currency}
            budget={budget}

             />
          </div>
        </CardHeader>
        <CardContent>
          {budget.items && budget.items.length > 0 ? (
            <div className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-8"></TableHead>
                    <TableHead>Category / Description</TableHead>
                    <TableHead>Responsible</TableHead>
                    <TableHead className="text-right">Budgeted</TableHead>
                    <TableHead className="text-right">Spent</TableHead>
                    <TableHead className="text-right">Remaining</TableHead>
                    <TableHead className="text-center">Progress</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="w-16"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {budget.items.map((item) => {
                    const spentPercentage = Number.parseFloat(item.spent_percentage || "0")
                    const isExpanded = expandedItems.has(item.id)

                    return (
                      <>
                        <TableRow key={item.id} onClick={()=>router.push(`/budgets/items/${item.id}`)}  className="hover:bg-gray-50 cursor-pointer">
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleExpanded(item.id)}
                              className="h-6 w-6 p-0"
                            >
                              {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                            </Button>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{item.category}</span>
                                {item.is_locked && <Lock className="h-4 w-4 text-gray-400" />}
                                {spentPercentage >= 90 && <AlertTriangle className="h-4 w-4 text-red-500" />}
                              </div>
                              {item.subcategory && <div className="text-sm text-gray-600">{item.subcategory}</div>}
                              <div className="text-sm text-gray-500">{item.description}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {item.responsible_person ? (
                              <div className="text-sm">
                                <div>{item.responsible_person.full_name}</div>
                                <div className="text-gray-500">{item.responsible_person.email}</div>
                              </div>
                            ) : (
                              <span className="text-gray-400">Unassigned</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right font-medium">{item.formatted_amount}</TableCell>
                          <TableCell className="text-right">
                            {formatCurrency( budget.currency.code,Number.parseFloat(item.spent_amount),)}
                          </TableCell>
                          <TableCell className="text-right">
                            <span className={getStatusColor(spentPercentage, item.is_locked)}>
                              {formatCurrency( budget.currency.code,Number.parseFloat(item.remaining_amount),)}
                            </span>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="space-y-1">
                              <Progress value={spentPercentage} className="w-16" />
                              <span className="text-xs text-gray-500">{spentPercentage}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="space-y-1">
                              {item.is_locked && (
                                <Badge variant="secondary" className="text-xs">
                                  Locked
                                </Badge>
                              )}
                              {item.expenses_count > 0 && (
                                <Badge variant="outline" className="text-xs">
                                  {item.expenses_count} expenses
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="ghost" size="sm" onClick={() => setSelectedItem(item)}>
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-4xl">
                                <DialogHeader>
                                  <DialogTitle>Budget Item Details: {item.category}</DialogTitle>
                                </DialogHeader>
                                <BudgetItemDetails item={item} currency={budget.currency} />
                              </DialogContent>
                            </Dialog>
                          </TableCell>
                        </TableRow>

                        {/* Expanded Row - Expenses */}
                        {isExpanded && item.expenses && item.expenses.length > 0 && (
                          <TableRow>
                            <TableCell colSpan={9} className="bg-gray-50 p-0">
                              <div className="p-4">
                                <h5 className="font-medium mb-3">Related Expenses ({item.expenses.length})</h5>
                                <div className="space-y-2">
                                  {item.expenses.map((expense) => (
                                    <div
                                      key={expense.id}
                                      className="flex items-center justify-between p-3 bg-white rounded border"
                                    >
                                      <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                          <span className="font-medium">{expense.title}</span>
                                          <Badge className={getExpenseStatusColor(expense.status)}>
                                            {expense.status}
                                          </Badge>
                                        </div>
                                        <div className="text-sm text-gray-600">{expense.description}</div>
                                        <div className="text-xs text-gray-500">
                                          {expense.vendor && `Vendor: ${expense.vendor} • `}
                                          Submitted by {expense.submitted_by.full_name} on{" "}
                                          {formatDate(expense.expense_date)}
                                        </div>
                                      </div>
                                      <div className="text-right">
                                        <div className="font-medium">{expense.formatted_amount}</div>
                                        <div className="text-sm text-gray-500">{expense.expense_type}</div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No budget items created yet.</p>
              <Button onClick={onAddItem} className="mt-4">
                <Plus className="h-4 w-4 mr-2" />
                Add First Budget Item
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function BudgetItemDetails({ item, currency }: { item: BudgetItemDetail; currency: any }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-500">Category</label>
          <p className="text-lg">{item.category}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-500">Subcategory</label>
          <p className="text-lg">{item.subcategory || "N/A"}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-500">Budgeted Amount</label>
          <p className="text-lg font-bold">{item.formatted_amount}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-500">Spent Amount</label>
          <p className="text-lg">{formatCurrency( currency.code,Number.parseFloat(item.spent_amount))}</p>
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-gray-500">Description</label>
        <p className="mt-1">{item.description}</p>
      </div>

      {item.responsible_person && (
        <div>
          <label className="text-sm font-medium text-gray-500">Responsible Person</label>
          <p className="mt-1">
            {item.responsible_person.full_name} ({item.responsible_person.email})
          </p>
        </div>
      )}

      {item.notes && (
        <div>
          <label className="text-sm font-medium text-gray-500">Notes</label>
          <p className="mt-1">{item.notes}</p>
        </div>
      )}

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Progress:</span>
          <Progress value={Number.parseFloat(item.spent_percentage)} className="w-32" />
          <span className="text-sm font-medium">{item.spent_percentage}%</span>
        </div>
        {item.is_locked && (
          <Badge variant="secondary">
            <Lock className="h-3 w-3 mr-1" />
            Locked
          </Badge>
        )}
      </div>
    </div>
  )
}
