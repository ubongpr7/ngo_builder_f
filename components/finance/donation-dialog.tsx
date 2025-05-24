"use client"

import type React from "react"
import { useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { format } from "date-fns"
import { Loader2, Heart } from "lucide-react"
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/redux/features/users/useAuth"
import { useGetAllCampaignsQuery, useCreateDonationMutation } from "@/redux/features/finance/financeApiSlice"
import { useAppSelector } from "@/redux/hooks"
import { useGetUserLoggedInProfileDetailsQuery } from "@/redux/features/profile/readProfileAPISlice"

const formSchema = z.object({
  amount: z
    .string()
    .min(1, { message: "Amount is required" })
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, { message: "Amount must be a positive number" }),
  donation_type: z.string().min(1, { message: "Donation type is required" }),
  payment_method: z.string().optional(),
  campaign: z.string().optional(),
  project: z.string().optional(),
  is_anonymous: z.boolean().default(false),
  donor_name: z.string().optional(),
  donor_email: z.string().email({ message: "Please enter a valid email address" }),
  notes: z.string().optional(),
  is_for_someone_else: z.boolean().default(false),
  status: z.string().optional(),
  donation_date: z.date({
    required_error: "Donation date is required",
  }),
})

interface DonationDialogProps {
  recurring?: boolean
  trigger?: React.ReactNode
  selectedCampaign?: { id: number; title: string } | null
  open?: boolean
  setOpen?: (open: boolean) => void
}

