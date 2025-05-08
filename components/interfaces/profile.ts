
import { Address } from "./common";

export interface profileAddressDataInterface extends Address {
  profile: string;
  title: string;
  primary: boolean;
  link?: string;
  created_at?: string;
  updated_at?: string;
  id: number;
  shipping_notes?: string;
  internal_shipping_notes?: string;
}

export interface profileDataInterface {
    id: number;
    name: string;
    description?: string | null;
    website?: string | null;
    address?: string;       
    phone?: string | null;
    email?: string | null;
    link?: string | null;
    image?: string | null;   
    notes?: string | null;   
    is_customer: boolean;
    is_supplier: boolean;
    is_manufacturer: boolean;
    currency: string;
    created_by?: number | null;  
    attachments?: number[];  
    base_currency?: string;    
    currency_name?: string;    
    created_at?: string;       
    updated_at?: string;    
    profile_type?:string;
    short_address?:string;
        
  }
export interface profileAddressInterface {
  id: number;
  profile: number; 
  title: string;
  primary: boolean;
  line1: string;
  line2?: string;
  postal_code: string;
  country: string;
  shipping_notes?: string;
  internal_shipping_notes?: string;
  link?: string;
  created_at?: string;
  updated_at?: string;
}


export interface ContactPersonInterface {
  id: number;
  profile: number;
  name: string;
  phone?: string;
  email?: string | null;
  role?: string;
  created_at?: string;
  updated_at?: string;
}


export interface UserProfile {
  // Basic User Information
  id?: number
  email: string
  first_name: string
  last_name: string
  username?: string
  is_verified?: boolean
  is_staff?: boolean
  is_worker?: boolean

  // Personal Information
  date_of_birth?: string
  user_date_of_birth?: string
  disabled?: boolean
  sex?: string
  bio?: string
  profile_image?: string

  // Social Links
  linkedin_profile?: string
  profile_link?: string

  // Professional Information
  organization?: string
  position?: string
  industry?: number | { id: number; name: string; description?: string }
  industry_details?: { id: number; name: string; description?: string }
  company_size?: string
  company_website?: string

  // Contact Information
  phone_number?: string

  // Address Information
  address?: any
  address_details?: {
    id?: number
    street?: string
    street_number?: number | string
    apt_number?: number | string
    postal_code?: string
    country?: string | { id: number; name: string }
    region?: string | { id: number; name: string }
    subregion?: string | { id: number; name: string }
    city?: string | { id: number; name: string }
  }

  // Disability Information
  disability?: { id: number; name: string; description?: string }

  // Expertise
  expertise?: Array<{ id: number; name: string; description?: string }>
  expertise_details?: Array<{ id: number; name: string; description?: string }>

  // Membership & Verification
  membership_type?: { id: number; name: string; description?: string } | string | null
  is_kyc_verified?: boolean

  // KYC Information
  id_document_type?: string
  id_document_number?: string
  id_document_image_front?: string
  id_document_image_back?: string
  selfie_image?: string
  kyc_submission_date?: string
  kyc_verification_date?: string | null
  kyc_rejection_reason?: string | null
  kyc_status?: { status: string; submitted_date: string }

  // Roles
  is_executive?: boolean
  is_ceo?: boolean
  is_project_manager?: boolean
  is_donor?: boolean
  is_volunteer?: boolean
  is_partner?: boolean
  is_DB_staff?: boolean
  is_standard_member?: boolean
  is_DB_executive?: boolean
  is_DB_admin?: boolean
  is_country_director?: boolean
  is_regional_head?: boolean
  is_benefactor?: boolean

  // Partnership Information
  partnership_type?: any
  partnership_level?: any
  partnership_type_details?: any
  partnership_level_details?: any
  assigned_region?: any
  partnership_start_date?: string | null

  // Summary Information
  role_summary?: string[]
  full_name?: string

  // Timestamps
  created_at: string
  updated_at?: string

  // Nested Profile Data
  profile_data?: UserProfile
}

// Helper type for profile completeness calculation
export type ProfileCompletenessField = keyof Pick<
  UserProfile,
  | "first_name"
  | "last_name"
  | "email"
  | "date_of_birth"
  | "phone_number"
  | "bio"
  | "address"
  | "organization"
  | "position"
  | "industry"
>

// Type for profile editing state
export interface ProfileEditState {
  isEditing: boolean
  setIsEditing: (value: boolean) => void
}
