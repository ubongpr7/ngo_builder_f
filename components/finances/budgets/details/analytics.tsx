"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, Label
} from "recharts"
import { 
  DollarSign, PieChartIcon, BarChartIcon, Activity, 
  Calendar, TrendingUp, AlertTriangle, Wallet, ArrowDownUp 
} from "lucide-react"
import type { Budget } from "@/types/finance"
import { formatCurrency, formatPercentage } from "@/lib/currency-utils"
import { formatDate } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"

interface BudgetInsightsProps {
  budget: Budget | null
  isLoading?: boolean
}

// Define color palettes for consistent visualization
const COLOR_PALETTE = {
  primary: "#3b82f6",
  secondary: "#10b981",
  warning: "#f59e0b",
  danger: "#ef4444",
  gray: "#9ca3af",
  funding: ["#6366f1", "#8b5cf6", "#ec4899", "#f43f5e", "#f97316"],
  expense: ["#06b6d4", "#0ea5e9", "#3b82f6", "#6366f1", "#8b5cf6"]
}

export function BudgetInsights({ budget, isLoading = false }: BudgetInsightsProps) {
  const [activeTab, setActiveTab] = useState("overview")
  
  // Process data for visualizations
  const processedData = useMemo(() => {
    if (!budget) return null
    
    // Funding breakdown by source type
    const fundingByType = budget.funding_breakdown?.reduce((acc, item) => {
      const existing = acc.find(i => i.source_type === item.source_type)
      if (existing) {
        existing.total_amount += item.total_amount
      } else {
        acc.push({
          source_type: item.source_type,
          source_type_display: item.source_type_display,
          total_amount: item.total_amount,
          count: 1
        })
      }
      return acc
    }, [] as any[]) || []
    
    // Expense summary by category
    const expensesByCategory = budget.expense_summary?.map(expense => ({
      name: expense.expense_type_display,
      value: expense.total_amount,
      count: expense.count
    })) || []
    
    // Budget timeline analysis
    const today = new Date()
    const startDate = new Date(budget.start_date)
    const endDate = new Date(budget.end_date)
    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24))
    const elapsedDays = Math.ceil((today.getTime() - startDate.getTime()) / (1000 * 3600 * 24))
    const remainingDays = Math.max(0, totalDays - elapsedDays)
    const progressPercentage = Math.min(100, Math.max(0, (elapsedDays / totalDays) * 100))
    
    // Burn rate analysis
    const idealBurnRate = budget.total_amount / totalDays
    const actualBurnRate = budget.spent_amount / elapsedDays
    const projectedSpend = actualBurnRate * totalDays
    const variance = projectedSpend - budget.total_amount
    
    return {
      fundingByType,
      expensesByCategory,
      timeline: {
        totalDays,
        elapsedDays,
        remainingDays,
        progressPercentage
      },
      burnRate: {
        ideal: idealBurnRate,
        actual: actualBurnRate,
        projectedSpend,
        variance,
        isOverBudget: projectedSpend > budget.total_amount
      },
      health: budget.budget_health
    }
  }, [budget])
  
  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border rounded-md shadow-lg">
          <p className="font-bold">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {formatCurrency(budget?.currency?.code || "USD", entry.value)}
            </p>
          ))}
        </div>
      )
    }
    return null
  }
  
  // Loading state
  if (isLoading || !budget) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }
  
  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
            <Wallet className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(budget.currency.code, budget.total_amount)}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {formatDate(budget.start_date)} - {formatDate(budget.end_date)}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Spent Amount</CardTitle>
            <ArrowDownUp className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(budget.currency.code, budget.spent_amount)}
            </div>
            <div className="flex items-center mt-1">
              <Progress 
                value={budget.spent_percentage} 
                className="h-2 w-full mr-2"
                indicatorClassName={budget.spent_percentage > 90 ? "bg-red-500" : 
                  budget.spent_percentage > 75 ? "bg-orange-500" : "bg-blue-500"}
              />
              <span className="text-xs text-gray-500">
                {formatPercentage(budget.spent_percentage)}
              </span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Funding Received</CardTitle>
            <DollarSign className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(budget.currency.code, budget.total_funding_allocated)}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {budget.funding_sources_count} sources • {formatPercentage(
                (budget.total_funding_allocated / budget.total_amount) * 100
              )} funded
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Budget Health</CardTitle>
            <Activity className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full mr-2 ${
                budget.budget_health?.health_status === "critical" ? "bg-red-500" :
                budget.budget_health?.health_status === "warning" ? "bg-orange-500" :
                budget.budget_health?.health_status === "underutilized" ? "bg-blue-500" :
                "bg-green-500"
              }`} />
              <div className="text-2xl font-bold capitalize">
                {budget.budget_health?.health_status || "Healthy"}
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {budget.budget_health?.days_remaining} days remaining
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Main Visualization Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 md:grid-cols-5">
          <TabsTrigger value="overview">
            <Activity className="h-4 w-4 mr-2" /> Overview
          </TabsTrigger>
          <TabsTrigger value="funding">
            <DollarSign className="h-4 w-4 mr-2" /> Funding
          </TabsTrigger>
          <TabsTrigger value="expenses">
            <ArrowDownUp className="h-4 w-4 mr-2" /> Expenses
          </TabsTrigger>
          <TabsTrigger value="timeline">
            <Calendar className="h-4 w-4 mr-2" /> Timeline
          </TabsTrigger>
          <TabsTrigger value="forecast">
            <TrendingUp className="h-4 w-4 mr-2" /> Forecast
          </TabsTrigger>
        </TabsList>
        
        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Budget Health Overview</CardTitle>
              <CardDescription>
                Comprehensive view of your budget's financial health and performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Budget Utilization Gauge */}
                <div className="space-y-4">
                  <h3 className="font-medium">Budget Utilization</h3>
                  <div className="relative w-full h-64 flex items-center justify-center">
                    <div className="absolute w-48 h-48 rounded-full border-8 border-gray-200"></div>
                    <div 
                      className="absolute w-48 h-48 rounded-full border-8 border-blue-500" 
                      style={{
                        clipPath: `inset(0 0 ${100 - budget.spent_percentage}% 0)`,
                        transform: "rotate(-90deg)"
                      }}
                    ></div>
                    <div className="text-center">
                      <div className="text-3xl font-bold">
                        {formatPercentage(budget.spent_percentage)}
                      </div>
                      <div className="text-gray-500">Utilized</div>
                      <div className="mt-2 text-sm">
                        {formatCurrency(budget.currency.code, budget.remaining_amount)} remaining
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Key Metrics */}
                <div className="space-y-6">
                  <div>
                    <h3 className="font-medium mb-2">Funding Coverage</h3>
                    <div className="h-6 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-green-500"
                        style={{ 
                          width: `${(budget.total_funding_allocated / budget.total_amount) * 100}%` 
                        }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-sm mt-1">
                      <span>0%</span>
                      <span>
                        {formatPercentage((budget.total_funding_allocated / budget.total_amount) * 100)} funded
                      </span>
                      <span>100%</span>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-2">Time Progress</h3>
                    <div className="h-6 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500"
                        style={{ width: `${processedData?.timeline.progressPercentage || 0}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-sm mt-1">
                      <span>Start</span>
                      <span>
                        {processedData?.timeline.elapsedDays} of {processedData?.timeline.totalDays} days
                      </span>
                      <span>End</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <Card className="bg-green-50 border-green-200">
                      <CardHeader className="p-4">
                        <CardTitle className="text-lg text-green-800">
                          {formatCurrency(budget.currency.code, budget.remaining_amount)}
                        </CardTitle>
                        <CardDescription className="text-green-700">
                          Funds Remaining
                        </CardDescription>
                      </CardHeader>
                    </Card>
                    
                    <Card className={budget.budget_health?.is_overbudget ? "bg-red-50 border-red-200" : "bg-blue-50 border-blue-200"}>
                      <CardHeader className="p-4">
                        <CardTitle className={`text-lg ${budget.budget_health?.is_overbudget ? "text-red-800" : "text-blue-800"}`}>
                          {formatCurrency(budget.currency.code, budget.budget_health?.funding_gap || 0)}
                        </CardTitle>
                        <CardDescription className={budget.budget_health?.is_overbudget ? "text-red-700" : "text-blue-700"}>
                          {budget.budget_health?.is_overbudget ? "Over Budget" : "Funding Gap"}
                        </CardDescription>
                      </CardHeader>
                    </Card>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Funding Tab */}
        <TabsContent value="funding" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Funding Sources</CardTitle>
              <CardDescription>
                Breakdown of funding sources allocated to this budget
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Funding by Type */}
                <div>
                  <h3 className="font-medium mb-4">By Funding Type</h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={processedData?.fundingByType || []}
                          cx="50%"
                          cy="50%"
                          labelLine={true}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="total_amount"
                          nameKey="source_type_display"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {processedData?.fundingByType?.map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={COLOR_PALETTE.funding[index % COLOR_PALETTE.funding.length]} 
                            />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => formatCurrency(budget.currency.code, value as number)} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                
                {/* Top Funding Sources */}
                <div>
                  <h3 className="font-medium mb-4">Top Funding Sources</h3>
                  <div className="space-y-4">
                    {budget.funding_sources_summary?.slice(0, 5).map((source, index) => (
                      <div key={source.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ 
                              backgroundColor: COLOR_PALETTE.funding[index % COLOR_PALETTE.funding.length] 
                            }} 
                          />
                          <div>
                            <div className="font-medium">{source.name}</div>
                            <div className="text-sm text-gray-500">
                              {source.funding_type_display}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">
                            {formatCurrency(source.currency_code, source.amount_allocated)}
                          </div>
                          <div className="text-sm text-gray-500">
                            {formatPercentage((source.amount_allocated / budget.total_amount) * 100)} of budget
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Expenses Tab */}
        <TabsContent value="expenses" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Expense Analysis</CardTitle>
              <CardDescription>
                Breakdown of expenses by category and type
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Expenses by Category */}
                <div>
                  <h3 className="font-medium mb-4">By Expense Category</h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={processedData?.expensesByCategory || []}
                        margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" angle={-45} textAnchor="end" height={60} />
                        <YAxis 
                          tickFormatter={(value) => formatCurrency(budget.currency.code, value, true)} 
                        />
                        <Tooltip 
                          formatter={(value) => formatCurrency(budget.currency.code, value as number)}
                          labelFormatter={(label) => `Category: ${label}`}
                        />
                        <Legend />
                        <Bar 
                          dataKey="value" 
                          name="Amount Spent"
                          fill={COLOR_PALETTE.primary}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                
                {/* Expense Distribution */}
                <div>
                  <h3 className="font-medium mb-4">Expense Distribution</h3>
                  <div className="space-y-4">
                    {processedData?.expensesByCategory.map((category, index) => (
                      <div key={category.name} className="space-y-2">
                        <div className="flex justify-between">
                          <span className="font-medium">{category.name}</span>
                          <span>
                            {formatCurrency(budget.currency.code, category.value)}
                            <span className="text-gray-500 ml-2">
                              ({formatPercentage((category.value / budget.spent_amount) * 100)})
                            </span>
                          </span>
                        </div>
                        <Progress 
                          value={(category.value / budget.spent_amount) * 100} 
                          className="h-2"
                          indicatorClassName="bg-blue-500"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Timeline Tab */}
        <TabsContent value="timeline" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Budget Timeline</CardTitle>
              <CardDescription>
                Progress and spending over the budget period
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Timeline Visualization */}
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { 
                          name: "Elapsed", 
                          days: processedData?.timeline.elapsedDays,
                          spent: budget.spent_amount,
                          remaining: budget.remaining_amount
                        },
                        { 
                          name: "Remaining", 
                          days: processedData?.timeline.remainingDays,
                          spent: 0,
                          remaining: budget.remaining_amount
                        }
                      ]}
                      layout="vertical"
                      margin={{ top: 20, right: 30, left: 40, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis type="category" dataKey="name" />
                      <Tooltip 
                        formatter={(value, name) => {
                          if (name === "spent") {
                            return [formatCurrency(budget.currency.code, value as number), "Spent"]
                          }
                          if (name === "remaining") {
                            return [formatCurrency(budget.currency.code, value as number), "Remaining"]
                          }
                          return [value, "Days"]
                        }}
                      />
                      <Legend />
                      <Bar dataKey="days" name="Days" fill={COLOR_PALETTE.gray} />
                      <Bar dataKey="spent" name="Amount Spent" fill={COLOR_PALETTE.primary} />
                      <Bar dataKey="remaining" name="Amount Remaining" fill={COLOR_PALETTE.secondary} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                
                {/* Time Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="p-4">
                      <CardTitle className="text-lg">
                        {processedData?.timeline.elapsedDays}
                      </CardTitle>
                      <CardDescription>Days Elapsed</CardDescription>
                    </CardHeader>
                  </Card>
                  
                  <Card>
                    <CardHeader className="p-4">
                      <CardTitle className="text-lg">
                        {processedData?.timeline.remainingDays}
                      </CardTitle>
                      <CardDescription>Days Remaining</CardDescription>
                    </CardHeader>
                  </Card>
                  
                  <Card>
                    <CardHeader className="p-4">
                      <CardTitle className="text-lg">
                        {formatPercentage(processedData?.timeline.progressPercentage || 0)}
                      </CardTitle>
                      <CardDescription>Time Progress</CardDescription>
                    </CardHeader>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Forecast Tab */}
        <TabsContent value="forecast" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Budget Forecast</CardTitle>
              <CardDescription>
                Projected spending based on current trends
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Burn Rate Analysis */}
                <div className="space-y-4">
                  <h3 className="font-medium">Burn Rate Analysis</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardHeader className="p-4">
                        <CardTitle className="text-lg">
                          {formatCurrency(budget.currency.code, processedData?.burnRate.actual || 0)}
                        </CardTitle>
                        <CardDescription>Daily Burn Rate</CardDescription>
                      </CardHeader>
                    </Card>
                    
                    <Card>
                      <CardHeader className="p-4">
                        <CardTitle className="text-lg">
                          {formatCurrency(budget.currency.code, processedData?.burnRate.ideal || 0)}
                        </CardTitle>
                        <CardDescription>Ideal Daily Rate</CardDescription>
                      </CardHeader>
                    </Card>
                    
                    <Card className={processedData?.burnRate.isOverBudget ? "bg-red-50 border-red-200" : "bg-green-50 border-green-200"}>
                      <CardHeader className="p-4">
                        <CardTitle className={`text-lg ${processedData?.burnRate.isOverBudget ? "text-red-800" : "text-green-800"}`}>
                          {formatCurrency(budget.currency.code, Math.abs(processedData?.burnRate.variance || 0))}
                          {processedData?.burnRate.variance && processedData.burnRate.variance > 0 ? "+" : ""}
                        </CardTitle>
                        <CardDescription>
                          {processedData?.burnRate.isOverBudget ? "Over Budget Projection" : "Under Budget Projection"}
                        </CardDescription>
                      </CardHeader>
                    </Card>
                  </div>
                </div>
                
                {/* Projection Chart */}
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { 
                          name: "Projected", 
                          amount: processedData?.burnRate.projectedSpend,
                          type: "Projected",
                          fill: processedData?.burnRate.isOverBudget ? COLOR_PALETTE.danger : COLOR_PALETTE.secondary
                        },
                        { 
                          name: "Budget", 
                          amount: budget.total_amount,
                          type: "Budget",
                          fill: COLOR_PALETTE.primary
                        }
                      ]}
                      margin={{ top: 20, right: 30, left: 40, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis 
                        tickFormatter={(value) => formatCurrency(budget.currency.code, value, true)} 
                      />
                      <Tooltip 
                        formatter={(value) => formatCurrency(budget.currency.code, value as number)}
                        labelFormatter={(label) => label}
                      />
                      <Bar dataKey="amount" name="Amount">
                        {[
                          { 
                            amount: processedData?.burnRate.projectedSpend, 
                            fill: processedData?.burnRate.isOverBudget ? COLOR_PALETTE.danger : COLOR_PALETTE.secondary
                          },
                          { 
                            amount: budget.total_amount, 
                            fill: COLOR_PALETTE.primary
                          }
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                      <Legend />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                
                {/* Recommendations */}
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-blue-700 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-blue-900">Budget Recommendations</h4>
                      <div className="mt-2 space-y-2 text-sm text-blue-800">
                        {processedData?.burnRate.isOverBudget ? (
                          <>
                            <p>• Your current spending rate projects a budget overrun of {
                              formatCurrency(budget.currency.code, processedData?.burnRate.variance || 0)
                            }</p>
                            <p>• Consider reducing expenses by {
                              formatCurrency(budget.currency.code, (processedData?.burnRate.variance || 0) / processedData?.timeline.remainingDays)
                            } per day</p>
                            <p>• Review expenses in high-spend categories</p>
                          </>
                        ) : (
                          <>
                            <p>• Your spending is currently under budget projections</p>
                            <p>• You have {
                              formatCurrency(budget.currency.code, Math.abs(processedData?.burnRate.variance || 0))
                            } available for additional initiatives</p>
                            <p>• Consider accelerating high-priority projects</p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}