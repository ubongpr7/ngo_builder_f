"use client"

import { useState, useEffect } from "react"
import type { Budget, BudgetStatistics, BudgetFilters, PaginatedResponse } from "../types/finance"

// Mock data for demonstration
const mockBudgets: Budget[] = [
  {
    id: 1,
    title: "Education Program 2024",
    budget_type: "program",
    project: { id: 1, title: "Rural Education Initiative" },
    department: { id: 1, name: "Education Department" },
    total_amount: 150000,
    currency: { id: 1, code: "USD", name: "US Dollar" },
    spent_amount: 87500,
    remaining_amount: 62500,
    spent_percentage: 58.33,
    formatted_amount: "USD 150,000",
    fiscal_year: "2024",
    start_date: "2024-01-01",
    end_date: "2024-12-31",
    status: "active",
    notes: "Primary education program for rural communities",
    created_by: {
      id: 1,
      username: "john.doe",
      email: "john.doe@destinybuilders.africa",
      first_name: "John",
      last_name: "Doe",
      full_name: "John Doe",
    },
    approved_by: {
      id: 2,
      username: "jane.smith",
      email: "jane.smith@destinybuilders.africa",
      first_name: "Jane",
      last_name: "Smith",
      full_name: "Jane Smith",
    },
    approved_at: "2024-01-15T10:30:00Z",
    created_at: "2024-01-10T09:00:00Z",
    updated_at: "2024-01-15T10:30:00Z",
    total_funding_allocated: 150000,
    items: [
      {
        id: 1,
        category: "Personnel",
        subcategory: "Teachers",
        description: "Teacher salaries and benefits",
        budgeted_amount: 80000,
        spent_amount: 45000,
        remaining_amount: 35000,
        spent_percentage: 56.25,
        formatted_amount: "USD 80,000",
        is_locked: false,
        responsible_person: {
          id: 3,
          username: "mary.johnson",
          email: "mary.johnson@destinybuilders.africa",
          first_name: "Mary",
          last_name: "Johnson",
          full_name: "Mary Johnson",
        },
        created_at: "2024-01-10T09:00:00Z",
        updated_at: "2024-01-15T10:30:00Z",
      },
      {
        id: 2,
        category: "Materials",
        subcategory: "Books",
        description: "Educational materials and textbooks",
        budgeted_amount: 30000,
        spent_amount: 18500,
        remaining_amount: 11500,
        spent_percentage: 61.67,
        formatted_amount: "USD 30,000",
        is_locked: false,
        created_at: "2024-01-10T09:00:00Z",
        updated_at: "2024-01-15T10:30:00Z",
      },
      {
        id: 3,
        category: "Infrastructure",
        description: "Classroom construction and renovation",
        budgeted_amount: 40000,
        spent_amount: 24000,
        remaining_amount: 16000,
        spent_percentage: 60.0,
        formatted_amount: "USD 40,000",
        is_locked: false,
        created_at: "2024-01-10T09:00:00Z",
        updated_at: "2024-01-15T10:30:00Z",
      },
    ],
    budget_funding: [
      {
        id: 1,
        funding_source: {
          id: 1,
          name: "Gates Foundation Grant",
          funding_type: "grant",
          amount_available: 200000,
          currency: { id: 1, code: "USD", name: "US Dollar" },
        },
        amount_allocated: 100000,
        allocation_date: "2024-01-15T10:30:00Z",
      },
      {
        id: 2,
        funding_source: {
          id: 2,
          name: "Community Donations",
          funding_type: "donation",
          amount_available: 75000,
          currency: { id: 1, code: "USD", name: "US Dollar" },
        },
        amount_allocated: 50000,
        allocation_date: "2024-01-15T10:30:00Z",
      },
    ],
    funding_breakdown: [
      {
        source: "Gates Foundation Grant",
        type: "Grant",
        amount: 100000,
        currency: "USD",
        percentage: 66.67,
      },
      {
        source: "Community Donations",
        type: "Donation",
        amount: 50000,
        currency: "USD",
        percentage: 33.33,
      },
    ],
  },
  {
    id: 2,
    title: "Healthcare Outreach 2024",
    budget_type: "project",
    project: { id: 2, title: "Mobile Health Clinics" },
    department: { id: 2, name: "Health Department" },
    total_amount: 200000,
    currency: { id: 1, code: "USD", name: "US Dollar" },
    spent_amount: 195000,
    remaining_amount: 5000,
    spent_percentage: 97.5,
    formatted_amount: "USD 200,000",
    fiscal_year: "2024",
    start_date: "2024-01-01",
    end_date: "2024-12-31",
    status: "active",
    notes: "Mobile healthcare services for remote areas",
    created_by: {
      id: 4,
      username: "dr.wilson",
      email: "dr.wilson@destinybuilders.africa",
      first_name: "Dr. Sarah",
      last_name: "Wilson",
      full_name: "Dr. Sarah Wilson",
    },
    approved_by: {
      id: 2,
      username: "jane.smith",
      email: "jane.smith@destinybuilders.africa",
      first_name: "Jane",
      last_name: "Smith",
      full_name: "Jane Smith",
    },
    approved_at: "2024-01-20T14:00:00Z",
    created_at: "2024-01-18T11:00:00Z",
    updated_at: "2024-01-20T14:00:00Z",
    total_funding_allocated: 200000,
    items: [
      {
        id: 4,
        category: "Medical Supplies",
        description: "Medicines and medical equipment",
        budgeted_amount: 120000,
        spent_amount: 118000,
        remaining_amount: 2000,
        spent_percentage: 98.33,
        formatted_amount: "USD 120,000",
        is_locked: false,
        responsible_person: {
          id: 5,
          username: "nurse.adams",
          email: "nurse.adams@destinybuilders.africa",
          first_name: "Lisa",
          last_name: "Adams",
          full_name: "Lisa Adams",
        },
        created_at: "2024-01-18T11:00:00Z",
        updated_at: "2024-01-20T14:00:00Z",
      },
      {
        id: 5,
        category: "Transportation",
        description: "Vehicle maintenance and fuel",
        budgeted_amount: 50000,
        spent_amount: 48000,
        remaining_amount: 2000,
        spent_percentage: 96.0,
        formatted_amount: "USD 50,000",
        is_locked: false,
        created_at: "2024-01-18T11:00:00Z",
        updated_at: "2024-01-20T14:00:00Z",
      },
      {
        id: 6,
        category: "Personnel",
        subcategory: "Medical Staff",
        description: "Healthcare worker salaries",
        budgeted_amount: 30000,
        spent_amount: 29000,
        remaining_amount: 1000,
        spent_percentage: 96.67,
        formatted_amount: "USD 30,000",
        is_locked: false,
        created_at: "2024-01-18T11:00:00Z",
        updated_at: "2024-01-20T14:00:00Z",
      },
    ],
    budget_funding: [
      {
        id: 3,
        funding_source: {
          id: 3,
          name: "WHO Emergency Fund",
          funding_type: "grant",
          amount_available: 300000,
          currency: { id: 1, code: "USD", name: "US Dollar" },
        },
        amount_allocated: 150000,
        allocation_date: "2024-01-20T14:00:00Z",
      },
      {
        id: 4,
        funding_source: {
          id: 4,
          name: "Local Government Support",
          funding_type: "government",
          amount_available: 100000,
          currency: { id: 1, code: "USD", name: "US Dollar" },
        },
        amount_allocated: 50000,
        allocation_date: "2024-01-20T14:00:00Z",
      },
    ],
    funding_breakdown: [
      {
        source: "WHO Emergency Fund",
        type: "Grant",
        amount: 150000,
        currency: "USD",
        percentage: 75.0,
      },
      {
        source: "Local Government Support",
        type: "Government",
        amount: 50000,
        currency: "USD",
        percentage: 25.0,
      },
    ],
  },
]

