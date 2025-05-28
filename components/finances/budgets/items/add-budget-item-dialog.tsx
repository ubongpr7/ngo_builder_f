"use client"

import { useEffect } from "react"
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
import { DollarSign, User, Lock, CheckCircle, Target, FileText, Settings, Loader2 } from "lucide-react"
import { toast } from "sonner"
import type { BudgetItem } from "@/types/finance"
import { useGetCurrenciesQuery } from "@/redux/features/common/typeOF"
import { useGetAdminUsersQuery } from "@/redux/features/profile/readProfileAPISlice"
import { useCreateBudgetItemMutation, useUpdateBudgetItemMutation } from "@/redux/features/finance/budget-items"

const budgetItemSchema = z.object({
  category: z.string().min(1, "Category is required"),
  subcategory: z.string().optional(),
  description: z.string().min(1, "Description is required"),
  budgeted_amount: z.number().min(0.01, "Amount must be greater than 0"),
  currency_id: z.number().min(1, "Currency is required"),
  responsible_person_id: z.number().optional(),
  approval_required_threshold: z.number().optional(),
  is_locked: z.boolean().default(false),
  notes: z.string().optional(),
})

type BudgetItemFormData = z.infer<typeof budgetItemSchema>

interface AddBudgetItemDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
  budgetId: number
  budgetItem?: BudgetItem
  budgetCurrency: {
    id: number
    code: string
    name: string
  }
}

