"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Search,
  Plus,
  Filter,
  Download,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  DollarSign,
  Target,
  Activity,
  Building2,
  PieChart,
  BarChart3,
  Zap,
} from "lucide-react"
import { BudgetOverviewDashboard } from "@/components/finances/budgets/dashboard/budget-overview-dashboard"
import { BudgetListTable } from "@/components/finances/budgets/dashboard/budget-list-table"
import { BudgetFiltersPanel } from "@/components/finances/budgets/dashboard/budget-filters-panel"

import { DepartmentBudgetBreakdown } from "@/components/finances/budgets/dashboard/department-budget-breakdown"
import { BudgetUtilizationMatrix } from "@/components/finances/budgets/dashboard/budget-utilization-matrix"
import { AddBudgetDialog } from "@/components/finances/budgets/dashboard/add-budget-dialog"
import { BudgetHealthIndicators } from "@/components/finances/budgets/dashboard/budget-health-indicators"
import { useGetBudgetsQuery, useGetBudgetStatisticsQuery } from "@/redux/features/finance/budgets"
import { ref } from "process"
