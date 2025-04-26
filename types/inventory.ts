export type AssetStatus = "Available" | "In Use" | "Maintenance" | "Disposed" | "Lost" | "Reserved"

export type AssetCategory =
  | "Electronics"
  | "Furniture"
  | "Vehicles"
  | "Office Equipment"
  | "Event Supplies"
  | "Medical Equipment"
  | "Educational Materials"
  | "Books"

export interface CustomField {
  id: string
  name: string
  type: "text" | "number" | "date" | "select" | "boolean"
  value: string | number | boolean | Date | null
  options?: string[] // For select type
}

export interface MaintenanceRecord {
  id: string
  date: string
  description: string
  cost: number
  performedBy: string
  nextScheduledDate?: string
}

export interface MovementRecord {
  id: string
  date: string
  fromLocation: string
  toLocation: string
  movedBy: string
  notes?: string
}

export interface FinancialDetails {
  acquisitionCost: number
  acquisitionDate: string
  fundingSource?: string
  grantId?: string
  donorId?: string
  currentValue?: number
  depreciationMethod?: "straight-line" | "reducing-balance" | "none"
  depreciationRate?: number
  salvageValue?: number
  usefulLifeYears?: number
}

export interface AssetItem {
  id: string
  name: string
  assetTag: string
  barcode?: string
  qrCode?: string
  serialNumber?: string
  category: AssetCategory
  subcategory?: string
  status: AssetStatus
  location: string
  department?: string
  assignedTo?: string
  description?: string
  manufacturer?: string
  model?: string
  purchaseDate?: string
  warrantyExpiration?: string
  notes?: string
  quantity: number
  image?: string
  lastUpdated: string
  customFields?: CustomField[]
  maintenanceRecords?: MaintenanceRecord[]
  movementHistory?: MovementRecord[]
  financialDetails?: FinancialDetails
  attachments?: { id: string; name: string; url: string; type: string }[]
}

export interface Location {
  id: string
  name: string
  type: "Building" | "Room" | "Storage" | "Vehicle" | "Other"
  address?: string
  parent?: string // Parent location ID
  notes?: string
}

export interface Grant {
  id: string
  name: string
  fundingOrganization: string
  startDate: string
  endDate: string
  amount: number
  description?: string
  requirements?: string
  reportingDeadlines?: string[]
}

export interface Donor {
  id: string
  name: string
  type: "Individual" | "Organization" | "Foundation" | "Government"
  contactName?: string
  email?: string
  phone?: string
  address?: string
  notes?: string
  donationHistory?: {
    id: string
    date: string
    amount: number
    purpose?: string
    assets?: string[] // Asset IDs
  }[]
}
