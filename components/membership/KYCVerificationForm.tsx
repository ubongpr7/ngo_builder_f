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
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { User, Home, FileCheck, CheckCircle, ChevronRight, ChevronLeft, Upload, Info } from "lucide-react"
import Link from "next/link"

// Define the schema for each step
const personalInfoSchema = z.object({
  phone_number: z.string().min(10, "Phone number must be at least 10 characters"),
  date_of_birth: z.string().min(1, "Date of birth is required"),
  bio: z.string().optional(),
})

const documentSchema = z.object({
  id_document_type: z.string().min(1, "ID type is required"),
  id_document_number: z.string().min(1, "ID number is required"),
  id_document_image_front: z.boolean().refine((val) => val === true, {
    message: "Please upload the front of your ID",
  }),
  id_document_image_back: z.boolean().refine((val) => val === true, {
    message: "Please upload the back of your ID",
  }),
  selfie_image: z.boolean().refine((val) => val === true, {
    message: "Please upload a recent photo",
  }),
  termsAccepted: z.boolean().refine((val) => val === true, {
    message: "You must accept the terms and conditions",
  }),
})

const addressSchema = z.object({
  country: z.string().min(1, "Country is required"),
  region: z.string().min(1, "Region/State is required"),
  subregion: z.string().min(1, "Subregion/LGA is required"),
  city: z.string().min(1, "City is required"),
  street: z.string().min(1, "Street is required"),
  street_number: z.string().optional(),
  apt_number: z.string().optional(),
  postal_code: z.string().optional(),
})

// Combine all schemas for the final submission
const formSchema = z.object({
  ...personalInfoSchema.shape,
  ...documentSchema.shape,
  ...addressSchema.shape,
})

type FormData = z.infer<typeof formSchema>

