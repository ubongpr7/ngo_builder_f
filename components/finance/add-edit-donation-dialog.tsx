"use client"

import type React from "react"
import { useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { format } from "date-fns"
import { Loader2, Plus, Edit2 } from "lucide-react"
import { toast } from "react-toastify"

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
import {
  useCreateDonationMutation,
  useUpdateDonationMutation,
  useGetAllCampaignsQuery,
  useGetAllDonorsQuery,
} from "@/redux/features/finance/financeApiSlice"
import type { Donation } from "@/types/finance"

const formSchema = z.object({
  amount: z
    .string()
    .min(1, { message: "Amount is required" })
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, { message: "Amount must be a positive number" }),
  donor: z.string().optional(),
  donor_name: z.string().optional(),
  campaign: z.string().optional(),
  project: z.string().optional(),
  donation_date: z.date({
    required_error: "Donation date is required",
  }),
  is_anonymous: z.boolean().default(false),
  status: z.string().min(1, { message: "Status is required" }),
  payment_method: z.string().optional(),
  donation_type: z.string().min(1, { message: "Donation type is required" }),
  notes: z.string().optional(),
  transaction_id: z.string().optional(),
})

interface AddEditDonationDialogProps {
  donation?: Donation
  onSuccess?: () => void
  trigger?: React.ReactNode
}

export function AddEditDonationDialog({ donation, onSuccess, trigger }: AddEditDonationDialogProps) {
  const [open, setOpen] = useState(false)
  const [createDonation, { isLoading: isCreating }] = useCreateDonationMutation()
  const [updateDonation, { isLoading: isUpdating }] = useUpdateDonationMutation()
  const { data: campaigns = [] } = useGetAllCampaignsQuery("")
  const { data: donors = [] } = useGetAllDonorsQuery("")
  const isLoading = isCreating || isUpdating
  const isEditing = !!donation

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: donation?.amount?.toString() || "",
      donor: donation?.donor?.toString() || "",
      donor_name: donation?.donor_name || "",
      campaign: donation?.campaign?.toString() || "",
      project: donation?.project?.toString() || "",
      donation_date: donation?.donation_date ? new Date(donation.donation_date) : new Date(),
      is_anonymous: donation?.is_anonymous || false,
      status: donation?.status || "completed",
      payment_method: donation?.payment_method || "credit_card",
      donation_type: donation?.donation_type || "one_time",
      notes: donation?.notes || "",
      transaction_id: donation?.transaction_id || "",
    },
  })

  // Prepare status options for react-select
  const statusOptions = [
    { value: "pending", label: "Pending" },
    { value: "completed", label: "Completed" },
    { value: "failed", label: "Failed" },
    { value: "refunded", label: "Refunded" },
  ]

  // Prepare donation type options
  const donationTypeOptions = [
    { value: "one_time", label: "One Time" },
    { value: "recurring", label: "Recurring" },
    { value: "pledge", label: "Pledge" },
  ]

  // Prepare payment method options for react-select
  const paymentMethodOptions = [
    { value: "credit_card", label: "Credit Card" },
    { value: "bank_transfer", label: "Bank Transfer" },
    { value: "paypal", label: "PayPal" },
    { value: "cash", label: "Cash" },
    { value: "check", label: "Check" },
    { value: "other", label: "Other" },
  ]

  // Prepare campaign options for react-select
  const campaignOptions =
    campaigns?.map((campaign: any) => ({
      value: campaign?.id?.toString(),
      label: campaign?.title || campaign?.name,
    })) || []

  // Prepare donor options for react-select
  const donorOptions =
    donors?.map((donor: any) => ({
      value: donor?.id?.toString(),
      label: donor?.name || `${donor?.first_name} ${donor?.last_name}`,
    })) || []

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const submitData = {
        ...values,
        amount: Number(values.amount),
        donation_date: format(values.donation_date, "yyyy-MM-dd"),
        donor: values.donor ? Number(values.donor) : null,
        campaign: values.campaign ? Number(values.campaign) : null,
        project: values.project ? Number(values.project) : null,
      }

      if (isEditing && donation) {
        await updateDonation({
          id: donation.id,
          donation: submitData,
        }).unwrap()
        toast.success("Donation updated successfully")
      } else {
        await createDonation(submitData).unwrap()
        toast.success("Donation created successfully")
      }

      setOpen(false)
      form.reset()
      if (onSuccess) onSuccess()
    } catch (error) {
      console.error("Failed to save donation:", error)
      toast.error(`Failed to ${isEditing ? "update" : "create"} donation. Please try again.`)
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
                Edit Donation
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Add Donation
              </>
            )}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Donation" : "Add Donation"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Edit the donation details below."
              : "Add a new donation to the system. Fill out the form below to record a donation."}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount ($)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="0.00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="donation_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Donation Date</FormLabel>
                      <FormControl>
                        <DateInput value={field.value} onChange={field.onChange} label="" id="donation-date" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="is_anonymous"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Anonymous Donation</FormLabel>
                      <FormDescription>Check this if the donor wishes to remain anonymous</FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              {!form.watch("is_anonymous") && (
                <div className="grid grid-cols-2 gap-4">
                  <Controller
                    control={form.control}
                    name="donor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Donor</FormLabel>
                        <FormControl>
                          <ReactSelectField
                            options={donorOptions}
                            placeholder="Select donor"
                            value={donorOptions.find((option) => option.value === field.value) || null}
                            onChange={(option) => field.onChange(option ? option.value : "")}
                            isClearable
                          />
                        </FormControl>
                        <FormDescription>Select existing donor</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="donor_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Donor Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter donor name" {...field} />
                        </FormControl>
                        <FormDescription>Or enter new donor name</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              <Controller
                control={form.control}
                name="campaign"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Campaign</FormLabel>
                    <FormControl>
                      <ReactSelectField
                        options={campaignOptions}
                        placeholder="Select campaign"
                        value={campaignOptions.find((option) => option.value === field.value) || null}
                        onChange={(option) => field.onChange(option ? option.value : "")}
                        isClearable
                      />
                    </FormControl>
                    <FormDescription>Optional. Select the campaign this donation is for</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <Controller
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <FormControl>
                        <ReactSelectField
                          options={statusOptions}
                          placeholder="Select status"
                          value={statusOptions.find((option) => option.value === field.value) || null}
                          onChange={(option) => field.onChange(option ? option.value : "")}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Controller
                  control={form.control}
                  name="donation_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Donation Type</FormLabel>
                      <FormControl>
                        <ReactSelectField
                          options={donationTypeOptions}
                          placeholder="Select type"
                          value={donationTypeOptions.find((option) => option.value === field.value) || null}
                          onChange={(option) => field.onChange(option ? option.value : "")}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Controller
                  control={form.control}
                  name="payment_method"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Method</FormLabel>
                      <FormControl>
                        <ReactSelectField
                          options={paymentMethodOptions}
                          placeholder="Select payment method"
                          value={paymentMethodOptions.find((option) => option.value === field.value) || null}
                          onChange={(option) => field.onChange(option ? option.value : "")}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="transaction_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Transaction ID</FormLabel>
                      <FormControl>
                        <Input placeholder="Transaction reference" {...field} />
                      </FormControl>
                      <FormDescription>Optional. Payment reference</FormDescription>
                      <FormMessage />
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
                      <Textarea placeholder="Additional notes about this donation" {...field} />
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
                  {isEditing ? "Update Donation" : "Add Donation"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
