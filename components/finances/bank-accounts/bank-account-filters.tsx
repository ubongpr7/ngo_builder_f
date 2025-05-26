"use client"

import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Filter, X } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import type { BankAccountFilters, FinancialInstitution } from "@/types/finance"

interface BankAccountFiltersProps {
  filters: BankAccountFilters
  onFiltersChange: (filters: Partial<BankAccountFilters>) => void
  financialInstitutions: FinancialInstitution[]
}

const accountTypes = [
  { value: "checking", label: "Checking" },
  { value: "savings", label: "Savings" },
  { value: "money_market", label: "Money Market" },
  { value: "restricted", label: "Restricted" },
  { value: "project", label: "Project" },
  { value: "grant", label: "Grant" },
  { value: "emergency", label: "Emergency" },
  { value: "investment", label: "Investment" },
  { value: "paypal", label: "PayPal" },
  { value: "stripe", label: "Stripe" },
  { value: "mobile_money", label: "Mobile Money" },
]

export function BankAccountFilters({ filters, onFiltersChange, financialInstitutions }: BankAccountFiltersProps) {
  const activeFiltersCount =
    Object.values(filters).filter((value) => value !== undefined && value !== null && value !== "").length - 2 // Exclude page and page_size

  const clearFilters = () => {
    onFiltersChange({
      account_type: undefined,
      financial_institution: undefined,
      currency: undefined,
      is_active: undefined,
      is_restricted: undefined,
      accepts_donations: undefined,
      online_banking_enabled: undefined,
      mobile_banking_enabled: undefined,
      debit_card_enabled: undefined,
    })
  }

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="relative">
            <Filter className="h-4 w-4 mr-2" />
            Filters
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-2 h-5 w-5 rounded-full p-0 text-xs">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-80" align="end">
          <DropdownMenuLabel className="flex items-center justify-between">
            Filter Options
            {activeFiltersCount > 0 && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="h-3 w-3 mr-1" />
                Clear
              </Button>
            )}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />

          <div className="p-4 space-y-4">
            {/* Account Type */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Account Type</Label>
              <Select
                value={filters.account_type || ""}
                onValueChange={(value) => onFiltersChange({ account_type: value || undefined })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  {accountTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Financial Institution */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Financial Institution</Label>
              <Select
                value={filters.financial_institution?.toString() || ""}
                onValueChange={(value) =>
                  onFiltersChange({
                    financial_institution: value ? Number.parseInt(value) : undefined,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All institutions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All institutions</SelectItem>
                  {financialInstitutions.map((institution) => (
                    <SelectItem key={institution.id} value={institution.id.toString()}>
                      {institution.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Status Filters */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Status</Label>

              <div className="flex items-center justify-between">
                <Label htmlFor="is_active" className="text-sm">
                  Active Only
                </Label>
                <Switch
                  id="is_active"
                  checked={filters.is_active === true}
                  onCheckedChange={(checked) => onFiltersChange({ is_active: checked ? true : undefined })}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="accepts_donations" className="text-sm">
                  Accepts Donations
                </Label>
                <Switch
                  id="accepts_donations"
                  checked={filters.accepts_donations === true}
                  onCheckedChange={(checked) => onFiltersChange({ accepts_donations: checked ? true : undefined })}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="is_restricted" className="text-sm">
                  Restricted Only
                </Label>
                <Switch
                  id="is_restricted"
                  checked={filters.is_restricted === true}
                  onCheckedChange={(checked) => onFiltersChange({ is_restricted: checked ? true : undefined })}
                />
              </div>
            </div>

            {/* Banking Features */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Banking Features</Label>

              <div className="flex items-center justify-between">
                <Label htmlFor="online_banking" className="text-sm">
                  Online Banking
                </Label>
                <Switch
                  id="online_banking"
                  checked={filters.online_banking_enabled === true}
                  onCheckedChange={(checked) => onFiltersChange({ online_banking_enabled: checked ? true : undefined })}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="mobile_banking" className="text-sm">
                  Mobile Banking
                </Label>
                <Switch
                  id="mobile_banking"
                  checked={filters.mobile_banking_enabled === true}
                  onCheckedChange={(checked) => onFiltersChange({ mobile_banking_enabled: checked ? true : undefined })}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="debit_card" className="text-sm">
                  Debit Card
                </Label>
                <Switch
                  id="debit_card"
                  checked={filters.debit_card_enabled === true}
                  onCheckedChange={(checked) => onFiltersChange({ debit_card_enabled: checked ? true : undefined })}
                />
              </div>
            </div>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <div className="flex items-center gap-1 flex-wrap">
          {filters.account_type && (
            <Badge variant="secondary" className="text-xs">
              Type: {accountTypes.find((t) => t.value === filters.account_type)?.label}
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 ml-1"
                onClick={() => onFiltersChange({ account_type: undefined })}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          {filters.is_active === true && (
            <Badge variant="secondary" className="text-xs">
              Active Only
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 ml-1"
                onClick={() => onFiltersChange({ is_active: undefined })}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          {filters.accepts_donations === true && (
            <Badge variant="secondary" className="text-xs">
              Accepts Donations
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 ml-1"
                onClick={() => onFiltersChange({ accepts_donations: undefined })}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
        </div>
      )}
    </div>
  )
}
