// This is a TypeScript representation of your Django models
// You would use this for frontend type safety

export interface Membership {
    id: number
    name: string
    slug: string
    isActive: boolean
    description: string | null
  }
  
  export interface Address {
    id: number
    street: string
    city: string
    state: string
    country: string
    postalCode: string
  }
  
  export interface UserProfile {
    id: number
    user: {
      id: number
      username: string
      email: string
      firstName: string
      lastName: string
    }
    membershipType: Membership | null
    phoneNumber: string | null
    address: Address | null
    bio: string | null
    profileImage: string | null
    dateOfBirth: string | null
  
    // KYC Verification Fields
    isKycVerified: boolean
    idDocumentType: string | null
    idDocumentNumber: string | null
    idDocumentImageFront: string | null
    idDocumentImageBack: string | null
    selfieImage: string | null
    kycSubmissionDate: string | null
    kycVerificationDate: string | null
    kycRejectionReason: string | null
  
    // Role Fields
    isProjectManager: boolean
    isDonor: boolean
    isVolunteer: boolean
    isPartner: boolean
  
    // Additional Fields for Organization Members
    organization?: string | null
    position?: string | null
    industry?: string | null
    expertise?: string[] | null
  
    // Fields for Country Directors and Regional Heads
    region?: string | null
    countries?: string[] | null
  
    // Fields for Partnership Bodies
    partnershipType?: string | null
    partnershipLevel?: string | null
    partnershipStartDate?: string | null
  
    // Fields for Executives and CEOs
    companySize?: string | null
    companyWebsite?: string | null
    linkedInProfile?: string | null
  
    // Common fields
    created_at: string
    updated_at: string
  }
  