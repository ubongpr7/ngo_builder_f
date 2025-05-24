"use client"

import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Edit, Eye, Calendar, DollarSign } from "lucide-react"
import { AddEditBudgetDialog } from "./add-edit-budget-dialog"
import { usePermissions } from "@/components/permissionHander"
import { useGetLoggedInProfileRolesQuery } from "@/redux/features/profile/readProfileAPISlice"
import { format } from "date-fns"
import type { Budget } from "@/types/finance"

interface BudgetCardProps {
  budget: Budget
  onUpdate?: () => void
}

export function BudgetCard({ budget, onUpdate }: BudgetCardProps) {
  const { data: userRoles } = useGetLoggedInProfileRolesQuery()
  const is_DB_admin = usePermissions(userRoles, { requiredRoles: ["is_DB_admin"], requireKYC: true })

  // Format dates
  const startDate = budget.start_date ? format(new Date(budget.start_date), "MMM d, yyyy") : "N/A"
  const endDate = budget.end_date ? format(new Date(budget.end_date), "MMM d, yyyy") : "N/A"

  // Status badge variant
  const getStatusVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "success"
      case "approved":
        return "success"
      case "pending_approval":
        return "warning"
      case "draft":
        return "secondary"
      case "completed":
        return "default"
      default:
        return "secondary"
    }
  }

  // Calculate spent percentage
  const spentPercentage = budget.spent_percentage || (Number(budget.spent_amount) / Number(budget.total_amount|| 1)) * 100

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <h3 className="font-semibold text-lg line-clamp-1">{budget.title}</h3>
          <Badge variant={getStatusVariant(budget.status) as any}>{budget.status.replace("_", " ")}</Badge>
        </div>

        <div className="mt-3 space-y-2">
          <div className="flex items-center text-sm">
            <Calendar className="h-3.5 w-3.5 mr-1.5 text-gray-500" />
            <span className="text-gray-700">
              {startDate} - {endDate}
            </span>
          </div>

          <div className="flex items-center text-sm">
            <DollarSign className="h-3.5 w-3.5 mr-1.5 text-gray-500" />
            <span className="text-gray-700">${Number(budget.total_amount).toFixed(2)}</span>
          </div>

          {budget.project_title && (
            <div className="text-sm text-gray-700">
              <span className="text-gray-500">Project: </span>
              {budget.project_title}
            </div>
          )}

          {budget.campaign_title && (
            <div className="text-sm text-gray-700">
              <span className="text-gray-500">Campaign: </span>
              {budget.campaign_title}
            </div>
          )}
        </div>

        <div className="mt-4">
          <Progress value={spentPercentage} className="h-2" />
          <div className="flex justify-between mt-1 text-sm">
            <span>${Number(budget.spent_amount).toFixed(2)} spent</span>
            <span className="text-gray-500">${Number(budget.total_amount).toFixed(2)}</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="bg-gray-50 px-4 py-3 border-t flex justify-between">
        <div className="text-sm text-gray-500">
          <Badge variant="outline">{budget.budget_type}</Badge>
        </div>

        <div className="flex space-x-2">
          <Button variant="ghost" size="sm" asChild>
            <a href={`/dashboard/finance/budgets/${budget.id}`}>
              <Eye className="h-4 w-4 mr-1" />
              View
            </a>
          </Button>

          {is_DB_admin && (
            <AddEditBudgetDialog
              budget={budget}
              onSuccess={onUpdate}
              trigger={
                <Button variant="ghost" size="sm">
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
              }
            />
          )}
        </div>
      </CardFooter>
    </Card>
  )
}
