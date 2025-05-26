"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Building,
  CreditCard,
  Smartphone,
  Plus,
  Edit,
  Trash2,
  Star,
  ArrowUpDown,
  CheckCircle,
  AlertCircle,
} from "lucide-react"
import { toast } from "react-toastify"
import type { DonationCampaign } from "@/types/finance"

interface CampaignBankAccountsManagementProps {
  campaign: DonationCampaign
  onDataChange: () => void
  onAddBankAccount: () => void
}

export function CampaignBankAccountsManagement({
  campaign,
  onDataChange,
  onAddBankAccount,
}: CampaignBankAccountsManagementProps) {
  const getAccountTypeIcon = (accountType: string) => {
    switch (accountType) {
      case "paypal":
      case "stripe":
        return <CreditCard className="h-4 w-4" />
      case "mobile_money":
        return <Smartphone className="h-4 w-4" />
      default:
        return <Building className="h-4 w-4" />
    }
  }

  const handleTogglePrimary = async (accountId: number, isPrimary: boolean) => {
    try {
      const response = await fetch(`/api/finance/campaigns/${campaign.id}/bank-accounts/${accountId}/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          is_primary: isPrimary,
        }),
      })

      if (response.ok) {
        onDataChange()
        toast.success(`Account ${isPrimary ? "set as" : "removed as"} primary`)
      } else {
        throw new Error("Failed to update account")
      }
    } catch (error) {
      toast.error("Failed to update account status")
    }
  }

  const handleToggleActive = async (accountId: number, isActive: boolean) => {
    try {
      const response = await fetch(`/api/finance/campaigns/${campaign.id}/bank-accounts/${accountId}/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          is_active: isActive,
        }),
      })

      if (response.ok) {
        onDataChange()
        toast.success(`Account ${isActive ? "activated" : "deactivated"}`)
      } else {
        throw new Error("Failed to update account")
      }
    } catch (error) {
      toast.error("Failed to update account status")
    }
  }

  const handleRemoveAccount = async (accountId: number) => {
    if (!confirm("Are you sure you want to remove this bank account from the campaign?")) {
      return
    }

    try {
      const response = await fetch(`/api/finance/campaigns/${campaign.id}/bank-accounts/${accountId}/`, {
        method: "DELETE",
      })

      if (response.ok) {
        onDataChange()
        toast.success("Bank account removed from campaign")
      } else {
        throw new Error("Failed to remove account")
      }
    } catch (error) {
      toast.error("Failed to remove bank account")
    }
  }

  const campaignBankAccounts = campaign.campaign_bank_accounts || []

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building className="h-5 w-5" />
          Campaign Bank Accounts
        </CardTitle>
        <CardDescription>Manage bank accounts that can receive donations for this campaign</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{campaignBankAccounts.length}</div>
            <div className="text-xs text-blue-600">Total Accounts</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {campaignBankAccounts.filter((cba) => cba.is_active).length}
            </div>
            <div className="text-xs text-green-600">Active</div>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {campaignBankAccounts.filter((cba) => cba.is_primary).length}
            </div>
            <div className="text-xs text-purple-600">Primary</div>
          </div>
          <div className="text-center p-3 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">
              {new Set(campaignBankAccounts.map((cba) => cba.bank_account.currency.code)).size}
            </div>
            <div className="text-xs text-orange-600">Currencies</div>
          </div>
        </div>

        {/* Add Account Button */}
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Connected Accounts</h3>
          <Button onClick={onAddBankAccount}>
            <Plus className="h-4 w-4 mr-2" />
            Add Account
          </Button>
        </div>

        {/* Accounts Table */}
        {campaignBankAccounts.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
            <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Bank Accounts</h3>
            <p className="text-gray-500 mb-4">Add bank accounts to start receiving donations for this campaign.</p>
            <Button onClick={onAddBankAccount}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Account
            </Button>
          </div>
        ) : (
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Account Details</TableHead>
                  <TableHead>Institution</TableHead>
                  <TableHead>Currency</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Primary</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {campaignBankAccounts
                  .sort((a, b) => a.priority_order - b.priority_order)
                  .map((cba) => (
                    <TableRow key={cba.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {getAccountTypeIcon(cba.bank_account.account_type)}
                          <div>
                            <div className="font-medium">{cba.bank_account.name}</div>
                            <div className="text-sm text-muted-foreground">
                              ****{cba.bank_account.account_number.slice(-4)}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">{cba.bank_account.financial_institution.name}</div>
                          <div className="text-muted-foreground capitalize">
                            {cba.bank_account.account_type.replace("_", " ")}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{cba.bank_account.currency.code}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{cba.priority_order}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={cba.is_active}
                            onCheckedChange={(checked) => handleToggleActive(cba.id, checked)}
                          />
                          <span className="text-sm">
                            {cba.is_active ? (
                              <span className="text-green-600 flex items-center gap-1">
                                <CheckCircle className="h-3 w-3" />
                                Active
                              </span>
                            ) : (
                              <span className="text-gray-500 flex items-center gap-1">
                                <AlertCircle className="h-3 w-3" />
                                Inactive
                              </span>
                            )}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={cba.is_primary}
                            onCheckedChange={(checked) => handleTogglePrimary(cba.id, checked)}
                          />
                          {cba.is_primary && <Star className="h-4 w-4 text-yellow-500 fill-current" />}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="outline" size="sm">
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleRemoveAccount(cba.id)}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Notes Section */}
        {campaignBankAccounts.some((cba) => cba.notes) && (
          <div className="space-y-2">
            <h4 className="font-medium">Account Notes</h4>
            {campaignBankAccounts
              .filter((cba) => cba.notes)
              .map((cba) => (
                <div key={cba.id} className="text-sm p-3 bg-gray-50 rounded-lg">
                  <div className="font-medium">{cba.bank_account.name}:</div>
                  <div className="text-muted-foreground">{cba.notes}</div>
                </div>
              ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
