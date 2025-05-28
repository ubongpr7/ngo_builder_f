"use client"

import { useState, useEffect } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import Select from "react-select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { DollarSign, Calendar, FileText, Settings, Loader2, CheckCircle, AlertTriangle, Building2 } from "lucide-react"
import { toast } from "sonner"
import { DateInput } from "@/components/ui/date-input"
import type { FundingSource } from "@/types/finance"
import { useGetCurrenciesQuery } from "@/redux/features/common/typeOF"
import { useGetGrantsQuery } from "@/redux/features/finance/grants"
import { useGetDonationsQuery } from "@/redux/features/finance/donations"
import { useGetDonationCampaignsQuery } from "@/redux/features/finance/donation-campaigns"
import {
  useCreateFundingSourceMutation,
  useUpdateFundingSourceMutation,
} from "@/redux/features/finance/funding-sources"
import { formatCurrency } from "@/lib/currency-utils"

const fundingSourceSchema = z
  .object({
    name: z.string().min(1, "Name is required"),
    funding_type: z.string().min(1, "Funding type is required"),
    description: z.string().optional(),
    amount_available: z.number().min(0.01, "Amount must be greater than 0"),
    currency_id: z.number().min(1, "Currency is required"),
    donation_id: z.number().optional(),
    campaign_id: z.number().optional(),
    grant_id: z.number().optional(),
    available_from: z.date().optional(),
    available_until: z.date().optional(),
    restrictions: z.string().optional(),
    is_active: z.boolean().default(true),
  })
  .refine(
    (data) => {
      if (data.available_from && data.available_until) {
        return data.available_until >= data.available_from
      }
      return true
    },
    {
      message: "End date must be after start date",
      path: ["available_until"],
    },
  )

type FundingSourceFormData = z.infer<typeof fundingSourceSchema>

interface AddFundingSourceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
  fundingSource?: FundingSource
}

