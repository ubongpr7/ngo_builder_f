"use client"

import type React from "react"

import { useState } from "react"
import { useForm, Controller } from "react-hook-form"
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
import { Plus, Edit, Loader2 } from "lucide-react"
import { useGetAllProjectsQuery } from "@/redux/features/projects/projectsAPISlice"
import { useCreateCampaignMutation, useUpdateCampaignMutation } from "@/redux/features/finance/financeApiSlice"
import { toast } from "react-toastify"
import { format } from "date-fns"
import type { DonationCampaign } from "@/types/finance"

const formSchema = z
  .object({
    title: z
      .string()
      .min(2, {
        message: "Campaign title must be at least 2 characters.",
      })
      .max(200, {
        message: "Campaign title must not exceed 200 characters.",
      }),
    description: z.string().min(10, {
      message: "Description must be at least 10 characters.",
    }),
    target_amount: z
      .string()
      .min(1, {
        message: "Target amount is required.",
      })
      .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
        message: "Target amount must be a positive number.",
      }),
    start_date: z.date({
      required_error: "Start date is required.",
    }),
    end_date: z.date({
      required_error: "End date is required.",
    }),
    project: z.string().optional(),
    is_active: z.boolean().default(true),
    is_featured: z.boolean().default(false),
    image: z.string().url().optional().or(z.literal("")),
  })
  .refine((data) => data.end_date > data.start_date, {
    message: "End date must be after start date.",
    path: ["end_date"],
  })

interface AddEditCampaignDialogProps {
  campaign?: DonationCampaign
  onSuccess?: () => void
  trigger?: React.ReactNode
}

export function AddEditCampaignDialog({ campaign, onSuccess, trigger }: AddEditCampaignDialogProps) {
  const [open, setOpen] = useState(false)
  const { data: projects = [] } = useGetAllProjectsQuery('')
  const [createCampaign, { isLoading: isCreating }] = useCreateCampaignMutation()
  const [updateCampaign, { isLoading: isUpdating }] = useUpdateCampaignMutation()

  const isLoading = isCreating || isUpdating

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: campaign?.title || "",
      description: campaign?.description || "",
      target_amount: campaign?.target_amount || "",
      start_date: campaign?.start_date ? new Date(campaign.start_date) : new Date(),
      end_date: campaign?.end_date ? new Date(campaign.end_date) : new Date(),
      project: campaign?.project?.toString() || "",
      is_active: campaign?.is_active ?? true,
      is_featured: campaign?.is_featured ?? false,
      image: campaign?.image || "",
    },
  })

  // Prepare project options for react-select
  const projectOptions = projects.map((project: any) => ({
    value: project.id.toString(),
    label: project.title || project.name,
  }))

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const submitData = {
        ...values,
        target_amount: Number(values.target_amount),
        start_date: format(values.start_date, "yyyy-MM-dd"),
        end_date: format(values.end_date, "yyyy-MM-dd"),
        project: values.project ? Number(values.project) : null,
        image: values.image || null,
      }

      if (campaign) {
        await updateCampaign({
          id: campaign.id,
          ...submitData,
        }).unwrap()
        toast.success("Campaign updated successfully")
      } else {
        await createCampaign(submitData).unwrap()
        toast.success("Campaign created successfully")
      }

      handleClose()
      onSuccess?.()
    } catch (error) {
      console.error("Failed to save campaign:", error)
      toast.error(`Failed to ${campaign ? "update" : "create"} campaign`)
    }
  }

  function handleClose() {
    setOpen(false)
    form.reset()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Campaign
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            {campaign ? (
              <>
                <Edit className="mr-2 h-5 w-5" />
                Edit Campaign
              </>
            ) : (
              <>
                <Plus className="mr-2 h-5 w-5" />
                Create New Campaign
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {campaign
              ? "Update the campaign details below."
              : "Fill in the details to create a new fundraising campaign."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Basic Information</h3>

              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Campaign Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter campaign title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe the campaign goals, purpose, and impact..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="target_amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target Amount ($)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" min="0.01" placeholder="0.00" {...field} />
                    </FormControl>
                    <FormDescription>The fundraising goal for this campaign</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Timeline */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Campaign Timeline</h3>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="start_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Date</FormLabel>
                      <FormControl>
                        <DateInput value={field.value} onChange={field.onChange} label="" id="start-date" />
                      </FormControl>
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
                        <DateInput value={field.value} onChange={field.onChange} label="" id="end-date" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Project Association */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Project Association</h3>

              <Controller
                control={form.control}
                name="project"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Associated Project (Optional)</FormLabel>
                    <FormControl>
                      <ReactSelectField
                        options={projectOptions}
                        placeholder="Select a project"
                        value={projectOptions.find((option:{value:string}) => option.value === field.value) || null}
                        onChange={(option) => field.onChange(option ? option.value : "")}
                        isClearable
                      />
                    </FormControl>
                    <FormDescription>Link this campaign to an existing project</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Campaign Settings */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Campaign Settings</h3>

              <div className="space-y-3">
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
                        <FormDescription>
                          Active campaigns are visible to donors and can receive donations
                        </FormDescription>
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
                        <FormDescription>Featured campaigns are highlighted prominently on the website</FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Campaign Image */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Campaign Image</h3>

              <FormField
                control={form.control}
                name="image"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image URL (Optional)</FormLabel>
                    <FormControl>
                      <Input type="url" placeholder="https://example.com/image.jpg" {...field} />
                    </FormControl>
                    <FormDescription>
                      Enter a URL for the campaign image. This will be displayed on campaign cards and details.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Image Preview */}
              {form.watch("image") && (
                <div className="mt-2">
                  <p className="text-sm font-medium mb-2">Preview:</p>
                  <img
                    src={form.watch("image") || "/placeholder.svg"}
                    alt="Campaign preview"
                    className="w-full max-w-sm h-32 object-cover rounded-lg border"
                    onError={(e) => {
                      e.currentTarget.style.display = "none"
                    }}
                  />
                </div>
              )}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
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
