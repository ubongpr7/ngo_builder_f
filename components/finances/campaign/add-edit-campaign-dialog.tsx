"use client"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form"
import { DateInput } from "@/components/ui/date-input"
import { ReactSelectField } from "@/components/ui/react-select-field"
import { Separator } from "@/components/ui/separator"
import { Plus, Edit, Loader2, Play, Upload, X } from "lucide-react"
import { useGetAllProjectsQuery } from "@/redux/features/projects/projectsAPISlice"
import { useGetCurrenciesQuery } from "@/redux/features/common/typeOF"
import {
  useCreateDonationCampaignMutation,
  useUpdateDonationCampaignMutation,
} from "@/redux/features/finance/donation-campaigns"
import { toast } from "react-toastify"
import { format } from "date-fns"
import type { DonationCampaign } from "@/types/finance"
import Image from "next/image"
import type { Project } from "@/types/project"

interface CurrencyInterface {
  id: number
  code: string
  name: string
}

const getDefaultEndDate = (startDate: Date = new Date()) =>
  new Date(new Date(startDate).setDate(startDate.getDate() + 30))

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB for images
const MAX_VIDEO_SIZE = 50 * 1024 * 1024 // 50MB for videos
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
const ACCEPTED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/ogg", "video/avi", "video/mov"]

// Enhanced form schema with video file field
const formSchema = z
  .object({
    title: z
      .string()
      .min(2, { message: "Campaign title must be at least 2 characters." })
      .max(200, { message: "Campaign title must not exceed 200 characters." }),
    description: z.string().min(10, { message: "Description must be at least 10 characters." }),
    campaign_type: z.string().default("general"),
    target_amount: z
      .string()
      .min(1, { message: "Target amount is required." })
      .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
        message: "Target amount must be a positive number.",
      }),
    minimum_goal: z
      .string()
      .optional()
      .refine((val) => !val || (!isNaN(Number(val)) && Number(val) > 0), {
        message: "Minimum goal must be a positive number.",
      }),
    target_currency: z.string().min(1, { message: "Currency is required." }),
    start_date: z.date({ required_error: "Start date is required." }),
    end_date: z.date({ required_error: "End date is required." }),
    project_id: z.string().optional(),
    is_active: z.boolean().default(true),
    is_featured: z.boolean().default(false),
    allow_anonymous_donations: z.boolean().default(true),
    allow_recurring_donations: z.boolean().default(true),
    allow_in_kind_donations: z.boolean().default(false),
    image: z
      .any()
      .refine((file) => !file || (file instanceof File && file.size <= MAX_FILE_SIZE), {
        message: "Max image size is 5MB.",
      })
      .refine((file) => !file || (file instanceof File && ACCEPTED_IMAGE_TYPES.includes(file.type)), {
        message: "Only JPEG, PNG, and WebP image formats are supported.",
      })
      .optional()
      .nullable(),
    video: z
      .any()
      .refine((file) => !file || (file instanceof File && file.size <= MAX_VIDEO_SIZE), {
        message: "Max video size is 50MB.",
      })
      .refine((file) => !file || (file instanceof File && ACCEPTED_VIDEO_TYPES.includes(file.type)), {
        message: "Only MP4, WebM, OGG, AVI, and MOV video formats are supported.",
      })
      .optional()
      .nullable(),
  })
  .refine((data) => data.end_date > data.start_date, {
    message: "End date must be after start date.",
    path: ["end_date"],
  })
  .refine((data) => !data.minimum_goal || Number(data.minimum_goal) <= Number(data.target_amount), {
    message: "Minimum goal cannot be greater than target amount.",
    path: ["minimum_goal"],
  })

interface CampaignFormProps {
  campaign?: DonationCampaign
  onSuccess?: () => void
  open: boolean
  setOpen: (value: boolean) => void
}

