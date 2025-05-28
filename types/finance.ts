// Base types for the finance system
export interface Currency {
  id: number
  code: string
  name: string
}

export interface User {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  full_name: string
}

export interface Project {
  id: number
  title: string
  description: string
}

export interface Department {
  id: number
  name: string
  description: string
}

// Financial Institution Types (Enhanced)
export interface FinancialInstitution {
  id: number
  name: string
  code: string
  branch_name?: string
  branch_code?: string
  address?: string
  contact_person?: string
  contact_phone?: string
  contact_email?: string
  is_active: boolean
  created_at: string
  accounts_count: number
  // Enhanced fields
  institution_type: "bank" | "credit_union" | "online" | "mobile_money" | "other"
  country: string
  city?: string
  postal_code?: string
  website?: string
  has_online_banking: boolean
  has_mobile_banking: boolean
  has_international_transfers: boolean
  supported_currencies: Currency[]
  regulatory_license?: string
  regulatory_body?: string
  risk_rating: "low" | "medium" | "high"
  last_audit_date?: string
  compliance_certifications: string[]
}

// Bank Account Types (Enhanced)
export interface BankAccount {
  id: number
  name: string
  account_number: string
  account_type:
    | "checking"
    | "savings"
    | "money_market"
    | "restricted"
    | "project"
    | "grant"
    | "emergency"
    | "investment"
    | "paypal"
    | "stripe"
    | "mobile_money"
  financial_institution: FinancialInstitution
  currency: Currency
  purpose: string
  is_restricted: boolean
  restrictions?: string
  primary_signatory: User
  secondary_signatories: User[]
  is_active: boolean
  opening_date: string
  closing_date?: string
  minimum_balance: string
  created_by: User
  created_at: string
  updated_at: string
  current_balance: string
  formatted_balance: string
  transactions_count: number
  // Enhanced fields
  accepts_donations: boolean
  online_banking_enabled: boolean
  mobile_banking_enabled: boolean
  debit_card_enabled: boolean
  last_transaction_date?: string
  monthly_maintenance_fee?: string
  overdraft_protection: boolean
  overdraft_limit?: string
  interest_rate?: string
  routing_number?: string
  swift_code?: string
  iban?: string
  branch_address?: string
  account_status: "active" | "frozen" | "closed" | "pending"
  risk_level: "low" | "medium" | "high"
  compliance_status: "compliant" | "pending_review" | "non_compliant"
  last_reconciled_date?: string
  auto_reconciliation_enabled: boolean
  

}

// Exchange Rate Types
export interface ExchangeRate {
  id: number
  from_currency: Currency
  to_currency: Currency
  rate: string
  effective_date: string
  source: string
  created_by: User
  created_at: string
}

// Campaign Types
export interface DonationCampaign {
  id: number
  title: string
  description: string
  target_amount: string
  target_currency: Currency
  start_date: string
  end_date: string
  project?: Project
  is_active: boolean
  is_featured: boolean
  image?: string
  created_by: User
  created_at: string
  updated_at: string
  current_amount_in_target_currency: string
  progress_percentage: string
  is_completed: boolean
  donations_count: number
  donors_count: number

  donation_trends: Array<{
    day: string
    count: number
    total: number
  }>
  donor_segments: {
    micro: number
    small: number
    medium: number
    large: number
    major: number
  }
  payment_method_breakdown: Array<{
    payment_method: string
    count: number
    total: number
  }>
  geographic_distribution: Array<any>
  donation_breakdown: {
    regular_donations: {
      count: number
      total: number
      percentage: number
    }
    in_kind_donations: {
      count: number
      total: number
      percentage: number
    }
    recurring_donations: {
      count: number
      total: number
      percentage: number
    }
  }
  // Bank account data
  available_bank_accounts: BankAccount[]
  bank_accounts_by_currency: Record<string, BankAccount[]>
  campaign_bank_accounts: Array<{
    id: number
    bank_account: BankAccount
    is_primary: boolean
    created_at: string
  }>
  // Recent donations
  donations: Donation[]
  recurring_donations: RecurringDonation[]
  in_kind_donations: InKindDonation[]
}