export function AddBudgetItemDialog({
  open,
  onOpenChange,
  onSuccess,
  budgetId,
  budgetItem,
  budgetCurrency,
}: AddBudgetItemDialogProps) {
  const isEditing = !!budgetItem

  const { data: currencies = [], isLoading: currenciesLoading } = useGetCurrenciesQuery()
  const { data: users = [], isLoading: usersLoading } = useGetAdminUsersQuery({})

  const [createBudgetItem, { isLoading: isCreating }] = useCreateBudgetItemMutation()
  const [updateBudgetItem, { isLoading: isUpdating }] = useUpdateBudgetItemMutation()

  const isLoading = isCreating || isUpdating

  const form = useForm<BudgetItemFormData>({
    resolver: zodResolver(budgetItemSchema),
    defaultValues: {
      category: "",
      subcategory: "",
      description: "",
      budgeted_amount: 0,
      currency_id: budgetCurrency.id,
      responsible_person_id: undefined,
      approval_required_threshold: undefined,
      is_locked: false,
      notes: "",
    },
  })

  // Populate form when editing
  useEffect(() => {
    if (budgetItem && open) {
      form.reset({
        category: budgetItem.category || "",
        subcategory: budgetItem.subcategory || "",
        description: budgetItem.description || "",
        budgeted_amount: Number.parseFloat(budgetItem.budgeted_amount) || 0,
        currency_id: budgetItem.currency?.id || budgetCurrency.id,
        responsible_person_id: budgetItem.responsible_person?.id,
        approval_required_threshold: budgetItem.approval_required_threshold
          ? Number.parseFloat(budgetItem.approval_required_threshold)
          : undefined,
        is_locked: budgetItem.is_locked || false,
        notes: budgetItem.notes || "",
      })
    }
  }, [budgetItem, open, form, budgetCurrency.id])

  const onSubmit = async (data: BudgetItemFormData) => {
    try {
      const payload = {
        budget: budgetId,
        ...data,
        // Convert undefined to null for API
        responsible_person_id: data.responsible_person_id || null,
        approval_required_threshold: data.approval_required_threshold || null,
        subcategory: data.subcategory || "",
        notes: data.notes || "",
      }

      if (isEditing) {
        await updateBudgetItem({
          id: budgetItem.id,
          data: payload,
        }).unwrap()
        toast.success("Budget item updated successfully!")
      } else {
        await createBudgetItem(payload).unwrap()
        toast.success("Budget item created successfully!")
      }

      onSuccess?.()
      onOpenChange(false)
      form.reset()
    } catch (error: any) {
      console.error("Budget item error:", error)
      toast.error(
        error?.data?.message || error?.data?.detail || `Failed to ${isEditing ? "update" : "create"} budget item`,
      )
    }
  }

  const categories = [
    "Personnel & Salaries",
    "Program Expenses",
    "Administrative Costs",
    "Equipment & Supplies",
    "Travel & Transportation",
    "Training & Development",
    "Marketing & Outreach",
    "Technology & Software",
    "Facilities & Utilities",
    "Professional Services",
    "Emergency Response",
    "Research & Development",
    "Project Management",
    "Project Implementation",
    "Project Monitoring & Evaluation",
    "Grant Management",
    "Donor Relations",
    "Fundraising Activities",
    "Partnership Development",
    "Capacity Building",
    "Community Engagement",
    "Stakeholder Management",
    "Risk Management",
    "Quality Assurance",
    "Compliance & Regulatory",
    "Financial Management",
    "Resource Mobilization",
    "Strategic Planning",
    "Operations Management",
    "Sustainability Initiatives",
  ]

  const subcategories: Record<string, string[]> = {
    "Personnel & Salaries": [
      "Full-time Staff",
      "Part-time Staff",
      "Consultants",
      "Benefits",
      "Overtime",
      "Performance Bonuses",
      "Training Allowances",
    ],
    "Program Expenses": [
      "Direct Services",
      "Materials",
      "Beneficiary Support",
      "Program Activities",
      "Field Operations",
      "Community Programs",
    ],
    "Administrative Costs": [
      "Office Supplies",
      "Communications",
      "Insurance",
      "Legal Fees",
      "Banking Charges",
      "Administrative Support",
    ],
    "Equipment & Supplies": [
      "Office Equipment",
      "Program Equipment",
      "Maintenance",
      "Consumables",
      "Medical Supplies",
      "Safety Equipment",
    ],
    "Travel & Transportation": [
      "Local Travel",
      "International Travel",
      "Vehicle Costs",
      "Accommodation",
      "Per Diem",
      "Fuel & Maintenance",
    ],
    "Training & Development": [
      "Staff Training",
      "Capacity Building",
      "Workshops",
      "Conferences",
      "Certification Programs",
      "Skills Development",
    ],
    "Marketing & Outreach": [
      "Advertising",
      "Events",
      "Publications",
      "Digital Marketing",
      "Public Relations",
      "Brand Development",
    ],
    "Technology & Software": [
      "Software Licenses",
      "Hardware",
      "IT Support",
      "Cloud Services",
      "System Integration",
      "Data Management",
    ],
    "Facilities & Utilities": [
      "Rent",
      "Utilities",
      "Maintenance",
      "Security",
      "Cleaning Services",
      "Property Management",
    ],
    "Professional Services": ["Accounting", "Legal", "Consulting", "Audit", "Tax Services", "Advisory Services"],
    "Emergency Response": [
      "Emergency Supplies",
      "Rapid Response",
      "Crisis Management",
      "Disaster Relief",
      "Emergency Communications",
    ],
    "Research & Development": [
      "Research Activities",
      "Innovation",
      "Pilot Programs",
      "Evaluation",
      "Data Collection",
      "Analysis & Reporting",
    ],
    "Project Management": [
      "Project Planning",
      "Project Coordination",
      "Timeline Management",
      "Resource Allocation",
      "Team Management",
      "Documentation",
    ],
    "Project Implementation": [
      "Implementation Activities",
      "Field Work",
      "Service Delivery",
      "Infrastructure Development",
      "System Deployment",
      "Rollout Activities",
    ],
    "Project Monitoring & Evaluation": [
      "M&E Framework",
      "Data Collection",
      "Impact Assessment",
      "Performance Monitoring",
      "Evaluation Studies",
      "Reporting",
    ],
    "Grant Management": [
      "Grant Writing",
      "Proposal Development",
      "Grant Administration",
      "Compliance Reporting",
      "Grant Closeout",
      "Financial Reporting",
    ],
    "Donor Relations": [
      "Donor Meetings",
      "Relationship Management",
      "Donor Communications",
      "Stewardship Activities",
      "Recognition Events",
      "Donor Research",
    ],
    "Fundraising Activities": [
      "Campaign Development",
      "Event Planning",
      "Digital Fundraising",
      "Corporate Partnerships",
      "Individual Giving",
      "Grant Applications",
    ],
    "Partnership Development": [
      "Partnership Agreements",
      "Collaboration Activities",
      "Joint Ventures",
      "Strategic Alliances",
      "Network Building",
      "Partnership Management",
    ],
    "Capacity Building": [
      "Institutional Strengthening",
      "Skills Development",
      "System Building",
      "Process Improvement",
      "Knowledge Transfer",
      "Mentoring Programs",
    ],
    "Community Engagement": [
      "Community Outreach",
      "Stakeholder Meetings",
      "Public Consultations",
      "Community Events",
      "Awareness Campaigns",
      "Feedback Mechanisms",
    ],
    "Stakeholder Management": [
      "Stakeholder Mapping",
      "Engagement Planning",
      "Communication Strategy",
      "Relationship Building",
      "Conflict Resolution",
      "Stakeholder Reporting",
    ],
    "Risk Management": [
      "Risk Assessment",
      "Risk Mitigation",
      "Insurance",
      "Contingency Planning",
      "Security Measures",
      "Crisis Preparedness",
    ],
    "Quality Assurance": [
      "Quality Control",
      "Standards Compliance",
      "Process Audits",
      "Performance Reviews",
      "Continuous Improvement",
      "Best Practices",
    ],
    "Compliance & Regulatory": [
      "Legal Compliance",
      "Regulatory Requirements",
      "Policy Development",
      "Governance",
      "Ethics Training",
      "Compliance Monitoring",
    ],
    "Financial Management": [
      "Financial Planning",
      "Budget Management",
      "Cash Flow Management",
      "Financial Controls",
      "Investment Management",
      "Financial Analysis",
    ],
    "Resource Mobilization": [
      "Resource Planning",
      "Asset Management",
      "Procurement",
      "Vendor Management",
      "Supply Chain",
      "Inventory Management",
    ],
    "Strategic Planning": [
      "Strategic Development",
      "Planning Workshops",
      "Vision & Mission",
      "Goal Setting",
      "Strategy Implementation",
      "Strategic Review",
    ],
    "Operations Management": [
      "Operational Planning",
      "Process Management",
      "Workflow Optimization",
      "Performance Management",
      "Operational Support",
      "Service Delivery",
    ],
    "Sustainability Initiatives": [
      "Environmental Programs",
      "Social Impact",
      "Economic Sustainability",
      "Green Initiatives",
      "Renewable Energy",
      "Waste Management",
    ],
  }
  const selectedCategory = form.watch("category")
  const budgetedAmount = form.watch("budgeted_amount")
  const selectedCurrency = currencies.find((c: any) => c.id === form.watch("currency_id"))

  // React Select options
  const categoryOptions = categories.map((category) => ({
    value: category,
    label: category,
  }))

  const subcategoryOptions =
    selectedCategory && subcategories[selectedCategory]
      ? subcategories[selectedCategory].map((subcategory) => ({
          value: subcategory,
          label: subcategory,
        }))
      : []

  const currencyOptions = currencies.map((currency: any) => ({
    value: currency.id,
    label: `${currency.code} - ${currency.name}`,
  }))

  const userOptions = users.map((user: any) => ({
    value: user.id,
    label: `${user.first_name} ${user.last_name}`,
    email: user.email,
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            {isEditing ? "Edit Budget Item" : "Add Budget Item"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the budget item details and configuration"
              : "Create a new budget item with detailed tracking parameters"}
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category *</FormLabel>
                        <FormControl>
                          <Controller
                            name="category"
                            control={form.control}
                            render={({ field: controllerField }) => (
                              <Select
                                {...controllerField}
                                options={categoryOptions}
                                value={categoryOptions.find((option) => option.value === controllerField.value)}
                                onChange={(selectedOption) => controllerField.onChange(selectedOption?.value || "")}
                                placeholder="Select category"
                                isSearchable
                                styles={selectStyles}
                                className="react-select-container"
                                classNamePrefix="react-select"
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
                    name="subcategory"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subcategory</FormLabel>
                        <FormControl>
                          <Controller
                            name="subcategory"
                            control={form.control}
                            render={({ field: controllerField }) => (
                              <Select
                                {...controllerField}
                                options={subcategoryOptions}
                                value={subcategoryOptions.find((option) => option.value === controllerField.value)}
                                onChange={(selectedOption) => controllerField.onChange(selectedOption?.value || "")}
                                placeholder="Select subcategory"
                                isSearchable
                                isDisabled={!selectedCategory}
                                styles={selectStyles}
                                className="react-select-container"
                                classNamePrefix="react-select"
                              />
                            )}
                          />
                        </FormControl>
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
                      <FormLabel>Description *</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe what this budget item covers..."
                          className="min-h-[80px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Provide a clear description of what expenses this item will cover
                      </FormDescription>
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="budgeted_amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Budgeted Amount *</FormLabel>
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
                                placeholder={currenciesLoading ? "Loading..." : "Select currency"}
                                isSearchable
                                isLoading={currenciesLoading}
                                isDisabled={currenciesLoading}
                                styles={selectStyles}
                                className="react-select-container"
                                classNamePrefix="react-select"
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
                    name="approval_required_threshold"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Approval Threshold</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            {...field}
                            onChange={(e) => field.onChange(Number.parseFloat(e.target.value) || undefined)}
                          />
                        </FormControl>
                        <FormDescription>Expenses above this amount require approval</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {budgetedAmount > 0 && (
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2 text-blue-700">
                      <CheckCircle className="h-4 w-4" />
                      <span className="font-medium">
                        Budget Allocation: {selectedCurrency?.code || budgetCurrency.code}{" "}
                        {budgetedAmount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Assignment & Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Assignment & Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="responsible_person_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Responsible Person</FormLabel>
                      <FormControl>
                        <Controller
                          name="responsible_person_id"
                          control={form.control}
                          render={({ field: controllerField }) => (
                            <Select
                              {...controllerField}
                              options={userOptions}
                              value={userOptions.find((option) => option.value === controllerField.value)}
                              onChange={(selectedOption) =>
                                controllerField.onChange(selectedOption?.value || undefined)
                              }
                              placeholder={usersLoading ? "Loading users..." : "Select responsible person"}
                              isSearchable
                              isLoading={usersLoading}
                              isDisabled={usersLoading}
                              isClearable
                              styles={selectStyles}
                              className="react-select-container"
                              classNamePrefix="react-select"
                              formatOptionLabel={(option: any) => (
                                <div className="flex items-center gap-2">
                                  <User className="h-4 w-4" />
                                  <div>
                                    <div>{option.label}</div>
                                    <div className="text-xs text-gray-500">{option.email}</div>
                                  </div>
                                </div>
                              )}
                            />
                          )}
                        />
                      </FormControl>
                      <FormDescription>Person responsible for managing this budget item</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Separator />

                <FormField
                  control={form.control}
                  name="is_locked"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base flex items-center gap-2">
                          <Lock className="h-4 w-4" />
                          Lock Budget Item
                        </FormLabel>
                        <FormDescription>Prevent modifications to this budget item</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
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
                        <Textarea
                          placeholder="Additional notes or instructions..."
                          className="min-h-[60px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Summary */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-gray-900">Budget Item Summary</h4>
                  <div className="mt-2 space-y-1 text-sm text-gray-700">
                    <p>• Category: {form.watch("category") || "Not selected"}</p>
                    <p>
                      • Amount: {selectedCurrency?.code || budgetCurrency.code} {(budgetedAmount || 0).toLocaleString()}
                    </p>
                    <p>• Locked: {form.watch("is_locked") ? "Yes" : "No"}</p>
                    <p>• Approval Required: {form.watch("approval_required_threshold") ? "Yes" : "No"}</p>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    {isEditing ? "Updating..." : "Creating..."}
                  </>
                ) : (
                  <>{isEditing ? "Update Item" : "Create Item"}</>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
