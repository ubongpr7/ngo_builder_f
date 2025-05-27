"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  Calendar,
  FileText,
  Building,
  User,
  CreditCard,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Loader,
} from "lucide-react"
import type { AccountTransaction } from "@/types/finance"
import { formatCurrency } from "@/lib/currency-utils"

interface TransactionDetailsDialogProps {
  transaction: AccountTransaction | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TransactionDetailsDialog({ transaction, open, onOpenChange }: TransactionDetailsDialogProps) {
  if (!transaction) return null

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "credit":
      case "transfer_in":
        return <ArrowUpRight className="h-6 w-6 text-green-600" />
      case "debit":
      case "transfer_out":
        return <ArrowDownRight className="h-6 w-6 text-red-600" />
      default:
        return <DollarSign className="h-6 w-6 text-blue-600" />
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case "failed":
        return <XCircle className="h-5 w-5 text-red-600" />
      case "pending":
      case "processing":
        return <Loader className="h-5 w-5 text-yellow-600" />
      case "cancelled":
        return <XCircle className="h-5 w-5 text-gray-600" />
      default:
        return <AlertCircle className="h-5 w-5 text-gray-600" />
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      completed: "default",
      pending: "secondary",
      processing: "secondary",
      failed: "destructive",
      cancelled: "outline",
    } as const

    return (
      <Badge variant={variants[status as keyof typeof variants] || "outline"} className="flex items-center gap-1">
        {getStatusIcon(status)}
        {status.replace("_", " ").toUpperCase()}
      </Badge>
    )
  }

  const formatAmount = (transaction: AccountTransaction) => {
    const isCredit = transaction.transaction_type === "credit" || transaction.transaction_type === "transfer_in"
    const sign = isCredit ? "+" : "-"
    const color = isCredit ? "text-green-600" : "text-red-600"
    return (
      <span className={`font-bold text-2xl ${color}`}>
        {sign}
        {formatCurrency(transaction.account.currency.code, Number(transaction.amount))}
      </span>
    )
  }

  const getTransactionTypeLabel = (type: string) => {
    const labels = {
      credit: "Credit (Money In)",
      debit: "Debit (Money Out)",
      transfer_in: "Transfer In",
      transfer_out: "Transfer Out",
      currency_exchange: "Currency Exchange",
    }
    return labels[type as keyof typeof labels] || type
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            {getTransactionIcon(transaction.transaction_type)}
            Transaction Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Transaction Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Transaction Overview
                </span>
                {getStatusBadge(transaction.status)}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center py-4">
                {formatAmount(transaction)}
                <p className="text-sm text-muted-foreground mt-1">
                  {getTransactionTypeLabel(transaction.transaction_type)}
                </p>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Reference Number</p>
                  <p className="font-mono text-sm bg-muted px-2 py-1 rounded">{transaction.reference_number}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Transaction Date</p>
                  <p className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {new Date(transaction.transaction_date).toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Account Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Account Name</p>
                <p className="font-medium">{transaction.account.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Account Number</p>
                <p className="font-mono">{transaction.account.account_number}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Financial Institution</p>
                <p>{transaction.account.financial_institution.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Currency</p>
                <p>
                  {transaction.account.currency.code} - {transaction.account.currency.name}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Transaction Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Transaction Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Description</p>
                <p className="bg-muted p-3 rounded text-sm">{transaction.description}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Amount</p>
                  <p className="font-medium">
                    {formatCurrency(transaction.account.currency.code, Number(transaction.amount))}
                  </p>
                </div>
                {transaction.processor_fee && Number(transaction.processor_fee) > 0 && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Processor Fee</p>
                    <p className="text-red-600">
                      -{formatCurrency(transaction.account.currency.code, Number(transaction.processor_fee))}
                    </p>
                  </div>
                )}
              </div>

              {transaction.net_amount && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Net Amount</p>
                  <p className="font-medium text-green-600">
                    {formatCurrency(transaction.account.currency.code, Number(transaction.net_amount))}
                  </p>
                </div>
              )}

              {transaction.bank_reference && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Bank Reference</p>
                  <p className="font-mono text-sm">{transaction.bank_reference}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Currency Exchange Information */}
          {transaction.original_currency && transaction.original_amount && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Currency Exchange
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Original Amount</p>
                    <p className="font-medium">
                      {formatCurrency(transaction.original_currency.code, Number(transaction.original_amount))}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Converted Amount</p>
                    <p className="font-medium">
                      {formatCurrency(transaction.account.currency.code, Number(transaction.amount))}
                    </p>
                  </div>
                </div>
                {transaction.exchange_rate_used && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Exchange Rate</p>
                    <p className="font-mono">
                      1 {transaction.original_currency.code} = {Number(transaction.exchange_rate_used).toFixed(6)}{" "}
                      {transaction.account.currency.code}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Transfer Information */}
          {transaction.transfer_to_account && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ArrowUpRight className="h-5 w-5" />
                  Transfer Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Transfer To Account</p>
                  <p className="font-medium">{transaction.transfer_to_account.name}</p>
                  <p className="text-sm text-muted-foreground">{transaction.transfer_to_account.account_number}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Authorization & Reconciliation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Authorization & Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {transaction.authorized_by && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Authorized By</p>
                  <p>{transaction.authorized_by.full_name}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Reconciled</p>
                  <p className="flex items-center gap-1">
                    {transaction.is_reconciled ? (
                      <>
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        Yes
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4 text-red-600" />
                        No
                      </>
                    )}
                  </p>
                </div>
                {transaction.reconciled_date && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Reconciled Date</p>
                    <p>{new Date(transaction.reconciled_date).toLocaleString()}</p>
                  </div>
                )}
              </div>

              {transaction.reconciled_by && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Reconciled By</p>
                  <p>{transaction.reconciled_by.full_name}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Timestamps */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Timestamps
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium text-muted-foreground">Created</p>
                  <p>{new Date(transaction.created_at).toLocaleString()}</p>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">Last Updated</p>
                  <p>{new Date(transaction.updated_at).toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
