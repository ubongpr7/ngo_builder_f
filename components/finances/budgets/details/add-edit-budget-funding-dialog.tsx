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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { Building2, DollarSign, CheckCircle, AlertTriangle, Loader2 } from "lucide-react"
import { toast } from "sonner"
import type { BudgetFunding } from "@/types/finance"
import { 
  useAddBudgetFundingMutation,
  useUpateBudgetFundingMutation
} from "@/redux/features/finance/budgets"

import { useGetFundingSourcesQuery } from "@/redux/features/finance/funding-sources"
import { DateInput } from "@/components/ui/date-input"
import { formatCurrency } from "@/lib/currency-utils"

const budgetFundingSchema = z.object({
  funding_source_id: z.number().min(1, "Funding source is required"),
  amount_allocated: z.number().min(0.01, "Amount must be greater than 0"),
  allocation_date: z.date(),
  notes: z.string().optional(),
})

type BudgetFundingFormData = z.infer<typeof budgetFundingSchema>

interface BudgetFundingDialogProps {
  open: boolean
  onOpenChange: () => void
  onSuccess?: () => void
  budgetId: number
  budgetFunding?: BudgetFunding
  budgetCurrency: {
    id: number
    code: string
  }
}

export function BudgetFundingDialog({
  open,
  onOpenChange,
  onSuccess,
  budgetId,
  budgetFunding,
  budgetCurrency,
}: BudgetFundingDialogProps) {
  const [selectedFundingSource, setSelectedFundingSource] = useState<any>(null)
  const isEditing = !!budgetFunding

  // Fetch funding sources
  const { data: fundingSourcesData, isLoading: fundingSourcesLoading } = useGetFundingSourcesQuery({
    is_active: true,
    amount_remaining__gt: 0,
    currency: budgetCurrency.id,

  })

  // Mutation hooks
  const [createBudgetFunding, { isLoading: isCreating }] = useAddBudgetFundingMutation()
  const [updateBudgetFunding, { isLoading: isUpdating }] = useUpateBudgetFundingMutation()

  const isLoading = isCreating || isUpdating || fundingSourcesLoading

  const fundingSources = fundingSourcesData || []

  const form = useForm<BudgetFundingFormData>({
    resolver: zodResolver(budgetFundingSchema),
    defaultValues: {
      funding_source_id: 0,
      amount_allocated: 0,
      allocation_date: new Date(),
      notes: "",
    },
  })

  // Populate form when editing
  useEffect(() => {
    if (budgetFunding && open) {
      form.reset({
        funding_source_id: budgetFunding.funding_source.id,
        amount_allocated: Number.parseFloat(budgetFunding.amount_allocated),
        allocation_date: new Date(budgetFunding.allocation_date),
        notes: budgetFunding.notes || "",
      })
      setSelectedFundingSource(budgetFunding.funding_source)
    } else if (!isEditing && open) {
      form.reset({
        funding_source_id: 0,
        amount_allocated: 0,
        allocation_date: new Date(),
        notes: "",
      })
      setSelectedFundingSource(null)
    }
  }, [budgetFunding, open, form, isEditing])

  const onSubmit = async (data: BudgetFundingFormData) => {
    try {
      const payload = {
        budget: budgetId,
        funding_source: data.funding_source_id,
        amount_allocated: data.amount_allocated.toString(),
        allocation_date: format(data.allocation_date, "yyyy-MM-dd"),
        notes: data.notes,
      }

      if (isEditing && budgetFunding) {
        await updateBudgetFunding({
          id: budgetFunding.id,
          data: payload,
        }).unwrap()
        toast.success("Budget funding updated successfully!")
      } else {
        await createBudgetFunding(  payload).unwrap()
        toast.success("Budget funding created successfully!")
      }

      onSuccess?.()
      onOpenChange()
    } catch (error: any) {
      console.error("Budget funding error:", error)
      toast.error(
        error?.data?.message || error?.data?.detail || 
        `Failed to ${isEditing ? "update" : "create"} budget funding`
      )
    }
  }

  // Watch form values
  const allocationAmount = form.watch("amount_allocated")
  const fundingSourceId = form.watch("funding_source_id")

  // Update selected funding source when ID changes
  useEffect(() => {
    const source = fundingSources.find((src: any) => src.id === fundingSourceId)
    setSelectedFundingSource(source)
  }, [fundingSourceId, fundingSources])

  // Check for insufficient funds
  const isInsufficientFunds = selectedFundingSource && 
    allocationAmount > Number.parseFloat(selectedFundingSource.amount_remaining || "0")

  // React Select options for funding sources
  const fundingSourceOptions = fundingSources.map((source: any) => ({
    value: source.id,
    label: source.name,
    fundingSource: source,
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
      padding: "12px",
      "&:hover": {
        backgroundColor: state.isSelected ? "#3b82f6" : "#eff6ff",
      },
    }),
    placeholder: (provided: any) => ({
      ...provided,
      color: "#9ca3af",
    }),
  }

  // Get badge color based on funding source status
  const getFundingStatusColor = (status: string) => {
    switch (status) {
      case "Available":
        return "bg-green-100 text-green-800"
      case "Expiring Soon":
        return "bg-orange-100 text-orange-800"
      case "Expired":
        return "bg-red-100 text-red-800"
      case "Inactive":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-blue-100 text-blue-800"
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            {isEditing ? "Edit Budget Funding" : "Add Funding Source"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the funding source allocation details"
              : "Allocate funds from a funding source to this budget"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Funding Source Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Funding Source
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="funding_source_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Funding Source *</FormLabel>
                      <FormControl>
                        <Controller
                          name="funding_source_id"
                          control={form.control}
                          render={({ field: controllerField }) => (
                            <Select
                              {...controllerField}
                              options={fundingSourceOptions}
                              value={fundingSourceOptions.find(
                                (option) => option.value === controllerField.value
                              )}
                              onChange={(selectedOption) => 
                                controllerField.onChange(selectedOption?.value || 0)
                              }
                              placeholder={fundingSourcesLoading ? "Loading funding sources..." : "Select funding source"}
                              isSearchable
                              isLoading={fundingSourcesLoading}
                              isDisabled={fundingSourcesLoading}
                              styles={selectStyles}
                              className="react-select-container"
                              classNamePrefix="react-select"
                              formatOptionLabel={(option: any) => {
                                const source = option.fundingSource
                                const status = source.is_active 
                                  ? source.available_until && new Date(source.available_until) < new Date()
                                    ? "Expired" 
                                    : source.available_until && 
                                      (new Date(source.available_until).getTime() - Date.now()) < 30 * 86400000
                                    ? "Expiring Soon"
                                    : "Available"
                                  : "Inactive"
                                    
                                return (
                                  <div className="flex items-center gap-3 py-2">
                                    <Building2 className="h-4 w-4 text-blue-500" />
                                    <div className="flex-1">
                                      <div className="font-medium">{source.name}</div>
                                      <div className="text-sm text-gray-500">
                                        {source.get_funding_type_display}
                                      </div>
                                      <div className="flex items-center gap-2 mt-1">
                                        <Badge className={getFundingStatusColor(status)}>
                                          {status}
                                        </Badge>
                                        <span className="text-sm font-medium text-green-600">
                                          {formatCurrency(
                                            source.currency?.code,
                                          (source.amount_available || "0"))}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                )
                              }}
                              noOptionsMessage={() => (fundingSourcesLoading ? "Loading..." : "No funding sources found")}
                            />
                          )}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {selectedFundingSource && (
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-blue-900">{selectedFundingSource.name}</h4>
                        <p className="text-sm text-blue-700">
                          {selectedFundingSource.get_funding_type_display} • {selectedFundingSource.currency?.code}
                        </p>
                        {selectedFundingSource.available_until && (
                          <p className="text-sm text-blue-700 mt-1">
                            Available until: {format(new Date(selectedFundingSource.available_until), "PPP")}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-blue-900">
                          {formatCurrency( selectedFundingSource.currency?.code,
                                (selectedFundingSource.amount_remaining || "0"))}
                        </div>
                        <div className="text-sm text-blue-700">Remaining Balance</div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Allocation Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Funding Allocation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="amount_allocated"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Amount to Allocate *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            className={cn(isInsufficientFunds && "border-red-500 focus:border-red-500")}
                            {...field}
                            onChange={(e) => field.onChange(Number.parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        {isInsufficientFunds && (
                          <div className="flex items-center gap-2 text-red-600 text-sm">
                            <AlertTriangle className="h-4 w-4" />
                            Insufficient funds in selected source
                          </div>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="allocation_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Allocation Date *</FormLabel>
                        <FormControl>
                          <DateInput
                            value={field.value}
                            onChange={field.onChange}
                            label=""
                            maxDate={new Date()}
                            minDate={new Date("1900-01-01")}
                          />
                        </FormControl>
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
                        <Textarea
                          placeholder="Add any notes about this funding allocation..."
                          className="min-h-[80px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {allocationAmount > 0 && selectedFundingSource && (
                  <div className={cn("p-4 rounded-lg", isInsufficientFunds ? "bg-red-50" : "bg-green-50")}>
                    <div
                      className={cn("flex items-center gap-2", isInsufficientFunds ? "text-red-700" : "text-green-700")}
                    >
                      {isInsufficientFunds ? (
                        <AlertTriangle className="h-4 w-4" />
                      ) : (
                        <CheckCircle className="h-4 w-4" />
                      )}
                      <span className="font-medium">
                        {isInsufficientFunds ? "Insufficient Funds" : "Allocation Valid"}
                      </span>
                    </div>
                    <div className={cn("mt-2 text-sm", isInsufficientFunds ? "text-red-600" : "text-green-600")}>
                      <p>
                        Allocation: {formatCurrency(budgetCurrency.code, allocationAmount.)}
                      </p>
                      <p>
                        Available: {formatCurrency(selectedFundingSource.currency?.code,(selectedFundingSource.amount_remaining || "0"))}
                      </p>
                      <p>
                        Remaining: {formatCurrency(
                            selectedFundingSource.currency?.code,
                            (Number.parseFloat(selectedFundingSource.amount_remaining || "0") - allocationAmount)
                        )}
                        
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Summary */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-gray-900">Funding Summary</h4>
                  <div className="mt-2 space-y-1 text-sm text-gray-700">
                    <p>• Source: {selectedFundingSource?.name || "Not selected"}</p>
                    <p>
                      • Amount: {formatCurrency(budgetCurrency.code,(allocationAmount || 0))}
                    </p>
                    <p>
                      • Date:{" "}
                      {form.watch("allocation_date") ? format(form.watch("allocation_date"), "PPP") : "Not set"}
                    </p>
                    {selectedFundingSource?.restrictions && (
                      <p className="text-orange-600">
                        • Restrictions: {selectedFundingSource.restrictions.substring(0, 100)}...
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange()} disabled={isLoading}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading || isInsufficientFunds}>
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    {isEditing ? "Updating..." : "Creating..."}
                  </>
                ) : (
                  <>{isEditing ? "Update Funding" : "Add Funding"}</>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}