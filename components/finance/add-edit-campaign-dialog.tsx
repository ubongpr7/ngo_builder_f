"use client"

import type React from "react"
import { useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { format } from "date-fns"
import { Loader2, Plus, Edit2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { DateInput } from "@/components/ui/date-input"
import { ReactSelectField } from "@/components/ui/react-select-field"
import { Checkbox } from "@/components/ui/checkbox"
import { useCreateCampaignMutation, useUpdateCampaignMutation } from "@/redux/features/finance/financeApiSlice"
import type { DonationCampaign } from "@/types/finance"

const formSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  description: z.string().min(1, { message: "Description is required" }),
  target_amount: z
    .string()
    .min(1, { message: "Target amount is required" })
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, { message: "Target amount must be a positive number" }),
  start_date: z.date({
    required_error: "Start date is required",
  }),
  end_date: z.date({
    required_error: "End date is required",
  }),
  is_active: z.boolean().default(true),
  is_featured: z.boolean().default(false),
  project: z.string().optional(),
  category: z.string().optional(),
  notes: z.string().optional(),
})

interface AddEditCampaignDialogProps {
  campaign?: DonationCampaign
  onSuccess?: () => void
  trigger?: React.ReactNode
}

export function AddEditCampaignDialog({ campaign, onSuccess, trigger }: AddEditCampaignDialogProps) {
  const [open, setOpen] = useState(false)
  const [createCampaign, { isLoading: isCreating }] = useCreateCampaignMutation()
  const [updateCampaign, { isLoading: isUpdating }] = useUpdateCampaignMutation()
  const isLoading = isCreating || isUpdating
  const isEditing = !!campaign

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: campaign?.title || "",
      description: campaign?.description || "",
      target_amount: campaign?.target_amount?.toString() || "",
      start_date: campaign?.start_date ? new Date(campaign.start_date) : new Date(),
      end_date: campaign?.end_date ? new Date(campaign.end_date) : new Date(),
      is_active: campaign?.is_active ?? true,
      is_featured: campaign?.is_featured ?? false,
      project: campaign?.project?.toString() || "",
      category: campaign?.category || "",
      notes: campaign?.notes || "",
    },
  })

  // Prepare category options
  const categoryOptions = [
    { value: "education", label: "Education" },
    { value: "healthcare", label: "Healthcare" },
    { value: "environment", label: "Environment" },
    { value: "community", label: "Community Development" },
    { value: "emergency", label: "Emergency Relief" },
    { value: "other", label: "Other" },
  ]

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const submitData = {
        ...values,
        target_amount: Number(values.target_amount),
        start_date: format(values.start_date, "yyyy-MM-dd"),
        end_date: format(values.end_date, "yyyy-MM-dd"),
        project: values.project ? Number(values.project) : null,
      }

      if (isEditing && campaign) {
        await updateCampaign({
          id: campaign.id,
          campaign: submitData,
        }).unwrap()
      } else {
        await createCampaign(submitData).unwrap()
      }

      setOpen(false)
      form.reset()
      if (onSuccess) onSuccess()
    } catch (error) {
      console.error("Failed to save campaign:", error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            {isEditing ? (
              <>
                <Edit2 className="mr-2 h-4 w-4" />
                Edit Campaign
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Add Campaign
              </>
            )}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Campaign" : "Add Campaign"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Edit the campaign details below."
              : "Add a new fundraising campaign. Fill out the form below to create a new campaign."}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Campaign Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Campaign title" {...field} />
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
                      <Textarea placeholder="Describe the campaign goals and purpose" {...field} />
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
                      <Input type="number" step="0.01" placeholder="0.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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

              <Controller
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <FormControl>
                      <ReactSelectField
                        options={categoryOptions}
                        placeholder="Select category"
                        value={categoryOptions.find((option) => option.value === field.value) || null}
                        onChange={(option) => field.onChange(option ? option.value : "")}
                        isClearable
                      />
                    </FormControl>
                    <FormDescription>Optional. Select the campaign category</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="is_active"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Active Campaign</FormLabel>
                        <FormDescription>Check this to make the campaign active and visible</FormDescription>
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
                        <FormLabel>Featured Campaign</FormLabel>
                        <FormDescription>Check this to feature the campaign prominently</FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Additional notes about this campaign" {...field} />
                    </FormControl>
                    <FormDescription>Optional. Add any additional notes or context.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isEditing ? "Update Campaign" : "Add Campaign"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
