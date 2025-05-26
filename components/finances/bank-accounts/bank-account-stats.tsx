"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { Building, DollarSign, TrendingUp, CreditCard, AlertTriangle, CheckCircle, Activity } from "lucide-react"
import type { BankAccount } from "@/types/finance"
import { formatCurrency } from "@/lib/currency-utils"

interface BankAccountStatsProps {
  accounts: BankAccount[]
}

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#84cc16", "#f97316"]

export function BankAccountStats({ accounts }: BankAccountStatsProps) {
  // Calculate statistics
  const totalAccounts = accounts.length
  const activeAccounts = accounts.filter((acc) => acc.is_active).length
  const donationAccounts = accounts.filter((acc) => acc.accepts_donations).length
  const restrictedAccounts = accounts.filter((acc) => acc.is_restricted).length

  // Group balances by currency instead of mixing them
  const currencyBalances = accounts
    .filter((acc) => acc.is_active)
    .reduce(
      (acc, account) => {
        const currency = account.currency.code
        const balance = Number.parseFloat(account.current_balance)
        if (!acc[currency]) {
          acc[currency] = { total: 0, count: 0 }
        }
        acc[currency].total += balance
        acc[currency].count += 1
        return acc
      },
      {} as Record<string, { total: number; count: number }>,
    )

  // Format currency balances for display
  const formattedCurrencyBalances = Object.entries(currencyBalances).map(([currency, data]) => ({
    currency,
    formatted: formatCurrency(currency, data.total),
    total: data.total,
    count: data.count,
  }))

  // Account type distribution
  const accountTypeData = accounts.reduce(
    (acc, account) => {
      const type = account.account_type.replace("_", " ").toUpperCase()
      acc[type] = (acc[type] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const typeChartData = Object.entries(accountTypeData).map(([type, count]) => ({
    type,
    count,
    percentage: ((count / totalAccounts) * 100).toFixed(1),
  }))

  // Currency distribution with proper formatting
  const currencyData = accounts.reduce(
    (acc, account) => {
      const currency = account.currency.code
      const balance = Number.parseFloat(account.current_balance)
      if (!acc[currency]) {
        acc[currency] = { count: 0, balance: 0 }
      }
      acc[currency].count += 1
      acc[currency].balance += balance
      return acc
    },
    {} as Record<string, { count: number; balance: number }>,
  )

  const currencyChartData = Object.entries(currencyData).map(([currency, data]) => ({
    currency,
    count: data.count,
    balance: data.balance,
    formattedBalance: formatCurrency(currency, data.balance),
  }))

  // Institution distribution
  const institutionData = accounts.reduce(
    (acc, account) => {
      const institution = account.financial_institution.name
      acc[institution] = (acc[institution] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const institutionChartData = Object.entries(institutionData).map(([institution, count]) => ({
    institution: institution.length > 25 ? institution.substring(0, 25) + "..." : institution,
    count,
    percentage: ((count / totalAccounts) * 100).toFixed(1),
  }))

  // Features adoption
  const featuresData = [
    {
      feature: "Online Banking",
      enabled: accounts.filter((acc) => acc.online_banking_enabled).length,
      total: totalAccounts,
    },
    {
      feature: "Mobile Banking",
      enabled: accounts.filter((acc) => acc.mobile_banking_enabled).length,
      total: totalAccounts,
    },
    {
      feature: "Debit Card",
      enabled: accounts.filter((acc) => acc.debit_card_enabled).length,
      total: totalAccounts,
    },
    {
      feature: "Accepts Donations",
      enabled: donationAccounts,
      total: totalAccounts,
    },
  ]

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Building className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Accounts</p>
                <p className="text-2xl font-bold">{totalAccounts}</p>
                <p className="text-xs text-muted-foreground">
                  {activeAccounts} active ({((activeAccounts / totalAccounts) * 100).toFixed(1)}%)
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Multi-Currency Balance Display */}
        <Card className="md:col-span-2">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2 mb-3">
              <DollarSign className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Balances by Currency</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {formattedCurrencyBalances.map(({ currency, formatted, count }) => (
                <div key={currency} className="bg-muted/50 rounded-lg p-3">
                  <p className="text-lg font-bold">{formatted}</p>
                  <p className="text-xs text-muted-foreground">
                    {count} account{count !== 1 ? "s" : ""}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <CreditCard className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Donation Accounts</p>
                <p className="text-2xl font-bold">{donationAccounts}</p>
                <p className="text-xs text-muted-foreground">
                  {((donationAccounts / totalAccounts) * 100).toFixed(1)}% of total
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Account Type Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Account Types
            </CardTitle>
            <CardDescription>Distribution of account types</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={typeChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ type, percentage }) => `${type}: ${percentage}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {typeChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Currency Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Currency Distribution
            </CardTitle>
            <CardDescription>Balance by currency</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={currencyChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="currency" />
                <YAxis />
                <Tooltip
                  formatter={(value, name) => [
                    name === "balance"
                      ? currencyChartData.find((d) => d.balance === value)?.formattedBalance || value
                      : value,
                    name === "balance" ? "Total Balance" : "Account Count",
                  ]}
                />
                <Bar dataKey="count" fill="#3b82f6" name="count" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Institution Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Financial Institutions
            </CardTitle>
            <CardDescription>Accounts per institution</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={institutionChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="institution" angle={-45} textAnchor="end" height={80} interval={0} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Account Summary by Currency - More Useful Than Balance Ranges */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Account Summary by Currency
            </CardTitle>
            <CardDescription>Breakdown of accounts and balances per currency</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {formattedCurrencyBalances.map(({ currency, formatted, total, count }) => (
                <div key={currency} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <div>
                      <p className="font-medium">{currency}</p>
                      <p className="text-sm text-muted-foreground">
                        {count} account{count !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">{formatted}</p>
                    <p className="text-sm text-muted-foreground">Avg: {formatCurrency(currency, total / count)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Features Adoption */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Banking Features Adoption
          </CardTitle>
          <CardDescription>Percentage of accounts with each feature enabled</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {featuresData.map((feature, index) => {
            const percentage = (feature.enabled / feature.total) * 100
            return (
              <div key={feature.feature} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{feature.feature}</span>
                  <span className="text-sm text-muted-foreground">
                    {feature.enabled}/{feature.total} ({percentage.toFixed(1)}%)
                  </span>
                </div>
                <Progress value={percentage} className="h-2" />
              </div>
            )
          })}
        </CardContent>
      </Card>

      {/* Account Health Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Rate</p>
                <p className="text-2xl font-bold text-green-600">
                  {((activeAccounts / totalAccounts) * 100).toFixed(1)}%
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Donation Ready</p>
                <p className="text-2xl font-bold text-blue-600">
                  {((donationAccounts / totalAccounts) * 100).toFixed(1)}%
                </p>
              </div>
              <CreditCard className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Restrictions</p>
                <p className="text-2xl font-bold text-orange-600">
                  {((restrictedAccounts / totalAccounts) * 100).toFixed(1)}%
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
