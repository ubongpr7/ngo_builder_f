export interface DropdownOption {
    id: number
    name: string
    [key: string]: any
  }
  
  export interface PersonalInfoFormData {
    first_name: string
    last_name: string
    sex:string
    disabled: boolean
    disability: number | null 
    date_of_birth: string 
    linkedin_profile: string | null
    profile_link: string | null

  }
  
  export interface AddressFormData {
    country: number | null
    region: number | null
    subregion: number | null
    city: number | null
    street: string
    street_number?: number | null
    apt_number?: number | null
    postal_code?: string | null
  }
  
  export interface ContactInfoFormData {
    phone_number: string
    bio: string | null
  }
  
  export interface IdentityVerificationFormData {
    id_document_type: string
    id_document_number: string
    id_document_image_front: File | null
    id_document_image_back: File | null
    selfie_image: File | null
  }
  
  export interface ProfessionalInfoFormData {
    organization: string | null
    position: string | null
    industry: string | null
    company_size: string | null
    company_website: string | null
    
  }
  
  export interface ExpertiseFormData {
    expertise: number[]
  }
  export interface RolesFormData {
    is_donor: boolean
    is_volunteer: boolean
    is_partner: boolean
    is_DB_executive: boolean
    is_ceo: boolean
    is_standard_member: boolean
    is_DB_staff: boolean
    is_DB_admin: boolean
    is_benefactor: boolean

  }
  
  
  export interface KYCFormState {
    currentStep: number
    completedSteps: number[]
    personalInfo: PersonalInfoFormData
    address: AddressFormData
    contactInfo: ContactInfoFormData
    identityVerification: IdentityVerificationFormData
    professionalInfo: ProfessionalInfoFormData
    expertise: ExpertiseFormData
    roles: RolesFormData
  }
  