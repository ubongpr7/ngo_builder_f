"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "react-toastify"
import { Heart, Repeat, Gift, DollarSign, CreditCard } from "lucide-react"
import { useAuth } from "@/redux/features/users/useAuth"
import {
  useCreateDonationMutation,
} from "@/redux/features/finance/donations"
import { useCreateRecurringDonationMutation } from "@/redux/features/finance/recurring-donations"
import { useCreateInKindDonationMutation } from "@/redux/features/finance/in-kind-donations"
import { formatCurrency } from "@/lib/currency-utils"
import Select from "react-select"

interface DonationDialogProps {
  open: boolean
  setOpen: (open: boolean) => void
  recurring?: boolean
  selectedCampaign?: { id: number; title: string } | null
  trigger?: React.ReactNode
}

interface SelectOption {
  value: string
  label: string
  icon?: React.ReactNode
}

export function DonationDialog({ open, setOpen, recurring = false, selectedCampaign, trigger }: DonationDialogProps) {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState(recurring ? "recurring" : "one-time")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const formRef = useRef<HTMLDivElement>(null)

  // Mutations
  const [createDonation, { isLoading: isCreatingDonation }] = useCreateDonationMutation()
  const [createRecurringDonation, { isLoading: isCreatingRecurring }] = useCreateRecurringDonationMutation()
  const [createInKindDonation, { isLoading: isCreatingInKind }] = useCreateInKindDonationMutation()

  // Form states
  const [oneTimeForm, setOneTimeForm] = useState({
    amount: "",
    currency: "USD",
    payment_method: "credit_card",
    is_anonymous: false,
    donor_name: user?.first_name && user?.last_name ? `${user.first_name} ${user.last_name}` : "",
    donor_email: user?.email || "",
    donor_phone: "",
    campaign: selectedCampaign?.id || "",
    message: "",
    marketing_opt_in: false,
    newsletter_opt_in: false,
  })

  const [recurringForm, setRecurringForm] = useState({
    amount: "",
    currency: "USD",
    frequency: "monthly",
    payment_method: "credit_card",
    is_anonymous: false,
    campaign: selectedCampaign?.id || "",
    start_date: new Date().toISOString().split("T")[0],
    end_date: "",
    notes: "",
  })

  const [inKindForm, setInKindForm] = useState({
    item_description: "",
    category: "other",
    brand_model: "",
    condition: "",
    quantity: "1",
    unit_of_measure: "",
    estimated_value: "",
    valuation_currency: "USD",
    valuation_method: "",
    campaign: selectedCampaign?.id || "",
    is_anonymous: false,
    donor_name: user?.first_name && user?.last_name ? `${user.first_name} ${user.last_name}` : "",
    donor_email: user?.email || "",
    donor_phone: "",
    donor_organization: "",
    pickup_required: false,
    delivery_address: "",
    special_handling_requirements: "",
    expected_delivery_date: "",
    notes: "",
  })

  // Select options
  const paymentMethodOptions: SelectOption[] = [
    { value: "credit_card", label: "Credit Card", icon: <CreditCard className="h-4 w-4" /> },
    { value: "debit_card", label: "Debit Card", icon: <CreditCard className="h-4 w-4" /> },
    { value: "bank_transfer", label: "Bank Transfer", icon: <DollarSign className="h-4 w-4" /> },
    { value: "mobile_money", label: "Mobile Money", icon: <DollarSign className="h-4 w-4" /> },
  ]

  const frequencyOptions: SelectOption[] = [
    { value: "weekly", label: "Weekly" },
    { value: "monthly", label: "Monthly" },
    { value: "quarterly", label: "Quarterly" },
    { value: "annually", label: "Annually" },
  ]

  const inKindCategoryOptions: SelectOption[] = [
    { value: "equipment", label: "Equipment" },
    { value: "supplies", label: "Supplies" },
    { value: "services", label: "Professional Services" },
    { value: "food", label: "Food & Beverages" },
    { value: "clothing", label: "Clothing" },
    { value: "books", label: "Books & Educational Materials" },
    { value: "technology", label: "Technology" },
    { value: "vehicles", label: "Vehicles" },
    { value: "other", label: "Other" },
  ]

  const currencyOptions: SelectOption[] = [
    { value: "USD", label: "USD - US Dollar" },
    { value: "EUR", label: "EUR - Euro" },
    { value: "GBP", label: "GBP - British Pound" },
    { value: "NGN", label: "NGN - Nigerian Naira" },
    { value: "GHS", label: "GHS - Ghanaian Cedi" },
    { value: "KES", label: "KES - Kenyan Shilling" },
  ]

  // Custom styles for react-select
  const selectStyles = {
    control: (provided: any, state: any) => ({
      ...provided,
      borderColor: state.isFocused ? "#10b981" : errors[state.selectProps.name] ? "#ef4444" : "#d1d5db",
      boxShadow: state.isFocused ? "0 0 0 1px #10b981" : "none",
      "&:hover": {
        borderColor: state.isFocused ? "#10b981" : "#9ca3af",
      },
      minHeight: "40px",
    }),
    option: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: state.isSelected ? "#10b981" : state.isFocused ? "#f0fdf4" : "white",
      color: state.isSelected ? "white" : "#374151",
      "&:hover": {
        backgroundColor: state.isSelected ? "#10b981" : "#f0fdf4",
      },
    }),
    multiValue: (provided: any) => ({
      ...provided,
      backgroundColor: "#f0fdf4",
    }),
    multiValueLabel: (provided: any) => ({
      ...provided,
      color: "#065f46",
    }),
    multiValueRemove: (provided: any) => ({
      ...provided,
      color: "#065f46",
      "&:hover": {
        backgroundColor: "#10b981",
        color: "white",
      },
    }),
  }

  // Custom option component with icons
  const OptionWithIcon = ({ children, ...props }: any) => {
    const { data } = props
    return (
      <div {...props.innerProps} className="flex items-center p-2 hover:bg-gray-50 cursor-pointer">
        {data.icon && <span className="mr-2">{data.icon}</span>}
        <span>{children}</span>
      </div>
    )
  }

  const validateOneTimeForm = () => {
    const newErrors: Record<string, string> = {}

    if (!oneTimeForm.amount || Number.parseFloat(oneTimeForm.amount) <= 0) {
      newErrors.amount = "Please enter a valid donation amount"
    }
    if (!oneTimeForm.currency) {
      newErrors.currency = "Please select a currency"
    }
    if (!oneTimeForm.payment_method) {
      newErrors.payment_method = "Please select a payment method"
    }
    if (!oneTimeForm.is_anonymous) {
      if (!oneTimeForm.donor_name.trim()) {
        newErrors.donor_name = "Please enter your name"
      }
      if (!oneTimeForm.donor_email.trim()) {
        newErrors.donor_email = "Please enter your email"
      } else if (!/\S+@\S+\.\S+/.test(oneTimeForm.donor_email)) {
        newErrors.donor_email = "Please enter a valid email address"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateRecurringForm = () => {
    const newErrors: Record<string, string> = {}

    if (!recurringForm.amount || Number.parseFloat(recurringForm.amount) <= 0) {
      newErrors.amount = "Please enter a valid donation amount"
    }
    if (!recurringForm.currency) {
      newErrors.currency = "Please select a currency"
    }
    if (!recurringForm.frequency) {
      newErrors.frequency = "Please select a frequency"
    }
    if (!recurringForm.payment_method) {
      newErrors.payment_method = "Please select a payment method"
    }
    if (!recurringForm.start_date) {
      newErrors.start_date = "Please select a start date"
    }
    if (recurringForm.end_date && new Date(recurringForm.end_date) <= new Date(recurringForm.start_date)) {
      newErrors.end_date = "End date must be after start date"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateInKindForm = () => {
    const newErrors: Record<string, string> = {}

    if (!inKindForm.item_description.trim()) {
      newErrors.item_description = "Please describe the item you're donating"
    }
    if (!inKindForm.category) {
      newErrors.category = "Please select a category"
    }
    if (!inKindForm.quantity || Number.parseInt(inKindForm.quantity) <= 0) {
      newErrors.quantity = "Please enter a valid quantity"
    }
    if (!inKindForm.estimated_value || Number.parseFloat(inKindForm.estimated_value) <= 0) {
      newErrors.estimated_value = "Please enter an estimated value"
    }
    if (!inKindForm.valuation_currency) {
      newErrors.valuation_currency = "Please select a currency"
    }
    if (!inKindForm.is_anonymous) {
      if (!inKindForm.donor_name.trim()) {
        newErrors.donor_name = "Please enter your name"
      }
      if (!inKindForm.donor_email.trim()) {
        newErrors.donor_email = "Please enter your email"
      } else if (!/\S+@\S+\.\S+/.test(inKindForm.donor_email)) {
        newErrors.donor_email = "Please enter a valid email address"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const scrollToError = () => {
    const firstErrorField = Object.keys(errors)[0]
    if (firstErrorField && formRef.current) {
      const errorElement = formRef.current.querySelector(`[name="${firstErrorField}"]`) as HTMLElement
      if (errorElement) {
        errorElement.focus()
        errorElement.scrollIntoView({ behavior: "smooth", block: "center" })
      }
    }
  }

  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      scrollToError()
    }
  }, [errors])

  const handleOneTimeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateOneTimeForm()) return

    try {
      await createDonation({
        ...oneTimeForm,
        amount: Number.parseFloat(oneTimeForm.amount),
        campaign: oneTimeForm.campaign ? Number.parseInt(oneTimeForm.campaign) : null,
      }).unwrap()

      toast.success("Donation created successfully! You will be redirected to payment.")
      setOpen(false)
      // Here you would typically redirect to payment processor
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to create donation")
    }
  }

  const handleRecurringSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateRecurringForm()) return

    try {
      await createRecurringDonation({
        ...recurringForm,
        amount: Number.parseFloat(recurringForm.amount),
        campaign: recurringForm.campaign ? Number.parseInt(recurringForm.campaign) : null,
      }).unwrap()

      toast.success("Recurring donation created successfully! You will be redirected to payment setup.")
      setOpen(false)
      // Here you would typically redirect to payment processor for subscription setup
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to create recurring donation")
    }
  }

  const handleInKindSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateInKindForm()) return

    try {
      await createInKindDonation({
        ...inKindForm,
        quantity: Number.parseInt(inKindForm.quantity),
        estimated_value: Number.parseFloat(inKindForm.estimated_value),
        campaign: inKindForm.campaign ? Number.parseInt(inKindForm.campaign) : null,
        pickup_required: inKindForm.pickup_required,
      }).unwrap()

      toast.success("In-kind donation pledge created successfully! We will contact you soon.")
      setOpen(false)
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to create in-kind donation")
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger}
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Heart className="h-6 w-6 mr-2 text-red-500" />
            Make a Donation
          </DialogTitle>
          <DialogDescription>
            {selectedCampaign
              ? `Support the "${selectedCampaign.title}" campaign`
              : "Choose how you'd like to support our mission"}
          </DialogDescription>
        </DialogHeader>

        <div ref={formRef}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="one-time" className="flex items-center">
                <Heart className="h-4 w-4 mr-2" />
                One-Time
              </TabsTrigger>
              <TabsTrigger value="recurring" className="flex items-center">
                <Repeat className="h-4 w-4 mr-2" />
                Recurring
              </TabsTrigger>
              <TabsTrigger value="in-kind" className="flex items-center">
                <Gift className="h-4 w-4 mr-2" />
                In-Kind
              </TabsTrigger>
            </TabsList>

            {/* One-Time Donation Form */}
            <TabsContent value="one-time">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Heart className="h-5 w-5 mr-2 text-red-500" />
                    One-Time Donation
                  </CardTitle>
                  <CardDescription>Make a single donation to support our cause</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleOneTimeSubmit} className="space-y-6">
                    {/* Amount and Currency */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="amount">Donation Amount *</Label>
                        <Input
                          id="amount"
                          name="amount"
                          type="number"
                          step="0.01"
                          min="0.01"
                          placeholder="0.00"
                          value={oneTimeForm.amount}
                          onChange={(e) => setOneTimeForm({ ...oneTimeForm, amount: e.target.value })}
                          className={errors.amount ? "border-red-500" : ""}
                        />
                        {errors.amount && <p className="text-red-500 text-sm mt-1">{errors.amount}</p>}
                      </div>
                      <div>
                        <Label htmlFor="currency">Currency *</Label>
                        <Select
                          name="currency"
                          options={currencyOptions}
                          value={currencyOptions.find((option) => option.value === oneTimeForm.currency)}
                          onChange={(option) => setOneTimeForm({ ...oneTimeForm, currency: option?.value || "" })}
                          styles={selectStyles}
                          placeholder="Select currency"
                          isSearchable
                        />
                        {errors.currency && <p className="text-red-500 text-sm mt-1">{errors.currency}</p>}
                      </div>
                    </div>

                    {/* Payment Method */}
                    <div>
                      <Label>Payment Method *</Label>
                      <div className="mt-2">
                        <Select
                          name="payment_method"
                          options={paymentMethodOptions}
                          value={paymentMethodOptions.find((option) => option.value === oneTimeForm.payment_method)}
                          onChange={(option) => setOneTimeForm({ ...oneTimeForm, payment_method: option?.value || "" })}
                          styles={selectStyles}
                          placeholder="Select payment method"
                          components={{ Option: OptionWithIcon }}
                        />
                      </div>
                      {errors.payment_method && <p className="text-red-500 text-sm mt-1">{errors.payment_method}</p>}
                    </div>

                    {/* Anonymous Donation */}
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="anonymous"
                        checked={oneTimeForm.is_anonymous}
                        onCheckedChange={(checked) => setOneTimeForm({ ...oneTimeForm, is_anonymous: !!checked })}
                      />
                      <Label htmlFor="anonymous">Make this donation anonymous</Label>
                    </div>

                    {/* Donor Information */}
                    {!oneTimeForm.is_anonymous && (
                      <div className="space-y-4">
                        <h4 className="font-medium">Donor Information</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="donor_name">Full Name *</Label>
                            <Input
                              id="donor_name"
                              name="donor_name"
                              value={oneTimeForm.donor_name}
                              onChange={(e) => setOneTimeForm({ ...oneTimeForm, donor_name: e.target.value })}
                              className={errors.donor_name ? "border-red-500" : ""}
                            />
                            {errors.donor_name && <p className="text-red-500 text-sm mt-1">{errors.donor_name}</p>}
                          </div>
                          <div>
                            <Label htmlFor="donor_email">Email Address *</Label>
                            <Input
                              id="donor_email"
                              name="donor_email"
                              type="email"
                              value={oneTimeForm.donor_email}
                              onChange={(e) => setOneTimeForm({ ...oneTimeForm, donor_email: e.target.value })}
                              className={errors.donor_email ? "border-red-500" : ""}
                            />
                            {errors.donor_email && <p className="text-red-500 text-sm mt-1">{errors.donor_email}</p>}
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="donor_phone">Phone Number (Optional)</Label>
                          <Input
                            id="donor_phone"
                            name="donor_phone"
                            value={oneTimeForm.donor_phone}
                            onChange={(e) => setOneTimeForm({ ...oneTimeForm, donor_phone: e.target.value })}
                          />
                        </div>
                      </div>
                    )}

                    {/* Message */}
                    <div>
                      <Label htmlFor="message">Message (Optional)</Label>
                      <Textarea
                        id="message"
                        name="message"
                        placeholder="Leave a message with your donation..."
                        value={oneTimeForm.message}
                        onChange={(e) => setOneTimeForm({ ...oneTimeForm, message: e.target.value })}
                      />
                    </div>

                    {/* Opt-ins */}
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="marketing_opt_in"
                          checked={oneTimeForm.marketing_opt_in}
                          onCheckedChange={(checked) => setOneTimeForm({ ...oneTimeForm, marketing_opt_in: !!checked })}
                        />
                        <Label htmlFor="marketing_opt_in">I'd like to receive updates about this campaign</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="newsletter_opt_in"
                          checked={oneTimeForm.newsletter_opt_in}
                          onCheckedChange={(checked) =>
                            setOneTimeForm({ ...oneTimeForm, newsletter_opt_in: !!checked })
                          }
                        />
                        <Label htmlFor="newsletter_opt_in">Subscribe to our newsletter</Label>
                      </div>
                    </div>

                    <Button type="submit" className="w-full" disabled={isCreatingDonation}>
                      {isCreatingDonation
                        ? "Processing..."
                        : `Donate ${formatCurrency(oneTimeForm.currency, Number.parseFloat(oneTimeForm.amount) || 0)}`}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Recurring Donation Form */}
            <TabsContent value="recurring">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Repeat className="h-5 w-5 mr-2 text-blue-500" />
                    Recurring Donation
                  </CardTitle>
                  <CardDescription>Set up a recurring donation to provide ongoing support</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleRecurringSubmit} className="space-y-6">
                    {/* Amount, Currency, and Frequency */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="recurring_amount">Amount *</Label>
                        <Input
                          id="recurring_amount"
                          name="amount"
                          type="number"
                          step="0.01"
                          min="0.01"
                          placeholder="0.00"
                          value={recurringForm.amount}
                          onChange={(e) => setRecurringForm({ ...recurringForm, amount: e.target.value })}
                          className={errors.amount ? "border-red-500" : ""}
                        />
                        {errors.amount && <p className="text-red-500 text-sm mt-1">{errors.amount}</p>}
                      </div>
                      <div>
                        <Label htmlFor="recurring_currency">Currency *</Label>
                        <Select
                          name="currency"
                          options={currencyOptions}
                          value={currencyOptions.find((option) => option.value === recurringForm.currency)}
                          onChange={(option) => setRecurringForm({ ...recurringForm, currency: option?.value || "" })}
                          styles={selectStyles}
                          placeholder="Select currency"
                          isSearchable
                        />
                        {errors.currency && <p className="text-red-500 text-sm mt-1">{errors.currency}</p>}
                      </div>
                      <div>
                        <Label htmlFor="frequency">Frequency *</Label>
                        <Select
                          name="frequency"
                          options={frequencyOptions}
                          value={frequencyOptions.find((option) => option.value === recurringForm.frequency)}
                          onChange={(option) => setRecurringForm({ ...recurringForm, frequency: option?.value || "" })}
                          styles={selectStyles}
                          placeholder="Select frequency"
                        />
                        {errors.frequency && <p className="text-red-500 text-sm mt-1">{errors.frequency}</p>}
                      </div>
                    </div>

                    {/* Payment Method */}
                    <div>
                      <Label>Payment Method *</Label>
                      <div className="mt-2">
                        <Select
                          name="payment_method"
                          options={paymentMethodOptions}
                          value={paymentMethodOptions.find((option) => option.value === recurringForm.payment_method)}
                          onChange={(option) =>
                            setRecurringForm({ ...recurringForm, payment_method: option?.value || "" })
                          }
                          styles={selectStyles}
                          placeholder="Select payment method"
                          components={{ Option: OptionWithIcon }}
                        />
                      </div>
                      {errors.payment_method && <p className="text-red-500 text-sm mt-1">{errors.payment_method}</p>}
                    </div>

                    {/* Dates */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="start_date">Start Date *</Label>
                        <Input
                          id="start_date"
                          name="start_date"
                          type="date"
                          value={recurringForm.start_date}
                          onChange={(e) => setRecurringForm({ ...recurringForm, start_date: e.target.value })}
                          className={errors.start_date ? "border-red-500" : ""}
                        />
                        {errors.start_date && <p className="text-red-500 text-sm mt-1">{errors.start_date}</p>}
                      </div>
                      <div>
                        <Label htmlFor="end_date">End Date (Optional)</Label>
                        <Input
                          id="end_date"
                          name="end_date"
                          type="date"
                          value={recurringForm.end_date}
                          onChange={(e) => setRecurringForm({ ...recurringForm, end_date: e.target.value })}
                          className={errors.end_date ? "border-red-500" : ""}
                        />
                        {errors.end_date && <p className="text-red-500 text-sm mt-1">{errors.end_date}</p>}
                      </div>
                    </div>

                    {/* Anonymous */}
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="recurring_anonymous"
                        checked={recurringForm.is_anonymous}
                        onCheckedChange={(checked) => setRecurringForm({ ...recurringForm, is_anonymous: !!checked })}
                      />
                      <Label htmlFor="recurring_anonymous">Make this donation anonymous</Label>
                    </div>

                    {/* Notes */}
                    <div>
                      <Label htmlFor="recurring_notes">Notes (Optional)</Label>
                      <Textarea
                        id="recurring_notes"
                        name="notes"
                        placeholder="Any additional notes about your recurring donation..."
                        value={recurringForm.notes}
                        onChange={(e) => setRecurringForm({ ...recurringForm, notes: e.target.value })}
                      />
                    </div>

                    <Button type="submit" className="w-full" disabled={isCreatingRecurring}>
                      {isCreatingRecurring
                        ? "Setting up..."
                        : `Set up ${formatCurrency(recurringForm.currency, Number.parseFloat(recurringForm.amount) || 0)} ${recurringForm.frequency} donation`}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* In-Kind Donation Form */}
            <TabsContent value="in-kind">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Gift className="h-5 w-5 mr-2 text-green-500" />
                    In-Kind Donation
                  </CardTitle>
                  <CardDescription>Donate goods, services, or other non-monetary items</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleInKindSubmit} className="space-y-6">
                    {/* Item Description */}
                    <div>
                      <Label htmlFor="item_description">Item Description *</Label>
                      <Textarea
                        id="item_description"
                        name="item_description"
                        placeholder="Describe what you're donating in detail..."
                        value={inKindForm.item_description}
                        onChange={(e) => setInKindForm({ ...inKindForm, item_description: e.target.value })}
                        className={errors.item_description ? "border-red-500" : ""}
                      />
                      {errors.item_description && (
                        <p className="text-red-500 text-sm mt-1">{errors.item_description}</p>
                      )}
                    </div>

                    {/* Category and Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="category">Category *</Label>
                        <Select
                          name="category"
                          options={inKindCategoryOptions}
                          value={inKindCategoryOptions.find((option) => option.value === inKindForm.category)}
                          onChange={(option) => setInKindForm({ ...inKindForm, category: option?.value || "" })}
                          styles={selectStyles}
                          placeholder="Select category"
                          isSearchable
                        />
                        {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
                      </div>
                      <div>
                        <Label htmlFor="brand_model">Brand/Model (Optional)</Label>
                        <Input
                          id="brand_model"
                          name="brand_model"
                          value={inKindForm.brand_model}
                          onChange={(e) => setInKindForm({ ...inKindForm, brand_model: e.target.value })}
                        />
                      </div>
                    </div>

                    {/* Quantity and Condition */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="quantity">Quantity *</Label>
                        <Input
                          id="quantity"
                          name="quantity"
                          type="number"
                          min="1"
                          value={inKindForm.quantity}
                          onChange={(e) => setInKindForm({ ...inKindForm, quantity: e.target.value })}
                          className={errors.quantity ? "border-red-500" : ""}
                        />
                        {errors.quantity && <p className="text-red-500 text-sm mt-1">{errors.quantity}</p>}
                      </div>
                      <div>
                        <Label htmlFor="unit_of_measure">Unit (Optional)</Label>
                        <Input
                          id="unit_of_measure"
                          name="unit_of_measure"
                          placeholder="e.g., boxes, pieces, hours"
                          value={inKindForm.unit_of_measure}
                          onChange={(e) => setInKindForm({ ...inKindForm, unit_of_measure: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="condition">Condition (Optional)</Label>
                        <Input
                          id="condition"
                          name="condition"
                          placeholder="e.g., New, Good, Fair"
                          value={inKindForm.condition}
                          onChange={(e) => setInKindForm({ ...inKindForm, condition: e.target.value })}
                        />
                      </div>
                    </div>

                    {/* Valuation */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="estimated_value">Estimated Value *</Label>
                        <Input
                          id="estimated_value"
                          name="estimated_value"
                          type="number"
                          step="0.01"
                          min="0.01"
                          placeholder="0.00"
                          value={inKindForm.estimated_value}
                          onChange={(e) => setInKindForm({ ...inKindForm, estimated_value: e.target.value })}
                          className={errors.estimated_value ? "border-red-500" : ""}
                        />
                        {errors.estimated_value && (
                          <p className="text-red-500 text-sm mt-1">{errors.estimated_value}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="valuation_currency">Currency *</Label>
                        <Select
                          name="valuation_currency"
                          options={currencyOptions}
                          value={currencyOptions.find((option) => option.value === inKindForm.valuation_currency)}
                          onChange={(option) =>
                            setInKindForm({ ...inKindForm, valuation_currency: option?.value || "" })
                          }
                          styles={selectStyles}
                          placeholder="Select currency"
                          isSearchable
                        />
                        {errors.valuation_currency && (
                          <p className="text-red-500 text-sm mt-1">{errors.valuation_currency}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="valuation_method">Valuation Method (Optional)</Label>
                        <Input
                          id="valuation_method"
                          name="valuation_method"
                          placeholder="e.g., Market price, Receipt"
                          value={inKindForm.valuation_method}
                          onChange={(e) => setInKindForm({ ...inKindForm, valuation_method: e.target.value })}
                        />
                      </div>
                    </div>

                    {/* Anonymous */}
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="inkind_anonymous"
                        checked={inKindForm.is_anonymous}
                        onCheckedChange={(checked) => setInKindForm({ ...inKindForm, is_anonymous: !!checked })}
                      />
                      <Label htmlFor="inkind_anonymous">Make this donation anonymous</Label>
                    </div>

                    {/* Donor Information */}
                    {!inKindForm.is_anonymous && (
                      <div className="space-y-4">
                        <h4 className="font-medium">Donor Information</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="inkind_donor_name">Full Name *</Label>
                            <Input
                              id="inkind_donor_name"
                              name="donor_name"
                              value={inKindForm.donor_name}
                              onChange={(e) => setInKindForm({ ...inKindForm, donor_name: e.target.value })}
                              className={errors.donor_name ? "border-red-500" : ""}
                            />
                            {errors.donor_name && <p className="text-red-500 text-sm mt-1">{errors.donor_name}</p>}
                          </div>
                          <div>
                            <Label htmlFor="inkind_donor_email">Email Address *</Label>
                            <Input
                              id="inkind_donor_email"
                              name="donor_email"
                              type="email"
                              value={inKindForm.donor_email}
                              onChange={(e) => setInKindForm({ ...inKindForm, donor_email: e.target.value })}
                              className={errors.donor_email ? "border-red-500" : ""}
                            />
                            {errors.donor_email && <p className="text-red-500 text-sm mt-1">{errors.donor_email}</p>}
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="inkind_donor_phone">Phone Number (Optional)</Label>
                            <Input
                              id="inkind_donor_phone"
                              name="donor_phone"
                              value={inKindForm.donor_phone}
                              onChange={(e) => setInKindForm({ ...inKindForm, donor_phone: e.target.value })}
                            />
                          </div>
                          <div>
                            <Label htmlFor="donor_organization">Organization (Optional)</Label>
                            <Input
                              id="donor_organization"
                              name="donor_organization"
                              value={inKindForm.donor_organization}
                              onChange={(e) => setInKindForm({ ...inKindForm, donor_organization: e.target.value })}
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Logistics */}
                    <div className="space-y-4">
                      <h4 className="font-medium">Logistics</h4>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="pickup_required"
                          checked={inKindForm.pickup_required}
                          onCheckedChange={(checked) => setInKindForm({ ...inKindForm, pickup_required: !!checked })}
                        />
                        <Label htmlFor="pickup_required">Pickup required (we'll arrange collection)</Label>
                      </div>

                      <div>
                        <Label htmlFor="delivery_address">Delivery/Pickup Address (Optional)</Label>
                        <Textarea
                          id="delivery_address"
                          name="delivery_address"
                          placeholder="Enter the address where items can be collected or delivered..."
                          value={inKindForm.delivery_address}
                          onChange={(e) => setInKindForm({ ...inKindForm, delivery_address: e.target.value })}
                        />
                      </div>

                      <div>
                        <Label htmlFor="expected_delivery_date">Expected Delivery Date (Optional)</Label>
                        <Input
                          id="expected_delivery_date"
                          name="expected_delivery_date"
                          type="date"
                          value={inKindForm.expected_delivery_date}
                          onChange={(e) => setInKindForm({ ...inKindForm, expected_delivery_date: e.target.value })}
                        />
                      </div>

                      <div>
                        <Label htmlFor="special_handling_requirements">Special Handling Requirements (Optional)</Label>
                        <Textarea
                          id="special_handling_requirements"
                          name="special_handling_requirements"
                          placeholder="Any special handling, storage, or transportation requirements..."
                          value={inKindForm.special_handling_requirements}
                          onChange={(e) =>
                            setInKindForm({ ...inKindForm, special_handling_requirements: e.target.value })
                          }
                        />
                      </div>
                    </div>

                    {/* Notes */}
                    <div>
                      <Label htmlFor="inkind_notes">Additional Notes (Optional)</Label>
                      <Textarea
                        id="inkind_notes"
                        name="notes"
                        placeholder="Any additional information about your donation..."
                        value={inKindForm.notes}
                        onChange={(e) => setInKindForm({ ...inKindForm, notes: e.target.value })}
                      />
                    </div>

                    <Button type="submit" className="w-full" disabled={isCreatingInKind}>
                      {isCreatingInKind ? "Creating pledge..." : "Submit In-Kind Donation Pledge"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  )
}