// Donation Types
export interface Donation {
  id: number
  donor?: User
  is_anonymous: boolean
  donor_name?: string
  donor_email?: string
  campaign?: DonationCampaign
  project?: Project
  amount: string
  currency: Currency
  exchange_rate?: string
  converted_amount?: string
  converted_currency?: Currency
  donation_date: string
  payment_method:
    | "credit_card"
    | "debit_card"
    | "bank_transfer"
    | "paypal"
    | "stripe"
    | "cash"
    | "check"
    | "mobile_money"
    | "cryptocurrency"
    | "other"
  transaction_id?: string
  reference_number?: string
  status: "pending" | "processing" | "completed" | "failed" | "refunded" | "cancelled"
  processor_fee: string
  processor_fee_currency?: Currency
  net_amount?: string
  deposited_to_account?: BankAccount
  deposit_date?: string
  bank_reference?: string
  notes?: string
  receipt_sent: boolean
  receipt_number?: string
  tax_deductible: boolean
  processed_by?: User
  created_at: string
  updated_at: string
  donor_name_display: string
  formatted_amount: string
}

// Recurring Donation Types
export interface RecurringDonation {
  id: number
  donor: User
  is_anonymous: boolean
  campaign?: DonationCampaign
  project?: Project
  amount: string
  currency: Currency
  frequency: "weekly" | "monthly" | "quarterly" | "biannually" | "annually"
  start_date: string
  end_date?: string
  next_payment_date?: string
  payment_method: string
  subscription_id?: string
  status: "active" | "paused" | "cancelled" | "expired" | "failed"
  total_donated: string
  payment_count: number
  notes?: string
  created_at: string
  updated_at: string
  formatted_amount: string
}

// In-Kind Donation Types
export interface InKindDonation {
  id: number
  donor?: User
  is_anonymous: boolean
  donor_name?: string
  donor_email?: string
  campaign?: DonationCampaign
  project?: Project
  item_description: string
  category?: string
  quantity: number
  estimated_value: string
  valuation_currency: Currency
  donation_date: string
  received_date?: string
  received_by?: User
  status: "pledged" | "received" | "declined" | "expired"
  notes?: string
  receipt_sent: boolean
  receipt_number?: string
  image?: string
  created_at: string
  updated_at: string
  donor_name_display: string
  formatted_value: string
}

// Grant Types
export interface Grant {
  id: number
  title: string
  description: string
  grantor: string
  grantor_type: "government" | "foundation" | "corporate" | "individual" | "multilateral" | "other"
  amount: string
  currency: Currency
  amount_received: string
  submission_date?: string
  approval_date?: string
  start_date?: string
  end_date?: string
  application_deadline?: string
  project?: Project
  designated_account?: BankAccount
  status: "draft" | "submitted" | "under_review" | "approved" | "rejected" | "active" | "completed" | "cancelled"
  requirements?: string
  reporting_frequency?: string
  disbursement_schedule?: string
  contact_person?: string
  contact_email?: string
  contact_phone?: string
  notes?: string
  created_by: User
  managed_by?: User
  created_at: string
  updated_at: string
  remaining_amount: string
  formatted_amount: string
  reports_count: number
}

// Grant Report Types
export interface GrantReport {
  id: number
  grant: Grant
  title: string
  report_type: "interim" | "final" | "financial" | "narrative" | "annual"
  reporting_period_start: string
  reporting_period_end: string
  due_date?: string
  submission_date?: string
  submitted_by: User
  status: "draft" | "submitted" | "approved" | "rejected" | "revision_required"
  narrative: string
  financial_report: string
  outcomes: string
  challenges?: string
  next_steps?: string
  feedback?: string
  attachments?: string
  created_at: string
  updated_at: string
}

