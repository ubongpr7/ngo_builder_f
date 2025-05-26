"use client"

import React from "react"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CalendarIcon, DollarSign, Plus, Info } from "lucide-react"
import { toast } from "react-toastify"
import { useGetCurrenciesQuery } from "@/redux/features/common/typeOF"
import { useGetBankAccountsQuery } from "@/redux/features/finance/bank-accounts"
import { useCreateAccountTransactionMutation } from "@/redux/features/finance/account-transactions"
import type { BankAccount } from "@/types/finance"
import { ReactSelectField } from "@/components/ui/react-select-field"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface TooltipProps {
  content: string
  children: React.ReactNode
}

function InfoTooltip({ content, children }: TooltipProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="inline-flex items-center cursor-help">
            {children}
            <Info className="h-4 w-4 ml-1 text-muted-foreground" />
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <p className="text-sm">{content}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

const transactionSchema = z.object({
  transaction_type: z.enum(["credit", "debit", "transfer_in", "transfer_out", "currency_exchange"]),
  amount: z
    .string()
    .min(1, "Amount is required")
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: "Amount must be a positive number",
    }),
  original_amount: z.string().optional(),
  original_currency_id: z.string().optional(),
  exchange_rate_used: z.string().optional(),
  transfer_to_account_id: z.string().optional(),
  reference_number: z.string().min(1, "Reference number is required"),
  bank_reference: z.string().optional(),
  transaction_date: z.string().min(1, "Transaction date is required"),
  description: z.string().min(1, "Description is required"),
  status: z.enum(["pending", "processing", "completed", "failed", "cancelled"]),
  processor_fee: z.string().optional(),
  net_amount: z.string().optional(),
})

type TransactionFormData = z.infer<typeof transactionSchema>

interface AddTransactionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  account: BankAccount
  onTransactionAdded: () => void
}

const transactionTypes = [
  { value: "credit", label: "Credit (Money In)", description: "Money coming into the account" },
  { value: "debit", label: "Debit (Money Out)", description: "Money going out of the account" },
  { value: "transfer_in", label: "Transfer In", description: "Transfer from another account" },
  { value: "transfer_out", label: "Transfer Out", description: "Transfer to another account" },
  { value: "currency_exchange", label: "Currency Exchange", description: "Currency conversion transaction" },
]

const statusOptions = [
  { value: "pending", label: "Pending", description: "Transaction is pending" },
  { value: "processing", label: "Processing", description: "Transaction is being processed" },
  { value: "completed", label: "Completed", description: "Transaction is completed" },
  { value: "failed", label: "Failed", description: "Transaction failed" },
  { value: "cancelled", label: "Cancelled", description: "Transaction was cancelled" },
]