const CAMPAIGN_TYPE_OPTIONS = [
  { value: "general", label: "General Fundraising" },
  { value: "emergency", label: "Emergency Response" },
  { value: "project_specific", label: "Project Specific" },
  { value: "capacity_building", label: "Capacity Building" },
  { value: "equipment", label: "Equipment Purchase" },
  { value: "scholarship", label: "Scholarship Fund" },
  { value: "research", label: "Research Initiative" },
  { value: "community_outreach", label: "Community Outreach" },
]

export function AddEditCampaignDialog({ campaign, onSuccess, open, setOpen }: CampaignFormProps) {
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null)
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null)
  const [isVideoPlaying, setIsVideoPlaying] = useState(false)

  const { data: projects = [] } = useGetAllProjectsQuery("")
  const { data: currencies = [] } = useGetCurrenciesQuery()
  const [createCampaign, { isLoading: isCreatingCampaign }] = useCreateDonationCampaignMutation()
  const [updateCampaign, { isLoading: isUpdatingCampaign }] = useUpdateDonationCampaignMutation()

  const isEditing = !!campaign
  const isLoading = isCreatingCampaign || isUpdatingCampaign

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      campaign_type: "general",
      target_amount: "",
      minimum_goal: "",
      target_currency: "",
      start_date: new Date(),
      end_date: getDefaultEndDate(),
      project_id: "",
      is_active: true,
      is_featured: false,
      allow_anonymous_donations: true,
      allow_recurring_donations: true,
      allow_in_kind_donations: false,
      image: null,
      video: null,
    },
  })

  useEffect(() => {
    if (campaign) {
      const initialStartDate = new Date(campaign.start_date)
      form.reset({
        title: campaign.title,
        description: campaign.description,
        campaign_type: campaign.campaign_type || "general",
        target_amount: campaign.target_amount.toString(),
        minimum_goal: campaign.minimum_goal?.toString() || "",
        target_currency: campaign.target_currency?.id?.toString() || "",
        start_date: initialStartDate,
        end_date: new Date(campaign.end_date),
        project_id: campaign.project?.id?.toString() || "",
        is_active: campaign.is_active,
        is_featured: campaign.is_featured,
        allow_anonymous_donations: campaign.allow_anonymous_donations ?? true,
        allow_recurring_donations: campaign.allow_recurring_donations ?? true,
        allow_in_kind_donations: campaign.allow_in_kind_donations ?? false,
        image: null,
        video: null,
      })
      if (campaign.image) setImagePreviewUrl(campaign.image)
      if (campaign.video) setVideoPreviewUrl(campaign.video)
    } else {
      const defaultCurrency = currencies.find((c: CurrencyInterface) => c.code === "USD")
      form.reset({
        title: "",
        description: "",
        campaign_type: "general",
        target_amount: "",
        minimum_goal: "",
        target_currency: defaultCurrency?.id.toString() || "",
        start_date: new Date(),
        end_date: getDefaultEndDate(),
        project_id: "",
        is_active: true,
        is_featured: false,
        allow_anonymous_donations: true,
        allow_recurring_donations: true,
        allow_in_kind_donations: false,
        image: null,
        video: null,
      })
      setImagePreviewUrl(null)
      setVideoPreviewUrl(null)
    }
  }, [campaign, form, currencies])

  const projectOptions = projects.map((project: Project) => ({
    value: project.id.toString(),
    label: project.title,
  }))

  const currencyOptions = currencies.map((currency: CurrencyInterface) => ({
    value: currency.id.toString(),
    label: `${currency.code} - ${currency.name}`,
  }))

  const handleImageChange = (file: File | null) => {
    form.setValue("image", file)
    if (!file) {
      setImagePreviewUrl(null)
      return
    }
    const url = URL.createObjectURL(file)
    setImagePreviewUrl(url)
  }

  const handleVideoChange = (file: File | null) => {
    form.setValue("video", file)
    if (!file) {
      setVideoPreviewUrl(null)
      setIsVideoPlaying(false)
      return
    }
    const url = URL.createObjectURL(file)
    setVideoPreviewUrl(url)
    setIsVideoPlaying(false)
  }

  const removeImage = () => {
    handleImageChange(null)
    toast.info("Image removed")
  }

  const removeVideo = () => {
    handleVideoChange(null)
    toast.info("Video removed")
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const loadingToastId = toast.loading(campaign ? "Updating campaign..." : "Creating campaign...")

    try {
      const formData = new FormData()

      // Add text fields
      formData.append("title", values.title)
      formData.append("description", values.description)
      formData.append("campaign_type", values.campaign_type)
      formData.append("target_amount", values.target_amount)
      if (values.minimum_goal) {
        formData.append("minimum_goal", values.minimum_goal)
      }
      formData.append("target_currency_id", values.target_currency)
      formData.append("start_date", format(values.start_date, "yyyy-MM-dd"))
      formData.append("end_date", format(values.end_date, "yyyy-MM-dd"))
      formData.append("is_active", values.is_active.toString())
      formData.append("is_featured", values.is_featured.toString())
      formData.append("allow_anonymous_donations", values.allow_anonymous_donations.toString())
      formData.append("allow_recurring_donations", values.allow_recurring_donations.toString())
      formData.append("allow_in_kind_donations", values.allow_in_kind_donations.toString())

      if (values.project_id) {
        formData.append("project_id", values.project_id)
      }

      // Add files
      if (values.image instanceof File) {
        formData.append("image", values.image)
      }
      if (values.video instanceof File) {
        formData.append("video", values.video)
      }

      if (campaign) {
        await updateCampaign({
          id: campaign.id,
          data: formData,
        }).unwrap()
        toast.update(loadingToastId, {
          render: "Campaign updated successfully!",
          type: "success",
          isLoading: false,
          autoClose: 3000,
        })
      } else {
        await createCampaign(formData).unwrap()
        toast.update(loadingToastId, {
          render: "Campaign created successfully!",
          type: "success",
          isLoading: false,
          autoClose: 3000,
        })
      }

      handleClose()
      onSuccess?.()
    } catch (error: any) {
      console.error("Failed to save campaign:", error)
      const errorMessage =
        error?.data?.detail ||
        error?.data?.message ||
        error?.message ||
        `Failed to ${campaign ? "update" : "create"} campaign`

      toast.update(loadingToastId, {
        render: errorMessage,
        type: "error",
        isLoading: false,
        autoClose: 5000,
      })
    }
  }

  function handleClose() {
    setOpen(false)
    form.reset()
    setImagePreviewUrl(null)
    setVideoPreviewUrl(null)
    setIsVideoPlaying(false)
  }

  const selectedCurrency = currencies.find((c: CurrencyInterface) => c.id.toString() === form.watch("target_currency"))

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl">
            {campaign ? <Edit className="mr-2 h-5 w-5" /> : <Plus className="mr-2 h-5 w-5" />}
            {campaign ? "Edit Campaign" : "Create New Campaign"}
          </DialogTitle>
          <DialogDescription>
            {campaign
              ? "Update the campaign details below. Note: Currency cannot be changed after creation."
              : "Fill in the details to create a new fundraising campaign."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* SECTION 1: BASIC INFORMATION */}
            <div className="space-y-6">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-semibold">
                  1
                </div>
                <h3 className="text-lg font-semibold">Basic Information</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Campaign Title *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter a compelling campaign title" {...field} />
                      </FormControl>
                      <FormDescription>A clear, compelling title that describes your campaign</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="campaign_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Campaign Type *</FormLabel>
                      <FormControl>
                        <ReactSelectField
                          value={CAMPAIGN_TYPE_OPTIONS.find((option) => option.value === field.value) || null}
                          onChange={(option) => field.onChange(option ? option.value : "general")}
                          options={CAMPAIGN_TYPE_OPTIONS}
                          placeholder="Select campaign type"
                        />
                      </FormControl>
                      <FormDescription>Choose the type that best describes your campaign</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Campaign Description *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe your campaign goals, impact, and why people should donate. Be specific about how funds will be used..."
                        className="min-h-[120px] resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Explain the purpose, impact, and urgency of your campaign. This helps donors understand why they
                      should contribute.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="project_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Associated Project</FormLabel>
                    <FormControl>
                      <ReactSelectField
                        value={projectOptions.find((option: any) => option.value === field.value) || null}
                        onChange={(option) => field.onChange(option ? option.value : "")}
                        options={[{ value: "", label: "No project selected" }, ...projectOptions]}
                        placeholder="Select a project (optional)"
                        isClearable
                      />
                    </FormControl>
                    <FormDescription>Link this campaign to an existing project for better organization</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            {/* SECTION 2: FINANCIAL GOALS */}
            <div className="space-y-6">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-semibold">
                  2
                </div>
                <h3 className="text-lg font-semibold">Financial Goals</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="target_amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Target Amount *</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground font-medium">
                            {selectedCurrency?.code || "$"}
                          </span>
                          <Input type="text" placeholder="0.00" className="pl-12 text-right font-medium" {...field} />
                        </div>
                      </FormControl>
                      <FormDescription>The total fundraising goal for this campaign</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="minimum_goal"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Minimum Goal</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground font-medium">
                            {selectedCurrency?.code || "$"}
                          </span>
                          <Input type="text" placeholder="0.00" className="pl-12 text-right font-medium" {...field} />
                        </div>
                      </FormControl>
                      <FormDescription>Minimum amount needed for campaign success (optional)</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="target_currency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Currency *</FormLabel>
                      <FormControl>
                        <ReactSelectField
                          value={currencyOptions.find((option) => option.value === field.value) || null}
                          onChange={(option) => field.onChange(option ? option.value : "")}
                          options={currencyOptions}
                          placeholder="Select currency"
                          isDisabled={isEditing}
                          className={isEditing ? "opacity-60" : ""}
                        />
                      </FormControl>
                      <FormDescription>
                        {isEditing
                          ? "Currency cannot be changed after creation"
                          : "Choose the currency for your fundraising goal"}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator />

            {/* SECTION 3: CAMPAIGN TIMELINE */}
            <div className="space-y-6">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-semibold">
                  3
                </div>
                <h3 className="text-lg font-semibold">Campaign Timeline</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="start_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Date *</FormLabel>
                      <FormControl>
                        <DateInput
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="Select start date"
                          minDate={new Date()}
                        />
                      </FormControl>
                      <FormDescription>When the campaign begins accepting donations</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="end_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Date *</FormLabel>
                      <FormControl>
                        <DateInput
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="Select end date"
                          minDate={form.watch("start_date") || new Date()}
                        />
                      </FormControl>
                      <FormDescription>When the campaign stops accepting donations</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Duration Display */}
              {form.watch("start_date") && form.watch("end_date") && (
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm font-medium">Campaign Duration</p>
                  <p className="text-sm text-muted-foreground">
                    {Math.ceil(
                      (form.watch("end_date").getTime() - form.watch("start_date").getTime()) / (1000 * 60 * 60 * 24),
                    )}{" "}
                    days
                  </p>
                </div>
              )}
            </div>

            <Separator />

            {/* SECTION 4: MEDIA CONTENT */}
            <div className="space-y-6">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-semibold">
                  4
                </div>
                <h3 className="text-lg font-semibold">Media Content</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Image Upload */}
                <FormField
                  control={form.control}
                  name="image"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Campaign Image</FormLabel>
                      <FormControl>
                        <div className="space-y-4">
                          <div className="flex items-center gap-4">
                            <div className="flex-1">
                              <Input
                                type="file"
                                accept="image/jpeg,image/jpg,image/png,image/webp"
                                onChange={(e) => handleImageChange(e.target.files?.[0] || null)}
                                className="cursor-pointer"
                              />
                            </div>
                            {imagePreviewUrl && (
                              <Button type="button" variant="outline" size="sm" onClick={removeImage}>
                                <X className="h-4 w-4" />
                              </Button>
                            )}
                          </div>

                          {imagePreviewUrl && (
                            <div className="relative w-full h-48 border-2 border-dashed border-muted-foreground/25 rounded-lg overflow-hidden">
                              <Image
                                src={imagePreviewUrl || "/placeholder.svg"}
                                alt="Campaign preview"
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 100vw, 50vw"
                              />
                            </div>
                          )}

                          {!imagePreviewUrl && (
                            <div className="w-full h-48 border-2 border-dashed border-muted-foreground/25 rounded-lg flex items-center justify-center">
                              <div className="text-center">
                                <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                                <p className="text-sm text-muted-foreground">Upload campaign image</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </FormControl>
                      <FormDescription>
                        Upload an appealing image that represents your campaign (max 5MB, JPEG/PNG/WebP)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Video Upload */}
                <FormField
                  control={form.control}
                  name="video"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Campaign Video</FormLabel>
                      <FormControl>
                        <div className="space-y-4">
                          <div className="flex items-center gap-4">
                            <div className="flex-1">
                              <Input
                                type="file"
                                accept="video/mp4,video/webm,video/ogg,video/avi,video/mov"
                                onChange={(e) => handleVideoChange(e.target.files?.[0] || null)}
                                className="cursor-pointer"
                              />
                            </div>
                            {videoPreviewUrl && (
                              <Button type="button" variant="outline" size="sm" onClick={removeVideo}>
                                <X className="h-4 w-4" />
                              </Button>
                            )}
                          </div>

                          {videoPreviewUrl && (
                            <div className="relative w-full h-48 border-2 border-dashed border-muted-foreground/25 rounded-lg overflow-hidden bg-black">
                              <video
                                src={videoPreviewUrl}
                                className="w-full h-full object-cover"
                                controls
                                preload="metadata"
                                onPlay={() => setIsVideoPlaying(true)}
                                onPause={() => setIsVideoPlaying(false)}
                              >
                                Your browser does not support the video tag.
                              </video>
                              <div className="absolute top-2 right-2">
                                <div className="bg-black/50 text-white px-2 py-1 rounded text-xs">
                                  {isVideoPlaying ? "Playing" : "Paused"}
                                </div>
                              </div>
                            </div>
                          )}

                          {!videoPreviewUrl && (
                            <div className="w-full h-48 border-2 border-dashed border-muted-foreground/25 rounded-lg flex items-center justify-center">
                              <div className="text-center">
                                <Play className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                                <p className="text-sm text-muted-foreground">Upload campaign video</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </FormControl>
                      <FormDescription>
                        Upload a video to tell your campaign story (max 50MB, MP4/WebM/OGG/AVI/MOV)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator />

            {/* SECTION 5: CAMPAIGN SETTINGS */}
            <div className="space-y-6">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-semibold">
                  5
                </div>
                <h3 className="text-lg font-semibold">Campaign Settings</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Status Settings */}
                <div className="space-y-6">
                  <h4 className="font-medium text-base border-b pb-2">Status & Visibility</h4>

                  <FormField
                    control={form.control}
                    name="is_active"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="font-medium">Active Campaign</FormLabel>
                          <FormDescription>
                            Campaign is live and accepting donations. Uncheck to pause the campaign.
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="is_featured"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="font-medium">Featured Campaign</FormLabel>
                          <FormDescription>
                            Display this campaign prominently on the homepage and in featured sections.
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>

                {/* Donation Options */}
                <div className="space-y-6">
                  <h4 className="font-medium text-base border-b pb-2">Donation Options</h4>

                  <FormField
                    control={form.control}
                    name="allow_anonymous_donations"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="font-medium">Allow Anonymous Donations</FormLabel>
                          <FormDescription>
                            Donors can choose to remain anonymous when making donations.
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="allow_recurring_donations"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="font-medium">Allow Recurring Donations</FormLabel>
                          <FormDescription>
                            Enable monthly, weekly, or other recurring donation options.
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="allow_in_kind_donations"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="font-medium">Allow In-Kind Donations</FormLabel>
                          <FormDescription>
                            Accept non-monetary donations such as goods, services, or equipment.
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            <DialogFooter className="pt-6 border-t">
              <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading} className="min-w-[120px]">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {campaign ? "Update Campaign" : "Create Campaign"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