// Funding Source Types
export interface FundingSource {
  id: number
  name: string
  funding_type: "donation" | "campaign" | "grant" | "internal" | "partnership" | "government" | "investment"
  donation?: Donation
  campaign?: DonationCampaign
  grant?: Grant
  amount_available: string
  currency: Currency
  amount_allocated: string
  is_active: boolean
  created_at: string
  amount_remaining: string
  formatted_amount: string
}

// Budget Types
export interface Budget {
  id: number
  title: string
  currency_id: string
  description: string
  budget_type:
    | "project"
    | "organizational"
    | "departmental"
    | "program"
    | "emergency"
    | "capacity_building"
    | "advocacy"
    | "research"
    | "partnership"
    | "event"
    | "maintenance"
    | "contingency"
  project?: Project
  department?: Department
  total_amount: string
  currency: Currency
  spent_amount: string
  fiscal_year?: string
  start_date: string
  end_date: string
  status: "draft" | "pending_approval" | "approved" | "active" | "completed" | "cancelled"
  notes?: string
  created_by: User
  approved_by?: User
  approved_at?: string
  created_at: string
  updated_at: string
  remaining_amount: string
  spent_percentage: string
  formatted_amount: string
  total_funding_allocated: string
  items: BudgetItem[]
  budget_funding: BudgetFunding[]
  funding_breakdown: FundingBreakdown[]
}

export interface BudgetFunding {
  id: number
  funding_source: FundingSource
  amount_allocated: string
  allocation_date: string
  notes?: string
}



export interface BudgetStatistics {
  total_budgets: number
  total_allocated: number
  total_spent: number
  by_type: Array<{
    budget_type: string
    count: number
    total_amount: number
    spent_amount: number
  }>
  by_status: Array<{
    status: string
    count: number
    total_amount: number
    spent_amount: number
  }>
  utilization_summary: Array<{
    budget_id: number
    budget_title: string
    budget_type: string
    total_amount: number
    spent_amount: number
    remaining_amount: number
    utilization_percentage: number
    currency_code: string
  }>
}

export interface BudgetFilters {
  search?: string
  budget_type?: string
  status?: string
  fiscal_year?: string
  start_date?: string
  end_date?: string
  currency?: string
  min_amount?: number
  max_amount?: number
  project?: string
  department?: string
}

export interface FundingBreakdown {
  source: string
  type: string
  amount: string
  currency: string
  percentage: number
}

// Budget Item Types
export interface BudgetItem {
  id: number
  budget: Budget
  category: string
  subcategory?: string
  description: string
  budgeted_amount: string
  spent_amount: string
  is_locked: boolean
  approval_required_threshold?: string
  responsible_person?: User
  notes?: string
  created_at: string
  updated_at: string
  remaining_amount: string
  spent_percentage: string
  formatted_amount: string
  currency:Currency
}

// Organizational Expense Types
export interface OrganizationalExpense {
  id: number
  budget_item?: BudgetItem
  title: string
  description: string
  expense_type:
    | "administrative"
    | "operational"
    | "travel"
    | "equipment"
    | "supplies"
    | "services"
    | "utilities"
    | "rent"
    | "insurance"
    | "other"
  amount: string
  currency: Currency
  expense_date: string
  vendor?: string
  receipt?: string
  status: "draft" | "pending" | "approved" | "paid" | "rejected"
  submitted_by: User
  approved_by?: User
  approved_at?: string
  notes?: string
  created_at: string
  updated_at: string
  formatted_amount: string
}

// Account Transaction Types
export interface AccountTransaction {
  id: number
  account: BankAccount
  transaction_type: "credit" | "debit" | "transfer_in" | "transfer_out" | "currency_exchange"
  amount: string
  original_amount?: string
  original_currency?: Currency
  exchange_rate_used?: string
  donation?: Donation
  grant?: Grant
  expense?: OrganizationalExpense
  transfer_to_account?: BankAccount
  reference_number: string
  bank_reference?: string
  transaction_date: string
  description: string
  status: "pending" | "processing" | "completed" | "failed" | "cancelled"
  processor_fee: string
  net_amount?: string
  authorized_by: User
  is_reconciled: boolean
  reconciled_date?: string
  reconciled_by?: User
  created_at: string
  updated_at: string
  formatted_amount: string
}

