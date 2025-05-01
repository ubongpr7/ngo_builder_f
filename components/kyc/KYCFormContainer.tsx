"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { CheckCircle } from "lucide-react"
import type { KYCFormState } from "../interfaces/kyc-forms"
import PersonalInfoForm from "./PersonalInfoForm"
import AddressForm from "./AddressForm"
import ContactInfoForm from "./ContactInfoForm"
import IdentityVerificationForm from "./IdentityVerificationForm"
import ProfessionalInfoForm from "./ProfessionalInfoForm"
import ExpertiseForm from "./ExpertiseForm"
import RolesForm from "./RolesForm"
import { useGetProfileQuery } from "@/redux/features/profile/profileAPISlice"

const TOTAL_STEPS = 7

export default function KYCFormContainer({profileId,userId}: {profileId:string,userId:string}) {
  const router = useRouter()
  const [userProfileId, setUserProfileId] = useState('0')
  const { data: userProfile, isLoading } = useGetProfileQuery(profileId)

  const [activeTab, setActiveTab] = useState("personal-info")
  const [formState, setFormState] = useState<KYCFormState>({
    currentStep: 1,
    completedSteps: [],
    personalInfo: {
      first_name: "",
      last_name: "",
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
      date_of_birth: null,
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
      membership_type: null,
      organization: null,
      position: null,
      industry: null,
    },
    expertise: {
      expertise: [],
    },
    roles: {
      is_project_manager: false,
      is_donor: false,
      is_volunteer: false,
      is_partner: false,
      is_mentor: false,
    },
  })

  // Populate form with existing user data if available
  useEffect(() => {
    if (userProfile) {
      // Map user profile data to form state
      const updatedFormState = { ...formState }

      if (userProfile.user) {
        updatedFormState.personalInfo.first_name = userProfile.user.first_name || ""
        updatedFormState.personalInfo.last_name = userProfile.user.last_name || ""
      }

      if (userProfile.address) {
        updatedFormState.address = {
          country: userProfile.address.country || null,
          region: userProfile.address.region || null,
          subregion: userProfile.address.subregion || null,
          city: userProfile.address.city || null,
          street: userProfile.address.street || "",
          street_number: userProfile.address.street_number || null,
          apt_number: userProfile.address.apt_number || null,
          postal_code: userProfile.address.postal_code || null,
        }
      }

      updatedFormState.contactInfo = {
        phone_number: userProfile.phone_number || "",
        date_of_birth: userProfile.date_of_birth || null,
        bio: userProfile.bio || null,
      }

      // Set completed steps based on data presence
      const completedSteps: number[] = []
      if (updatedFormState.personalInfo.first_name && updatedFormState.personalInfo.last_name) {
        completedSteps.push(1)
      }

      if (updatedFormState.address.country && updatedFormState.address.city) {
        completedSteps.push(2)
      }

      if (updatedFormState.contactInfo.phone_number) {
        completedSteps.push(3)
      }

      if (userProfile.id_document_type && userProfile.id_document_number) {
        completedSteps.push(4)
        updatedFormState.identityVerification = {
          id_document_type: userProfile.id_document_type,
          id_document_number: userProfile.id_document_number,
          id_document_image_front: null,
          id_document_image_back: null,
          selfie_image: null,
        }
      }

      if (userProfile.membership_type || userProfile.industry) {
        completedSteps.push(5)
        updatedFormState.professionalInfo = {
          membership_type: userProfile.membership_type || null,
          organization: userProfile.organization || null,
          position: userProfile.position || null,
          industry: userProfile.industry || null,
        }
      }

      if (userProfile.expertise && userProfile.expertise.length > 0) {
        completedSteps.push(6)
        updatedFormState.expertise.expertise = userProfile.expertise
      }

      if (userProfile.is_project_manager !== undefined) {
        completedSteps.push(7)
        updatedFormState.roles = {
          is_project_manager: userProfile.is_project_manager || false,
          is_donor: userProfile.is_donor || false,
          is_volunteer: userProfile.is_volunteer || false,
          is_partner: userProfile.is_partner || false,
          is_mentor: false, // Assuming this is not in your model
        }
      }

      updatedFormState.completedSteps = completedSteps
      updatedFormState.currentStep = Math.min(Math.max(...completedSteps, 0) + 1, TOTAL_STEPS)

      setFormState(updatedFormState)
    }
  }, [userProfile])

  const handleStepComplete = (step: number) => {
    setFormState((prev) => {
      const completedSteps = [...prev.completedSteps]
      if (!completedSteps.includes(step)) {
        completedSteps.push(step)
      }

      // Move to next step if current step was completed
      const nextStep = step < TOTAL_STEPS ? step + 1 : step

      // Set the appropriate tab based on the next step
      switch (nextStep) {
        case 1:
          setActiveTab("personal-info")
          break
        case 2:
          setActiveTab("address")
          break
        case 3:
          setActiveTab("contact-info")
          break
        case 4:
          setActiveTab("identity-verification")
          break
        case 5:
          setActiveTab("professional-info")
          break
        case 6:
          setActiveTab("expertise")
          break
        case 7:
          setActiveTab("roles")
          break
        default:
          break
      }

      return {
        ...prev,
        currentStep: nextStep,
        completedSteps,
      }
    })
  }

  const updateFormData = (section: keyof KYCFormState, data: any) => {
    setFormState((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        ...data,
      },
    }))
  }

  const isStepCompleted = (step: number) => formState.completedSteps.includes(step)

  if (isLoading) {
    return (
      <div className="container mx-auto py-10 px-4">
        <Card className="max-w-4xl mx-auto">
          <CardContent className="p-8">
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <Card className="max-w-4xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Complete Your Profile</CardTitle>
          <CardDescription>Please provide your information to complete your membership registration</CardDescription>

          <div className="flex justify-between items-center mt-6 px-2">
            {Array.from({ length: TOTAL_STEPS }).map((_, index) => {
              const stepNumber = index + 1
              const isCompleted = isStepCompleted(stepNumber)
              const isCurrent = formState.currentStep === stepNumber

              return (
                <div key={stepNumber} className="flex flex-col items-center">
                  <div
                    className={`
                      flex items-center justify-center w-10 h-10 rounded-full 
                      ${
                        isCompleted
                          ? "bg-green-600 text-white"
                          : isCurrent
                            ? "bg-green-100 border-2 border-green-600 text-green-600"
                            : "bg-gray-100 text-gray-400"
                      }
                    `}
                  >
                    {isCompleted ? <CheckCircle className="h-5 w-5" /> : stepNumber}
                  </div>
                  <span className="text-xs mt-1 hidden md:inline">Step {stepNumber}</span>
                </div>
              )
            })}
          </div>
        </CardHeader>

        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 md:grid-cols-7 mb-8">
              <TabsTrigger value="personal-info" disabled={formState.currentStep < 1}>
                Personal
              </TabsTrigger>
              <TabsTrigger value="address" disabled={formState.currentStep < 2}>
                Address
              </TabsTrigger>
              <TabsTrigger value="contact-info" disabled={formState.currentStep < 3}>
                Contact
              </TabsTrigger>
              <TabsTrigger value="identity-verification" disabled={formState.currentStep < 4}>
                Identity
              </TabsTrigger>
              <TabsTrigger value="professional-info" disabled={formState.currentStep < 5}>
                Professional
              </TabsTrigger>
              <TabsTrigger value="expertise" disabled={formState.currentStep < 6}>
                Expertise
              </TabsTrigger>
              <TabsTrigger value="roles" disabled={formState.currentStep < 7}>
                Roles
              </TabsTrigger>
            </TabsList>

            <TabsContent value="personal-info">
              <PersonalInfoForm 
                profileId={profileId}
                userId={userId}
                formData={formState.personalInfo}
                updateFormData={(data) => updateFormData("personalInfo", data)}
                onComplete={() => handleStepComplete(1)}
              />
            </TabsContent>

            <TabsContent value="address">
              <AddressForm
                profileId={profileId}
                formData={formState.address}
                updateFormData={(data) => updateFormData("address", data)}
                onComplete={() => handleStepComplete(2)}
              />
            </TabsContent>

            <TabsContent value="contact-info">
              <ContactInfoForm
                profileId={profileId}
                formData={formState.contactInfo}
                updateFormData={(data) => updateFormData("contactInfo", data)}
                onComplete={() => handleStepComplete(3)}
              />
            </TabsContent>

            <TabsContent value="identity-verification">
              <IdentityVerificationForm
                profileId={profileId}
                formData={formState.identityVerification}
                updateFormData={(data) => updateFormData("identityVerification", data)}
                onComplete={() => handleStepComplete(4)}
              />
            </TabsContent>

            <TabsContent value="professional-info">
              <ProfessionalInfoForm
                profileId={profileId}
                formData={formState.professionalInfo}
                updateFormData={(data) => updateFormData("professionalInfo", data)}
                onComplete={() => handleStepComplete(5)}
              />
            </TabsContent>

            <TabsContent value="expertise">
              <ExpertiseForm
                profileId={profileId}
                formData={formState.expertise}
                updateFormData={(data) => updateFormData("expertise", data)}
                onComplete={() => handleStepComplete(6)}
              />
            </TabsContent>

            <TabsContent value="roles">
              <RolesForm
              profileId={profileId}
              formData={formState.roles}
                updateFormData={(data) => updateFormData("roles", data)}
                onComplete={() => handleStepComplete(7)}
              />
            </TabsContent>
          </Tabs>

          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={() => {
                const prevStep = formState.currentStep - 1
                if (prevStep >= 1) {
                  setFormState((prev) => ({ ...prev, currentStep: prevStep }))

                  // Set the appropriate tab based on the previous step
                  switch (prevStep) {
                    case 1:
                      setActiveTab("personal-info")
                      break
                    case 2:
                      setActiveTab("address")
                      break
                    case 3:
                      setActiveTab("contact-info")
                      break
                    case 4:
                      setActiveTab("identity-verification")
                      break
                    case 5:
                      setActiveTab("professional-info")
                      break
                    case 6:
                      setActiveTab("expertise")
                      break
                    case 7:
                      setActiveTab("roles")
                      break
                    default:
                      break
                  }
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

                  // Set the appropriate tab based on the next step
                  switch (nextStep) {
                    case 1:
                      setActiveTab("personal-info")
                      break
                    case 2:
                      setActiveTab("address")
                      break
                    case 3:
                      setActiveTab("contact-info")
                      break
                    case 4:
                      setActiveTab("identity-verification")
                      break
                    case 5:
                      setActiveTab("professional-info")
                      break
                    case 6:
                      setActiveTab("expertise")
                      break
                    case 7:
                      setActiveTab("roles")
                      break
                    default:
                      break
                  }
                } else if (formState.completedSteps.length === TOTAL_STEPS) {
                  // All steps completed, redirect to dashboard
                  router.push("/dashboard")
                }
              }}
              disabled={formState.currentStep >= TOTAL_STEPS && formState.completedSteps.length < TOTAL_STEPS}
              className="bg-green-600 hover:bg-green-700"
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
