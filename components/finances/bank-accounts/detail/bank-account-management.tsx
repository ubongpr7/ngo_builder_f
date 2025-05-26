"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Settings,
  Shield,
  AlertTriangle,
  CheckCircle,
  Users,
  CreditCard,
  Lock,
  Unlock,
  Trash2,
  Save,
} from "lucide-react"
import {
  useUpdateBankAccountMutation,
  useFreezeBankAccountMutation,
  useUnfreezeBankAccountMutation,
  useCheckLowBalanceMutation,
} from "@/redux/features/finance/bank-accounts"
import type { BankAccount } from "@/types/finance"
import { toast } from "sonner"

interface BankAccountManagementProps {
  account: BankAccount
  onUpdate: () => void
}

export function BankAccountManagement({ account, onUpdate }: BankAccountManagementProps) {
  const [lowBalanceThreshold, setLowBalanceThreshold] = useState("")
  const [restrictions, setRestrictions] = useState(account.restrictions || "")
  const [isRestricted, setIsRestricted] = useState(account.is_restricted)
  const [isActive, setIsActive] = useState(account.is_active)

  const [updateAccount, { isLoading: isUpdating }] = useUpdateBankAccountMutation()
  const [freezeAccount, { isLoading: isFreezing }] = useFreezeBankAccountMutation()
  const [unfreezeAccount, { isLoading: isUnfreezing }] = useUnfreezeBankAccountMutation()
  const [checkLowBalance, { isLoading: isCheckingBalance }] = useCheckLowBalanceMutation()

  const handleUpdateSettings = async () => {
    try {
      await updateAccount({
        id: account.id,
        data: {
          is_restricted: isRestricted,
          restrictions: isRestricted ? restrictions : null,
          is_active: isActive,
        },
      }).unwrap()

      toast.success("Account settings updated successfully")
      onUpdate()
    } catch (error) {
      toast.error("Failed to update account settings")
    }
  }

  const handleFreeze = async () => {
    try {
      await freezeAccount(account.id).unwrap()
      toast.success("Account frozen successfully")
      onUpdate()
    } catch (error) {
      toast.error("Failed to freeze account")
    }
  }

  const handleUnfreeze = async () => {
    try {
      await unfreezeAccount(account.id).unwrap()
      toast.success("Account unfrozen successfully")
      onUpdate()
    } catch (error) {
      toast.error("Failed to unfreeze account")
    }
  }

  const handleCheckLowBalance = async () => {
    try {
      const result = await checkLowBalance({
        accountId: account.id,
        threshold: lowBalanceThreshold || undefined,
      }).unwrap()

      if (result.alert) {
        toast.warning(result.message)
      } else {
        toast.success(result.message)
      }
    } catch (error) {
      toast.error("Failed to check balance")
    }
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

  return (
    <div className="space-y-6">
      {/* Account Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Account Status & Controls
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Current Status</h4>
              <p className="text-sm text-muted-foreground">Account operational status</p>
            </div>
            {getAccountStatusBadge()}
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {account.account_status === "frozen" ? (
              <Button onClick={handleUnfreeze} disabled={isUnfreezing} className="w-full">
                <Unlock className="h-4 w-4 mr-2" />
                {isUnfreezing ? "Unfreezing..." : "Unfreeze Account"}
              </Button>
            ) : (
              <Button onClick={handleFreeze} disabled={isFreezing} variant="outline" className="w-full">
                <Lock className="h-4 w-4 mr-2" />
                {isFreezing ? "Freezing..." : "Freeze Account"}
              </Button>
            )}

            <Button variant="outline" className="w-full" disabled>
              <Trash2 className="h-4 w-4 mr-2" />
              Close Account
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Account Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Account Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Account Active</Label>
                <p className="text-sm text-muted-foreground">Enable or disable this account</p>
              </div>
              <Switch checked={isActive} onCheckedChange={setIsActive} />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Restricted Account</Label>
                <p className="text-sm text-muted-foreground">Apply usage restrictions to this account</p>
              </div>
              <Switch checked={isRestricted} onCheckedChange={setIsRestricted} />
            </div>

            {isRestricted && (
              <div className="space-y-2">
                <Label htmlFor="restrictions">Restriction Details</Label>
                <Textarea
                  id="restrictions"
                  placeholder="Describe the account restrictions..."
                  value={restrictions}
                  onChange={(e) => setRestrictions(e.target.value)}
                  rows={3}
                />
              </div>
            )}
          </div>

          <Button onClick={handleUpdateSettings} disabled={isUpdating} className="w-full">
            <Save className="h-4 w-4 mr-2" />
            {isUpdating ? "Saving..." : "Save Settings"}
          </Button>
        </CardContent>
      </Card>

      {/* Balance Monitoring */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Balance Monitoring
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="threshold">Low Balance Threshold</Label>
              <Input
                id="threshold"
                type="number"
                placeholder="Enter amount..."
                value={lowBalanceThreshold}
                onChange={(e) => setLowBalanceThreshold(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={handleCheckLowBalance} disabled={isCheckingBalance} className="w-full">
                {isCheckingBalance ? "Checking..." : "Check Balance"}
              </Button>
            </div>
          </div>

          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-800">Current Balance</p>
                <p className="text-sm text-blue-700">{account.formatted_balance}</p>
                <p className="text-xs text-blue-600 mt-1">
                  Minimum required: {account.currency.symbol}
                  {account.minimum_balance}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Signatories Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Signatory Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Primary Signatory</h4>
            <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                {account.primary_signatory.first_name[0]}
                {account.primary_signatory.last_name[0]}
              </div>
              <div>
                <p className="font-medium">{account.primary_signatory.full_name}</p>
                <p className="text-sm text-muted-foreground">{account.primary_signatory.email}</p>
              </div>
            </div>
          </div>

          {account.secondary_signatories.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Secondary Signatories ({account.secondary_signatories.length})</h4>
              <div className="space-y-2">
                {account.secondary_signatories.map((signatory) => (
                  <div
                    key={signatory.id}
                    className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg"
                  >
                    <div className="h-8 w-8 bg-gray-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                      {signatory.first_name[0]}
                      {signatory.last_name[0]}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{signatory.full_name}</p>
                      <p className="text-sm text-muted-foreground">{signatory.email}</p>
                    </div>
                    <Button variant="ghost" size="sm">
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Button variant="outline" className="w-full">
            <Users className="h-4 w-4 mr-2" />
            Manage Signatories
          </Button>
        </CardContent>
      </Card>

      {/* Banking Features */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Banking Features
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <span className="text-sm">Online Banking</span>
              <Badge variant={account.online_banking_enabled ? "default" : "secondary"}>
                {account.online_banking_enabled ? "Enabled" : "Disabled"}
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <span className="text-sm">Mobile Banking</span>
              <Badge variant={account.mobile_banking_enabled ? "default" : "secondary"}>
                {account.mobile_banking_enabled ? "Enabled" : "Disabled"}
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <span className="text-sm">Debit Card</span>
              <Badge variant={account.debit_card_enabled ? "default" : "secondary"}>
                {account.debit_card_enabled ? "Enabled" : "Disabled"}
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <span className="text-sm">Accepts Donations</span>
              <Badge variant={account.accepts_donations ? "default" : "secondary"}>
                {account.accepts_donations ? "Yes" : "No"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