// Fund Allocation Types
export interface FundAllocation {
  id: number
  source_account: BankAccount
  budget: Budget
  amount_allocated: string
  allocation_date: string
  purpose: string
  allocated_by: User
  approved_by?: User
  is_active: boolean
  created_at: string
  formatted_amount: string
}

// Statistics Types
export interface FinancialSummary {
  total_donations: string
  total_grants: string
  total_expenses: string
  total_budget_allocated: string
  total_account_balance: string
  active_campaigns_count: number
  active_grants_count: number
  pending_expenses_count: number
}

export interface DonationStats {
  period: string
  total_amount: string
  donation_count: number
  average_donation: string
  unique_donors: number
  top_campaigns: Array<{
    campaign__title: string
    total: string
    count: number
  }>
  payment_methods: Array<{
    payment_method: string
    total: string
    count: number
  }>
}

export interface CampaignPerformance {
  campaign_id: number
  campaign_title: string
  target_amount: string
  raised_amount: string
  progress_percentage: string
  donors_count: number
  days_remaining: number
}

export interface BudgetUtilization {
  budget_id: number
  budget_title: string
  budget_type: string
  total_amount: string
  spent_amount: string
  remaining_amount: string
  utilization_percentage: string
  currency_code: string
}

// Filter Types
export interface DonationFilters {
  status?: string
  payment_method?: string
  currency?: number
  campaign?: number
  project?: number
  is_anonymous?: boolean
  tax_deductible?: boolean
  receipt_sent?: boolean
  amount_min?: number
  amount_max?: number
  donation_date_from?: string
  donation_date_to?: string
  search?: string
  ordering?: string
  page?: number
  page_size?: number
}

export interface GrantFilters {
  status?: string
  grantor_type?: string
  currency?: number
  project?: number
  managed_by?: number
  amount_min?: number
  amount_max?: number
  start_date_from?: string
  start_date_to?: string
  search?: string
  ordering?: string
  page?: number
  page_size?: number
}

export interface ExpenseFilters {
  status?: string
  expense_type?: string
  currency?: number
  budget_item?: number
  submitted_by?: number
  approved_by?: number
  amount_min?: number
  amount_max?: number
  expense_date_from?: string
  expense_date_to?: string
  search?: string
  ordering?: string
  page?: number
  page_size?: number
}

export interface TransactionFilters {
  account?: number
  transaction_type?: string
  status?: string
  original_currency?: number
  authorized_by?: number
  is_reconciled?: boolean
  amount_min?: number
  amount_max?: number
  transaction_date_from?: string
  transaction_date_to?: string
  search?: string
  ordering?: string
  page?: number
  page_size?: number
}

// Bank Account Filter Types
export interface BankAccountFilters {
  account_type?: string
  financial_institution?: number
  currency?: number
  is_active?: boolean
  is_restricted?: boolean
  accepts_donations?: boolean
  online_banking_enabled?: boolean
  mobile_banking_enabled?: boolean
  debit_card_enabled?: boolean
  primary_signatory?: number
  minimum_balance_min?: number
  minimum_balance_max?: number
  current_balance_min?: number
  current_balance_max?: number
  opening_date_from?: string
  opening_date_to?: string
  search?: string
  ordering?: string
  page?: number
  page_size?: number
}

export interface FinancialInstitutionFilters {
  is_active?: boolean
  country?: string
  institution_type?: "bank" | "credit_union" | "online" | "mobile_money" | "other"
  has_online_banking?: boolean
  has_mobile_banking?: boolean
  search?: string
  ordering?: string
  page?: number
  page_size?: number
}

