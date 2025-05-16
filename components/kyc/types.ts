export interface KYCFormContainerProps {
    profileId: string
    userId: string
  }
  
  export interface FormComponentProps {
    profileId: string
    userId: string
    formData: any
    updateFormData: (data: any) => void
    onComplete: () => void
  }
  
  export interface ProfessionalInfoFormProps {
    profileId: string
    industry_id?: number | null
    formData: any
    updateFormData: (data: any) => void
    onComplete: () => void
  }
  
  export interface AddressFormProps {
    profileId: string
    addressId: string | null
    formData: any
    updateFormData: (data: any) => void
    onComplete: () => void
  }
  