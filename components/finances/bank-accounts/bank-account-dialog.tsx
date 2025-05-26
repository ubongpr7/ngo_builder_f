"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Separator } from "@/components/ui/separator"
import { Building, CreditCard, Smartphone } from "lucide-react"
import { toast } from "react-toastify"
import { useGetFinancialInstitutionsQuery } from "@/redux/features/finance/financial-institutions"
import { useGetCurrenciesQuery } from "@/redux/features/common/typeOF"
import { useGetAdminUsersQuery } from "@/redux/features/profile/readProfileAPISlice"
import { useCreateBankAccountMutation, useUpdateBankAccountMutation } from "@/redux/features/finance/bank-accounts"
import type { BankAccount } from "@/types/finance"
import { ReactSelectField } from "@/components/ui/react-select-field"

const bankAccountSchema = z.object({
  name: z.string().min(1, "Account name is required"),
  account_number: z.string().min(1, "Account number is required"),
  account_type: z.string().min(1, "Account type is required"),
  financial_institution_id: z.string().min(1, "Financial institution is required"),
  currency_id: z.string().min(1, "Currency is required"),
  purpose: z.string().min(1, "Purpose is required"),
  is_restricted: z.boolean(),
  restrictions: z.string().optional(),
  primary_signatory_id: z.string().min(1, "Primary signatory is required"),
  is_active: z.boolean(),
  opening_date: z.string().min(1, "Opening date is required"),
  closing_date: z.string().optional(),
  minimum_balance: z.string().optional(),
  accepts_donations: z.boolean(),
  online_banking_enabled: z.boolean(),
  mobile_banking_enabled: z.boolean(),
  debit_card_enabled: z.boolean(),
  notes: z.string().optional(),
})

type BankAccountFormData = z.infer<typeof bankAccountSchema>

interface BankAccountDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  account?: BankAccount | null
  onAccountSaved: () => void
}

const accountTypes = [
  { value: "checking", label: "Checking Account", icon: Building },
  { value: "savings", label: "Savings Account", icon: Building },
  { value: "money_market", label: "Money Market", icon: Building },
  { value: "restricted", label: "Restricted Fund", icon: Building },
  { value: "project", label: "Project Account", icon: Building },
  { value: "grant", label: "Grant Account", icon: Building },
  { value: "emergency", label: "Emergency Fund", icon: Building },
  { value: "investment", label: "Investment Account", icon: Building },
  { value: "paypal", label: "PayPal", icon: CreditCard },
  { value: "stripe", label: "Stripe", icon: CreditCard },
  { value: "mobile_money", label: "Mobile Money", icon: Smartphone },
]

