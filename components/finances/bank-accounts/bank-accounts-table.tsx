"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Building,
  CreditCard,
  Smartphone,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Activity,
  CheckCircle,
  AlertCircle,
  Lock,
  Unlock,
  Star,
  DollarSign,
} from "lucide-react"
import { toast } from "react-toastify"
import { Skeleton } from "@/components/ui/skeleton"
import type { BankAccount } from "@/types/finance"

interface BankAccountsTableProps {
  accounts: BankAccount[]
  isLoading: boolean
  totalCount: number
  currentPage: number
  pageSize: number
  onPageChange: (page: number) => void
  onEditAccount: (account: BankAccount) => void
  onRefresh: () => void
}

export function BankAccountsTable({
  accounts,
  isLoading,
  totalCount,
  currentPage,
  pageSize,
  onPageChange,
  onEditAccount,
  onRefresh,
}: BankAccountsTableProps) {
  const [deletingAccount, setDeletingAccount] = useState<BankAccount | null>(null)
  const [updatingAccount, setUpdatingAccount] = useState<number | null>(null)
  const [openDropdown, setOpenDropdown] = useState<number | null>(null)

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

  const getAccountTypeColor = (accountType: string) => {
    switch (accountType) {
      case "checking":
        return "bg-blue-100 text-blue-800"
      case "savings":
        return "bg-green-100 text-green-800"
      case "restricted":
        return "bg-red-100 text-red-800"
      case "project":
        return "bg-purple-100 text-purple-800"
      case "grant":
        return "bg-orange-100 text-orange-800"
      case "paypal":
      case "stripe":
        return "bg-indigo-100 text-indigo-800"
      case "mobile_money":
        return "bg-pink-100 text-pink-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleToggleActive = async (account: BankAccount) => {
    setUpdatingAccount(account.id)
    try {
      const response = await fetch(`/api/finance/bank-accounts/${account.id}/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          is_active: !account.is_active,
        }),
      })

      if (response.ok) {
        onRefresh()
        toast.success(`Account ${!account.is_active ? "activated" : "deactivated"} successfully`)
      } else {
        throw new Error("Failed to update account")
      }
    } catch (error) {
      toast.error("Failed to update account status")
    } finally {
      setUpdatingAccount(null)
    }
  }

  const handleDeleteAccount = async (account: BankAccount) => {
    try {
      const response = await fetch(`/api/finance/bank-accounts/${account.id}/`, {
        method: "DELETE",
      })

      if (response.ok) {
        onRefresh()
        toast.success("Bank account deleted successfully")
      } else {
        const error = await response.json()
        toast.error(error.detail || "Failed to delete bank account")
      }
    } catch (error) {
      toast.error("Failed to delete bank account")
    } finally {
      setDeletingAccount(null)
    }
  }

  const totalPages = Math.ceil(totalCount / pageSize)

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-10 w-10 rounded" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-[200px]" />
                  <Skeleton className="h-3 w-[150px]" />
                </div>
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-8 w-8" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (accounts.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Bank Accounts</h3>
          <p className="text-gray-500 mb-4">Get started by adding your first bank account.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Account Details</TableHead>
                <TableHead>Institution</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Currency</TableHead>
                <TableHead>Balance</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Features</TableHead>
                <TableHead className="w-[50px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accounts.map((account) => (
                <TableRow key={account.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {getAccountTypeIcon(account.account_type)}
                      <div>
                        <div className="font-medium flex items-center gap-2">
                          {account.name}
                          {account.accepts_donations && <Star className="h-3 w-3 text-yellow-500 fill-current" />}
                        </div>
                        <div className="text-sm text-muted-foreground">****{account.account_number.slice(-4)}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div className="font-medium">{account.financial_institution.name}</div>
                      <div className="text-muted-foreground">{account.financial_institution.code}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getAccountTypeColor(account.account_type)}>
                      {account.account_type.replace("_", " ").toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{account.currency.code}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div className="font-medium">{account.formatted_balance}</div>
                      {account.minimum_balance && Number.parseFloat(account.minimum_balance) > 0 && (
                        <div className="text-xs text-muted-foreground">
                          Min: {account.currency.code} {Number.parseFloat(account.minimum_balance).toLocaleString()}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={account.is_active}
                        onCheckedChange={() => handleToggleActive(account)}
                        disabled={updatingAccount === account.id}
                      />
                      <div className="flex items-center gap-1">
                        {account.is_active ? (
                          <CheckCircle className="h-3 w-3 text-green-600" />
                        ) : (
                          <AlertCircle className="h-3 w-3 text-gray-400" />
                        )}
                        <span className="text-xs">{account.is_active ? "Active" : "Inactive"}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {account.online_banking_enabled && (
                        <Badge variant="secondary" className="text-xs">
                          Online
                        </Badge>
                      )}
                      {account.mobile_banking_enabled && (
                        <Badge variant="secondary" className="text-xs">
                          Mobile
                        </Badge>
                      )}
                      {account.debit_card_enabled && (
                        <Badge variant="secondary" className="text-xs">
                          Card
                        </Badge>
                      )}
                      {account.is_restricted && (
                        <Badge variant="destructive" className="text-xs">
                          Restricted
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu
                      open={openDropdown === account.id}
                      onOpenChange={(open) => setOpenDropdown(open ? account.id : null)}
                    >
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem
                          onClick={() => {
                            setOpenDropdown(null) // Close dropdown first
                            onEditAccount(account)
                          }}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Account
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Activity className="h-4 w-4 mr-2" />
                          View Transactions
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <DollarSign className="h-4 w-4 mr-2" />
                          Check Balance
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          {account.is_active ? (
                            <>
                              <Lock className="h-4 w-4 mr-2" />
                              Freeze Account
                            </>
                          ) : (
                            <>
                              <Unlock className="h-4 w-4 mr-2" />
                              Unfreeze Account
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => {
                            setOpenDropdown(null) // Close dropdown first
                            setDeletingAccount(account)
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Account
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, totalCount)} of {totalCount}{" "}
            accounts
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const page = i + 1
              return (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => onPageChange(page)}
                >
                  {page}
                </Button>
              )
            })}
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingAccount} onOpenChange={() => setDeletingAccount(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Bank Account</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingAccount?.name}"? This action cannot be undone and will remove
              all associated transaction history.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingAccount && handleDeleteAccount(deletingAccount)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
