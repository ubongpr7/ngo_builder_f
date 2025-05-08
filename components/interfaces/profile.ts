
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
  // Personal Information
  id?: number
  first_name: string
  last_name: string
  email: string
  date_of_birth?: string
  sex?: string
  bio?: string
  disabled?: boolean
  disability?: {
    id: number
    name: string
    description?: string
  }
  profile_image?: string

  // Professional Information
  organization?: string
  position?: string
  industry?: {
    id: number
    name: string
    description?: string
  }
  company_size?: string
  company_website?: string
  expertise?: Array<{
    id: number
    name: string
    description?: string
  }>

  // Contact & Address Information
  phone_number?: string
  address?: {
    street_number?: string
    street?: string
    city?: {
      id: number
      name: string
    }
    subregion?: {
      id: number
      name: string
    }
    region?: {
      id: number
      name: string
    }
    country?: {
      id: number
      name: string
    }
    postal_code?: string
  }
  linkedin_profile?: string
  profile_link?: string

  // Membership & Verification
  membership_type?: {
    id: number
    name: string
    description?: string
  }
  is_kyc_verified?: boolean

  // Roles
  is_standard_member?: boolean
  is_DB_executive?: boolean
  is_ceo?: boolean
  is_donor?: boolean
  is_volunteer?: boolean
  is_partner?: boolean
  is_DB_staff?: boolean
  is_DB_admin?: boolean
  is_benefactor?: boolean

  // Timestamps
  created_at: string
  updated_at?: string
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