export interface CampaignFilters {
  is_active?: boolean
  is_featured?: boolean
  is_completed?: boolean
  project?: number
  target_currency?: number
  created_by?: number
  target_amount_min?: number
  target_amount_max?: number
  progress_min?: number
  progress_max?: number
  start_date_from?: string
  start_date_to?: string
  end_date_from?: string
  end_date_to?: string
  search?: string
  ordering?: string
  page?: number
  page_size?: number
}

export interface RecurringDonationFilters {
  status?: "active" | "paused" | "cancelled" | "expired" | "failed"
  frequency?: "weekly" | "monthly" | "quarterly" | "biannually" | "annually"
  campaign?: number
  project?: number
  donor?: number
  currency?: number
  is_anonymous?: boolean
  amount_min?: number
  amount_max?: number
  start_date_from?: string
  start_date_to?: string
  next_payment_from?: string
  next_payment_to?: string
  search?: string
  ordering?: string
  page?: number
  page_size?: number
}

export interface InKindDonationFilters {
  status?: "pledged" | "received" | "declined" | "expired"
  category?: string
  campaign?: number
  project?: number
  donor?: number
  valuation_currency?: number
  is_anonymous?: boolean
  receipt_sent?: boolean
  estimated_value_min?: number
  estimated_value_max?: number
  donation_date_from?: string
  donation_date_to?: string
  received_date_from?: string
  received_date_to?: string
  search?: string
  ordering?: string
  page?: number
  page_size?: number
}

export interface ExchangeRateFilters {
  from_currency?: number
  to_currency?: number
  source?: string
  created_by?: number
  effective_date_from?: string
  effective_date_to?: string
  rate_min?: number
  rate_max?: number
  search?: string
  ordering?: string
  page?: number
  page_size?: number
}

export interface FundAllocationFilters {
  source_account?: number
  budget?: number
  allocated_by?: number
  approved_by?: number
  is_active?: boolean
  amount_min?: number
  amount_max?: number
  allocation_date_from?: string
  allocation_date_to?: string
  search?: string
  ordering?: string
  page?: number
  page_size?: number
}

export interface GrantReportFilters {
  grant?: number
  report_type?: "interim" | "final" | "financial" | "narrative" | "annual"
  status?: "draft" | "submitted" | "approved" | "rejected" | "revision_required"
  submitted_by?: number
  due_date_from?: string
  due_date_to?: string
  submission_date_from?: string
  submission_date_to?: string
  reporting_period_start_from?: string
  reporting_period_start_to?: string
  search?: string
  ordering?: string
  page?: number
  page_size?: number
}

// API Response Types
export interface PaginatedResponse<T> {
  count: number
  next?: string
  previous?: string
  results: T[]
}

export interface ApiError {
  detail?: string
  message?: string
  errors?: Record<string, string[]>
}

// Enhanced Statistics Types
export interface DashboardMetrics {
  financial_summary: FinancialSummary
  donation_stats: DonationStats
  campaign_performance: CampaignPerformance[]
  budget_utilization: BudgetUtilization[]
  recent_transactions: AccountTransaction[]
  alerts: FinanceAlert[]
  trends: FinancialTrends
}

export interface FinanceAlert {
  id: string
  type: "low_balance" | "budget_exceeded" | "campaign_deadline" | "grant_report_due" | "compliance_issue"
  severity: "low" | "medium" | "high" | "critical"
  title: string
  message: string
  entity_type: string
  entity_id: number
  created_at: string
  is_read: boolean
  action_required: boolean
  action_url?: string
}

export interface FinancialTrends {
  donations_trend: TrendData[]
  expenses_trend: TrendData[]
  grants_trend: TrendData[]
  balance_trend: TrendData[]
}

export interface TrendData {
  period: string
  value: number
  formatted_value: string
  change_percentage: number
  change_direction: "up" | "down" | "stable"
}

export interface BankAccountSummary extends BankAccount {
  recent_transactions_count: number
  pending_transactions_count: number
  last_reconciliation_date?: string
  next_maintenance_fee_date?: string
  average_monthly_balance: string
  transaction_volume_30_days: string
}