export function AddFundingSourceDialog({ open, onOpenChange, onSuccess, fundingSource }: AddFundingSourceDialogProps) {
  const [selectedCurrency, setSelectedCurrency] = useState<any>(null)
  const isEditing = !!fundingSource

  const { data: currenciesData, isLoading: currenciesLoading } = useGetCurrenciesQuery({})
  const { data: grantsData, isLoading: grantsLoading } = useGetGrantsQuery({})
  const { data: donationsData, isLoading: donationsLoading } = useGetDonationsQuery({})
  const { data: campaignsData, isLoading: campaignsLoading } = useGetDonationCampaignsQuery({})
    console.log('campaign: ', campaignsData,'donations: ', donationsData,'grants: ', grantsData,'currencies: ', currenciesData)
  const [createFundingSource, { isLoading: isCreating }] = useCreateFundingSourceMutation()
  const [updateFundingSource, { isLoading: isUpdating }] = useUpdateFundingSourceMutation()

  const isLoading = isCreating || isUpdating

  // Extract data from the response structure
  const currencies = currenciesData || []
  const grants = grantsData ||[]
  const donations = donationsData || []
  const campaigns = campaignsData || []


  const form = useForm<FundingSourceFormData>({
    resolver: zodResolver(fundingSourceSchema),
    defaultValues: {
      name: "",
      funding_type: "",
      description: "",
      amount_available: 0,
      currency_id: 0,
      donation_id: undefined,
      campaign_id: undefined,
      grant_id: undefined,
      available_from: undefined,
      available_until: undefined,
      restrictions: "",
      is_active: true,
    },
  })

  // Populate form when editing
  useEffect(() => {
    if (fundingSource && open) {
      form.reset({
        name: fundingSource.name,
        funding_type: fundingSource.funding_type,
        description: fundingSource.description || "",
        amount_available: Number.parseFloat(fundingSource.amount_available),
        currency_id: fundingSource.currency?.id || 0,
        donation_id: fundingSource.donation?.id,
        campaign_id: fundingSource.campaign?.id,
        grant_id: fundingSource.grant?.id,
        available_from: fundingSource.available_from ? new Date(fundingSource.available_from) : undefined,
        available_until: fundingSource.available_until ? new Date(fundingSource.available_until) : undefined,
        restrictions: fundingSource.restrictions || "",
        is_active: fundingSource.is_active,
      })
      setSelectedCurrency(fundingSource.currency)
    }
  }, [fundingSource, open, form])

  const onSubmit = async (data: FundingSourceFormData) => {
    try {
      const payload = {
        ...data,
        // Convert undefined to null for optional foreign keys
        donation_id: data.donation_id || null,
        campaign_id: data.campaign_id || null,
        grant_id: data.grant_id || null,
        available_from: data.available_from ? format(data.available_from, "yyyy-MM-dd") : null,
        available_until: data.available_until ? format(data.available_until, "yyyy-MM-dd") : null,
        description: data.description || "",
        restrictions: data.restrictions || "",
      }

      if (isEditing) {
        await updateFundingSource({
          id: fundingSource.id,
          data: payload,
        }).unwrap()
        toast.success("Funding source updated successfully!")
      } else {
        await createFundingSource(payload).unwrap()
        toast.success("Funding source created successfully!")
      }

      onSuccess?.()
      onOpenChange(false)
      form.reset()
      setSelectedCurrency(null)
    } catch (error: any) {
      console.error("Funding source error:", error)
      toast.error(
        error?.data?.message || error?.data?.detail || `Failed to ${isEditing ? "update" : "create"} funding source`,
      )
    }
  }

  const fundingTypes = [
    { value: "donation", label: "General Donation", description: "Individual or one-time donations" },
    { value: "campaign", label: "Campaign", description: "Fundraising campaign proceeds" },
    { value: "grant", label: "Grant", description: "Grant funding from institutions" },
    { value: "internal", label: "Internal Funds", description: "Organization's internal funding" },
    { value: "partnership", label: "Partnership Funding", description: "Funding from partnerships" },
    { value: "government", label: "Government Funding", description: "Government grants or contracts" },
    { value: "investment", label: "Investment Returns", description: "Returns from investments" },
    { value: "fundraising_event", label: "Fundraising Event", description: "Proceeds from fundraising events" },
    { value: "corporate_sponsorship", label: "Corporate Sponsorship", description: "Corporate sponsor funding" },
    { value: "foundation_grant", label: "Foundation Grant", description: "Private foundation grants" },
    { value: "crowdfunding", label: "Crowdfunding", description: "Crowdfunding platform proceeds" },
    { value: "other", label: "Other", description: "Other funding sources" },
  ]

  const selectedFundingType = form.watch("funding_type")
  const currencyId = form.watch("currency_id")
  const amountAvailable = form.watch("amount_available")
  const availableFrom = form.watch("available_from")
  const availableUntil = form.watch("available_until")

  useEffect(() => {
    const currency = currencies.find((curr: any) => curr.id === currencyId)
    setSelectedCurrency(currency)
  }, [currencyId, currencies])

  // React Select options
  const currencyOptions = currencies.map((currency: any) => ({
    value: currency.id,
    label: `${currency.code} - ${currency.name}`,
    currency: currency,
  }))

  const grantOptions = grants.map((grant: any) => ({
    value: grant.id,
    label: `${grant.title} - ${grant.grantor}`,
    grant: grant,
  }))

  const donationOptions = donations.map((donation: any) => ({
    value: donation.id,
    label: `${donation.donor_name_display} - ${donation.formatted_amount}`,
    donation: donation,
  }))

  const campaignOptions = campaigns.map((campaign: any) => ({
    value: campaign.id,
    label: campaign.title,
    campaign: campaign,
  }))

  // Custom styles for React Select
  const selectStyles = {
    control: (provided: any, state: any) => ({
      ...provided,
      minHeight: "40px",
      borderColor: state.isFocused ? "#3b82f6" : "#d1d5db",
      boxShadow: state.isFocused ? "0 0 0 1px #3b82f6" : "none",
      "&:hover": {
        borderColor: "#3b82f6",
      },
    }),
    option: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: state.isSelected ? "#3b82f6" : state.isFocused ? "#eff6ff" : "white",
      color: state.isSelected ? "white" : "#374151",
      "&:hover": {
        backgroundColor: state.isSelected ? "#3b82f6" : "#eff6ff",
      },
    }),
    placeholder: (provided: any) => ({
      ...provided,
      color: "#9ca3af",
    }),
  }

  // Check for date validation errors
  const hasDateError = availableFrom && availableUntil && availableUntil < availableFrom

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            {isEditing ? "Edit Funding Source" : "Add Funding Source"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the funding source details and configuration"
              : "Create a new funding source to track available funds"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter funding source name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="funding_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Funding Type *</FormLabel>
                      <FormControl>
                        <Controller
                          name="funding_type"
                          control={form.control}
                          render={({ field: controllerField }) => (
                            <Select
                              {...controllerField}
                              options={fundingTypes}
                              value={fundingTypes.find((option) => option.value === controllerField.value)}
                              onChange={(selectedOption) => controllerField.onChange(selectedOption?.value || "")}
                              placeholder="Select funding type"
                              isSearchable
                              styles={selectStyles}
                              className="react-select-container"
                              classNamePrefix="react-select"
                              formatOptionLabel={(option: any) => (
                                <div className="py-1">
                                  <div className="font-medium">{option.label}</div>
                                  <div className="text-sm text-gray-500">{option.description}</div>
                                </div>
                              )}
                            />
                          )}
                        />
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
                          placeholder="Describe the funding source and its purpose..."
                          className="min-h-[80px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Financial Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Financial Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="currency_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Currency *</FormLabel>
                        <FormControl>
                          <Controller
                            name="currency_id"
                            control={form.control}
                            render={({ field: controllerField }) => (
                              <Select
                                {...controllerField}
                                options={currencyOptions}
                                value={currencyOptions.find((option) => option.value === controllerField.value)}
                                onChange={(selectedOption) => controllerField.onChange(selectedOption?.value || 0)}
                                placeholder={currenciesLoading ? "Loading currencies..." : "Select currency"}
                                isSearchable
                                isLoading={currenciesLoading}
                                isDisabled={currenciesLoading}
                                styles={selectStyles}
                                className="react-select-container"
                                classNamePrefix="react-select"
                                formatOptionLabel={(option: any) => (
                                  <div className="flex items-center gap-2">
                                    <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                                      {option.currency.code}
                                    </span>
                                    <span>{option.currency.name}</span>
                                  </div>
                                )}
                              />
                            )}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="amount_available"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Amount Available *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            {...field}
                            onChange={(e) => field.onChange(Number.parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {selectedCurrency && amountAvailable > 0 && (
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2 text-green-700">
                      <CheckCircle className="h-4 w-4" />
                      <span className="font-medium">Amount Preview</span>
                    </div>
                    <div className="mt-2 text-sm text-green-600">
                      <p>Available: {formatCurrency(selectedCurrency.code, amountAvailable)}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Linked Sources */}
            {(selectedFundingType === "grant" ||
              selectedFundingType === "donation" ||
              selectedFundingType === "campaign") && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    Linked Source
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {selectedFundingType === "grant" && (
                    <FormField
                      control={form.control}
                      name="grant_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Linked Grant</FormLabel>
                          <FormControl>
                            <Controller
                              name="grant_id"
                              control={form.control}
                              render={({ field: controllerField }) => (
                                <Select
                                  {...controllerField}
                                  options={grantOptions}
                                  value={grantOptions.find((option) => option.value === controllerField.value)}
                                  onChange={(selectedOption) => controllerField.onChange(selectedOption?.value)}
                                  placeholder={grantsLoading ? "Loading grants..." : "Select grant (optional)"}
                                  isSearchable
                                  isClearable
                                  isLoading={grantsLoading}
                                  isDisabled={grantsLoading}
                                  styles={selectStyles}
                                  className="react-select-container"
                                  classNamePrefix="react-select"
                                />
                              )}
                            />
                          </FormControl>
                          <FormDescription>Optionally link this funding source to a specific grant</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {selectedFundingType === "donation" && (
                    <FormField
                      control={form.control}
                      name="donation_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Linked Donation</FormLabel>
                          <FormControl>
                            <Controller
                              name="donation_id"
                              control={form.control}
                              render={({ field: controllerField }) => (
                                <Select
                                  {...controllerField}
                                  options={donationOptions}
                                  value={donationOptions.find((option) => option.value === controllerField.value)}
                                  onChange={(selectedOption) => controllerField.onChange(selectedOption?.value)}
                                  placeholder={donationsLoading ? "Loading donations..." : "Select donation (optional)"}
                                  isSearchable
                                  isClearable
                                  isLoading={donationsLoading}
                                  isDisabled={donationsLoading}
                                  styles={selectStyles}
                                  className="react-select-container"
                                  classNamePrefix="react-select"
                                />
                              )}
                            />
                          </FormControl>
                          <FormDescription>Optionally link this funding source to a specific donation</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {selectedFundingType === "campaign" && (
                    <FormField
                      control={form.control}
                      name="campaign_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Linked Campaign</FormLabel>
                          <FormControl>
                            <Controller
                              name="campaign_id"
                              control={form.control}
                              render={({ field: controllerField }) => (
                                <Select
                                  {...controllerField}
                                  options={campaignOptions}
                                  value={campaignOptions.find((option) => option.value === controllerField.value)}
                                  onChange={(selectedOption) => controllerField.onChange(selectedOption?.value)}
                                  placeholder={campaignsLoading ? "Loading campaigns..." : "Select campaign (optional)"}
                                  isSearchable
                                  isClearable
                                  isLoading={campaignsLoading}
                                  isDisabled={campaignsLoading}
                                  styles={selectStyles}
                                  className="react-select-container"
                                  classNamePrefix="react-select"
                                />
                              )}
                            />
                          </FormControl>
                          <FormDescription>Optionally link this funding source to a specific campaign</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </CardContent>
              </Card>
            )}

            {/* Availability & Restrictions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Availability & Restrictions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="available_from"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Available From</FormLabel>
                        <FormControl>
                          <DateInput
                            value={field.value}
                            onChange={field.onChange}
                            label=""
                            minDate={new Date("1900-01-01")}
                          />
                        </FormControl>
                        <FormDescription>Date when funds become available</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="available_until"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Available Until</FormLabel>
                        <FormControl>
                          <DateInput
                            value={field.value}
                            onChange={field.onChange}
                            label=""
                            minDate={availableFrom || new Date("1900-01-01")}
                            className={cn(hasDateError && "border-red-500")}
                          />
                        </FormControl>
                        <FormDescription>Date when funds expire if not used</FormDescription>
                        {hasDateError && (
                          <div className="flex items-center gap-2 text-red-600 text-sm">
                            <AlertTriangle className="h-4 w-4" />
                            End date must be after start date
                          </div>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="restrictions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Usage Restrictions</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe any restrictions on how these funds can be used..."
                          className="min-h-[80px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>Specify any limitations or requirements for using these funds</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="is_active"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Active Funding Source</FormLabel>
                        <FormDescription>
                          Whether this funding source is currently active and available for allocation
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <Separator />
              </CardContent>
            </Card>

            {/* Summary */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-gray-900">Funding Source Summary</h4>
                  <div className="mt-2 space-y-1 text-sm text-gray-700">
                    <p>• Name: {form.watch("name") || "Not set"}</p>
                    <p>• Type: {fundingTypes.find((t) => t.value === selectedFundingType)?.label || "Not selected"}</p>
                    <p>• Currency: {selectedCurrency?.code || "Not selected"}</p>
                    <p>
                      • Amount:{" "}
                      {selectedCurrency && amountAvailable
                        ? formatCurrency(selectedCurrency.code, amountAvailable)
                        : "Not set"}
                    </p>
                    <p>• Status: {form.watch("is_active") ? "Active" : "Inactive"}</p>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading || hasDateError}>
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    {isEditing ? "Updating..." : "Creating..."}
                  </>
                ) : (
                  <>{isEditing ? "Update Funding Source" : "Create Funding Source"}</>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