const mockStatistics: BudgetStatistics = {
  total_budgets: 12,
  total_allocated: 2500000,
  total_spent: 1875000,
  by_type: [
    { budget_type: "program", count: 5, total_amount: 1200000, spent_amount: 900000 },
    { budget_type: "project", count: 4, total_amount: 800000, spent_amount: 650000 },
    { budget_type: "organizational", count: 2, total_amount: 300000, spent_amount: 225000 },
    { budget_type: "emergency", count: 1, total_amount: 200000, spent_amount: 100000 },
  ],
  by_status: [
    { status: "active", count: 8, total_amount: 2000000, spent_amount: 1500000 },
    { status: "approved", count: 2, total_amount: 300000, spent_amount: 0 },
    { status: "completed", count: 2, total_amount: 200000, spent_amount: 200000 },
  ],
  utilization_summary: [
    {
      budget_id: 1,
      budget_title: "Education Program 2024",
      budget_type: "program",
      total_amount: 150000,
      spent_amount: 87500,
      remaining_amount: 62500,
      utilization_percentage: 58.33,
      currency_code: "USD",
    },
    {
      budget_id: 2,
      budget_title: "Healthcare Outreach 2024",
      budget_type: "project",
      total_amount: 200000,
      spent_amount: 195000,
      remaining_amount: 5000,
      utilization_percentage: 97.5,
      currency_code: "USD",
    },
  ],
}

