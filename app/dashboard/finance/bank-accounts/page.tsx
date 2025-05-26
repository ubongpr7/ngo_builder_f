"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Building, Plus, Search, Download, CreditCard, CheckCircle, DollarSign } from "lucide-react"
import { BankAccountsTable } from "@/components/finances/bank-accounts/bank-accounts-table"
import { BankAccountDialog } from "@/components/finances/bank-accounts/bank-account-dialog"
import { BankAccountStats } from "@/components/finances/bank-accounts/bank-account-stats"
import { BankAccountFilters } from "@/components/finances/bank-accounts/bank-account-filters"
import { useGetBankAccountsQuery } from "@/redux/features/finance/bank-accounts"
import type { BankAccount, BankAccountFilters as FilterType } from "@/types/finance"
import { useGetFinancialInstitutionsQuery } from "@/redux/features/finance/financial-institutions"
import { usePermissions } from "@/components/permissionHander"
import { useGetLoggedInProfileRolesQuery } from "@/redux/features/profile/readProfileAPISlice"

export default function BankAccountsPage() {
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingAccount, setEditingAccount] = useState<BankAccount | null>(null)
    const { data: userRoles } = useGetLoggedInProfileRolesQuery()
  
  const [filters, setFilters] = useState<FilterType>({
    page: 1,
    page_size: 20,
  })
  const [searchTerm, setSearchTerm] = useState("")

  const {
    data: bankAccountsResponse,
    isLoading,
    refetch,
  } = useGetBankAccountsQuery({
    ...filters,
    search: searchTerm || undefined,
  })

  const { data: financialInstitutions = [] } = useGetFinancialInstitutionsQuery({
    is_active: true,
  })

  const bankAccounts = bankAccountsResponse||[]
  const totalCount = bankAccountsResponse?.count || 0

  const handleAddAccount = () => {
    setEditingAccount(null)
    setShowAddDialog(true)
  }

  const handleEditAccount = (account: BankAccount) => {
    setEditingAccount(account)
    setShowAddDialog(true)
  }

  const handleDialogClose = () => {
    setShowAddDialog(false)
    setEditingAccount(null)
  }

  const handleAccountSaved = () => {
    refetch()
    handleDialogClose()
  }

  const handleFiltersChange = (newFilters: Partial<FilterType>) => {
    setFilters((prev) => ({ ...prev, ...newFilters, page: 1 }))
  }

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }))
  }

  // Calculate summary stats
  const canManageBankAccounts = usePermissions(userRoles, {
    requiredRoles:['is_DB_admin']
  })
  const activeAccounts = bankAccounts.filter((account) => account.is_active)
  const totalBalance = activeAccounts.reduce((sum, account) => sum + Number.parseFloat(account.current_balance), 0)
  const donationAccounts = bankAccounts.filter((account) => account.accepts_donations)
  const restrictedAccounts = bankAccounts.filter((account) => account.is_restricted)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bank Accounts</h1>
          <p className="text-muted-foreground">Manage your organization's bank accounts and financial institutions</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          {canManageBankAccounts && (
            <Button onClick={handleAddAccount}>
              <Plus className="h-4 w-4 mr-2" />
              Add Account
            </Button>
          )}
          
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Building className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Accounts</p>
                <p className="text-2xl font-bold">{bankAccounts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Accounts</p>
                <p className="text-2xl font-bold">{activeAccounts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Balance</p>
                <p className="text-2xl font-bold">${totalBalance.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <CreditCard className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Donation Accounts</p>
                <p className="text-2xl font-bold">{donationAccounts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="accounts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="accounts">All Accounts</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="donations">Donation Accounts</TabsTrigger>
          <TabsTrigger value="restricted">Restricted</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="accounts" className="space-y-4">
          {/* Search and Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search accounts by name, number, or institution..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <BankAccountFilters
                  filters={filters}
                  onFiltersChange={handleFiltersChange}
                  financialInstitutions={financialInstitutions}
                />
              </div>
            </CardContent>
          </Card>

          {/* Accounts Table */}
          <BankAccountsTable
            accounts={bankAccounts}
            isLoading={isLoading}
            totalCount={totalCount}
            currentPage={filters.page || 1}
            pageSize={filters.page_size || 20}
            onPageChange={handlePageChange}
            onEditAccount={handleEditAccount}
            onRefresh={refetch}

          />
        </TabsContent>

        <TabsContent value="active">
          <BankAccountsTable
            accounts={activeAccounts}
            isLoading={isLoading}
            totalCount={activeAccounts.length}
            currentPage={1}
            pageSize={20}
            onPageChange={() => {}}
            onEditAccount={handleEditAccount}
            onRefresh={refetch}
          />
        </TabsContent>

        <TabsContent value="donations">
          <BankAccountsTable
            accounts={donationAccounts}
            isLoading={isLoading}
            totalCount={donationAccounts.length}
            currentPage={1}
            pageSize={20}
            onPageChange={() => {}}
            onEditAccount={handleEditAccount}
            onRefresh={refetch}
          />
        </TabsContent>

        <TabsContent value="restricted">
          <BankAccountsTable
            accounts={restrictedAccounts}
            isLoading={isLoading}
            totalCount={restrictedAccounts.length}
            currentPage={1}
            pageSize={20}
            onPageChange={() => {}}
            onEditAccount={handleEditAccount}
            onRefresh={refetch}
          />
        </TabsContent>

        <TabsContent value="analytics">
          <BankAccountStats accounts={bankAccounts} />
        </TabsContent>
      </Tabs>

      {/* Add/Edit Dialog */}
      <BankAccountDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        account={editingAccount}
        onAccountSaved={handleAccountSaved}
      />
    </div>
  )
}
