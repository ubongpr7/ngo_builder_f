"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  MoreHorizontal,
  Edit,
  Eye,
  Trash2,
  CheckCircle,
  Clock,
  AlertTriangle,
  TrendingUp,
  Activity,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { Budget } from "@/types/finance"

interface BudgetListTableProps {
  budgets: Budget[]
  isLoading: boolean
  onFiltersChange: (filters: any) => void
}

export function BudgetListTable({ budgets, isLoading, onFiltersChange }: BudgetListTableProps) {
  const [sortField, setSortField] = useState<string>("created_at")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")

  const handleSort = (field: string) => {
    const direction = sortField === field && sortDirection === "asc" ? "desc" : "asc"
    setSortField(field)
    setSortDirection(direction)
    onFiltersChange({ ordering: direction === "desc" ? `-${field}` : field })
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { color: "bg-gray-100 text-gray-800", icon: Edit },
      pending_approval: { color: "bg-yellow-100 text-yellow-800", icon: Clock },
      approved: { color: "bg-blue-100 text-blue-800", icon: CheckCircle },
      active: { color: "bg-green-100 text-green-800", icon: Activity },
      completed: { color: "bg-purple-100 text-purple-800", icon: CheckCircle },
      cancelled: { color: "bg-red-100 text-red-800", icon: AlertTriangle },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft
    const Icon = config.icon

    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {status.replace("_", " ").toUpperCase()}
      </Badge>
    )
  }

  const getUtilizationColor = (percentage: number) => {
    if (percentage >= 90) return "text-red-600"
    if (percentage >= 75) return "text-yellow-600"
    return "text-green-600"
  }

  const getUtilizationIcon = (percentage: number) => {
    if (percentage >= 90) return <AlertTriangle className="h-4 w-4 text-red-500" />
    if (percentage >= 75) return <TrendingUp className="h-4 w-4 text-yellow-500" />
    return <Activity className="h-4 w-4 text-green-500" />
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Budget Portfolio ({budgets.length})</span>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Activity className="h-4 w-4" />
            Real-time tracking enabled
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="cursor-pointer hover:bg-gray-50" onClick={() => handleSort("title")}>
                  Budget Title
                </TableHead>
                <TableHead className="cursor-pointer hover:bg-gray-50" onClick={() => handleSort("budget_type")}>
                  Type
                </TableHead>
                <TableHead className="cursor-pointer hover:bg-gray-50" onClick={() => handleSort("total_amount")}>
                  Total Amount
                </TableHead>
                <TableHead>Utilization</TableHead>
                <TableHead className="cursor-pointer hover:bg-gray-50" onClick={() => handleSort("status")}>
                  Status
                </TableHead>
                <TableHead>Department</TableHead>
                <TableHead className="cursor-pointer hover:bg-gray-50" onClick={() => handleSort("start_date")}>
                  Period
                </TableHead>
                <TableHead>Health</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {budgets.map((budget) => {
                const utilizationPercentage = Number.parseFloat(budget.spent_percentage)
                const isOverBudget = utilizationPercentage > 100
                const isNearLimit = utilizationPercentage > 85

                return (
                  <TableRow key={budget.id} className="hover:bg-gray-50">
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium">{budget.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {budget.fiscal_year && `FY ${budget.fiscal_year}`}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge variant="outline">{budget.budget_type.replace("_", " ").toUpperCase()}</Badge>
                    </TableCell>

                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium">{budget.formatted_amount}</div>
                        <div className="text-sm text-muted-foreground">
                          Spent: ${Number.parseFloat(budget.spent_amount).toLocaleString()}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className={`text-sm font-medium ${getUtilizationColor(utilizationPercentage)}`}>
                            {utilizationPercentage.toFixed(1)}%
                          </span>
                          {getUtilizationIcon(utilizationPercentage)}
                        </div>
                        <Progress value={Math.min(utilizationPercentage, 100)} className="h-2" />
                        {isOverBudget && (
                          <div className="text-xs text-red-600 font-medium">
                            Over budget by $
                            {(
                              Number.parseFloat(budget.spent_amount) - Number.parseFloat(budget.total_amount)
                            ).toLocaleString()}
                          </div>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>{getStatusBadge(budget.status)}</TableCell>

                    <TableCell>
                      <div className="text-sm">{budget.department?.name || "Unassigned"}</div>
                    </TableCell>

                    <TableCell>
                      <div className="text-sm space-y-1">
                        <div>{new Date(budget.start_date).toLocaleDateString()}</div>
                        <div className="text-muted-foreground">to {new Date(budget.end_date).toLocaleDateString()}</div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-2">
                        {isOverBudget ? (
                          <Badge className="bg-red-100 text-red-800">Critical</Badge>
                        ) : isNearLimit ? (
                          <Badge className="bg-yellow-100 text-yellow-800">Warning</Badge>
                        ) : (
                          <Badge className="bg-green-100 text-green-800">Healthy</Badge>
                        )}
                      </div>
                    </TableCell>

                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Budget
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Activity className="mr-2 h-4 w-4" />
                            View Analytics
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>

        {budgets.length === 0 && (
          <div className="text-center py-12">
            <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No budgets found</h3>
            <p className="text-muted-foreground mb-4">
              Create your first budget to start tracking expenses and allocations.
            </p>
            <Button>Create Budget</Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