export function DonationDialog({ recurring = false, trigger, selectedCampaign, open, setOpen }: DonationDialogProps) {
  const [isSubmitted, setIsSubmitted] = useState(false)
  const { isAuthenticated } = useAuth()
  const [createDonation, { isLoading }] = useCreateDonationMutation()
  const { data: campaigns = [] } = useGetAllCampaignsQuery()
  const { data: userData, isLoading: isUserLoading } = useGetUserLoggedInProfileDetailsQuery("")

  const isAdmin = userData?.profile_data?.is_DB_admin || false

  // Filter for active campaigns
  const activeCampaigns = campaigns.filter((campaign: any) => {
    return (
      campaign.is_active && new Date(campaign.start_date) <= new Date() && new Date(campaign.end_date) >= new Date()
    )
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: "",
      donation_type: recurring ? "recurring" : "one_time",
      payment_method: "credit_card",
      campaign: selectedCampaign ? selectedCampaign.id.toString() : "",
      is_anonymous: false,
      donor_name: isAuthenticated ? `${userData?.first_name || ""} ${userData?.last_name || ""}`.trim() : "",
      donor_email: isAuthenticated ? userData?.email || "" : "",
      notes: "",
      is_for_someone_else: false,
      status: isAdmin ? "pending" : undefined,
      donation_date: new Date(),
    },
  })

  const watchIsForSomeoneElse = form.watch("is_for_someone_else")
  const watchIsAnonymous = form.watch("is_anonymous")

  // Prepare options for react-select
  const donationTypeOptions = [
    { value: "one_time", label: "One Time" },
    { value: "recurring", label: "Recurring" },
    { value: "in_kind", label: "In Kind" },
  ]

  const paymentMethodOptions = [
    { value: "credit_card", label: "Credit Card" },
    { value: "debit_card", label: "Debit Card" },
    { value: "bank_transfer", label: "Bank Transfer" },
    { value: "paypal", label: "PayPal" },
    { value: "stripe", label: "Stripe" },
    { value: "cash", label: "Cash" },
    { value: "check", label: "Check" },
    { value: "other", label: "Other" },
  ]

  const statusOptions = [
    { value: "pending", label: "Pending" },
    { value: "processing", label: "Processing" },
    { value: "completed", label: "Completed" },
    { value: "failed", label: "Failed" },
    { value: "refunded", label: "Refunded" },
    { value: "cancelled", label: "Cancelled" },
  ]

  const campaignOptions =
    activeCampaigns?.map((campaign: any) => ({
      value: campaign?.id?.toString(),
      label: campaign?.title || campaign?.name,
    })) || []

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const submitData = {
        ...values,
        amount: Number(values.amount),
        donation_date: format(values.donation_date, "yyyy-MM-dd"),
        status: isAdmin ? values.status || "pending" : "pending",
        donor: isAuthenticated && !values.is_for_someone_else ? userData?.id : null,
        campaign: values.campaign ? Number(values.campaign) : null,
        project: values.project ? Number(values.project) : null,
      }

      // Remove is_for_someone_else as it's not in the backend model
      delete submitData.is_for_someone_else

      await createDonation(submitData).unwrap()
      toast.success("Thank you for your donation!")
      form.reset()
      setIsSubmitted(true)
    } catch (error) {
      console.error("Failed to submit donation:", error)
      toast.error("Failed to submit donation. Please try again.")
    }
  }

  function handleClose() {
    setOpen(false)
    setIsSubmitted(false)
    form.reset()
  }

  if (isSubmitted) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {trigger || (
            <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
              <Heart className="mr-2 h-4 w-4" />
              {recurring ? "Donate Monthly" : "Donate Now"}
            </Button>
          )}
        </DialogTrigger>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-center text-green-600">Thank You for Your Donation!</DialogTitle>
            <DialogDescription className="text-center">
              Your donation has been submitted successfully.{" "}
              {!isAdmin && "An administrator will contact you soon to proceed with your donation."}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            {!isAuthenticated && (
              <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
                <h4 className="text-lg font-semibold mb-2">Join Our Community</h4>
                <p className="mb-4">
                  Become a member to stay updated on our projects and be a part of our impactful programs.
                </p>
                <Button asChild className="w-full">
                  <a href="/register">Become a Member</a>
                </Button>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button onClick={() => setIsSubmitted(false)} variant="outline" className="w-full">
              Make Another Donation
            </Button>
            <Button onClick={handleClose} className="w-full">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
            <Heart className="mr-2 h-4 w-4" />
            {recurring ? "Donate Monthly" : "Donate Now"}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{recurring ? "Monthly Donation" : "Make a Donation"}</DialogTitle>
          <DialogDescription>
            Support our mission by making a {recurring ? "monthly" : "one-time"} donation. Your contribution helps us
            empower individuals and communities across Africa.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-4">
                <FormLabel>Select Amount</FormLabel>
                <RadioGroup
                  defaultValue="50"
                  className="grid grid-cols-2 md:grid-cols-4 gap-4"
                  onValueChange={(value) => form.setValue("amount", value)}
                >
                  <div>
                    <RadioGroupItem value="25" id="amount-25" className="sr-only" />
                    <Label
                      htmlFor="amount-25"
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-green-600 [&:has([data-state=checked])]:border-green-600"
                    >
                      $25
                    </Label>
                  </div>
                  <div>
                    <RadioGroupItem value="50" id="amount-50" className="sr-only" />
                    <Label
                      htmlFor="amount-50"
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-green-600 [&:has([data-state=checked])]:border-green-600"
                    >
                      $50
                    </Label>
                  </div>
                  <div>
                    <RadioGroupItem value="100" id="amount-100" className="sr-only" />
                    <Label
                      htmlFor="amount-100"
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-green-600 [&:has([data-state=checked])]:border-green-600"
                    >
                      $100
                    </Label>
                  </div>
                  <div>
                    <RadioGroupItem value="custom" id="amount-custom" className="sr-only" />
                    <Label
                      htmlFor="amount-custom"
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-green-600 [&:has([data-state=checked])]:border-green-600"
                    >
                      Custom
                    </Label>
                  </div>
                </RadioGroup>
              </div>

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
                      <FormLabel>Make this donation anonymous</FormLabel>
                      <FormDescription>Your name will not be publicly associated with this donation</FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              {isAuthenticated && !isAdmin && (
                <FormField
                  control={form.control}
                  name="is_for_someone_else"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={(checked) => {
                            field.onChange(checked)
                            if (!checked) {
                              form.setValue(
                                "donor_name",
                                `${userData?.first_name || ""} ${userData?.last_name || ""}`.trim(),
                              )
                              form.setValue("donor_email", userData?.email || "")
                            } else {
                              form.setValue("donor_name", "")
                              form.setValue("donor_email", "")
                            }
                          }}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>I am making this donation on behalf of someone else</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
              )}

              {(!isAuthenticated || watchIsForSomeoneElse || isAdmin) && !watchIsAnonymous && (
                <FormField
                  control={form.control}
                  name="donor_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Donor Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter full name" {...field} />
                      </FormControl>
                      <FormDescription>Full name of the donor</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="donor_email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Email <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="Enter email address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {activeCampaigns.length > 0 && !selectedCampaign && (
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
              )}

              {selectedCampaign && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <FormLabel className="text-green-800">Selected Campaign</FormLabel>
                      <p className="text-sm font-medium text-green-700">{selectedCampaign.title}</p>
                    </div>
                    <div className="text-green-600">
                      <Heart className="h-5 w-5" />
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
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
              </div>

              {isAdmin && (
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
              )}

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

              {!isAdmin && (
                <Alert className="bg-blue-50 border-blue-200">
                  <AlertDescription>
                    After submitting your donation, an administrator will contact you to complete the process. Thank you
                    for your support!
                  </AlertDescription>
                </Alert>
              )}

              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {recurring ? "Donate Monthly" : "Donate Now"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
