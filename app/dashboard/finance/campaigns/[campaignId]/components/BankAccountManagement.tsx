import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Banknote, Plus, Star, Settings } from "lucide-react"

interface BankAccountManagementProps {
  bankAccounts: any
  campaignId: number
}

export function BankAccountManagement({ bankAccounts, campaignId }: BankAccountManagementProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold">Bank Account Management</h3>
          <p className="text-muted-foreground">Manage bank accounts for {bankAccounts?.campaign_title}</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Account
        </Button>
      </div>

      {/* Accounts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {bankAccounts?.accounts?.map((account: any) => (
          <Card key={account.id} className="relative">
            {account.is_primary && (
              <div className="absolute top-2 right-2">
                <Badge variant="default" className="flex items-center">
                  <Star className="h-3 w-3 mr-1" />
                  Primary
                </Badge>
              </div>
            )}
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <Banknote className="h-5 w-5 mr-2" />
                {account.bank_account.name}
              </CardTitle>
              <CardDescription>
                {account.bank_account.account_type} • {account.bank_account.currency.code}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-2xl font-bold">{account.bank_account.formatted_balance}</div>
                <div className="text-sm text-muted-foreground">Current Balance</div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Priority Order:</span>
                  <span>{account.priority_order}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Status:</span>
                  <Badge variant={account.bank_account.is_active ? "default" : "secondary"}>
                    {account.bank_account.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>

              {account.notes && (
                <div className="text-sm text-muted-foreground">
                  <strong>Notes:</strong> {account.notes}
                </div>
              )}

              <div className="flex space-x-2">
                {!account.is_primary && (
                  <Button variant="outline" size="sm" className="flex-1">
                    Set Primary
                  </Button>
                )}
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Summary Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Account Summary</CardTitle>
          <CardDescription>Overview of all connected bank accounts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold">{bankAccounts?.total_accounts}</div>
              <div className="text-sm text-muted-foreground">Total Accounts</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">
                {bankAccounts?.accounts?.filter((acc: any) => acc.bank_account.is_active).length}
              </div>
              <div className="text-sm text-muted-foreground">Active Accounts</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">
                {new Set(bankAccounts?.accounts?.map((acc: any) => acc.bank_account.currency.code)).size}
              </div>
              <div className="text-sm text-muted-foreground">Currencies</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
