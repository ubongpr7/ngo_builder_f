"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { User, Home, FileCheck, CheckCircle, AlertCircle, ChevronRight, ChevronLeft, Upload } from "lucide-react"
import Link from "next/link"

// Define the schema for each step
const personalInfoSchema = z.object({
  nin: z.string().min(11, "NIN must be at least 11 characters").max(11, "NIN must not exceed 11 characters"),
  title: z.string().min(1, "Title is required"),
  firstName: z.string().min(1, "First name is required"),
  middleName: z.string().optional(),
  lastName: z.string().min(1, "Last name is required"),
  gender: z.string().min(1, "Gender is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  phoneNumber: z.string().min(10, "Phone number must be at least 10 characters"),
  alternatePhone: z.string().optional(),
  occupation: z.string().min(1, "Occupation is required"),
  employmentStatus: z.string().min(1, "Employment status is required"),
})

const addressSchema = z.object({
  country: z.string().min(1, "Country is required"),
  stateRegion: z.string().min(1, "State/Region is required"),
  lga: z.string().min(1, "LGA/Subregion is required"),
  city: z.string().min(1, "City is required"),
  address: z.string().min(1, "Full address is required"),
  postalCode: z.string().optional(),
  residenceType: z.string().min(1, "Residence type is required"),
  residenceDuration: z.string().min(1, "Residence duration is required"),
})

const documentSchema = z.object({
  idType: z.string().min(1, "ID type is required"),
  idNumber: z.string().min(1, "ID number is required"),
  idExpiryDate: z.string().min(1, "ID expiry date is required"),
  uploadedIdFront: z.boolean().refine((val) => val === true, {
    message: "Please upload the front of your ID",
  }),
  uploadedIdBack: z.boolean().refine((val) => val === true, {
    message: "Please upload the back of your ID",
  }),
  uploadedPhoto: z.boolean().refine((val) => val === true, {
    message: "Please upload a recent photo",
  }),
  termsAccepted: z.boolean().refine((val) => val === true, {
    message: "You must accept the terms and conditions",
  }),
})

// Combine all schemas for the final submission
const formSchema = z.object({
  ...personalInfoSchema.shape,
  ...addressSchema.shape,
  ...documentSchema.shape,
})

type FormData = z.infer<typeof formSchema>

export default function KYCVerificationForm() {
  const [activeStep, setActiveStep] = useState("personal")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [stepValidation, setStepValidation] = useState({
    personal: false,
    address: false,
    documents: false,
  })
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({})
  const router = useRouter()
  const { toast } = useToast()

  // Initialize the form with react-hook-form
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nin: "",
      title: "",
      firstName: "",
      middleName: "",
      lastName: "",
      gender: "",
      dateOfBirth: "",
      phoneNumber: "",
      alternatePhone: "",
      occupation: "",
      employmentStatus: "",
      country: "",
      stateRegion: "",
      lga: "",
      city: "",
      address: "",
      postalCode: "",
      residenceType: "",
      residenceDuration: "",
      idType: "",
      idNumber: "",
      idExpiryDate: "",
      uploadedIdFront: false,
      uploadedIdBack: false,
      uploadedPhoto: false,
      termsAccepted: false,
    },
  })

  const {
    watch,
    trigger,
    setValue,
    formState: { errors },
  } = form

  // Watch all form values for validation
  const formValues = watch()

  // Validate each step when form values change
  useEffect(() => {
    const validatePersonalStep = async () => {
      const result = await trigger([
        "nin",
        "title",
        "firstName",
        "lastName",
        "gender",
        "dateOfBirth",
        "phoneNumber",
        "occupation",
        "employmentStatus",
      ])
      setStepValidation((prev) => ({ ...prev, personal: result }))
    }

    const validateAddressStep = async () => {
      const result = await trigger([
        "country",
        "stateRegion",
        "lga",
        "city",
        "address",
        "residenceType",
        "residenceDuration",
      ])
      setStepValidation((prev) => ({ ...prev, address: result }))
    }

    const validateDocumentsStep = async () => {
      const result = await trigger([
        "idType",
        "idNumber",
        "idExpiryDate",
        "uploadedIdFront",
        "uploadedIdBack",
        "uploadedPhoto",
        "termsAccepted",
      ])
      setStepValidation((prev) => ({ ...prev, documents: result }))
    }

    if (activeStep === "personal") {
      validatePersonalStep()
    } else if (activeStep === "address") {
      validateAddressStep()
    } else if (activeStep === "documents") {
      validateDocumentsStep()
    }
  }, [formValues, activeStep, trigger])

  // Handle step navigation
  const handleNextStep = async () => {
    if (activeStep === "personal") {
      // Mark all personal fields as touched
      const personalFields = [
        "nin",
        "title",
        "firstName",
        "lastName",
        "gender",
        "dateOfBirth",
        "phoneNumber",
        "occupation",
        "employmentStatus",
      ]
      const newTouchedFields = personalFields.reduce((acc, field) => ({ ...acc, [field]: true }), {})
      setTouchedFields((prev) => ({ ...prev, ...newTouchedFields }))

      if (stepValidation.personal) {
        setActiveStep("address")
      }
    } else if (activeStep === "address") {
      // Mark all address fields as touched
      const addressFields = ["country", "stateRegion", "lga", "city", "address", "residenceType", "residenceDuration"]
      const newTouchedFields = addressFields.reduce((acc, field) => ({ ...acc, [field]: true }), {})
      setTouchedFields((prev) => ({ ...prev, ...newTouchedFields }))

      if (stepValidation.address) {
        setActiveStep("documents")
      }
    }
  }

  const handlePreviousStep = () => {
    if (activeStep === "address") {
      setActiveStep("personal")
    } else if (activeStep === "documents") {
      setActiveStep("address")
    }
  }

  const markAsTouched = (fieldName: string) => {
    setTouchedFields((prev) => ({ ...prev, [fieldName]: true }))
  }

  // Handle form submission
  const onSubmit = async (data: FormData) => {
    // Mark all document fields as touched
    const documentFields = [
      "idType",
      "idNumber",
      "idExpiryDate",
      "uploadedIdFront",
      "uploadedIdBack",
      "uploadedPhoto",
      "termsAccepted",
    ]
    const newTouchedFields = documentFields.reduce((acc, field) => ({ ...acc, [field]: true }), {})
    setTouchedFields((prev) => ({ ...prev, ...newTouchedFields }))

    if (stepValidation.documents) {
      setIsSubmitting(true)

      // Simulate API call
      setTimeout(() => {
        setIsSubmitting(false)
        toast({
          title: "Verification Submitted",
          description:
            "Your verification information has been submitted successfully. We will review your application shortly.",
        })
        router.push("/membership/dashboard")
      }, 2000)
    }
  }

  // Mock data for dropdowns
  const countries = ["Nigeria", "Ghana", "Kenya", "South Africa", "Ethiopia", "Egypt", "Tanzania", "Uganda"]
  const states = {
    Nigeria: ["Lagos", "Abuja FCT", "Rivers", "Kano", "Kaduna", "Oyo"],
    Ghana: ["Greater Accra", "Ashanti", "Western", "Eastern", "Central"],
    Kenya: ["Nairobi", "Mombasa", "Kisumu", "Nakuru", "Eldoret"],
    "South Africa": ["Gauteng", "Western Cape", "KwaZulu-Natal", "Eastern Cape"],
  }
  const lgas = {
    Lagos: ["Ikeja", "Alimosho", "Eti-Osa", "Surulere", "Kosofe", "Mushin"],
    "Abuja FCT": ["Abuja Municipal", "Gwagwalada", "Kuje", "Bwari", "Kwali"],
    "Greater Accra": ["Accra Metropolitan", "Tema", "Ga East", "Ga West", "La-Nkwantanang"],
    Nairobi: ["Westlands", "Dagoretti", "Kibra", "Roysambu", "Kasarani"],
  }
  const cities = {
    Ikeja: ["Ikeja GRA", "Oregun", "Opebi", "Allen Avenue", "Maryland"],
    Alimosho: ["Egbeda", "Idimu", "Ikotun", "Iyana Ipaja", "Ayobo"],
    "Accra Metropolitan": ["Osu", "Cantonments", "Airport Residential", "Legon", "Adabraka"],
    Westlands: ["Parklands", "Highridge", "Spring Valley", "Kitisuru", "Lavington"],
  }

  // Handle file uploads
  const handleFileUpload = (field: "uploadedIdFront" | "uploadedIdBack" | "uploadedPhoto") => {
    // In a real implementation, this would handle the file upload
    // For now, we'll just set the field to true to simulate a successful upload
    setValue(field, true)
    toast({
      title: "File Uploaded",
      description: "Your file has been uploaded successfully.",
    })
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
      <Card className="mb-4 sm:mb-8 border-0 sm:border">
        <CardHeader className="px-3 py-3 sm:px-6 sm:py-4">
          <CardTitle className="text-lg sm:text-xl">KYC Verification</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Complete all required information to verify your identity
          </CardDescription>
        </CardHeader>
        <CardContent className="px-3 sm:px-6">
          <div className="mb-4 sm:mb-8">
            <Tabs value={activeStep} className="w-full">
              <TabsList className="w-full grid grid-cols-3 h-auto p-1">
                <TabsTrigger
                  value="personal"
                  onClick={() => setActiveStep("personal")}
                  className="flex items-center justify-center gap-1 py-1.5 px-0 text-[10px] sm:text-xs"
                >
                  <User className="h-3 w-3" />
                  <span className="hidden xs:inline">Personal</span>
                  {stepValidation.personal && <CheckCircle className="h-3 w-3 text-green-500" />}
                </TabsTrigger>
                <TabsTrigger
                  value="address"
                  onClick={() => stepValidation.personal && setActiveStep("address")}
                  disabled={!stepValidation.personal}
                  className="flex items-center justify-center gap-1 py-1.5 px-0 text-[10px] sm:text-xs"
                >
                  <Home className="h-3 w-3" />
                  <span className="hidden xs:inline">Address</span>
                  {stepValidation.address && <CheckCircle className="h-3 w-3 text-green-500" />}
                </TabsTrigger>
                <TabsTrigger
                  value="documents"
                  onClick={() => stepValidation.personal && stepValidation.address && setActiveStep("documents")}
                  disabled={!stepValidation.personal || !stepValidation.address}
                  className="flex items-center justify-center gap-1 py-1.5 px-0 text-[10px] sm:text-xs"
                >
                  <FileCheck className="h-3 w-3" />
                  <span className="hidden xs:inline">Documents</span>
                  {stepValidation.documents && <CheckCircle className="h-3 w-3 text-green-500" />}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="personal" className="mt-3 sm:mt-4">
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="nin" className="text-xs sm:text-sm">
                      National ID Number (NIN) <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="nin"
                      {...form.register("nin")}
                      placeholder="Enter your 11-digit NIN"
                      onBlur={() => markAsTouched("nin")}
                      className="h-8 sm:h-9 text-xs sm:text-sm"
                    />
                    {touchedFields.nin && errors.nin && (
                      <p className="text-[10px] sm:text-xs text-red-500">{errors.nin.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-xs sm:text-sm">
                      Title <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      onValueChange={(value) => {
                        setValue("title", value)
                        markAsTouched("title")
                      }}
                      defaultValue={formValues.title}
                    >
                      <SelectTrigger onBlur={() => markAsTouched("title")} className="h-8 sm:h-9 text-xs sm:text-sm">
                        <SelectValue placeholder="Select title" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Mr">Mr</SelectItem>
                        <SelectItem value="Mrs">Mrs</SelectItem>
                        <SelectItem value="Miss">Miss</SelectItem>
                        <SelectItem value="Dr">Dr</SelectItem>
                        <SelectItem value="Prof">Prof</SelectItem>
                        <SelectItem value="Chief">Chief</SelectItem>
                      </SelectContent>
                    </Select>
                    {touchedFields.title && errors.title && (
                      <p className="text-[10px] sm:text-xs text-red-500">{errors.title.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-xs sm:text-sm">
                        First Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="firstName"
                        {...form.register("firstName")}
                        placeholder="First name"
                        onBlur={() => markAsTouched("firstName")}
                        className="h-8 sm:h-9 text-xs sm:text-sm"
                      />
                      {touchedFields.firstName && errors.firstName && (
                        <p className="text-[10px] sm:text-xs text-red-500">{errors.firstName.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="text-xs sm:text-sm">
                        Last Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="lastName"
                        {...form.register("lastName")}
                        placeholder="Last name"
                        onBlur={() => markAsTouched("lastName")}
                        className="h-8 sm:h-9 text-xs sm:text-sm"
                      />
                      {touchedFields.lastName && errors.lastName && (
                        <p className="text-[10px] sm:text-xs text-red-500">{errors.lastName.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="middleName" className="text-xs sm:text-sm">
                      Middle Name
                    </Label>
                    <Input
                      id="middleName"
                      {...form.register("middleName")}
                      placeholder="Middle name (optional)"
                      onBlur={() => markAsTouched("middleName")}
                      className="h-8 sm:h-9 text-xs sm:text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-2">
                      <Label htmlFor="gender" className="text-xs sm:text-sm">
                        Gender <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        onValueChange={(value) => {
                          setValue("gender", value)
                          markAsTouched("gender")
                        }}
                        defaultValue={formValues.gender}
                      >
                        <SelectTrigger onBlur={() => markAsTouched("gender")} className="h-8 sm:h-9 text-xs sm:text-sm">
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Male">Male</SelectItem>
                          <SelectItem value="Female">Female</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                          <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
                        </SelectContent>
                      </Select>
                      {touchedFields.gender && errors.gender && (
                        <p className="text-[10px] sm:text-xs text-red-500">{errors.gender.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dateOfBirth" className="text-xs sm:text-sm">
                        Date of Birth <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="dateOfBirth"
                        type="date"
                        {...form.register("dateOfBirth")}
                        onBlur={() => markAsTouched("dateOfBirth")}
                        className="h-8 sm:h-9 text-xs sm:text-sm"
                      />
                      {touchedFields.dateOfBirth && errors.dateOfBirth && (
                        <p className="text-[10px] sm:text-xs text-red-500">{errors.dateOfBirth.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber" className="text-xs sm:text-sm">
                      Phone Number <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="phoneNumber"
                      {...form.register("phoneNumber")}
                      placeholder="Enter your phone number"
                      onBlur={() => markAsTouched("phoneNumber")}
                      className="h-8 sm:h-9 text-xs sm:text-sm"
                    />
                    {touchedFields.phoneNumber && errors.phoneNumber && (
                      <p className="text-[10px] sm:text-xs text-red-500">{errors.phoneNumber.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="alternatePhone" className="text-xs sm:text-sm">
                      Alternate Phone Number
                    </Label>
                    <Input
                      id="alternatePhone"
                      {...form.register("alternatePhone")}
                      placeholder="Enter alternate phone number (optional)"
                      onBlur={() => markAsTouched("alternatePhone")}
                      className="h-8 sm:h-9 text-xs sm:text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-2">
                      <Label htmlFor="occupation" className="text-xs sm:text-sm">
                        Occupation <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="occupation"
                        {...form.register("occupation")}
                        placeholder="Your occupation"
                        onBlur={() => markAsTouched("occupation")}
                        className="h-8 sm:h-9 text-xs sm:text-sm"
                      />
                      {touchedFields.occupation && errors.occupation && (
                        <p className="text-[10px] sm:text-xs text-red-500">{errors.occupation.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="employmentStatus" className="text-xs sm:text-sm">
                        Employment Status <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        onValueChange={(value) => {
                          setValue("employmentStatus", value)
                          markAsTouched("employmentStatus")
                        }}
                        defaultValue={formValues.employmentStatus}
                      >
                        <SelectTrigger
                          onBlur={() => markAsTouched("employmentStatus")}
                          className="h-8 sm:h-9 text-xs sm:text-sm"
                        >
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Employed">Employed</SelectItem>
                          <SelectItem value="Self-Employed">Self-Employed</SelectItem>
                          <SelectItem value="Business Owner">Business Owner</SelectItem>
                          <SelectItem value="Student">Student</SelectItem>
                          <SelectItem value="Unemployed">Unemployed</SelectItem>
                          <SelectItem value="Retired">Retired</SelectItem>
                        </SelectContent>
                      </Select>
                      {touchedFields.employmentStatus && errors.employmentStatus && (
                        <p className="text-[10px] sm:text-xs text-red-500">{errors.employmentStatus.message}</p>
                      )}
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="address" className="mt-3 sm:mt-4">
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="country" className="text-xs sm:text-sm">
                      Country <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      onValueChange={(value) => {
                        setValue("country", value)
                        setValue("stateRegion", "")
                        setValue("lga", "")
                        setValue("city", "")
                        markAsTouched("country")
                      }}
                      defaultValue={formValues.country}
                    >
                      <SelectTrigger onBlur={() => markAsTouched("country")} className="h-8 sm:h-9 text-xs sm:text-sm">
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent>
                        {countries.map((country) => (
                          <SelectItem key={country} value={country}>
                            {country}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {touchedFields.country && errors.country && (
                      <p className="text-[10px] sm:text-xs text-red-500">{errors.country.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="stateRegion" className="text-xs sm:text-sm">
                      State/Region <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      onValueChange={(value) => {
                        setValue("stateRegion", value)
                        setValue("lga", "")
                        setValue("city", "")
                        markAsTouched("stateRegion")
                      }}
                      defaultValue={formValues.stateRegion}
                      disabled={!formValues.country}
                    >
                      <SelectTrigger
                        onBlur={() => markAsTouched("stateRegion")}
                        className="h-8 sm:h-9 text-xs sm:text-sm"
                      >
                        <SelectValue placeholder="Select state/region" />
                      </SelectTrigger>
                      <SelectContent>
                        {formValues.country &&
                          states[formValues.country as keyof typeof states]?.map((state) => (
                            <SelectItem key={state} value={state}>
                              {state}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    {touchedFields.stateRegion && errors.stateRegion && (
                      <p className="text-[10px] sm:text-xs text-red-500">{errors.stateRegion.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lga" className="text-xs sm:text-sm">
                      LGA/Subregion <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      onValueChange={(value) => {
                        setValue("lga", value)
                        setValue("city", "")
                        markAsTouched("lga")
                      }}
                      defaultValue={formValues.lga}
                      disabled={!formValues.stateRegion}
                    >
                      <SelectTrigger onBlur={() => markAsTouched("lga")} className="h-8 sm:h-9 text-xs sm:text-sm">
                        <SelectValue placeholder="Select LGA/subregion" />
                      </SelectTrigger>
                      <SelectContent>
                        {formValues.stateRegion &&
                          lgas[formValues.stateRegion as keyof typeof lgas]?.map((lga) => (
                            <SelectItem key={lga} value={lga}>
                              {lga}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    {touchedFields.lga && errors.lga && (
                      <p className="text-[10px] sm:text-xs text-red-500">{errors.lga.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="city" className="text-xs sm:text-sm">
                      City <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      onValueChange={(value) => {
                        setValue("city", value)
                        markAsTouched("city")
                      }}
                      defaultValue={formValues.city}
                      disabled={!formValues.lga}
                    >
                      <SelectTrigger onBlur={() => markAsTouched("city")} className="h-8 sm:h-9 text-xs sm:text-sm">
                        <SelectValue placeholder="Select city" />
                      </SelectTrigger>
                      <SelectContent>
                        {formValues.lga &&
                          cities[formValues.lga as keyof typeof cities]?.map((city) => (
                            <SelectItem key={city} value={city}>
                              {city}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    {touchedFields.city && errors.city && (
                      <p className="text-[10px] sm:text-xs text-red-500">{errors.city.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address" className="text-xs sm:text-sm">
                      Full Address <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="address"
                      {...form.register("address")}
                      placeholder="Enter your full address"
                      onBlur={() => markAsTouched("address")}
                      className="h-8 sm:h-9 text-xs sm:text-sm"
                    />
                    {touchedFields.address && errors.address && (
                      <p className="text-[10px] sm:text-xs text-red-500">{errors.address.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="postalCode" className="text-xs sm:text-sm">
                      Postal Code/ZIP Code
                    </Label>
                    <Input
                      id="postalCode"
                      {...form.register("postalCode")}
                      placeholder="Enter postal code (if applicable)"
                      onBlur={() => markAsTouched("postalCode")}
                      className="h-8 sm:h-9 text-xs sm:text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="residenceType" className="text-xs sm:text-sm">
                      Residence Type <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      onValueChange={(value) => {
                        setValue("residenceType", value)
                        markAsTouched("residenceType")
                      }}
                      defaultValue={formValues.residenceType}
                    >
                      <SelectTrigger
                        onBlur={() => markAsTouched("residenceType")}
                        className="h-8 sm:h-9 text-xs sm:text-sm"
                      >
                        <SelectValue placeholder="Select residence type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Owned">Owned</SelectItem>
                        <SelectItem value="Rented">Rented</SelectItem>
                        <SelectItem value="Family Owned">Family Owned</SelectItem>
                        <SelectItem value="Company Provided">Company Provided</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    {touchedFields.residenceType && errors.residenceType && (
                      <p className="text-[10px] sm:text-xs text-red-500">{errors.residenceType.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="residenceDuration" className="text-xs sm:text-sm">
                      How long have you lived at this address? <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      onValueChange={(value) => {
                        setValue("residenceDuration", value)
                        markAsTouched("residenceDuration")
                      }}
                      defaultValue={formValues.residenceDuration}
                    >
                      <SelectTrigger
                        onBlur={() => markAsTouched("residenceDuration")}
                        className="h-8 sm:h-9 text-xs sm:text-sm"
                      >
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Less than 6 months">Less than 6 months</SelectItem>
                        <SelectItem value="6-12 months">6-12 months</SelectItem>
                        <SelectItem value="1-3 years">1-3 years</SelectItem>
                        <SelectItem value="3-5 years">3-5 years</SelectItem>
                        <SelectItem value="5-10 years">5-10 years</SelectItem>
                        <SelectItem value="More than 10 years">More than 10 years</SelectItem>
                      </SelectContent>
                    </Select>
                    {touchedFields.residenceDuration && errors.residenceDuration && (
                      <p className="text-[10px] sm:text-xs text-red-500">{errors.residenceDuration.message}</p>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="documents" className="mt-3 sm:mt-4">
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="idType" className="text-xs sm:text-sm">
                      ID Type <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      onValueChange={(value) => {
                        setValue("idType", value)
                        markAsTouched("idType")
                      }}
                      defaultValue={formValues.idType}
                    >
                      <SelectTrigger onBlur={() => markAsTouched("idType")} className="h-8 sm:h-9 text-xs sm:text-sm">
                        <SelectValue placeholder="Select ID type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="National ID Card">National ID Card</SelectItem>
                        <SelectItem value="International Passport">International Passport</SelectItem>
                        <SelectItem value="Driver's License">Driver's License</SelectItem>
                        <SelectItem value="Voter's Card">Voter's Card</SelectItem>
                      </SelectContent>
                    </Select>
                    {touchedFields.idType && errors.idType && (
                      <p className="text-[10px] sm:text-xs text-red-500">{errors.idType.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="idNumber" className="text-xs sm:text-sm">
                      ID Number <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="idNumber"
                      {...form.register("idNumber")}
                      placeholder="Enter your ID number"
                      onBlur={() => markAsTouched("idNumber")}
                      className="h-8 sm:h-9 text-xs sm:text-sm"
                    />
                    {touchedFields.idNumber && errors.idNumber && (
                      <p className="text-[10px] sm:text-xs text-red-500">{errors.idNumber.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="idExpiryDate" className="text-xs sm:text-sm">
                      ID Expiry Date <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="idExpiryDate"
                      type="date"
                      {...form.register("idExpiryDate")}
                      onBlur={() => markAsTouched("idExpiryDate")}
                      className="h-8 sm:h-9 text-xs sm:text-sm"
                    />
                    {touchedFields.idExpiryDate && errors.idExpiryDate && (
                      <p className="text-[10px] sm:text-xs text-red-500">{errors.idExpiryDate.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs sm:text-sm">
                      Upload Front of ID <span className="text-red-500">*</span>
                    </Label>
                    <div
                      className="border border-dashed rounded-lg p-2 sm:p-3 text-center cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => {
                        handleFileUpload("uploadedIdFront")
                        markAsTouched("uploadedIdFront")
                      }}
                      onBlur={() => markAsTouched("uploadedIdFront")}
                    >
                      <Upload className="h-5 w-5 mx-auto text-gray-400 mb-1" />
                      <p className="text-[10px] sm:text-xs text-gray-500">Click to upload front of ID</p>
                      {formValues.uploadedIdFront && (
                        <div className="mt-1 flex items-center justify-center text-green-600">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          <span className="text-[10px] sm:text-xs">Uploaded</span>
                        </div>
                      )}
                    </div>
                    {touchedFields.uploadedIdFront && errors.uploadedIdFront && (
                      <p className="text-[10px] sm:text-xs text-red-500">{errors.uploadedIdFront.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs sm:text-sm">
                      Upload Back of ID <span className="text-red-500">*</span>
                    </Label>
                    <div
                      className="border border-dashed rounded-lg p-2 sm:p-3 text-center cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => {
                        handleFileUpload("uploadedIdBack")
                        markAsTouched("uploadedIdBack")
                      }}
                      onBlur={() => markAsTouched("uploadedIdBack")}
                    >
                      <Upload className="h-5 w-5 mx-auto text-gray-400 mb-1" />
                      <p className="text-[10px] sm:text-xs text-gray-500">Click to upload back of ID</p>
                      {formValues.uploadedIdBack && (
                        <div className="mt-1 flex items-center justify-center text-green-600">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          <span className="text-[10px] sm:text-xs">Uploaded</span>
                        </div>
                      )}
                    </div>
                    {touchedFields.uploadedIdBack && errors.uploadedIdBack && (
                      <p className="text-[10px] sm:text-xs text-red-500">{errors.uploadedIdBack.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs sm:text-sm">
                      Upload Recent Passport Photo <span className="text-red-500">*</span>
                    </Label>
                    <div
                      className="border border-dashed rounded-lg p-2 sm:p-3 text-center cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => {
                        handleFileUpload("uploadedPhoto")
                        markAsTouched("uploadedPhoto")
                      }}
                      onBlur={() => markAsTouched("uploadedPhoto")}
                    >
                      <Upload className="h-5 w-5 mx-auto text-gray-400 mb-1" />
                      <p className="text-[10px] sm:text-xs text-gray-500">Click to upload passport photo</p>
                      {formValues.uploadedPhoto && (
                        <div className="mt-1 flex items-center justify-center text-green-600">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          <span className="text-[10px] sm:text-xs">Uploaded</span>
                        </div>
                      )}
                    </div>
                    {touchedFields.uploadedPhoto && errors.uploadedPhoto && (
                      <p className="text-[10px] sm:text-xs text-red-500">{errors.uploadedPhoto.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-start space-x-2">
                      <Checkbox
                        id="termsAccepted"
                        checked={formValues.termsAccepted}
                        onCheckedChange={(checked) => {
                          setValue("termsAccepted", checked === true)
                          markAsTouched("termsAccepted")
                        }}
                        onBlur={() => markAsTouched("termsAccepted")}
                        className="mt-1"
                      />
                      <div className="grid gap-1 leading-none">
                        <Label htmlFor="termsAccepted" className="text-[10px] sm:text-xs font-medium">
                          I confirm that all information provided is accurate <span className="text-red-500">*</span>
                        </Label>
                        <p className="text-[10px] text-gray-500">
                          By checking this box, I agree to the{" "}
                          <Link href="/terms" className="text-green-600 hover:underline">
                            Terms
                          </Link>{" "}
                          and{" "}
                          <Link href="/privacy" className="text-green-600 hover:underline">
                            Privacy Policy
                          </Link>
                        </p>
                      </div>
                    </div>
                    {touchedFields.termsAccepted && errors.termsAccepted && (
                      <p className="text-[10px] sm:text-xs text-red-500">{errors.termsAccepted.message}</p>
                    )}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between px-3 py-3 sm:px-6 sm:py-4">
          {activeStep !== "personal" && (
            <Button
              type="button"
              variant="outline"
              onClick={handlePreviousStep}
              className="h-7 sm:h-8 text-[10px] sm:text-xs px-2 sm:px-3"
            >
              <ChevronLeft className="h-3 w-3 mr-1" /> Previous
            </Button>
          )}
          {activeStep === "personal" && (
            <div></div> // Empty div for spacing when there's no previous button
          )}

          {activeStep !== "documents" ? (
            <Button
              type="button"
              onClick={handleNextStep}
              disabled={
                (activeStep === "personal" && !stepValidation.personal) ||
                (activeStep === "address" && !stepValidation.address)
              }
              className="h-7 sm:h-8 text-[10px] sm:text-xs px-2 sm:px-3 bg-green-600 hover:bg-green-700"
            >
              Next <ChevronRight className="h-3 w-3 ml-1" />
            </Button>
          ) : (
            <Button
              type="submit"
              disabled={!stepValidation.documents || isSubmitting}
              className="h-7 sm:h-8 text-[10px] sm:text-xs px-2 sm:px-3 bg-green-600 hover:bg-green-700"
            >
              {isSubmitting ? "Submitting..." : "Submit Verification"}
            </Button>
          )}
        </CardFooter>
      </Card>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start mb-4">
        <AlertCircle className="h-4 w-4 text-yellow-600 mr-2 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="font-medium text-yellow-800 text-xs">Verification Process</h3>
          <p className="text-[10px] sm:text-xs text-yellow-700 mt-1">
            Your verification information will be reviewed within 24-48 hours.
          </p>
        </div>
      </div>
    </form>
  )
}
