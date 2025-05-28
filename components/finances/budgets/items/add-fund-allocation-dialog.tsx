"use client"

import { useState, useEffect } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import Select from "react-select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { Building2, CreditCard, DollarSign, User, CheckCircle, AlertTriangle, Banknote, Loader2 } from "lucide-react"
import { toast } from "sonner"
import type { FundAllocation } from "@/types/finance"
import { useGetBankAccountsQuery } from "@/redux/features/finance/bank-accounts"
import {
  useCreateFundAllocationMutation,
  useUpdateFundAllocationMutation,
} from "@/redux/features/finance/fund-allocations"
import { DateInput } from "@/components/ui/date-input"

const fundAllocationSchema = z.object({
  source_account_id: z.number().min(1, "Bank account is required"),
  amount_allocated: z.number().min(0.01, "Amount must be greater than 0"),
  allocation_date: z.date(),
  purpose: z.string().min(1, "Purpose is required"),
  is_active: z.boolean().default(true),
})

type FundAllocationFormData = z.infer<typeof fundAllocationSchema>

interface AddFundAllocationDialogProps {
  open: boolean
  onOpenChange: () => void
  onSuccess?: () => void
  budgetId: number
  allocation?: FundAllocation
  budgetCurrency: {
    id: number
    code: string
  }
}

