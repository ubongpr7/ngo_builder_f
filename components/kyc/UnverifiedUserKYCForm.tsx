"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { AlertCircle, CheckCircle } from "lucide-react"
import type { KYCFormState } from "../interfaces/kyc-forms"
import PersonalInfoForm from "./PersonalInfoForm"
import AddressForm from "./AddressForm"
import ContactInfoForm from "./ContactInfoForm"
import IdentityVerificationForm from "./IdentityVerificationForm"
import ProfessionalInfoForm from "./ProfessionalInfoForm"
import ExpertiseForm from "./ExpertiseForm"
import RolesForm from "./RolesForm"
import { useGetProfileQuery } from "@/redux/features/profile/profileAPISlice"
import { useGetAddressByIdQuery } from "@/redux/features/profile/profileRelatedAPISlice"
import { ProfileImageUploader } from "./ProfileImageUploader"
import { useGetUserProfileDetailsQuery } from "@/redux/features/profile/readProfileAPISlice"
import type { KYCFormContainerProps } from "./types"
import { Alert } from "../ui/alert"

// Step order for unverified users
const STEP_ORDER: Record<number, string> = {
  1: "personal-info",
  2: "expertise",
  3: "roles",
  4: "professional-info",
  5: "address",
  6: "contact-info",
  7: "identity-verification",
  8: "profile-image",
}

// Total number of steps for unverified users
const TOTAL_STEPS = 8

