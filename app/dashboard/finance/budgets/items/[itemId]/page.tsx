"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  CheckCircle,
  AlertCircle,
  Lock,
  Unlock,
  DollarSign,
  PieChart,
  BarChart2,
  Activity,
  FileText,
  User,
  CreditCard,
  Calendar,
  TrendingUp
} from "lucide-react";
import { formatCurrencyCompact } from "@/lib/currency-utils";
import { useGetBudgetItemByIdQuery } from "@/redux/features/finance/budget-items"; // Adjust import based on your actual hook
import { BudgetItem } from "@/types/finance";

const BudgetItemDetailPage = () => {
      const params = useParams()
  const itemId = params.itemId as string
    
  const [activeTab, setActiveTab] = useState("overview");
  const { data, isLoading:loading, error } = useGetBudgetItemByIdQuery(Number(itemId));

  if (loading) return <PageSkeleton />;
  if (error) return <div>Error: {error.message}</div>;

  const budgetItem = data as BudgetItem;
  if (!budgetItem) return <div>Budget item not found</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">
          {budgetItem.category} - {budgetItem.subcategory}
        </h1>
        <div className="flex gap-2">
          <Button variant="outline">
            <FileText className="mr-2 h-4 w-4" />
            Reports
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">Actions</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>
                <Edit className="mr-2 h-4 w-4" /> Edit Item
              </DropdownMenuItem>
              <DropdownMenuItem className="text-red-500">
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 w-full max-w-md mb-6">
          <TabsTrigger value="overview">
            <Activity className="mr-2 h-4 w-4" /> Overview
          </TabsTrigger>
          <TabsTrigger value="expenses">
            <CreditCard className="mr-2 h-4 w-4" /> 
            Expenses ({budgetItem.expensesCount})
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <TrendingUp className="mr-2 h-4 w-4" /> Analytics
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <OverviewTab budgetItem={budgetItem} />
        </TabsContent>

        {/* Expenses Tab */}
        <TabsContent value="expenses">
          <ExpensesTab expenses={budgetItem.organizationalExpenses} />
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <AnalyticsTab budgetItem={budgetItem} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Overview Tab Component
const OverviewTab = ({ budgetItem }: { budgetItem: any }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" /> Financial Summary
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between">
            <span>Budgeted Amount:</span>
            <span className="font-semibold">{budgetItem.formattedAmount}</span>
          </div>
          <div className="flex justify-between">
            <span>Spent Amount:</span>
            <span className="font-semibold">
              {formatCurrencyCompact(budgetItem.spentAmount)} ({budgetItem.spentPercentage}%)
            </span>
          </div>
          <div className="flex justify-between">
            <span>Remaining:</span>
            <span className="font-semibold">
              {formatCurrencyCompact(budgetItem.remainingAmount)}
            </span>
          </div>
          <div className="pt-2">
            <div className="flex justify-between mb-1">
              <span>Utilization</span>
              <span>{budgetItem.spentPercentage}%</span>
            </div>
            <div className="h-2.5 bg-gray-200 rounded-full">
              <div 
                className={`h-2.5 rounded-full ${
                  budgetItem.spentPercentage > 80 
                    ? "bg-red-500" 
                    : budgetItem.spentPercentage > 50 
                      ? "bg-yellow-500" 
                      : "bg-green-500"
                }`}
                style={{ width: `${budgetItem.spentPercentage}%` }}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" /> Details
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span>Category:</span>
            <span className="font-medium">{budgetItem.category}</span>
          </div>
          <div className="flex justify-between">
            <span>Subcategory:</span>
            <span className="font-medium">{budgetItem.subcategory}</span>
          </div>
          <div className="flex justify-between">
            <span>Responsible:</span>
            <span className="font-medium">
              {budgetItem.responsiblePerson?.firstName} {budgetItem.responsiblePerson?.lastName}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Approval Threshold:</span>
            <span className="font-medium">
              {formatCurrencyCompact(budgetItem.approvalRequiredThreshold)}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Status:</span>
            <Badge variant={budgetItem.isLocked ? "destructive" : "success"}>
              {budgetItem.isLocked ? (
                <Lock className="mr-1 h-4 w-4" />
              ) : (
                <Unlock className="mr-1 h-4 w-4" />
              )}
              {budgetItem.isLocked ? "Locked" : "Active"}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>

    <Card className="md:col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" /> Notes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-700">
          {budgetItem.notes || "No notes available for this budget item."}
        </p>
      </CardContent>
    </Card>
  </div>
);

// Expenses Tab Component
const ExpensesTab = ({ expenses }: { expenses: any[] }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <CreditCard className="h-5 w-5" /> Organizational Expenses
      </CardTitle>
    </CardHeader>
    <CardContent>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Vendor</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Submitted By</TableHead>
            <TableHead>Approved By</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {expenses.length > 0 ? (
            expenses.map((expense) => (
              <TableRow key={expense.id}>
                <TableCell className="font-medium">{expense.title}</TableCell>
                <TableCell>{expense.vendor}</TableCell>
                <TableCell>{expense.formattedAmount}</TableCell>
                <TableCell>
                  {new Date(expense.expenseDate).toLocaleDateString()}
                </TableCell>
                <TableCell>{expense.expenseType}</TableCell>
                <TableCell>
                  <Badge 
                    variant={
                      expense.status === "APPROVED" ? "success" : 
                      expense.status === "PENDING" ? "warning" : "destructive"
                    }
                  >
                    {expense.status === "APPROVED" ? (
                      <CheckCircle className="mr-1 h-4 w-4" />
                    ) : (
                      <AlertCircle className="mr-1 h-4 w-4" />
                    )}
                    {expense.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {expense.submittedBy?.firstName} {expense.submittedBy?.lastName}
                </TableCell>
                <TableCell>
                  {expense.approvedBy
                    ? `${expense.approvedBy.firstName} ${expense.approvedBy.lastName}`
                    : "Pending"}
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8">
                <div className="text-gray-500">No expenses recorded</div>
                <Button variant="outline" className="mt-4">
                  Add Expense
                </Button>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </CardContent>
  </Card>
);

// Analytics Tab Component
const AnalyticsTab = ({ budgetItem }: { budgetItem: any }) => {
  // Mock data for analytics - replace with real data
  const expenseTrendData = [
    { month: "Jan", amount: 1500 },
    { month: "Feb", amount: 2200 },
    { month: "Mar", amount: 1800 },
    { month: "Apr", amount: 2500 },
    { month: "May", amount: 2100 },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5" /> Budget Allocation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-8">
            <div className="space-y-4 flex-1">
              <div className="flex justify-between">
                <span className="flex items-center">
                  <span className="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
                  Budgeted
                </span>
                <span className="font-semibold">
                  {formatCurrencyCompact(budgetItem.budgetedAmount)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="flex items-center">
                  <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                  Spent
                </span>
                <span className="font-semibold">
                  {formatCurrencyCompact(budgetItem.spentAmount)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="flex items-center">
                  <span className="w-3 h-3 bg-amber-500 rounded-full mr-2"></span>
                  Remaining
                </span>
                <span className="font-semibold">
                  {formatCurrencyCompact(budgetItem.remainingAmount)}
                </span>
              </div>
            </div>
            <div className="relative">
              <div className="w-32 h-32 rounded-full border-8 
                border-blue-500 
                border-t-green-500 
                border-r-green-500 
                border-b-green-500 
                rotate-[135deg]">
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl font-bold rotate-[-135deg]">
                  {budgetItem.spentPercentage}%
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart2 className="h-5 w-5" /> Spending Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {expenseTrendData.map((item, index) => (
              <div key={item.month} className="flex items-center">
                <span className="w-20 font-medium">{item.month}</span>
                <div className="flex-1 flex items-center">
                  <div 
                    className="h-6 bg-blue-500 rounded mr-2"
                    style={{ 
                      width: `${(item.amount / 3000) * 100}%`,
                      maxWidth: "100%"
                    }}
                  ></div>
                  <span>{formatCurrencyCompact(item.amount)}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" /> Key Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border rounded-lg p-4 text-center">
              <div className="text-2xl font-bold">{budgetItem.expensesCount}</div>
              <div className="text-gray-500">Total Expenses</div>
            </div>
            <div className="border rounded-lg p-4 text-center">
              <div className="text-2xl font-bold">
                {formatCurrencyCompact(
                  budgetItem.expensesCount
                    ? budgetItem.spentAmount / budgetItem.expensesCount
                    : 0
                )}
              </div>
              <div className="text-gray-500">Average Expense</div>
            </div>
            <div className="border rounded-lg p-4 text-center">
              <div className="text-2xl font-bold">
                {budgetItem.remainingAmount > 0
                  ? `${Math.floor(
                      (budgetItem.remainingAmount / budgetItem.budgetedAmount) * 100
                    )}%`
                  : "0%"}
              </div>
              <div className="text-gray-500">Remaining Budget</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Loading Skeleton
const PageSkeleton = () => (
  <div className="container mx-auto px-4 py-8">
    <div className="flex justify-between items-center mb-6">
      <Skeleton className="h-9 w-64" />
      <div className="flex gap-2">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-24" />
      </div>
    </div>

    <Tabs defaultValue="overview">
      <TabsList className="grid grid-cols-3 w-full max-w-md mb-6">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </TabsList>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-24" />
          </CardHeader>
          <CardContent className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </Tabs>
  </div>
);

export default BudgetItemDetailPage;