export function BankAccountDialog({ open, onOpenChange, account, onAccountSaved }: BankAccountDialogProps) {
  const isEditing = !!account
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { data: financialInstitutions = [] } = useGetFinancialInstitutionsQuery({
    is_active: true,
  })

  const { data: currencies = [] } = useGetCurrenciesQuery()

  const { data: users = [] } = useGetAdminUsersQuery({
    is_active: true,
  })

  const form = useForm<BankAccountFormData>({
    resolver: zodResolver(bankAccountSchema),
    defaultValues: {
      name: "",
      account_number: "",
      account_type: "",
      financial_institution_id: "",
      currency_id: "",
      purpose: "",
      is_restricted: false,
      restrictions: "",
      primary_signatory_id: "",
      is_active: true,
      opening_date: new Date().toISOString().split("T")[0],
      closing_date: "",
      minimum_balance: "0.00",
      accepts_donations: false,
      online_banking_enabled: false,
      mobile_banking_enabled: false,
      debit_card_enabled: false,
      notes: "",
    },
  })

  // Reset form when account changes
  useEffect(() => {
    if (account) {
      form.reset({
        name: account.name,
        account_number: account.account_number,
        account_type: account.account_type,
        financial_institution_id: account.financial_institution.id.toString(),
        currency_id: account.currency.id.toString(),
        purpose: account.purpose,
        is_restricted: account.is_restricted,
        restrictions: account.restrictions || "",
        primary_signatory_id: account.primary_signatory.id.toString(),
        is_active: account.is_active,
        opening_date: account.opening_date,
        closing_date: account.closing_date || "",
        minimum_balance: account.minimum_balance,
        accepts_donations: account.accepts_donations || false,
        online_banking_enabled: account.online_banking_enabled || false,
        mobile_banking_enabled: account.mobile_banking_enabled || false,
        debit_card_enabled: account.debit_card_enabled || false,
        notes: account.notes || "",
      })
    } else {
      form.reset({
        name: "",
        account_number: "",
        account_type: "",
        financial_institution_id: "",
        currency_id: "",
        purpose: "",
        is_restricted: false,
        restrictions: "",
        primary_signatory_id: "",
        is_active: true,
        opening_date: new Date().toISOString().split("T")[0],
        closing_date: "",
        minimum_balance: "0.00",
        accepts_donations: false,
        online_banking_enabled: false,
        mobile_banking_enabled: false,
        debit_card_enabled: false,
        notes: "",
      })
    }
  }, [account, form])

  const getAccountTypeIcon = (accountType: string) => {
    const type = accountTypes.find((t) => t.value === accountType)
    const Icon = type?.icon || Building
    return <Icon className="h-4 w-4" />
  }

  const [createBankAccount, { isLoading: isCreating }] = useCreateBankAccountMutation()
  const [updateBankAccount, { isLoading: isUpdating }] = useUpdateBankAccountMutation()

  const handleSubmit = async (data: BankAccountFormData) => {
    setIsSubmitting(true)
    try {
      const payload = {
        ...data,
        financial_institution_id: Number.parseInt(data.financial_institution_id),
        currency_id: Number.parseInt(data.currency_id),
        primary_signatory_id: Number.parseInt(data.primary_signatory_id),
        minimum_balance: data.minimum_balance || "0.00",
        restrictions: data.is_restricted ? data.restrictions : null,
        closing_date: data.closing_date || null,
      }

      if (isEditing) {
        await updateBankAccount({
          id: account.id,
          data: payload,
        }).unwrap()
      } else {
        await createBankAccount(payload).unwrap()
      }

      onAccountSaved()
      onOpenChange(false)
      toast.success(`Bank account ${isEditing ? "updated" : "created"} successfully`)
    } catch (error: any) {
      console.error("Bank account operation failed:", error)
      toast.error(error?.data?.detail || error?.message || `Failed to ${isEditing ? "update" : "create"} bank account`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDialogClose = () => {
    if (!isSubmitting) {
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            {isEditing ? "Edit Bank Account" : "Add New Bank Account"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the bank account information below."
              : "Add a new bank account to your organization's financial system."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Basic Information</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Account Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Main Operating Account" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="account_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Account Number</FormLabel>
                      <FormControl>
                        <Input placeholder="1234567890" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="account_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Account Type</FormLabel>
                      <FormControl>
                        <ReactSelectField
                          value={accountTypes.find((type) => type.value === field.value) || null}
                          onChange={(option) => field.onChange(option?.value || "")}
                          options={accountTypes.map((type) => ({
                            value: type.value,
                            label: type.label,
                          }))}
                          placeholder="Select account type"
                          isClearable
                          isSearchable
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="financial_institution_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Financial Institution</FormLabel>
                      <FormControl>
                        <ReactSelectField
                          value={
                            financialInstitutions.find((inst) => inst.id.toString() === field.value)
                              ? {
                                  value: field.value,
                                  label: `${financialInstitutions.find((inst) => inst.id.toString() === field.value)?.name} (${financialInstitutions.find((inst) => inst.id.toString() === field.value)?.code})`,
                                }
                              : null
                          }
                          onChange={(option) => field.onChange(option?.value || "")}
                          options={financialInstitutions.map((institution) => ({
                            value: institution.id.toString(),
                            label: `${institution.name} (${institution.code})`,
                          }))}
                          placeholder="Select institution"
                          isClearable
                          isSearchable
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="currency_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Currency</FormLabel>
                      <FormControl>
                        <ReactSelectField
                          value={
                            currencies.find((curr) => curr.id.toString() === field.value)
                              ? {
                                  value: field.value,
                                  label: `${currencies.find((curr) => curr.id.toString() === field.value)?.code} - ${currencies.find((curr) => curr.id.toString() === field.value)?.name}`,
                                }
                              : null
                          }
                          onChange={(option) => field.onChange(option?.value || "")}
                          options={currencies.map((currency) => ({
                            value: currency.id.toString(),
                            label: `${currency.code} - ${currency.name}`,
                          }))}
                          placeholder="Select currency"
                          isClearable
                          isSearchable
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="minimum_balance"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Minimum Balance</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="0.00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="purpose"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Purpose</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe the purpose of this account..."
                        className="resize-none"
                        rows={2}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            {/* Signatories */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Signatories</h3>

              <FormField
                control={form.control}
                name="primary_signatory_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Primary Signatory</FormLabel>
                    <FormControl>
                      <ReactSelectField
                        value={
                          users.find((user) => user.id.toString() === field.value)
                            ? {
                                value: field.value,
                                label: `${users.find((user) => user.id.toString() === field.value)?.full_name} (${users.find((user) => user.id.toString() === field.value)?.email})`,
                              }
                            : null
                        }
                        onChange={(option) => field.onChange(option?.value || "")}
                        options={users.map((user) => ({
                          value: user.id.toString(),
                          label: `${user.full_name} (${user.email})`,
                        }))}
                        placeholder="Select primary signatory"
                        isClearable
                        isSearchable
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            {/* Account Settings */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Account Settings</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="opening_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Opening Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="closing_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Closing Date (Optional)</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="is_active"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Active Account</FormLabel>
                        <div className="text-sm text-muted-foreground">Enable this account for transactions</div>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="accepts_donations"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Accepts Donations</FormLabel>
                        <div className="text-sm text-muted-foreground">Allow this account to receive donations</div>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="is_restricted"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Restricted Account</FormLabel>
                        <div className="text-sm text-muted-foreground">
                          Mark this account as having usage restrictions
                        </div>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              {form.watch("is_restricted") && (
                <FormField
                  control={form.control}
                  name="restrictions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Restrictions</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe the restrictions on this account..."
                          className="resize-none"
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            <Separator />

            {/* Banking Features */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Banking Features</h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="online_banking_enabled"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-sm">Online Banking</FormLabel>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="mobile_banking_enabled"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-sm">Mobile Banking</FormLabel>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="debit_card_enabled"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-sm">Debit Card</FormLabel>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator />

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Additional notes about this account..."
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
              <Button type="submit" disabled={isSubmitting} className="flex-1">
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                    Saving...
                  </>
                ) : isEditing ? (
                  "Update Account"
                ) : (
                  "Create Account"
                )}
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
