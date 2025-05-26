"use client"

import { useParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Building,
  CreditCard,
  DollarSign,
  Calendar,
  Users,
  Activity,
  AlertTriangle,
  Edit,
  SnowflakeIcon as Freeze,
  Unlock,
} from "lucide-react"
import {
  useGetBankAccountByIdQuery,
  useFreezeBankAccountMutation,
  useUnfreezeBankAccountMutation,
} from "@/redux/features/finance/bank-accounts"
import { BankAccountOverview } from "@/components/finances/bank-accounts/detail/bank-account-overview"
import { BankAccountStatistics } from "@/components/finances/bank-accounts/detail/bank-account-statistics"
import { BankAccountTransactionHistory } from "@/components/finances/bank-accounts/detail/bank-account-transaction-history"
import { BankAccountAnalyticsCharts } from "@/components/finances/bank-accounts/detail/bank-account-analytics-charts"
import { BankAccountBalanceHistory } from "@/components/finances/bank-accounts/detail/bank-account-balance-history"
import { BankAccountManagement } from "@/components/finances/bank-accounts/detail/bank-account-management"
import { BankAccountDialog } from "@/components/finances/bank-accounts/bank-account-dialog"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { useState } from "react"
import { toast } from "sonner"

export default function BankAccountDetailPage() {
  const params = useParams()
  const accountId = Number(params.accountId)
  const [editDialogOpen, setEditDialogOpen] = useState(false)

  const { data: account, isLoading, error, refetch } = useGetBankAccountByIdQuery(accountId)
  const [freezeAccount] = useFreezeBankAccountMutation()
  const [unfreezeAccount] = useUnfreezeBankAccountMutation()

  const handleFreeze = async () => {
    try {
      await freezeAccount(accountId).unwrap()
      toast.success("Account frozen successfully")
      refetch()
    } catch (error) {
      toast.error("Failed to freeze account")
    }
  }

  const handleUnfreeze = async () => {
    try {
      await unfreezeAccount(accountId).unwrap()
      toast.success("Account unfrozen successfully")
      refetch()
    } catch (error) {
      toast.error("Failed to unfreeze account")
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error || !account) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Account Not Found</h3>
            <p className="text-muted-foreground">The requested bank account could not be found.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const getAccountStatusBadge = () => {
    if (!account.is_active) {
      return <Badge variant="destructive">Inactive</Badge>
    }
    if (account.account_status === "frozen") {
      return <Badge variant="secondary">Frozen</Badge>
    }
    if (account.is_restricted) {
      return <Badge variant="outline">Restricted</Badge>
    }
    return <Badge variant="default">Active</Badge>
  }

  const getAccountTypeDisplay = () => {
    return account.account_type.replace("_", " ").toUpperCase()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">{account.name}</h1>
            {getAccountStatusBadge()}
          </div>
          <div className="flex items-center gap-4 text-muted-foreground">
            <div className="flex items-center gap-1">
              <Building className="h-4 w-4" />
              <span>{account.financial_institution.name}</span>
            </div>
            <div className="flex items-center gap-1">
              <CreditCard className="h-4 w-4" />
              <span>{getAccountTypeDisplay()}</span>
            </div>
            <div className="flex items-center gap-1">
              <DollarSign className="h-4 w-4" />
              <span>{account.currency.code}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {account.account_status === "frozen" ? (
            <Button onClick={handleUnfreeze} variant="outline" size="sm">
              <Unlock className="h-4 w-4 mr-2" />
              Unfreeze
            </Button>
          ) : (
            <Button onClick={handleFreeze} variant="outline" size="sm">
              <Freeze className="h-4 w-4 mr-2" />
              Freeze
            </Button>
          )}
          <Button onClick={() => setEditDialogOpen(true)} size="sm">
            <Edit className="h-4 w-4 mr-2" />
            Edit Account
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Current Balance</p>
                <p className="text-2xl font-bold">{account.formatted_balance}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Transactions</p>
                <p className="text-2xl font-bold">{account.transactions_count}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Opened</p>
                <p className="text-2xl font-bold">{new Date(account.opening_date).toLocaleDateString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Signatories</p>
                <p className="text-2xl font-bold">{1 + account.secondary_signatories.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="statistics">Statistics</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="balance-history">Balance History</TabsTrigger>
          <TabsTrigger value="management">Management</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <BankAccountOverview account={account} />
        </TabsContent>

        <TabsContent value="statistics" className="space-y-6">
          <BankAccountStatistics accountId={accountId} />
        </TabsContent>

        <TabsContent value="transactions" className="space-y-6">
          <BankAccountTransactionHistory accountId={accountId} />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <BankAccountAnalyticsCharts accountId={accountId} />
        </TabsContent>

        <TabsContent value="balance-history" className="space-y-6">
          <BankAccountBalanceHistory accountId={accountId} />
        </TabsContent>

        <TabsContent value="management" className="space-y-6">
          <BankAccountManagement account={account} onUpdate={refetch} />
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <BankAccountDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        account={account}
        onSuccess={() => {
          setEditDialogOpen(false)
          refetch()
        }}
      />
    </div>
  )
}
