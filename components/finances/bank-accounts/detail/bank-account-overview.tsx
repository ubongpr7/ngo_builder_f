"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Building, CreditCard, Users, Shield, AlertTriangle, CheckCircle, Info } from "lucide-react"
import type { BankAccount } from "@/types/finance"

interface BankAccountOverviewProps {
  account: BankAccount
}

export function BankAccountOverview({ account }: BankAccountOverviewProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const getFeatureBadge = (enabled: boolean, label: string) => {
    return (
      <Badge variant={enabled ? "default" : "secondary"} className="flex items-center gap-1">
        {enabled ? <CheckCircle className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
        {label}
      </Badge>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Account Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Account Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Account Number</p>
              <p className="font-mono">{account.account_number}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Account Type</p>
              <p className="capitalize">{account.account_type.replace("_", " ")}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Currency</p>
              <p>
                {account.currency.name} ({account.currency.code})
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Minimum Balance</p>
              <p>
                {account.currency.symbol}
                {account.minimum_balance}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Opening Date</p>
              <p>{formatDate(account.opening_date)}</p>
            </div>
            {account.closing_date && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Closing Date</p>
                <p>{formatDate(account.closing_date)}</p>
              </div>
            )}
          </div>

          {account.purpose && (
            <>
              <Separator />
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Purpose</p>
                <p className="text-sm">{account.purpose}</p>
              </div>
            </>
          )}

          {account.is_restricted && account.restrictions && (
            <>
              <Separator />
              <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-orange-800">Account Restrictions</p>
                    <p className="text-sm text-orange-700">{account.restrictions}</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Financial Institution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Financial Institution
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Institution Name</p>
            <p className="font-semibold">{account.financial_institution.name}</p>
          </div>

          {account.financial_institution.code && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">Institution Code</p>
              <p className="font-mono">{account.financial_institution.code}</p>
            </div>
          )}

          {account.financial_institution.branch_name && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">Branch</p>
              <p>{account.financial_institution.branch_name}</p>
              {account.financial_institution.branch_code && (
                <p className="text-sm text-muted-foreground font-mono">
                  Code: {account.financial_institution.branch_code}
                </p>
              )}
            </div>
          )}

          {account.financial_institution.address && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">Address</p>
              <p className="text-sm">{account.financial_institution.address}</p>
            </div>
          )}

          {(account.financial_institution.contact_person ||
            account.financial_institution.contact_phone ||
            account.financial_institution.contact_email) && (
            <>
              <Separator />
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Contact Information</p>
                {account.financial_institution.contact_person && (
                  <p className="text-sm">Contact: {account.financial_institution.contact_person}</p>
                )}
                {account.financial_institution.contact_phone && (
                  <p className="text-sm">Phone: {account.financial_institution.contact_phone}</p>
                )}
                {account.financial_institution.contact_email && (
                  <p className="text-sm">Email: {account.financial_institution.contact_email}</p>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Signatories */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Account Signatories
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2">Primary Signatory</p>
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
              <p className="text-sm font-medium text-muted-foreground mb-2">
                Secondary Signatories ({account.secondary_signatories.length})
              </p>
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
                    <div>
                      <p className="font-medium">{signatory.full_name}</p>
                      <p className="text-sm text-muted-foreground">{signatory.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Banking Features */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Banking Features & Services
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {getFeatureBadge(account.online_banking_enabled, "Online Banking")}
            {getFeatureBadge(account.mobile_banking_enabled, "Mobile Banking")}
            {getFeatureBadge(account.debit_card_enabled, "Debit Card")}
            {getFeatureBadge(account.accepts_donations, "Accepts Donations")}
            {getFeatureBadge(account.overdraft_protection, "Overdraft Protection")}
            {getFeatureBadge(account.auto_reconciliation_enabled, "Auto Reconciliation")}
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-4 text-sm">
            {account.routing_number && (
              <div>
                <p className="font-medium text-muted-foreground">Routing Number</p>
                <p className="font-mono">{account.routing_number}</p>
              </div>
            )}
            {account.swift_code && (
              <div>
                <p className="font-medium text-muted-foreground">SWIFT Code</p>
                <p className="font-mono">{account.swift_code}</p>
              </div>
            )}
            {account.iban && (
              <div>
                <p className="font-medium text-muted-foreground">IBAN</p>
                <p className="font-mono">{account.iban}</p>
              </div>
            )}
            {account.interest_rate && (
              <div>
                <p className="font-medium text-muted-foreground">Interest Rate</p>
                <p>{account.interest_rate}%</p>
              </div>
            )}
            {account.monthly_maintenance_fee && (
              <div>
                <p className="font-medium text-muted-foreground">Monthly Fee</p>
                <p>
                  {account.currency.symbol}
                  {account.monthly_maintenance_fee}
                </p>
              </div>
            )}
            {account.overdraft_limit && (
              <div>
                <p className="font-medium text-muted-foreground">Overdraft Limit</p>
                <p>
                  {account.currency.symbol}
                  {account.overdraft_limit}
                </p>
              </div>
            )}
          </div>

          {account.last_reconciled_date && (
            <>
              <Separator />
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Last reconciled on {formatDate(account.last_reconciled_date)}</span>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Account Metadata */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Account Metadata
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="font-medium text-muted-foreground">Created By</p>
              <p>{account.created_by.full_name}</p>
            </div>
            <div>
              <p className="font-medium text-muted-foreground">Created At</p>
              <p>{formatDate(account.created_at)}</p>
            </div>
            <div>
              <p className="font-medium text-muted-foreground">Last Updated</p>
              <p>{formatDate(account.updated_at)}</p>
            </div>
            <div>
              <p className="font-medium text-muted-foreground">Account Status</p>
              <Badge variant={account.is_active ? "default" : "destructive"}>
                {account.is_active ? "Active" : "Inactive"}
              </Badge>
            </div>
            <div>
              <p className="font-medium text-muted-foreground">Risk Level</p>
              <Badge
                variant={
                  account.risk_level === "low"
                    ? "default"
                    : account.risk_level === "medium"
                      ? "secondary"
                      : "destructive"
                }
              >
                {account.risk_level?.toUpperCase()}
              </Badge>
            </div>
            <div>
              <p className="font-medium text-muted-foreground">Compliance Status</p>
              <Badge
                variant={
                  account.compliance_status === "compliant"
                    ? "default"
                    : account.compliance_status === "pending_review"
                      ? "secondary"
                      : "destructive"
                }
              >
                {account.compliance_status?.replace("_", " ").toUpperCase()}
              </Badge>
            </div>
            {account.last_transaction_date && (
              <div>
                <p className="font-medium text-muted-foreground">Last Transaction</p>
                <p>{formatDate(account.last_transaction_date)}</p>
              </div>
            )}
            <div>
              <p className="font-medium text-muted-foreground">Total Transactions</p>
              <p>{account.transactions_count}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
