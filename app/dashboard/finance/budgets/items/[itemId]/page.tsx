"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowLeft,
  Edit,
  Plus,
  DollarSign,
  Target,
  Activity,
  User,
  Calendar,
  FileText,
  AlertTriangle,
  CheckCircle,
  Lock,
  Unlock,
} from "lucide-react"
import { useGetBudgetItemByIdQuery } from "@/redux/features/finance/budget-items"
import { useGetOrganizationalExpensesQuery } from "@/redux/features/finance/organizational-expenses"
import { formatCurrency } from "@/lib/currency-utils"
import { BudgetItemEditDialog } from "@/components/finances/budgets/items/budget-item-edit-dialog"
import { ExpenseDialog } from "@/components/finances/budgets/items/expense-dialog"
import { ExpensesList } from "@/components/finances/budgets/items/expense-list"
import { BudgetItemOverview } from "@/components/finances/budgets/items/budget-item-overview"
import { BudgetItemAnalytics } from "@/components/finances/budgets/items/budget-item-analytics"

export default function BudgetItemDetailPage() {
  const params = useParams()
  const router = useRouter()
  const budgetItemId = Number(params.itemId)

  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showExpenseDialog, setShowExpenseDialog] = useState(false)
  const [selectedExpense, setSelectedExpense] = useState<any>(null)

  const {
    data: budgetItem,
    isLoading: budgetItemLoading,
    error: budgetItemError,
    refetch: refetchBudgetItem,
  } = useGetBudgetItemByIdQuery(budgetItemId)

  const {
    data: expenses,
    isLoading: expensesLoading,
    refetch: refetchExpenses,
  } = useGetOrganizationalExpensesQuery({
    budget_item: budgetItemId,
    page_size: 100,
  })

  if (budgetItemLoading) {
    return (
      <div className="space-y-6 p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (budgetItemError || !budgetItem) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-red-500" />
          <h2 className="text-xl font-semibold mb-2">Budget Item Not Found</h2>
          <p className="text-muted-foreground mb-4">
            The budget item you're looking for doesn't exist or you don't have permission to view it.
          </p>
          <Button onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  const handleEditExpense = (expense: any) => {
    setSelectedExpense(expense)
    setShowExpenseDialog(true)
  }

  const handleAddExpense = () => {
    setSelectedExpense(null)
    setShowExpenseDialog(true)
  }

  const handleExpenseDialogClose = () => {
    setSelectedExpense(null)
    setShowExpenseDialog(false)
  }

  const handleDialogSuccess = () => {
    refetchBudgetItem()
    refetchExpenses()
  }

  const getStatusColor = (utilization: number) => {
    if (utilization >= 100) return "text-red-600"
    if (utilization >= 85) return "text-yellow-600"
    return "text-green-600"
  }

  const getStatusIcon = (utilization: number) => {
    if (utilization >= 100) return <AlertTriangle className="h-4 w-4 text-red-500" />
    if (utilization >= 85) return <AlertTriangle className="h-4 w-4 text-yellow-500" />
    return <CheckCircle className="h-4 w-4 text-green-500" />
  }

  const utilization = budgetItem.spent_percentage || 0
  const currencyCode = budgetItem.budget?.currency?.code || "USD"

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Budget
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{budgetItem.category}</h1>
            {budgetItem.subcategory && <p className="text-muted-foreground">{budgetItem.subcategory}</p>}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setShowEditDialog(true)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Item
          </Button>
          <Button onClick={handleAddExpense}>
            <Plus className="h-4 w-4 mr-2" />
            Add Expense
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Budgeted</p>
                <p className="text-2xl font-bold text-blue-900">
                  {formatCurrency(currencyCode, budgetItem.budgeted_amount)}
                </p>
              </div>
              <Target className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Spent (Paid)</p>
                <p className="text-2xl font-bold text-green-900">
                  {formatCurrency(currencyCode, budgetItem.spent_amount)}
                </p>
                <p className="text-xs text-green-600">{budgetItem.spent_percentage}%</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Committed</p>
                <p className="text-2xl font-bold text-orange-900">
                  {formatCurrency(currencyCode, budgetItem.committed_amount)}
                </p>
                <p className="text-xs text-orange-600">{budgetItem.committed_percentage}%</p>
              </div>
              <Activity className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Available</p>
                <p className="text-2xl font-bold text-purple-900">
                  {formatCurrency(currencyCode, budgetItem.truly_available_amount)}
                </p>
                <p className="text-xs text-purple-600">After obligations</p>
              </div>
              <Target className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-yellow-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600">Health</p>
                <div className="flex items-center gap-2">
                  <p className={`text-lg font-bold ${getStatusColor(budgetItem.utilization_percentage || 0)}`}>
                    {budgetItem.budget_health?.replace("_", " ")}
                  </p>
                  {getStatusIcon(budgetItem.utilization_percentage || 0)}
                </div>
                <Progress value={Math.min(budgetItem.utilization_percentage || 0, 100)} className="mt-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Budget Item Details */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Budget Item Details
            </CardTitle>
            <div className="flex items-center gap-2">
              {budgetItem.is_locked ? (
                <Badge variant="destructive" className="gap-1">
                  <Lock className="h-3 w-3" />
                  Locked
                </Badge>
              ) : (
                <Badge variant="default" className="gap-1">
                  <Unlock className="h-3 w-3" />
                  Active
                </Badge>
              )}
              {budgetItem.approval_required_threshold && <Badge variant="secondary">Approval Required</Badge>}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Description</label>
                <p className="mt-1 text-gray-900">{budgetItem.description}</p>
              </div>

              {budgetItem.responsible_person && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Responsible Person</label>
                  <div className="mt-1 flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-900">
                      {budgetItem.responsible_person.first_name} {budgetItem.responsible_person.last_name}
                    </span>
                  </div>
                </div>
              )}

              {budgetItem.approval_required_threshold && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Approval Threshold</label>
                  <p className="mt-1 text-gray-900">
                    {formatCurrency(currencyCode, budgetItem.approval_required_threshold)}
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Budget Information</label>
                <div className="mt-1 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Budget Title:</span>
                    <span className="font-medium">{budgetItem.budget?.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Budget Period:</span>
                    <span className="font-medium">
                      {budgetItem.budget?.start_date} - {budgetItem.budget?.end_date}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Budget:</span>
                    <span className="font-medium">{formatCurrency(currencyCode, budgetItem.budget?.total_amount)}</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">Created</label>
                <div className="mt-1 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-900">{new Date(budgetItem.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              {budgetItem.notes && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Notes</label>
                  <p className="mt-1 text-gray-900">{budgetItem.notes}</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for detailed views */}
      <Tabs defaultValue="expenses" className="space-y-6">
        <TabsList>
          <TabsTrigger value="expenses" className="gap-2">
            <FileText className="h-4 w-4" />
            Expenses ({budgetItem.expenses?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="overview" className="gap-2">
            <Target className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="analytics" className="gap-2">
            <Activity className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="expenses">
          <ExpensesList
            expenses={expenses || []}
            isLoading={expensesLoading}
            onEditExpense={handleEditExpense}
            onAddExpense={handleAddExpense}
            budgetItem={budgetItem}
          />
        </TabsContent>

        <TabsContent value="overview">
          <BudgetItemOverview budgetItem={budgetItem} />
        </TabsContent>

        <TabsContent value="analytics">
          <BudgetItemAnalytics budgetItem={budgetItem} expenses={expenses || []} />
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <BudgetItemEditDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        budgetItem={budgetItem}
        onSuccess={handleDialogSuccess}
      />

      <ExpenseDialog
        open={showExpenseDialog}
        onOpenChange={handleExpenseDialogClose}
        budgetItem={budgetItem}
        expense={selectedExpense}
        onSuccess={handleDialogSuccess}
      />
    </div>
  )
}