export function AddTransactionDialog({ open, onOpenChange, account, onTransactionAdded }: AddTransactionDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { data: currencies = [] } = useGetCurrenciesQuery()
  const { data: bankAccountsData } = useGetBankAccountsQuery({})
  const bankAccounts = bankAccountsData?.results || []

  const form = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      transaction_type: "credit",
      amount: "",
      original_amount: "",
      original_currency_id: "",
      exchange_rate_used: "",
      transfer_to_account_id: "",
      reference_number: `TXN-${Date.now()}`,
      bank_reference: "",
      transaction_date: new Date().toISOString().split("T")[0],
      description: "",
      status: "completed",
      processor_fee: "0.00",
      net_amount: "",
    },
  })

  const watchedTransactionType = form.watch("transaction_type")
  const watchedAmount = form.watch("amount")
  const watchedProcessorFee = form.watch("processor_fee")

  // Auto-calculate net amount
  React.useEffect(() => {
    if (watchedAmount && watchedProcessorFee) {
      const amount = Number.parseFloat(watchedAmount) || 0
      const fee = Number.parseFloat(watchedProcessorFee) || 0
      const netAmount = Math.max(0, amount - fee)
      form.setValue("net_amount", netAmount.toFixed(2))
    }
  }, [watchedAmount, watchedProcessorFee, form])

  const [createTransaction] = useCreateAccountTransactionMutation()

  const handleSubmit = async (data: TransactionFormData) => {
    setIsSubmitting(true)
    try {
      const payload = {
        account_id: account.id,
        transaction_type: data.transaction_type,
        amount: Number.parseFloat(data.amount),
        original_amount: data.original_amount ? Number.parseFloat(data.original_amount) : undefined,
        original_currency_id: data.original_currency_id ? Number.parseInt(data.original_currency_id) : undefined,
        exchange_rate_used: data.exchange_rate_used ? Number.parseFloat(data.exchange_rate_used) : undefined,
        transfer_to_account_id: data.transfer_to_account_id ? Number.parseInt(data.transfer_to_account_id) : undefined,
        reference_number: data.reference_number,
        bank_reference: data.bank_reference || undefined,
        transaction_date: new Date(data.transaction_date).toISOString(),
        description: data.description,
        status: data.status,
        processor_fee: data.processor_fee ? Number.parseFloat(data.processor_fee) : 0,
        net_amount: data.net_amount ? Number.parseFloat(data.net_amount) : undefined,
      }

      await createTransaction(payload).unwrap()
      onTransactionAdded()
      onOpenChange(false)
      form.reset()
      toast.success("Transaction added successfully")
    } catch (error: any) {
      console.error("Transaction creation failed:", error)
      toast.error(error?.data?.detail || error?.message || "Failed to create transaction")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDialogClose = () => {
    if (!isSubmitting) {
      onOpenChange(false)
      form.reset()
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add New Transaction
          </DialogTitle>
          <DialogDescription>
            Add a new transaction to {account.name} ({account.account_number})
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Transaction Type and Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="transaction_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <InfoTooltip content="Choose the type of transaction: Credit (money coming in), Debit (money going out), Transfer (between accounts), or Currency Exchange">
                        Transaction Type
                      </InfoTooltip>
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select transaction type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {transactionTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            <div>
                              <div className="font-medium">{type.label}</div>
                              <div className="text-xs text-muted-foreground">{type.description}</div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <InfoTooltip content="Current status of the transaction: Pending (waiting), Processing (in progress), Completed (finished), Failed (unsuccessful), or Cancelled">
                        Status
                      </InfoTooltip>
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {statusOptions.map((status) => (
                          <SelectItem key={status.value} value={status.value}>
                            <div>
                              <div className="font-medium">{status.label}</div>
                              <div className="text-xs text-muted-foreground">{status.description}</div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Amount and Currency */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <InfoTooltip
                        content={`The transaction amount in ${account.currency.code}. For credits, this is money received. For debits, this is money spent.`}
                      >
                        Amount ({account.currency.code})
                      </InfoTooltip>
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input type="number" step="0.01" placeholder="0.00" className="pl-10" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="processor_fee"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <InfoTooltip content="Any fees charged by payment processors (like PayPal, Stripe, bank fees). This will be deducted from the amount to calculate net amount.">
                        Processor Fee (Optional)
                      </InfoTooltip>
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input type="number" step="0.01" placeholder="0.00" className="pl-10" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Multi-currency support */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="original_amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <InfoTooltip content="If this transaction was originally in a different currency, enter the original amount here. Used for multi-currency tracking.">
                        Original Amount (Optional)
                      </InfoTooltip>
                    </FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="0.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="original_currency_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <InfoTooltip content="The original currency if this transaction involved currency conversion. Select the currency the transaction was originally made in.">
                        Original Currency
                      </InfoTooltip>
                    </FormLabel>
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
                name="exchange_rate_used"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <InfoTooltip content="The exchange rate used to convert from original currency to account currency. Format: 1 original currency = X account currency.">
                        Exchange Rate
                      </InfoTooltip>
                    </FormLabel>
                    <FormControl>
                      <Input type="number" step="0.00000001" placeholder="1.00000000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Transfer Account (if transfer type) */}
            {(watchedTransactionType === "transfer_in" || watchedTransactionType === "transfer_out") && (
              <FormField
                control={form.control}
                name="transfer_to_account_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <InfoTooltip
                        content={`Select the ${watchedTransactionType === "transfer_in" ? "source" : "destination"} account for this transfer. Money will be ${watchedTransactionType === "transfer_in" ? "coming from" : "going to"} this account.`}
                      >
                        {watchedTransactionType === "transfer_in" ? "Transfer From Account" : "Transfer To Account"}
                      </InfoTooltip>
                    </FormLabel>
                    <FormControl>
                      <ReactSelectField
                        value={
                          bankAccounts.find((acc) => acc.id.toString() === field.value)
                            ? {
                                value: field.value,
                                label: `${bankAccounts.find((acc) => acc.id.toString() === field.value)?.name} (${bankAccounts.find((acc) => acc.id.toString() === field.value)?.account_number})`,
                              }
                            : null
                        }
                        onChange={(option) => field.onChange(option?.value || "")}
                        options={bankAccounts
                          .filter((acc) => acc.id !== account.id)
                          .map((acc) => ({
                            value: acc.id.toString(),
                            label: `${acc.name} (${acc.account_number})`,
                          }))}
                        placeholder="Select account"
                        isClearable
                        isSearchable
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* References and Date */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="reference_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <InfoTooltip content="A unique identifier for this transaction. This helps track and reference the transaction later. Auto-generated but can be customized.">
                        Reference Number
                      </InfoTooltip>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="TXN-123456" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bank_reference"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <InfoTooltip content="The reference number provided by the bank or payment processor. This helps match transactions with bank statements.">
                        Bank Reference (Optional)
                      </InfoTooltip>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Bank ref number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="transaction_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <InfoTooltip content="The actual date when the transaction occurred. This may be different from when you're recording it in the system.">
                        Transaction Date
                      </InfoTooltip>
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input type="date" className="pl-10" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Net Amount (calculated) */}
            {form.watch("net_amount") && (
              <FormField
                control={form.control}
                name="net_amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <InfoTooltip content="The final amount after deducting processor fees. This is automatically calculated: Amount - Processor Fee = Net Amount.">
                        Net Amount (After Fees)
                      </InfoTooltip>
                    </FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="0.00" readOnly className="bg-muted" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <InfoTooltip content="Provide details about this transaction: what it was for, who it was from/to, or any other relevant information for future reference.">
                      Description
                    </InfoTooltip>
                  </FormLabel>
                  <FormControl>
                    <Textarea placeholder="Describe the transaction..." className="resize-none" rows={3} {...field} />
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
                    Adding Transaction...
                  </>
                ) : (
                  "Add Transaction"
                )}
              </Button>
              <Button type="button" variant="outline" onClick={handleDialogClose}>
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
