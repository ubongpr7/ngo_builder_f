export interface DonationCampaign {
  id: number
  title: string
  description: string
  target_amount: string
  current_amount: string
  start_date: string
  end_date: string
  project?: number
  project_name?: string
  is_active: boolean
  is_featured: boolean
  image?: string
  created_by?: number
  created_by_name?: string
  progress_percentage: number
  is_completed: boolean
  donations_count: number
  total_raised: string
  created_at: string
  updated_at: string
}

export interface Donation {
  id: number
  donor?: number
  donor_name_display: string
  campaign?: number
  campaign_title?: string
  project?: number
  project_title?: string
  amount: string
  donation_type: "one_time" | "recurring" | "in_kind"
  donation_date: string
  payment_method: string
  transaction_id?: string
  reference_number?: string
  status: "pending" | "processing" | "completed" | "failed" | "refunded" | "cancelled"
  is_anonymous: boolean
  donor_name?: string
  donor_email?: string
  notes?: string
  receipt_sent: boolean
  receipt_number?: string
  tax_deductible: boolean
  processed_by?: number
  processed_by_name?: string
  created_at: string
  updated_at: string
}

export interface RecurringDonation {
  id: number
  donor: number
  donor_name: string
  campaign?: number
  campaign_title?: string
  project?: number
  project_title?: string
  amount: string
  frequency: "weekly" | "monthly" | "quarterly" | "biannually" | "annually"
  start_date: string
  end_date?: string
  next_payment_date?: string
  payment_method: string
  subscription_id?: string
  status: "active" | "paused" | "cancelled" | "expired" | "failed"
  is_anonymous: boolean
  notes?: string
  total_donated: string
  payment_count: number
  created_at: string
  updated_at: string
}

export interface InKindDonation {
  id: number
  donor?: number
  donor_name_display: string
  campaign?: number
  campaign_title?: string
  project?: number
  project_title?: string
  item_description: string
  category?: string
  quantity: number
  estimated_value: string
  donation_date: string
  received_date?: string
  received_by?: number
  received_by_name?: string
  status: "pledged" | "received" | "declined" | "expired"
  is_anonymous: boolean
  donor_name?: string
  donor_email?: string
  notes?: string
  receipt_sent: boolean
  receipt_number?: string
  image?: string
  created_at: string
  updated_at: string
}

export interface Grant {
  id: number
  title: string
  description: string
  grantor: string
  grantor_type: "government" | "foundation" | "corporate" | "individual" | "other"
  amount: string
  amount_received: string
  submission_date?: string
  approval_date?: string
  start_date?: string
  end_date?: string
  project?: number
  project_title?: string
  status: "draft" | "submitted" | "under_review" | "approved" | "rejected" | "active" | "completed" | "cancelled"
  requirements?: string
  reporting_frequency?: string
  contact_person?: string
  contact_email?: string
  contact_phone?: string
  notes?: string
  application_deadline?: string
  created_by?: number
  created_by_name?: string
  managed_by?: number
  managed_by_name?: string
  reports_count: number
  remaining_amount: string
  created_at: string
  updated_at: string
}

export interface GrantReport {
  id: number
  grant: number
  grant_title: string
  grantor: string
  title: string
  report_type: "interim" | "final" | "financial" | "narrative" | "annual"
  reporting_period_start: string
  reporting_period_end: string
  due_date?: string
  submission_date?: string
  submitted_by: number
  submitted_by_name: string
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

export interface Budget {
  id: number
  title: string
  budget_type: "project" | "organizational" | "department" | "campaign" | "grant"
  project?: number
  project_title?: string
  campaign?: number
  campaign_title?: string
  grant?: number
  description?: string
  grant_title?: string
  fiscal_year?: string
  start_date: string
  end_date: string
  total_amount: string
  spent_amount: string
  remaining_amount: string
  spent_percentage: number
  status: "draft" | "pending_approval" | "approved" | "active" | "completed" | "cancelled"
  notes?: string
  created_by: number
  created_by_name: string
  approved_by?: number
  approved_by_name?: string
  approved_at?: string
  items_count: number
  items: BudgetItem[]
  created_at: string
  updated_at: string
}

export interface BudgetItem {
  id: number
  budget: number
  category: string
  subcategory?: string
  description: string
  budgeted_amount: string
  spent_amount: string
  remaining_amount: string
  spent_percentage: number
  notes?: string
  created_at: string
  updated_at: string
}

export interface OrganizationalExpense {
  id: number
  budget_item?: number
  budget_item_description?: string
  title: string
  description: string
  expense_type:
    | "operational"
    | "administrative"
    | "travel"
    | "equipment"
    | "supplies"
    | "services"
    | "utilities"
    | "rent"
    | "insurance"
    | "other"
  amount: string
  expense_date: string
  vendor?: string
  receipt?: string
  status: "draft" | "pending" | "approved" | "paid" | "rejected"
  submitted_by: number
  submitted_by_name: string
  approved_by?: number
  approved_by_name?: string
  approved_at?: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface FinanceSummary {
  total_donations: string
  total_grants: string
  total_expenses: string
  active_campaigns: number
  pending_expenses: number
  monthly_donations: string
  monthly_expenses: string
}

export interface DonationStats {
  total_amount: string
  total_count: number
  average_amount: string
  top_donors: any[]
  monthly_trend: any[]
}