export function useBudgets(filters: BudgetFilters = {}) {
  const [budgets, setBudgets] = useState<PaginatedResponse<Budget>>({
    count: 0,
    results: [],
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchBudgets = async () => {
      setLoading(true)
      try {
        // Simulate API call delay
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Filter mock data based on filters
        let filteredBudgets = [...mockBudgets]

        if (filters.search) {
          filteredBudgets = filteredBudgets.filter(
            (budget) =>
              budget.title.toLowerCase().includes(filters.search!.toLowerCase()) ||
              budget.notes?.toLowerCase().includes(filters.search!.toLowerCase()),
          )
        }

        if (filters.budget_type && filters.budget_type !== "all") {
          filteredBudgets = filteredBudgets.filter((budget) => budget.budget_type === filters.budget_type)
        }

        if (filters.status && filters.status !== "all") {
          filteredBudgets = filteredBudgets.filter((budget) => budget.status === filters.status)
        }

        if (filters.fiscal_year && filters.fiscal_year !== "all") {
          filteredBudgets = filteredBudgets.filter((budget) => budget.fiscal_year === filters.fiscal_year)
        }

        setBudgets({
          count: filteredBudgets.length,
          results: filteredBudgets,
        })
        setError(null)
      } catch (err) {
        setError("Failed to fetch budgets")
      } finally {
        setLoading(false)
      }
    }

    fetchBudgets()
  }, [filters])

  return { budgets, loading, error }
}

export function useBudgetById(id: number) {
  const [budget, setBudget] = useState<Budget | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchBudget = async () => {
      setLoading(true)
      try {
        // Simulate API call delay
        await new Promise((resolve) => setTimeout(resolve, 800))

        const foundBudget = mockBudgets.find((b) => b.id === id)
        if (foundBudget) {
          setBudget(foundBudget)
          setError(null)
        } else {
          setError("Budget not found")
        }
      } catch (err) {
        setError("Failed to fetch budget")
      } finally {
        setLoading(false)
      }
    }

    fetchBudget()
  }, [id])

  return { budget, loading, error }
}

export function useBudgetStatistics() {
  const [statistics, setStatistics] = useState<BudgetStatistics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStatistics = async () => {
      setLoading(true)
      try {
        // Simulate API call delay
        await new Promise((resolve) => setTimeout(resolve, 600))

        setStatistics(mockStatistics)
        setError(null)
      } catch (err) {
        setError("Failed to fetch statistics")
      } finally {
        setLoading(false)
      }
    }

    fetchStatistics()
  }, [])

  return { statistics, loading, error }
}
