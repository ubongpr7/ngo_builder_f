"use client"

import type React from "react"
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
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form"
import { DateInput } from "@/components/ui/date-input"
import { ReactSelectField } from "@/components/ui/react-select-field"
import { Plus, Edit, Loader2, Trash } from "lucide-react"
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
  new Date(new Date(startDate).setDate(startDate.getDate() + 30)) // Default to 30 days

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"]

const formSchema = z
  .object({
    title: z
      .string()
      .min(2, { message: "Campaign title must be at least 2 characters." })
      .max(200, { message: "Campaign title must not exceed 200 characters." }),
    description: z.string().min(10, { message: "Description must be at least 10 characters." }),
    target_amount: z
      .string()
      .min(1, { message: "Target amount is required." })
      .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
        message: "Target amount must be a positive number.",
      }),
    target_currency: z.string().min(1, { message: "Currency is required." }),
    start_date: z.date({ required_error: "Start date is required." }),
    end_date: z.date({ required_error: "End date is required." }),
    project_id: z.string().optional(),
    is_active: z.boolean().default(true),
    is_featured: z.boolean().default(false),
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
  })
  .refine((data) => data.end_date > data.start_date, {
    message: "End date must be after start date.",
    path: ["end_date"],
  })

interface AddEditCampaignDialogProps {
  campaign?: DonationCampaign
  onSuccess?: () => void
  open: boolean
  setOpen: (value: boolean) => void
  trigger?: React.ReactNode
}

export function AddEditCampaignDialog({ campaign, onSuccess, open, setOpen, trigger }: AddEditCampaignDialogProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
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
      target_amount: "",
      target_currency: "",
      start_date: new Date(),
      end_date: getDefaultEndDate(),
      project_id: "",
      is_active: true,
      is_featured: false,
      image: null,
    },
  })

  useEffect(() => {
    if (campaign) {
      const initialStartDate = new Date(campaign.start_date)
      form.reset({
        title: campaign.title,
        description: campaign.description,
        target_amount: campaign.target_amount.toString(),
        target_currency: campaign.target_currency?.id?.toString() || "",
        start_date: initialStartDate,
        end_date: new Date(campaign.end_date),
        project_id: campaign.project?.id?.toString() || "",
        is_active: campaign.is_active,
        is_featured: campaign.is_featured,
        image: null,
      })
      if (campaign.image) setPreviewUrl(campaign.image)
    } else {
      // Set default currency to USD if available
      const defaultCurrency = currencies.find((c: CurrencyInterface) => c.code === "USD")
      form.reset({
        title: "",
        description: "",
        target_amount: "",
        target_currency: defaultCurrency?.id.toString() || "",
        start_date: new Date(),
        end_date: getDefaultEndDate(),
        project_id: "",
        is_active: true,
        is_featured: false,
        image: null,
      })
      setPreviewUrl(null)
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
      setPreviewUrl(null)
      return
    }
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const submitData = {
        title: values.title,
        description: values.description,
        target_amount: values.target_amount,
        target_currency: Number.parseInt(values.target_currency),
        start_date: format(values.start_date, "yyyy-MM-dd"),
        end_date: format(values.end_date, "yyyy-MM-dd"),
        is_active: values.is_active,
        is_featured: values.is_featured,
        ...(values.project_id && { project_id: Number.parseInt(values.project_id) }),
      }

      if (campaign) {
        // For updates, don't include currency (it's not editable)
        const { target_currency, ...updateData } = submitData
        await updateCampaign({
          id: campaign.id,
          data: updateData,
        }).unwrap()
        toast.success("Campaign updated successfully")
      } else {
        await createCampaign(submitData).unwrap()
        toast.success("Campaign created successfully")
      }

      handleClose()
      onSuccess?.()
    } catch (error: any) {
      console.error("Failed to save campaign:", error)
      const errorMessage =
        error?.data?.detail || error?.message || `Failed to ${campaign ? "update" : "create"} campaign`
      toast.error(errorMessage)
    }
  }

  function handleClose() {
    setOpen(false)
    form.reset()
    setPreviewUrl(null)
  }

  const selectedCurrency = currencies.find(
    (c: CurrencyInterface) => c.id.toString() === form.watch("target_currency"),
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
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
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Image Upload Section */}
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="image"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Campaign Image</FormLabel>
                    <FormControl>
                      <div className="flex items-center gap-4">
                        <Input
                          type="file"
                          accept="image/jpeg,image/jpg,image/png,image/webp"
                          onChange={(e) => handleImageChange(e.target.files?.[0] || null)}
                        />
                        {previewUrl && (
                          <Button type="button" variant="ghost" size="sm" onClick={() => handleImageChange(null)}>
                            <Trash className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </FormControl>
                    <FormDescription>Upload an image to make your campaign more appealing (max 5MB)</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {previewUrl && (
                <div className="mt-2">
                  <p className="text-sm font-medium mb-2">Preview:</p>
                  <div className="relative w-full max-w-sm h-48 border rounded-lg overflow-hidden">
                    <Image
                      src={previewUrl || "/placeholder.svg"}
                      alt="Campaign preview"
                      fill
                      className="object-cover"
                      sizes="(max-width: 384px) 100vw, 384px"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Title Field */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Campaign Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter campaign title" {...field} />
                  </FormControl>
                  <FormDescription>A clear, compelling title for your campaign</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description Field */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe your campaign goals, impact, and why people should donate..."
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>Explain the purpose and impact of your campaign</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Target Amount and Currency */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="target_amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target Amount</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                          {selectedCurrency?.code || "$"}
                        </span>
                        <Input type="text" placeholder="0.00" className="pl-12" {...field} />
                      </div>
                    </FormControl>
                    <FormDescription>The fundraising goal for this campaign</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="target_currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Currency</FormLabel>
                    <FormControl>
                      <ReactSelectField
                        value={currencyOptions.find((option) => option.value === field.value) || null}
                        onChange={(option) => field.onChange(option ? option.value : "")}
                        options={currencyOptions}
                        placeholder="Select currency"
                        isDisabled={isEditing} // Currency cannot be changed when editing
                        className={isEditing ? "opacity-60" : ""}
                      />
                    </FormControl>
                    <FormDescription>
                      {isEditing
                        ? "Currency cannot be changed after creation"
                        : "Choose the currency for your target amount"}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Date Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="start_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date</FormLabel>
                    <FormControl>
                      <DateInput
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Select start date"
                        minDate={new Date()} // Cannot start in the past
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
                    <FormLabel>End Date</FormLabel>
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

            {/* Project Selection */}
            <FormField
              control={form.control}
              name="project_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Associated Project</FormLabel>
                  <FormControl>
                    <ReactSelectField
                      value={projectOptions.find((option:any) => option.value === field.value) || null}
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

            {/* Boolean Fields */}
            <div className="flex items-center space-x-6">
              <FormField
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Active Campaign</FormLabel>
                      <FormDescription>Campaign is accepting donations</FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="is_featured"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Featured Campaign</FormLabel>
                      <FormDescription>Display prominently on homepage</FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
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
