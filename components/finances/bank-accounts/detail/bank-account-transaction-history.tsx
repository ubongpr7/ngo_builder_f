"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Search,
  Filter,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  DollarSign,
  FileText,
  MoreHorizontal,
} from "lucide-react"
import { useGetAccountTransactionsQuery } from "@/redux/features/finance/bank-accounts"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Pagination } from "@/components/ui/pagination"
import { TransactionDetailsDialog } from "./transaction-details-dialog"
import type { AccountTransaction } from "@/types/finance"

interface BankAccountTransactionHistoryProps {
  accountId: number
  refetchAccounts:boolean
}

export function BankAccountTransactionHistory({ accountId,refetchAccounts }: BankAccountTransactionHistoryProps) {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("")
  const [statusFilter, setStatusFilter] = useState<string>("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [selectedTransaction, setSelectedTransaction] = useState<AccountTransaction | null>(null)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)

  const { data, isLoading, error,refetch } = useGetAccountTransactionsQuery({
    accountId,
    page,
    page_size: 20,
    search: search || undefined,
    type: typeFilter || undefined,
    status: statusFilter || undefined,
    start_date: startDate || undefined,
    end_date: endDate || undefined,
    ordering: "-transaction_date",
  })
useEffect(() => {
  let timeoutId: ReturnType<typeof setTimeout>;

  if (refetchAccounts) {
    timeoutId = setTimeout(() => {
      refetch();
    }, 500);
  }

  return () => {
    clearTimeout(timeoutId);
  };
}, [refetchAccounts, refetch]);
  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "credit":
      case "transfer_in":
        return <ArrowUpRight className="h-4 w-4 text-green-600" />
      case "debit":
      case "transfer_out":
        return <ArrowDownRight className="h-4 w-4 text-red-600" />
      default:
        return <DollarSign className="h-4 w-4 text-blue-600" />
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
      <Badge variant={variants[status as keyof typeof variants] || "outline"}>
        {status.replace("_", " ").toUpperCase()}
      </Badge>
    )
  }

  const formatAmount = (transaction: AccountTransaction) => {
    const isCredit = transaction.transaction_type === "credit" || transaction.transaction_type === "transfer_in"
    const sign = isCredit ? "+" : "-"
    return `${sign}${transaction.formatted_amount}`
  }

  const handleTransactionClick = (transaction: AccountTransaction) => {
    setSelectedTransaction(transaction)
    setShowDetailsDialog(true)
  }

  const handleExport = () => {
    // Implementation for exporting transactions
    console.log("Exporting transactions...")
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Transaction Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search transactions..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={typeFilter || "all"} onValueChange={(value) => setTypeFilter(value === "all" ? "" : value)}>
              <SelectTrigger>
                <SelectValue placeholder="Transaction Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="credit">Credit</SelectItem>
                <SelectItem value="debit">Debit</SelectItem>
                <SelectItem value="transfer_in">Transfer In</SelectItem>
                <SelectItem value="transfer_out">Transfer Out</SelectItem>
                <SelectItem value="currency_exchange">Currency Exchange</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={statusFilter || "all"}
              onValueChange={(value) => setStatusFilter(value === "all" ? "" : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            <Input
              type="date"
              placeholder="Start Date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />

            <Input type="date" placeholder="End Date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>

          <div className="flex justify-between items-center mt-4">
            <Button
              variant="outline"
              onClick={() => {
                setSearch("")
                setTypeFilter("")
                setStatusFilter("")
                setStartDate("")
                setEndDate("")
              }}
            >
              Clear Filters
            </Button>
            <Button onClick={handleExport} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Transaction History
            </span>
            {data && <span className="text-sm text-muted-foreground">{data.count} total transactions</span>}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data?.results && data.results.length > 0 ? (
            <>
              <div className="w-full overflow-x-auto">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="whitespace-nowrap">Type</TableHead>
                        <TableHead className="whitespace-nowrap">Date</TableHead>
                        <TableHead className="whitespace-nowrap">Description</TableHead>
                        <TableHead className="whitespace-nowrap">Reference</TableHead>
                        <TableHead className="whitespace-nowrap">Amount</TableHead>
                        <TableHead className="whitespace-nowrap">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.results.map((transaction:AccountTransaction) => (
                        <TableRow
                          key={transaction.id}
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => handleTransactionClick(transaction)}
                        >
                          <TableCell className="whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              {getTransactionIcon(transaction.transaction_type)}
                              <span className="capitalize">{transaction.transaction_type.replace("_", " ")}</span>
                            </div>
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              {new Date(transaction.transaction_date).toLocaleDateString()}
                            </div>
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            <div className="max-w-[200px] truncate" title={transaction.description}>
                              {transaction.description}
                            </div>
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            <code className="text-xs bg-muted px-1 py-0.5 rounded">{transaction.reference_number}</code>
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            <span
                              className={`font-medium ${
                                transaction.transaction_type === "credit" ||
                                transaction.transaction_type === "transfer_in"
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}
                            >
                              {formatAmount(transaction)}
                            </span>
                          </TableCell>
                          <TableCell className="whitespace-nowrap">{getStatusBadge(transaction.status)}</TableCell>
                          
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Pagination */}
              {data.count > 20 && (
                <div className="mt-4">
                  <Pagination currentPage={page} totalPages={Math.ceil(data.count / 20)} onPageChange={setPage} />
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Transactions Found</h3>
              <p className="text-muted-foreground">
                {search || typeFilter || statusFilter || startDate || endDate
                  ? "No transactions match your current filters."
                  : "This account has no transaction history yet."}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Transaction Details Dialog */}
      <TransactionDetailsDialog
        transaction={selectedTransaction}
        open={showDetailsDialog}
        onOpenChange={setShowDetailsDialog}
      />
    </div>
  )
}