export function AddFundAllocationDialog({
  open,
  onOpenChange,
  onSuccess,
  budgetId,
  allocation,
  budgetCurrency,
}: AddFundAllocationDialogProps) {
  const [selectedAccount, setSelectedAccount] = useState<any>(null)
  const isEditing = !!allocation

  const { data: bankAccountsData, isLoading: bankAccountsLoading } = useGetBankAccountsQuery({})

  const [createFundAllocation, { isLoading: isCreating }] = useCreateFundAllocationMutation()
  const [updateFundAllocation, { isLoading: isUpdating }] = useUpdateFundAllocationMutation()

  const isLoading = isCreating || isUpdating

  // Extract bank accounts from the response structure
  const bankAccounts = bankAccountsData?.results || []

  const form = useForm<FundAllocationFormData>({
    resolver: zodResolver(fundAllocationSchema),
    defaultValues: {
      source_account_id: 0,
      amount_allocated: 0,
      allocation_date: new Date(),
      purpose: "",
      is_active: true,
    },
  })

  // Populate form when editing
  useEffect(() => {
    if (allocation && open) {
      form.reset({
        source_account_id: allocation.source_account.id,
        amount_allocated: Number.parseFloat(allocation.amount_allocated),
        allocation_date: new Date(allocation.allocation_date),
        purpose: allocation.purpose,
        is_active: allocation.is_active,
      })
      setSelectedAccount(allocation.source_account)
    }
  }, [allocation, open, form, budgetCurrency.id])

  const onSubmit = async (data: FundAllocationFormData) => {
    try {
      const payload = {
        budget: budgetId,
        source_account: data.source_account_id,
        amount_allocated: data.amount_allocated.toString(),
        allocation_date: format(data.allocation_date, "yyyy-MM-dd"),
        purpose: data.purpose,
        is_active: data.is_active,
      }

      if (isEditing) {
        await updateFundAllocation({
          id: allocation.id,
          data: payload,
        }).unwrap()
        toast.success("Fund allocation updated successfully!")
      } else {
        await createFundAllocation(payload).unwrap()
        toast.success("Fund allocation created successfully!")
      }

      onSuccess?.()
      onOpenChange()
      form.reset()
      setSelectedAccount(null)
    } catch (error: any) {
      console.error("Fund allocation error:", error)
      toast.error(
        error?.data?.message || error?.data?.detail || `Failed to ${isEditing ? "update" : "create"} fund allocation`,
      )
    }
  }

  const getAccountTypeIcon = (type: string) => {
    switch (type) {
      case "checking":
      case "savings":
        return <Building2 className="h-4 w-4" />
      case "paypal":
      case "stripe":
        return <CreditCard className="h-4 w-4" />
      default:
        return <Banknote className="h-4 w-4" />
    }
  }

  const getAccountTypeColor = (type: string) => {
    switch (type) {
      case "checking":
        return "bg-blue-100 text-blue-800"
      case "savings":
        return "bg-green-100 text-green-800"
      case "restricted":
        return "bg-red-100 text-red-800"
      case "project":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const allocationAmount = form.watch("amount_allocated")
  const accountId = form.watch("source_account_id")

  useEffect(() => {
    const account = bankAccounts.find((acc: any) => acc.id === accountId)
    setSelectedAccount(account)
  }, [accountId, bankAccounts])

  const isInsufficientFunds =
    selectedAccount && allocationAmount > Number.parseFloat(selectedAccount.current_balance || "0")

  // React Select options for bank accounts
  const bankAccountOptions = bankAccounts.map((account: any) => ({
    value: account.id,
    label: account.name,
    account: account,
  }))

  // Custom styles for React Select
  const selectStyles = {
    control: (provided: any, state: any) => ({
      ...provided,
      minHeight: "40px",
      borderColor: state.isFocused ? "#3b82f6" : "#d1d5db",
      boxShadow: state.isFocused ? "0 0 0 1px #3b82f6" : "none",
      "&:hover": {
        borderColor: "#3b82f6",
      },
    }),
    option: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: state.isSelected ? "#3b82f6" : state.isFocused ? "#eff6ff" : "white",
      color: state.isSelected ? "white" : "#374151",
      padding: "12px",
      "&:hover": {
        backgroundColor: state.isSelected ? "#3b82f6" : "#eff6ff",
      },
    }),
    placeholder: (provided: any) => ({
      ...provided,
      color: "#9ca3af",
    }),
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            {isEditing ? "Edit Fund Allocation" : "Add Fund Allocation"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the fund allocation details and configuration"
              : "Allocate funds from a bank account to this budget"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Bank Account Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Source Account
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="source_account_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bank Account *</FormLabel>
                      <FormControl>
                        <Controller
                          name="source_account_id"
                          control={form.control}
                          render={({ field: controllerField }) => (
                            <Select
                              {...controllerField}
                              options={bankAccountOptions}
                              value={bankAccountOptions.find((option) => option.value === controllerField.value)}
                              onChange={(selectedOption) => controllerField.onChange(selectedOption?.value || 0)}
                              placeholder={bankAccountsLoading ? "Loading accounts..." : "Select bank account"}
                              isSearchable
                              isLoading={bankAccountsLoading}
                              isDisabled={bankAccountsLoading}
                              styles={selectStyles}
                              className="react-select-container"
                              classNamePrefix="react-select"
                              formatOptionLabel={(option: any) => (
                                <div className="flex items-center gap-3 py-2">
                                  {getAccountTypeIcon(option.account.account_type)}
                                  <div className="flex-1">
                                    <div className="font-medium">{option.account.name}</div>
                                    <div className="text-sm text-gray-500">
                                      {option.account.financial_institution?.name} • {option.account.account_number}
                                    </div>
                                    <div className="flex items-center gap-2 mt-1">
                                      <Badge className={getAccountTypeColor(option.account.account_type)}>
                                        {option.account.account_type}
                                      </Badge>
                                      <span className="text-sm font-medium text-green-600">
                                        {option.account.currency?.code}{" "}
                                        {Number.parseFloat(option.account.current_balance || "0").toLocaleString()}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              )}
                              noOptionsMessage={() => (bankAccountsLoading ? "Loading..." : "No accounts found")}
                            />
                          )}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {selectedAccount && (
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-blue-900">{selectedAccount.name}</h4>
                        <p className="text-sm text-blue-700">
                          {selectedAccount.financial_institution?.name} • {selectedAccount.account_number}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-blue-900">
                          {selectedAccount.currency?.code}{" "}
                          {Number.parseFloat(selectedAccount.current_balance || "0").toLocaleString()}
                        </div>
                        <div className="text-sm text-blue-700">Available Balance</div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Allocation Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Allocation Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="amount_allocated"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Amount to Allocate *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            className={cn(isInsufficientFunds && "border-red-500 focus:border-red-500")}
                            {...field}
                            onChange={(e) => field.onChange(Number.parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        {isInsufficientFunds && (
                          <div className="flex items-center gap-2 text-red-600 text-sm">
                            <AlertTriangle className="h-4 w-4" />
                            Insufficient funds in selected account
                          </div>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="allocation_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Allocation Date *</FormLabel>
                        <FormControl>
                          <DateInput
                            value={field.value}
                            onChange={field.onChange}
                            label=""
                            maxDate={new Date()}
                            minDate={new Date("1900-01-01")}
                          />
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
                      <FormLabel>Purpose *</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe the purpose of this fund allocation..."
                          className="min-h-[80px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>Explain why these funds are being allocated to this budget</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {allocationAmount > 0 && selectedAccount && (
                  <div className={cn("p-4 rounded-lg", isInsufficientFunds ? "bg-red-50" : "bg-green-50")}>
                    <div
                      className={cn("flex items-center gap-2", isInsufficientFunds ? "text-red-700" : "text-green-700")}
                    >
                      {isInsufficientFunds ? (
                        <AlertTriangle className="h-4 w-4" />
                      ) : (
                        <CheckCircle className="h-4 w-4" />
                      )}
                      <span className="font-medium">
                        {isInsufficientFunds ? "Insufficient Funds" : "Allocation Valid"}
                      </span>
                    </div>
                    <div className={cn("mt-2 text-sm", isInsufficientFunds ? "text-red-600" : "text-green-600")}>
                      <p>
                        Allocation: {budgetCurrency.code} {allocationAmount.toLocaleString()}
                      </p>
                      <p>
                        Available: {selectedAccount.currency?.code}{" "}
                        {Number.parseFloat(selectedAccount.current_balance || "0").toLocaleString()}
                      </p>
                      <p>
                        Remaining: {selectedAccount.currency?.code}{" "}
                        {(
                          Number.parseFloat(selectedAccount.current_balance || "0") - allocationAmount
                        ).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="is_active"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Active Allocation</FormLabel>
                        <FormDescription>
                          Whether this allocation is currently active and available for use
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <Separator />
              </CardContent>
            </Card>

            {/* Summary */}
            {(() => {
              return (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Allocation Summary</h4>
                      <div className="mt-2 space-y-1 text-sm text-gray-700">
                        <p>• Account: {selectedAccount?.name || "Not selected"}</p>
                        <p>
                          • Amount: {budgetCurrency.code} {(allocationAmount || 0).toLocaleString()}
                        </p>
                        <p>
                          • Date:{" "}
                          {form.watch("allocation_date") ? format(form.watch("allocation_date"), "PPP") : "Not set"}
                        </p>
                        <p>• Status: {form.watch("is_active") ? "Active" : "Inactive"}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })()}

            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange()} disabled={isLoading}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading || isInsufficientFunds}>
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    {isEditing ? "Updating..." : "Creating..."}
                  </>
                ) : (
                  <>{isEditing ? "Update Allocation" : "Create Allocation"}</>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