export default function KYCVerificationForm() {
  const [activeStep, setActiveStep] = useState("personal")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [stepValidation, setStepValidation] = useState({
    personal: false,
    documents: false,
    address: false,
  })
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({})
  const router = useRouter()
  const { toast } = useToast()

  // Initialize the form with react-hook-form
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      phone_number: "",
      date_of_birth: "",
      bio: "",
      id_document_type: "",
      id_document_number: "",
      id_document_image_front: false,
      id_document_image_back: false,
      selfie_image: false,
      termsAccepted: false,
      country: "",
      region: "",
      subregion: "",
      city: "",
      street: "",
      street_number: "",
      apt_number: "",
      postal_code: "",
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
      const result = await trigger(["phone_number", "date_of_birth", "bio"])
      setStepValidation((prev) => ({ ...prev, personal: result }))
    }

    const validateDocumentsStep = async () => {
      const result = await trigger([
        "id_document_type",
        "id_document_number",
        "id_document_image_front",
        "id_document_image_back",
        "selfie_image",
        "termsAccepted",
      ])
      setStepValidation((prev) => ({ ...prev, documents: result }))
    }

    const validateAddressStep = async () => {
      const result = await trigger(["country", "region", "subregion", "city", "street"])
      setStepValidation((prev) => ({ ...prev, address: result }))
    }

    if (activeStep === "personal") {
      validatePersonalStep()
    } else if (activeStep === "documents") {
      validateDocumentsStep()
    } else if (activeStep === "address") {
      validateAddressStep()
    }
  }, [formValues, activeStep, trigger])

  // Handle step navigation
  const handleNextStep = async () => {
    if (activeStep === "personal") {
      // Mark all personal fields as touched
      const personalFields = ["phone_number", "date_of_birth", "bio"]
      const newTouchedFields = personalFields.reduce((acc, field) => ({ ...acc, [field]: true }), {})
      setTouchedFields((prev) => ({ ...prev, ...newTouchedFields }))

      if (stepValidation.personal) {
        setActiveStep("documents")
      }
    } else if (activeStep === "documents") {
      // Mark all document fields as touched
      const documentFields = [
        "id_document_type",
        "id_document_number",
        "id_document_image_front",
        "id_document_image_back",
        "selfie_image",
        "termsAccepted",
      ]
      const newTouchedFields = documentFields.reduce((acc, field) => ({ ...acc, [field]: true }), {})
      setTouchedFields((prev) => ({ ...prev, ...newTouchedFields }))

      if (stepValidation.documents) {
        setActiveStep("address")
      }
    }
  }

  const handlePreviousStep = () => {
    if (activeStep === "documents") {
      setActiveStep("personal")
    } else if (activeStep === "address") {
      setActiveStep("documents")
    }
  }

  const markAsTouched = (fieldName: string) => {
    setTouchedFields((prev) => ({ ...prev, [fieldName]: true }))
  }

  // Handle form submission
  const onSubmit = async (data: FormData) => {
    // Mark all address fields as touched
    const addressFields = [
      "country",
      "region",
      "subregion",
      "city",
      "street",
      "street_number",
      "apt_number",
      "postal_code",
    ]
    const newTouchedFields = addressFields.reduce((acc, field) => ({ ...acc, [field]: true }), {})
    setTouchedFields((prev) => ({ ...prev, ...newTouchedFields }))

    if (stepValidation.address) {
      setIsSubmitting(true)

      // Format data for backend
      const formattedData = {
        profile: {
          phone_number: data.phone_number,
          date_of_birth: data.date_of_birth,
          bio: data.bio,
          id_document_type: data.id_document_type,
          id_document_number: data.id_document_number,
          // The actual file uploads would be handled separately
        },
        address: {
          country: data.country,
          region: data.region,
          subregion: data.subregion,
          city: data.city,
          street: data.street,
          street_number: data.street_number ? Number.parseInt(data.street_number) : null,
          apt_number: data.apt_number ? Number.parseInt(data.apt_number) : null,
          postal_code: data.postal_code,
        },
      }

      // Simulate API call
      console.log("Submitting KYC data:", formattedData)

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
  const regions = {
    Nigeria: ["Lagos", "Abuja FCT", "Rivers", "Kano", "Kaduna", "Oyo"],
    Ghana: ["Greater Accra", "Ashanti", "Western", "Eastern", "Central"],
    Kenya: ["Nairobi", "Mombasa", "Kisumu", "Nakuru", "Eldoret"],
    "South Africa": ["Gauteng", "Western Cape", "KwaZulu-Natal", "Eastern Cape"],
  }
  const subregions = {
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
  const handleFileUpload = (field: "id_document_image_front" | "id_document_image_back" | "selfie_image") => {
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
                  value="documents"
                  onClick={() => stepValidation.personal && setActiveStep("documents")}
                  disabled={!stepValidation.personal}
                  className="flex items-center justify-center gap-1 py-1.5 px-0 text-[10px] sm:text-xs"
                >
                  <FileCheck className="h-3 w-3" />
                  <span className="hidden xs:inline">Documents</span>
                  {stepValidation.documents && <CheckCircle className="h-3 w-3 text-green-500" />}
                </TabsTrigger>
                <TabsTrigger
                  value="address"
                  onClick={() => stepValidation.personal && stepValidation.documents && setActiveStep("address")}
                  disabled={!stepValidation.personal || !stepValidation.documents}
                  className="flex items-center justify-center gap-1 py-1.5 px-0 text-[10px] sm:text-xs"
                >
                  <Home className="h-3 w-3" />
                  <span className="hidden xs:inline">Address</span>
                  {stepValidation.address && <CheckCircle className="h-3 w-3 text-green-500" />}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="personal" className="mt-3 sm:mt-4">
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="phone_number" className="text-xs sm:text-sm">
                      Phone Number <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="phone_number"
                      {...form.register("phone_number")}
                      placeholder="Enter your phone number"
                      onBlur={() => markAsTouched("phone_number")}
                      className="h-8 sm:h-9 text-xs sm:text-sm"
                    />
                    {touchedFields.phone_number && errors.phone_number && (
                      <p className="text-[10px] sm:text-xs text-red-500">{errors.phone_number.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="date_of_birth" className="text-xs sm:text-sm">
                      Date of Birth <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="date_of_birth"
                      type="date"
                      {...form.register("date_of_birth")}
                      onBlur={() => markAsTouched("date_of_birth")}
                      className="h-8 sm:h-9 text-xs sm:text-sm"
                    />
                    {touchedFields.date_of_birth && errors.date_of_birth && (
                      <p className="text-[10px] sm:text-xs text-red-500">{errors.date_of_birth.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio" className="text-xs sm:text-sm">
                      Bio (Optional)
                    </Label>
                    <Textarea
                      id="bio"
                      {...form.register("bio")}
                      placeholder="Tell us a bit about yourself"
                      onBlur={() => markAsTouched("bio")}
                      className="text-xs sm:text-sm min-h-[100px]"
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="documents" className="mt-3 sm:mt-4">
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="id_document_type" className="text-xs sm:text-sm">
                      ID Type <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      onValueChange={(value) => {
                        setValue("id_document_type", value)
                        markAsTouched("id_document_type")
                      }}
                      defaultValue={formValues.id_document_type}
                    >
                      <SelectTrigger
                        onBlur={() => markAsTouched("id_document_type")}
                        className="h-8 sm:h-9 text-xs sm:text-sm"
                      >
                        <SelectValue placeholder="Select ID type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="National ID Card">National ID Card</SelectItem>
                        <SelectItem value="International Passport">International Passport</SelectItem>
                        <SelectItem value="Driver's License">Driver's License</SelectItem>
                        <SelectItem value="Voter's Card">Voter's Card</SelectItem>
                      </SelectContent>
                    </Select>
                    {touchedFields.id_document_type && errors.id_document_type && (
                      <p className="text-[10px] sm:text-xs text-red-500">{errors.id_document_type.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="id_document_number" className="text-xs sm:text-sm">
                      ID Number <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="id_document_number"
                      {...form.register("id_document_number")}
                      placeholder="Enter your ID number"
                      onBlur={() => markAsTouched("id_document_number")}
                      className="h-8 sm:h-9 text-xs sm:text-sm"
                    />
                    {touchedFields.id_document_number && errors.id_document_number && (
                      <p className="text-[10px] sm:text-xs text-red-500">{errors.id_document_number.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs sm:text-sm">
                      Upload Front of ID <span className="text-red-500">*</span>
                    </Label>
                    <div
                      className="border border-dashed rounded-lg p-2 sm:p-3 text-center cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => {
                        handleFileUpload("id_document_image_front")
                        markAsTouched("id_document_image_front")
                      }}
                      onBlur={() => markAsTouched("id_document_image_front")}
                    >
                      <Upload className="h-5 w-5 mx-auto text-gray-400 mb-1" />
                      <p className="text-[10px] sm:text-xs text-gray-500">Click to upload front of ID</p>
                      {formValues.id_document_image_front && (
                        <div className="mt-1 flex items-center justify-center text-green-600">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          <span className="text-[10px] sm:text-xs">Uploaded</span>
                        </div>
                      )}
                    </div>
                    {touchedFields.id_document_image_front && errors.id_document_image_front && (
                      <p className="text-[10px] sm:text-xs text-red-500">{errors.id_document_image_front.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs sm:text-sm">
                      Upload Back of ID <span className="text-red-500">*</span>
                    </Label>
                    <div
                      className="border border-dashed rounded-lg p-2 sm:p-3 text-center cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => {
                        handleFileUpload("id_document_image_back")
                        markAsTouched("id_document_image_back")
                      }}
                      onBlur={() => markAsTouched("id_document_image_back")}
                    >
                      <Upload className="h-5 w-5 mx-auto text-gray-400 mb-1" />
                      <p className="text-[10px] sm:text-xs text-gray-500">Click to upload back of ID</p>
                      {formValues.id_document_image_back && (
                        <div className="mt-1 flex items-center justify-center text-green-600">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          <span className="text-[10px] sm:text-xs">Uploaded</span>
                        </div>
                      )}
                    </div>
                    {touchedFields.id_document_image_back && errors.id_document_image_back && (
                      <p className="text-[10px] sm:text-xs text-red-500">{errors.id_document_image_back.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs sm:text-sm">
                      Upload Selfie Photo <span className="text-red-500">*</span>
                    </Label>
                    <div
                      className="border border-dashed rounded-lg p-2 sm:p-3 text-center cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => {
                        handleFileUpload("selfie_image")
                        markAsTouched("selfie_image")
                      }}
                      onBlur={() => markAsTouched("selfie_image")}
                    >
                      <Upload className="h-5 w-5 mx-auto text-gray-400 mb-1" />
                      <p className="text-[10px] sm:text-xs text-gray-500">Click to upload selfie photo</p>
                      {formValues.selfie_image && (
                        <div className="mt-1 flex items-center justify-center text-green-600">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          <span className="text-[10px] sm:text-xs">Uploaded</span>
                        </div>
                      )}
                    </div>
                    {touchedFields.selfie_image && errors.selfie_image && (
                      <p className="text-[10px] sm:text-xs text-red-500">{errors.selfie_image.message}</p>
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

              <TabsContent value="address" className="mt-3 sm:mt-4">
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="country" className="text-xs sm:text-sm">
                      Country <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      onValueChange={(value) => {
                        setValue("country", value)
                        setValue("region", "")
                        setValue("subregion", "")
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
                    <Label htmlFor="region" className="text-xs sm:text-sm">
                      Region/State <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      onValueChange={(value) => {
                        setValue("region", value)
                        setValue("subregion", "")
                        setValue("city", "")
                        markAsTouched("region")
                      }}
                      defaultValue={formValues.region}
                      disabled={!formValues.country}
                    >
                      <SelectTrigger onBlur={() => markAsTouched("region")} className="h-8 sm:h-9 text-xs sm:text-sm">
                        <SelectValue placeholder="Select region/state" />
                      </SelectTrigger>
                      <SelectContent>
                        {formValues.country &&
                          regions[formValues.country as keyof typeof regions]?.map((region) => (
                            <SelectItem key={region} value={region}>
                              {region}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    {touchedFields.region && errors.region && (
                      <p className="text-[10px] sm:text-xs text-red-500">{errors.region.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subregion" className="text-xs sm:text-sm">
                      Subregion/LGA <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      onValueChange={(value) => {
                        setValue("subregion", value)
                        setValue("city", "")
                        markAsTouched("subregion")
                      }}
                      defaultValue={formValues.subregion}
                      disabled={!formValues.region}
                    >
                      <SelectTrigger
                        onBlur={() => markAsTouched("subregion")}
                        className="h-8 sm:h-9 text-xs sm:text-sm"
                      >
                        <SelectValue placeholder="Select subregion/LGA" />
                      </SelectTrigger>
                      <SelectContent>
                        {formValues.region &&
                          subregions[formValues.region as keyof typeof subregions]?.map((subregion) => (
                            <SelectItem key={subregion} value={subregion}>
                              {subregion}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    {touchedFields.subregion && errors.subregion && (
                      <p className="text-[10px] sm:text-xs text-red-500">{errors.subregion.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="city" className="text-xs sm:text-sm">
                      City/Town <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      onValueChange={(value) => {
                        setValue("city", value)
                        markAsTouched("city")
                      }}
                      defaultValue={formValues.city}
                      disabled={!formValues.subregion}
                    >
                      <SelectTrigger onBlur={() => markAsTouched("city")} className="h-8 sm:h-9 text-xs sm:text-sm">
                        <SelectValue placeholder="Select city/town" />
                      </SelectTrigger>
                      <SelectContent>
                        {formValues.subregion &&
                          cities[formValues.subregion as keyof typeof cities]?.map((city) => (
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
                    <Label htmlFor="street" className="text-xs sm:text-sm">
                      Street <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="street"
                      {...form.register("street")}
                      placeholder="Enter your street name"
                      onBlur={() => markAsTouched("street")}
                      className="h-8 sm:h-9 text-xs sm:text-sm"
                    />
                    {touchedFields.street && errors.street && (
                      <p className="text-[10px] sm:text-xs text-red-500">{errors.street.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-2">
                      <Label htmlFor="street_number" className="text-xs sm:text-sm">
                        Street Number
                      </Label>
                      <Input
                        id="street_number"
                        type="number"
                        {...form.register("street_number")}
                        placeholder="Street number"
                        onBlur={() => markAsTouched("street_number")}
                        className="h-8 sm:h-9 text-xs sm:text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="apt_number" className="text-xs sm:text-sm">
                        Apartment Number
                      </Label>
                      <Input
                        id="apt_number"
                        type="number"
                        {...form.register("apt_number")}
                        placeholder="Apt number"
                        onBlur={() => markAsTouched("apt_number")}
                        className="h-8 sm:h-9 text-xs sm:text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="postal_code" className="text-xs sm:text-sm">
                      Postal Code
                    </Label>
                    <Input
                      id="postal_code"
                      {...form.register("postal_code")}
                      placeholder="Enter postal code (if applicable)"
                      onBlur={() => markAsTouched("postal_code")}
                      className="h-8 sm:h-9 text-xs sm:text-sm"
                    />
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

          {activeStep !== "address" ? (
            <Button
              type="button"
              onClick={handleNextStep}
              disabled={
                (activeStep === "personal" && !stepValidation.personal) ||
                (activeStep === "documents" && !stepValidation.documents)
              }
              className="h-7 sm:h-8 text-[10px] sm:text-xs px-2 sm:px-3 bg-green-600 hover:bg-green-700"
            >
              Next <ChevronRight className="h-3 w-3 ml-1" />
            </Button>
          ) : (
            <Button
              type="submit"
              disabled={!stepValidation.address || isSubmitting}
              className="h-7 sm:h-8 text-[10px] sm:text-xs px-2 sm:px-3 bg-green-600 hover:bg-green-700"
            >
              {isSubmitting ? "Submitting..." : "Submit Verification"}
            </Button>
          )}
        </CardFooter>
      </Card>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start mb-4">
        <Info className="h-4 w-4 text-yellow-600 mr-2 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="font-medium text-yellow-800 text-xs">Verification Process</h3>
          <p className="text-[10px] sm:text-xs text-yellow-700 mt-1">
            Your verification information will be reviewed within 24-48 hours. You will be notified once your
            verification is complete.
          </p>
        </div>
      </div>
    </form>
  )
}