export function UnverifiedUserKYCForm({ profileId, userId }: KYCFormContainerProps) {
  const router = useRouter()

  // API queries
  const {
    data: userProfile,
    isLoading: isProfileLoading,
    refetch: refetchProfile,
  } = useGetProfileQuery(profileId, { skip: !profileId })

  const { data: userData, isLoading: isUserDataLoading } = useGetUserProfileDetailsQuery(userId, { skip: !userId })

  const addressId = userProfile?.address || null
  const { data: address, isLoading: isAddressLoading } = useGetAddressByIdQuery(
    { userProfileId: profileId, addressId: addressId },
    { skip: !addressId },
  )

  // UI state
  const [activeTab, setActiveTab] = useState(STEP_ORDER[1])

  // Initialize form state with empty values
  const [formState, setFormState] = useState<KYCFormState>({
    currentStep: 1,
    completedSteps: [],
    personalInfo: {
      first_name: "",
      last_name: "",
      date_of_birth: "",
      profile_link: "",
      linkedin_profile: "",
      sex: "",
      disabled: false,
      disability: null,
    },
    address: {
      country: null,
      region: null,
      subregion: null,
      city: null,
      street: "",
      street_number: null,
      apt_number: null,
      postal_code: null,
    },
    contactInfo: {
      phone_number: "",
      bio: null,
    },
    identityVerification: {
      id_document_type: "passport",
      id_document_number: "",
      id_document_image_front: null,
      id_document_image_back: null,
      selfie_image: null,
    },
    professionalInfo: {
      organization: null,
      position: null,
      industry: null,
      company_size: null,
      company_website: null,
    },
    expertise: {
      expertise: [],
    },
    roles: {
      is_donor: false,
      is_volunteer: false,
      is_partner: false,
      is_ceo: false,
      is_standard_member: false,
      is_DB_executive: false,
      is_DB_staff: false,
      is_benefactor: false,
      is_DB_admin: false,
    },
  })

  // Handle userData changes
  useEffect(() => {
    if (userData) {
      setFormState((prev) => {
        const updatedPersonalInfo = {
          ...prev.personalInfo,
          first_name: userData.first_name || prev.personalInfo.first_name || "",
          last_name: userData.last_name || prev.personalInfo.last_name || "",
          date_of_birth: userData.date_of_birth || prev.personalInfo.date_of_birth || "",
          profile_link: userData.profile_link || prev.personalInfo.profile_link || "",
          linkedin_profile: userData.linkedin_profile || prev.personalInfo.linkedin_profile || "",
          sex: userData.sex || prev.personalInfo.sex || "",
          disabled: userData.disabled !== undefined ? userData.disabled : prev.personalInfo.disabled || false,
          disability:
            userData.disability !== null && userData.disability !== undefined
              ? userData.disability
              : prev.personalInfo.disability || null,
        }

        return {
          ...prev,
          personalInfo: updatedPersonalInfo,
        }
      })
    }
  }, [userData])

  // Handle userProfile and address changes
  useEffect(() => {
    if (userProfile) {
      const updatedFormState = { ...formState }

      // Update address data if available
      if (userProfile.address && address) {
        updatedFormState.address = {
          country: address.country || null,
          region: address.region || null,
          subregion: address.subregion || null,
          city: address.city || null,
          street: address.street || "",
          street_number: address.street_number || null,
          apt_number: address.apt_number || null,
          postal_code: address.postal_code || null,
        }
      }

      // Update contact info
      updatedFormState.contactInfo = {
        phone_number: userProfile.phone_number || "",
        bio: userProfile.bio || null,
      }

      // Update professional info
      updatedFormState.professionalInfo = {
        organization: userProfile.organization || null,
        position: userProfile.position || null,
        industry: userProfile.industry || null,
        company_size: userProfile.company_size || null,
        company_website: userProfile.company_website || null,
      }

      // Update expertise
      if (userProfile.expertise && userProfile.expertise.length > 0) {
        updatedFormState.expertise.expertise = userProfile.expertise
      }

      // Update roles
      if (userProfile.is_project_manager !== undefined) {
        updatedFormState.roles = {
          is_donor: userProfile.is_donor || false,
          is_volunteer: userProfile.is_volunteer || false,
          is_partner: userProfile.is_partner || false,
          is_ceo: userProfile.is_ceo || false,
          is_standard_member: userProfile.is_standard_member || false,
          is_DB_executive: userProfile.is_DB_executive || false,
          is_DB_staff: userProfile.is_DB_staff || false,
          is_benefactor: userProfile.is_benefactor || false,
          is_DB_admin: userProfile.is_DB_admin || false,
        }
      }

      // Update identity verification
      if (userProfile.id_document_type && userProfile.id_document_number) {
        updatedFormState.identityVerification = {
          id_document_type: userProfile.id_document_type,
          id_document_number: userProfile.id_document_number,
          id_document_image_front: userProfile.id_document_image_front || null,
          id_document_image_back: userProfile.id_document_image_back || null,
          selfie_image: userProfile.selfie_image || null,
        }
      }

      setFormState(updatedFormState)
    }
  }, [userProfile, address])

  // Calculate completed steps and set current step
  useEffect(() => {
    const completedSteps: number[] = []

    // Check personal info completion
    if (formState.personalInfo.first_name && formState.personalInfo.last_name && formState.personalInfo.date_of_birth) {
      completedSteps.push(1)
    }

    // Check expertise completion
    if (formState.expertise.expertise && formState.expertise.expertise.length > 0) {
      completedSteps.push(2)
    }

    // Check roles completion
    if (userProfile?.is_project_manager !== undefined) {
      completedSteps.push(3)
    }

    // Check professional info completion
    if (formState.professionalInfo.industry) {
      completedSteps.push(4)
    }

    // Check address completion
    if (formState.address.country && formState.address.city) {
      completedSteps.push(5)
    }

    // Check contact info completion
    if (formState.contactInfo.phone_number) {
      completedSteps.push(6)
    }

    // Check identity verification completion
    if (userProfile?.id_document_type && userProfile?.id_document_number) {
      completedSteps.push(7)
    }

    // Check profile image completion
    if (userProfile?.profile_image) {
      completedSteps.push(8)
    }

    // Update form state with completed steps
    setFormState((prev) => {
      const nextIncompleteStep = Math.min(Math.max(...completedSteps, 0) + 1, TOTAL_STEPS)

      // Only update active tab if it's a new step
      if (nextIncompleteStep !== prev.currentStep) {
        setActiveTab(STEP_ORDER[nextIncompleteStep])
      }

      return {
        ...prev,
        completedSteps,
        currentStep: nextIncompleteStep,
      }
    })
  }, [formState.personalInfo, formState.expertise, formState.address, formState.contactInfo, userProfile])

  // Handle step complete
  const handleStepComplete = (step: number) => {
    setFormState((prev) => {
      const completedSteps = [...prev.completedSteps]
      if (!completedSteps.includes(step)) {
        completedSteps.push(step)
      }

      // Determine next step
      const nextStep = step < TOTAL_STEPS ? step + 1 : step
      setActiveTab(STEP_ORDER[nextStep])

      return {
        ...prev,
        currentStep: nextStep,
        completedSteps,
      }
    })
  }

  // Update form data
  const updateFormData = (section: keyof KYCFormState, data: any) => {
    setFormState((prev) => ({
      ...prev,
      [section]: {
        ...(typeof prev[section] === "object" && prev[section] !== null ? prev[section] : {}),
        ...data,
      },
    }))
  }

  // Check if step is completed
  const isStepCompleted = (step: number) => {
    return formState.completedSteps.includes(step)
  }

  // Show loading state
  if (isProfileLoading || isUserDataLoading || isAddressLoading) {
    return (
      <div className="container mx-auto py-10 px-4">
        <Card className="max-w-4xl mx-auto">
          <CardContent className="p-4 sm:p-8">
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 sm:py-10 px-4">
      <Card className="max-w-4xl mx-auto">
        <CardHeader className="text-center px-4 sm:px-6">
          <CardTitle className="text-xl sm:text-2xl">Profile Settings</CardTitle>
          <div className="mt-4">
            <Alert variant="default" className="text-sm">
              <AlertCircle className="h-4 w-4 mr-2" />
              Please ensure all information is accurate and up-to-date.
            </Alert>
          </div>

          <div className="sm:hidden mt-6">
            <div className="flex justify-center gap-8 mb-2 items-start">
              {[1, 2, 3, 4, 5].map((stepNumber) => (
                <div key={stepNumber} className="flex flex-col items-center">
                  <div
                    className={`flex items-center justify-center w-8 h-8 rounded-full 
                    ${
                      isStepCompleted(stepNumber)
                        ? "bg-green-600 text-white"
                        : formState.currentStep === stepNumber
                          ? "bg-green-100 border-2 border-green-600 text-green-600"
                          : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {isStepCompleted(stepNumber) ? <CheckCircle className="h-4 w-4" /> : stepNumber}
                  </div>
                  <span className="text-xs mt-1">Step {stepNumber}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-left gap-5">
              {[6, 7, 8].map((stepNumber) => (
                <div key={stepNumber} className="flex flex-col items-center ml-2">
                  <div
                    className={`flex items-center justify-center w-8 h-8 rounded-full 
                    ${
                      isStepCompleted(stepNumber)
                        ? "bg-green-600 text-white"
                        : formState.currentStep === stepNumber
                          ? "bg-green-100 border-2 border-green-600 text-green-600"
                          : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {isStepCompleted(stepNumber) ? <CheckCircle className="h-4 w-4" /> : stepNumber}
                  </div>
                  <span className="text-xs mt-1">Step {stepNumber}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Desktop step indicators */}
          <div className="hidden sm:flex justify-between items-center mt-6 px-2">
            {Array.from({ length: TOTAL_STEPS }).map((_, index) => {
              const stepNumber = index + 1
              return (
                <div key={stepNumber} className="flex flex-col items-center">
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-full 
                    ${
                      isStepCompleted(stepNumber)
                        ? "bg-green-600 text-white"
                        : formState.currentStep === stepNumber
                          ? "bg-green-100 border-2 border-green-600 text-green-600"
                          : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {isStepCompleted(stepNumber) ? <CheckCircle className="h-5 w-5" /> : stepNumber}
                  </div>
                  <span className="text-xs mt-1">Step {stepNumber}</span>
                </div>
              )
            })}
          </div>
        </CardHeader>

        <CardContent className="p-4 sm:p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            {/* Mobile TabsList */}
            <div className="sm:hidden">
              <TabsList className="grid w-full grid-cols-3 gap-2 mb-4">
                <TabsTrigger value="personal-info" disabled={formState.currentStep < 1} className="text-xs p-2">
                  1. Personal
                </TabsTrigger>
                <TabsTrigger value="expertise" disabled={formState.currentStep < 2} className="text-xs p-2">
                  2. Expertise
                </TabsTrigger>
                <TabsTrigger value="roles" disabled={formState.currentStep < 3} className="text-xs p-2">
                  3. Roles
                </TabsTrigger>
              </TabsList>
              <TabsList className="grid w-full grid-cols-3 gap-2 mb-4">
                <TabsTrigger value="professional-info" disabled={formState.currentStep < 4} className="text-xs p-2">
                  4. Professional
                </TabsTrigger>
                <TabsTrigger value="address" disabled={formState.currentStep < 5} className="text-xs p-2">
                  5. Address
                </TabsTrigger>
                <TabsTrigger value="contact-info" disabled={formState.currentStep < 6} className="text-xs p-2">
                  6. Contact
                </TabsTrigger>
              </TabsList>
              <TabsList className="grid w-full grid-cols-2 gap-2 mb-6">
                <TabsTrigger value="identity-verification" disabled={formState.currentStep < 7} className="text-xs p-2">
                  7. Identity
                </TabsTrigger>
                <TabsTrigger value="profile-image" disabled={formState.currentStep < 8} className="text-xs p-2">
                  8. Photo
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Desktop TabsList */}
            <TabsList className="hidden sm:grid w-full grid-cols-8 mb-8">
              <TabsTrigger value="personal-info" disabled={formState.currentStep < 1}>
                Personal
              </TabsTrigger>
              <TabsTrigger value="expertise" disabled={formState.currentStep < 2}>
                Expertise
              </TabsTrigger>
              <TabsTrigger value="roles" disabled={formState.currentStep < 3}>
                Roles
              </TabsTrigger>
              <TabsTrigger value="professional-info" disabled={formState.currentStep < 4}>
                Professional
              </TabsTrigger>
              <TabsTrigger value="address" disabled={formState.currentStep < 5}>
                Address
              </TabsTrigger>
              <TabsTrigger value="contact-info" disabled={formState.currentStep < 6}>
                Contact
              </TabsTrigger>
              <TabsTrigger value="identity-verification" disabled={formState.currentStep < 7}>
                Identity
              </TabsTrigger>
              <TabsTrigger value="profile-image" disabled={formState.currentStep < 8}>
                Photo
              </TabsTrigger>
            </TabsList>

            {/* Tab Contents */}
            <TabsContent value="personal-info">
              <PersonalInfoForm
                profileId={profileId}
                userId={userId}
                formData={formState.personalInfo}
                updateFormData={(data) => updateFormData("personalInfo", data)}
                onComplete={() => handleStepComplete(1)}
              />
            </TabsContent>

            <TabsContent value="expertise">
              <ExpertiseForm
                profileId={profileId}
                userId={userId}
                formData={formState.expertise}
                updateFormData={(data) => updateFormData("expertise", data)}
                onComplete={() => handleStepComplete(2)}
              />
            </TabsContent>

            <TabsContent value="roles">
              <RolesForm
                profileId={profileId}
                userId={userId}
                formData={formState.roles}
                updateFormData={(data) => updateFormData("roles", data)}
                onComplete={() => handleStepComplete(3)}
              />
            </TabsContent>

            <TabsContent value="professional-info">
              <ProfessionalInfoForm
                profileId={profileId}
                industry_id={userProfile?.industry}
                formData={formState.professionalInfo}
                updateFormData={(data) => updateFormData("professionalInfo", data)}
                onComplete={() => handleStepComplete(4)}
              />
            </TabsContent>

            <TabsContent value="address">
              <AddressForm
                profileId={profileId}
                addressId={addressId}
                formData={formState.address}
                updateFormData={(data) => updateFormData("address", data)}
                onComplete={() => handleStepComplete(5)}
              />
            </TabsContent>

            <TabsContent value="contact-info">
              <ContactInfoForm
                profileId={profileId}
                userId={userId}
                formData={formState.contactInfo}
                updateFormData={(data) => updateFormData("contactInfo", data)}
                onComplete={() => handleStepComplete(6)}
              />
            </TabsContent>

            <TabsContent value="identity-verification">
              <IdentityVerificationForm
                profileId={profileId}
                userId={userId}
                formData={formState.identityVerification}
                updateFormData={(data) => updateFormData("identityVerification", data)}
                onComplete={() => handleStepComplete(7)}
              />
            </TabsContent>

            <TabsContent value="profile-image">
              <div className="p-4 border relative rounded-md bg-gray-50">
                <h3 className="text-sm font-medium text-gray-700 mb-4">Profile Photo</h3>
                <ProfileImageUploader
                  userId={userId}
                  profileId={profileId}
                  currentImage={userProfile?.profile_image}
                  userName={
                    formState.personalInfo.first_name && formState.personalInfo.last_name
                      ? `${formState.personalInfo.first_name} ${formState.personalInfo.last_name}`
                      : "User"
                  }
                  onSuccess={refetchProfile}
                  size="lg"
                />
                <p className="text-sm text-gray-500 mt-2">Upload a clear headshot for your member profile</p>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex flex-col sm:flex-row justify-between gap-4 mt-6 sm:mt-8">
            <Button
              className="border border-green-700 hover:bg-green-700 hover:text-white"
              variant="outline"
              onClick={() => {
                const prevStep = formState.currentStep - 1
                if (prevStep >= 1) {
                  setFormState((prev) => ({ ...prev, currentStep: prevStep }))
                  setActiveTab(STEP_ORDER[prevStep])
                }
              }}
              disabled={formState.currentStep <= 1}
            >
              Previous
            </Button>

            <Button
              onClick={() => {
                const nextStep = formState.currentStep + 1
                if (nextStep <= TOTAL_STEPS) {
                  setFormState((prev) => ({ ...prev, currentStep: nextStep }))
                  setActiveTab(STEP_ORDER[nextStep])
                } else if (formState.completedSteps.length === TOTAL_STEPS) {
                  router.push("/dashboard")
                }
              }}
              disabled={formState.currentStep >= TOTAL_STEPS && formState.completedSteps.length < TOTAL_STEPS}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {formState.currentStep < TOTAL_STEPS
                ? "Next"
                : formState.completedSteps.length === TOTAL_STEPS
                  ? "Complete Registration"
                  : "Complete Current Step"}
            </Button>
          </div>
          <div className="mt-4 text-center text-sm text-gray-500">
            {formState.completedSteps.length} of {TOTAL_STEPS} steps completed
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
