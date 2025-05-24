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
import {
  useCreateBudgetMutation,
  useUpdateBudgetMutation,
  useGetAllCampaignsQuery,
} from "@/redux/features/finance/financeApiSlice"
import type { Budget } from "@/types/finance"

const formSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  description: z.string().optional(),
  total_amount: z
    .string()
    .min(1, { message: "Total amount is required" })
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, { message: "Total amount must be a positive number" }),
  start_date: z.date({
    required_error: "Start date is required",
  }),
  end_date: z.date({
    required_error: "End date is required",
  }),
  budget_type: z.string().min(1, { message: "Budget type is required" }),
  department: z.string().optional(),
  project: z.string().optional(),
  campaign: z.string().optional(),
  grant: z.string().optional(),
  notes: z.string().optional(),
})

interface AddEditBudgetDialogProps {
  budget?: Budget
  onSuccess?: () => void
  trigger?: React.ReactNode
}

export function AddEditBudgetDialog({ budget, onSuccess, trigger }: AddEditBudgetDialogProps) {
  const [open, setOpen] = useState(false)
  const [createBudget, { isLoading: isCreating }] = useCreateBudgetMutation()
  const [updateBudget, { isLoading: isUpdating }] = useUpdateBudgetMutation()
  const { data: campaigns = [] } = useGetAllCampaignsQuery()
  const isLoading = isCreating || isUpdating
  const isEditing = !!budget

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: budget?.title || "",
      description: budget?.description || "",
      total_amount: budget?.total_amount?.toString() || "",
      start_date: budget?.start_date ? new Date(budget.start_date) : new Date(),
      end_date: budget?.end_date ? new Date(budget.end_date) : new Date(),
      budget_type: budget?.budget_type || "operational",
      department: budget?.department || "",
      project: budget?.project?.toString() || "",
      campaign: budget?.campaign?.toString() || "",
      grant: budget?.grant?.toString() || "",
      notes: budget?.notes || "",
    },
  })

  // Prepare budget type options
  const budgetTypeOptions = [
    { value: "operational", label: "Operational" },
    { value: "project", label: "Project" },
    { value: "campaign", label: "Campaign" },
    { value: "grant", label: "Grant" },
    { value: "annual", label: "Annual" },
    { value: "quarterly", label: "Quarterly" },
  ]

  // Prepare department options
  const departmentOptions = [
    { value: "administration", label: "Administration" },
    { value: "programs", label: "Programs" },
    { value: "fundraising", label: "Fundraising" },
    { value: "marketing", label: "Marketing" },
    { value: "finance", label: "Finance" },
    { value: "hr", label: "Human Resources" },
    { value: "it", label: "Information Technology" },
    { value: "other", label: "Other" },
  ]

  // Prepare campaign options
  const campaignOptions =
    campaigns?.map((campaign: any) => ({
      value: campaign?.id?.toString(),
      label: campaign?.title || campaign?.name,
    })) || []

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const submitData = {
        ...values,
        total_amount: Number(values.total_amount),
        start_date: format(values.start_date, "yyyy-MM-dd"),
        end_date: format(values.end_date, "yyyy-MM-dd"),
        project: values.project ? Number(values.project) : null,
        campaign: values.campaign ? Number(values.campaign) : null,
        grant: values.grant ? Number(values.grant) : null,
      }

      if (isEditing && budget) {
        await updateBudget({
          id: budget.id,
          budget: submitData,
        }).unwrap()
        toast.success("Budget updated successfully")
      } else {
        await createBudget(submitData).unwrap()
        toast.success("Budget created successfully")
      }

      setOpen(false)
      form.reset()
      if (onSuccess) onSuccess()
    } catch (error) {
      console.error("Failed to save budget:", error)
      toast.error(`Failed to ${isEditing ? "update" : "create"} budget. Please try again.`)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="button-primary">
            {isEditing ? (
              <>
                <Edit2 className="mr-2 h-4 w-4" />
                Edit Budget
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Add Budget
              </>
            )}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Budget" : "Add Budget"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Edit the budget details below."
              : "Add a new budget. Fill out the form below to create a new budget."}
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
                    <FormLabel>Budget Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Budget title" {...field} />
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
                      <Textarea placeholder="Describe the budget purpose and scope" {...field} />
                    </FormControl>
                    <FormDescription>Optional. Describe the budget purpose</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="total_amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total Amount ($)</FormLabel>
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

              <div className="grid grid-cols-2 gap-4">
                <Controller
                  control={form.control}
                  name="budget_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Budget Type</FormLabel>
                      <FormControl>
                        <ReactSelectField
                          options={budgetTypeOptions}
                          placeholder="Select type"
                          value={budgetTypeOptions.find((option:{value:string}) => option.value === field.value) || null}
                          onChange={(option) => field.onChange(option ? option.value : "")}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Controller
                  control={form.control}
                  name="department"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Department</FormLabel>
                      <FormControl>
                        <ReactSelectField
                          options={departmentOptions}
                          placeholder="Select department"
                          value={departmentOptions.find((option) => option.value === field.value) || null}
                          onChange={(option) => field.onChange(option ? option.value : "")}
                          isClearable
                        />
                      </FormControl>
                      <FormDescription>Optional</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

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
                    <FormDescription>Optional. Link to a specific campaign</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Additional notes about this budget" {...field} />
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
                  {isEditing ? "Update Budget" : "Add Budget"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
