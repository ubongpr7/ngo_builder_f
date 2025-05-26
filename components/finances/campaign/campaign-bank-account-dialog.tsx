"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Building, CreditCard, Smartphone, Plus } from "lucide-react"
import { toast } from "react-toastify"
import { useGetBankAccountsQuery } from "@/redux/features/finance/bank-accounts"
import type { DonationCampaign } from "@/types/finance"

const bankAccountSchema = z.object({
  bank_account_id: z.string().min(1, "Please select a bank account"),
  is_primary: z.boolean(),
  priority_order: z.string().min(1, "Priority order is required"),
  notes: z.string().optional(),
})

type BankAccountFormData = z.infer<typeof bankAccountSchema>

interface CampaignBankAccountDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  campaign: DonationCampaign
  onBankAccountAdded: () => void
}

export function CampaignBankAccountDialog({
  open,
  onOpenChange,
  campaign,
  onBankAccountAdded,
}: CampaignBankAccountDialogProps) {
  const [isLoading, setIsLoading] = useState(false)

  const { data: bankAccounts = [] } = useGetBankAccountsQuery({
    is_active: true,
    accepts_donations: true,
  })

  const form = useForm<BankAccountFormData>({
    resolver: zodResolver(bankAccountSchema),
    defaultValues: {
      bank_account_id: "",
      is_primary: false,
      priority_order: "1",
      notes: "",
    },
  })

  // Filter out accounts already added to campaign
  const addedAccountIds = campaign.campaign_bank_accounts?.map((cba) => cba.bank_account.id) || []
  const availableAccounts = bankAccounts.filter((account) => !addedAccountIds.includes(account.id))

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

  const handleSubmit = async (data: BankAccountFormData) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/finance/campaigns/${campaign.id}/bank-accounts/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bank_account_id: Number.parseInt(data.bank_account_id),
          is_primary: data.is_primary,
          priority_order: Number.parseInt(data.priority_order),
          notes: data.notes?.trim() || null,
        }),
      })

      if (response.ok) {
        onBankAccountAdded()
        form.reset()
        toast.success("Bank account added to campaign successfully")
      } else {
        const error = await response.json()
        toast.error(error.detail || "Failed to add bank account")
      }
    } catch (error) {
      toast.error("Failed to add bank account to campaign")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add Bank Account to Campaign
          </DialogTitle>
          <DialogDescription>Add a bank account that can receive donations for "{campaign.title}"</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Bank Account Selection */}
            <FormField
              control={form.control}
              name="bank_account_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select Bank Account</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a bank account" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableAccounts.length === 0 ? (
                        <div className="p-4 text-center text-muted-foreground">
                          No available bank accounts for donations
                        </div>
                      ) : (
                        availableAccounts.map((account) => (
                          <SelectItem key={account.id} value={account.id.toString()}>
                            <div className="flex items-center space-x-3 w-full">
                              {getAccountTypeIcon(account.account_type)}
                              <div className="flex-1">
                                <div className="font-medium">{account.name}</div>
                                <div className="text-sm text-muted-foreground">
                                  {account.financial_institution.name} • ****{account.account_number.slice(-4)}
                                </div>
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {account.currency.code}
                              </Badge>
                            </div>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Priority Order */}
            <FormField
              control={form.control}
              name="priority_order"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Priority Order</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="1"
                      placeholder="1"
                      {...field}
                      onChange={(e) => field.onChange(e.target.value)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Primary Account Switch */}
            <FormField
              control={form.control}
              name="is_primary"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Primary Account</FormLabel>
                    <div className="text-sm text-muted-foreground">
                      Mark this as the primary account for this campaign
                    </div>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Special instructions or notes for this account..."
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={isLoading || availableAccounts.length === 0} className="flex-1">
                {isLoading ? "Adding..." : "Add Bank Account"}
              </Button>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
