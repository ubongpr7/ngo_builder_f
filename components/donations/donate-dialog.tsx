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
import { useCreateDonationMutation } from "@/redux/features/finance/donations"
import { useCreateRecurringDonationMutation } from "@/redux/features/finance/recurring-donations"
import { useCreateInKindDonationMutation } from "@/redux/features/finance/in-kind-donations"
import { formatCurrency } from "@/lib/currency-utils"
import Select from "react-select"
import { useGetCurrenciesQuery } from "@/redux/features/common/typeOF"
// Add this import at the top with other imports
import { PaymentHandler } from "../payments/payment-handler"

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

interface CurrencyInterface {
  id: number
  code: string
  name: string
}

export function DonationDialog({ open, setOpen, recurring = false, selectedCampaign, trigger }: DonationDialogProps) {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState(recurring ? "recurring" : "one-time")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const formRef = useRef<HTMLDivElement>(null)
  // Add this state to the DonationDialog component
  const [showPayment, setShowPayment] = useState(false)
  const [currentDonation, setCurrentDonation] = useState<any>(null)
  const [donationType, setDonationType] = useState<"one-time" | "recurring" | "in-kind">("one-time")
  // Mutations
  const [createDonation, { isLoading: isCreatingDonation }] = useCreateDonationMutation()
  const [createRecurringDonation, { isLoading: isCreatingRecurring }] = useCreateRecurringDonationMutation()
  const [createInKindDonation, { isLoading: isCreatingInKind }] = useCreateInKindDonationMutation()

  // Form states
  const [oneTimeForm, setOneTimeForm] = useState({
    amount: "",
    currency: "1", // Default to USD ID (adjust based on your currency IDs)
    payment_method: "credit_card",
    is_anonymous: false,
    donor_name: user?.first_name && user?.last_name ? `${user.first_name} ${user.last_name}` : "",
    donor_email: user?.email || "",
    donor_phone: "",
    campaign: selectedCampaign?.id?.toString() || "",
    message: "",
    marketing_opt_in: false,
    newsletter_opt_in: false,
  })

  const [recurringForm, setRecurringForm] = useState({
    amount: "",
    currency: "1", // Default to USD ID
    frequency: "monthly",
    payment_method: "credit_card",
    is_anonymous: false,
    campaign: selectedCampaign?.id?.toString() || "",
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
    valuation_currency: "1", // Default to USD ID
    valuation_method: "",
    campaign: selectedCampaign?.id?.toString() || "",
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

  const conditionOptions: SelectOption[] = [
    { value: "new", label: "New" },
    { value: "excellent", label: "Excellent" },
    { value: "good", label: "Good" },
    { value: "fair", label: "Fair" },
    { value: "poor", label: "Poor" },
    { value: "damaged", label: "Damaged" },
  ]

  const unitOptions: SelectOption[] = [
    { value: "pieces", label: "Pieces" },
    { value: "boxes", label: "Boxes" },
    { value: "pallets", label: "Pallets" },
    { value: "hours", label: "Hours" },
    { value: "days", label: "Days" },
    { value: "kg", label: "Kilograms" },
    { value: "liters", label: "Liters" },
    { value: "meters", label: "Meters" },
    { value: "square_meters", label: "Square Meters" },
    { value: "sets", label: "Sets" },
  ]

  const valuationMethodOptions: SelectOption[] = [
    { value: "market_price", label: "Market Price" },
    { value: "receipt", label: "Receipt" },
    { value: "appraisal", label: "Professional Appraisal" },
    { value: "purchase_price", label: "Purchase Price" },
    { value: "replacement_cost", label: "Replacement Cost" },
    { value: "comparable_sales", label: "Comparable Sales" },
  ]

  const recurringPaymentMethodOptions: SelectOption[] = [
    { value: "credit_card", label: "Credit Card", icon: <CreditCard className="h-4 w-4" /> },
    { value: "debit_card", label: "Debit Card", icon: <CreditCard className="h-4 w-4" /> },
  ]

  const { data: currencies = [] } = useGetCurrenciesQuery()
  // Update the currency options mapping
  const currencyOptions = currencies.map((currency: CurrencyInterface) => ({
    value: currency.id.toString(), // Use ID as value
    label: `${currency.code} - ${currency.name}`,
  })) 
  const selectedRCurrencyCode = currencies.find(
  (c) => String(c.id) == String(recurringForm.currency)
)?.code || 'USD';
  const selectedCurrencyCode = currencies.find(
  (c) => String(c.id) == String(oneTimeForm.currency)
)?.code || 'USD';


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

  // Add helper function to get currency code from ID
  const getCurrencyCode = (currencyId: string) => {
    const currency = currencies.find((c: CurrencyInterface) => c.id.toString() === currencyId)
    return currency?.code || "USD"
  }

  // Update the handleOneTimeSubmit function
  const handleOneTimeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateOneTimeForm()) return

    try {
      // Format data according to DonationSerializer expectations
      const formattedData = {
        // Foreign key fields with _id suffix
        donor_id: user?.id || null,
        campaign_id: oneTimeForm.campaign ? Number.parseInt(oneTimeForm.campaign) : null,
        currency_id: Number.parseInt(oneTimeForm.currency), // Convert currency to ID

        // Direct fields
        amount: Number.parseFloat(oneTimeForm.amount),
        payment_method: oneTimeForm.payment_method,
        is_anonymous: oneTimeForm.is_anonymous,
        donor_name: oneTimeForm.is_anonymous ? null : oneTimeForm.donor_name,
        donor_email: oneTimeForm.is_anonymous ? null : oneTimeForm.donor_email,
        donor_phone: oneTimeForm.is_anonymous ? null : oneTimeForm.donor_phone,

        // Optional fields
        marketing_opt_in: oneTimeForm.marketing_opt_in,
        newsletter_opt_in: oneTimeForm.newsletter_opt_in,
        notes: oneTimeForm.message || null,

        // Default values
        donation_source: "website",
        tax_deductible: true,
      }

      const result = await createDonation(formattedData).unwrap()

      // Set current donation and show payment
      
      setCurrentDonation({
        id: result.id,
        amount: Number.parseFloat(oneTimeForm.amount),
        currency: getCurrencyCode(oneTimeForm.currency), // Convert ID back to code for Flutterwave
        donor_email: oneTimeForm.donor_email,
        donor_name: oneTimeForm.donor_name,
        donor_phone: oneTimeForm.donor_phone,
        type: "one-time",
        campaign_id: oneTimeForm.campaign ? Number.parseInt(oneTimeForm.campaign) : null,
      })
      setShowPayment(true)
    } catch (error: any) {
      console.error("Donation creation error:", error)
      toast.error(error?.data?.message || error?.data?.detail || "Failed to create donation")
    }
  }

  // Update the handleRecurringSubmit function
  const handleRecurringSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateRecurringForm()) return

    try {
      // Format data according to RecurringDonationSerializer expectations
      const formattedData = {
        // Foreign key fields with _id suffix
        donor_id: user?.id || null,
        campaign_id: recurringForm.campaign ? Number.parseInt(recurringForm.campaign) : null,
        currency_id: Number.parseInt(recurringForm.currency), // Convert currency to ID

        // Direct fields
        amount: Number.parseFloat(recurringForm.amount),
        frequency: recurringForm.frequency,
        payment_method: recurringForm.payment_method,
        is_anonymous: recurringForm.is_anonymous,
        start_date: recurringForm.start_date,
        end_date: recurringForm.end_date || null,
        notes: recurringForm.notes || null,

        // Default values
        max_failed_payments: 3,
      }

      const result = await createRecurringDonation(formattedData).unwrap()

      // Set current donation and show payment
      setCurrentDonation({
        id: result.id,
        amount: Number.parseFloat(recurringForm.amount),
        currency: getCurrencyCode(recurringForm.currency), // Convert ID back to code for Flutterwave
        donor_email: user?.email || "",
        donor_name: user?.first_name && user?.last_name ? `${user.first_name} ${user.last_name}` : "",
        donor_phone: "",
        type: "recurring",
        campaign_id: recurringForm.campaign ? Number.parseInt(recurringForm.campaign) : null,
        payment_plan_id: result.subscription_id,
      })
      setShowPayment(true)
    } catch (error: any) {
      console.error("Recurring donation creation error:", error)
      toast.error(error?.data?.message || error?.data?.detail || "Failed to create recurring donation")
    }
  }

  // Add this function to handle payment completion
  const handlePaymentComplete = () => {
    toast.success("Payment completed successfully!")
    setShowPayment(false)
    setOpen(false)
  }

  // Add this function to handle payment cancellation
  const handlePaymentCancel = () => {
    toast.info("Payment cancelled")
    setShowPayment(false)
  }

  // Update the handleInKindSubmit function
  const handleInKindSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateInKindForm()) return

    try {
      // Format data according to InKindDonationSerializer expectations
      const formattedData = {
        // Foreign key fields with _id suffix
        donor_id: user?.id || null,
        campaign_id: inKindForm.campaign ? Number.parseInt(inKindForm.campaign) : null,
        valuation_currency_id: Number.parseInt(inKindForm.valuation_currency), // Note: valuation_currency_id

        // Direct fields
        item_description: inKindForm.item_description,
        category: inKindForm.category,
        brand_model: inKindForm.brand_model || null,
        condition: inKindForm.condition || null,
        quantity: Number.parseInt(inKindForm.quantity),
        unit_of_measure: inKindForm.unit_of_measure || null,
        estimated_value: Number.parseFloat(inKindForm.estimated_value),
        valuation_method: inKindForm.valuation_method || null,

        // Donor information
        is_anonymous: inKindForm.is_anonymous,
        donor_name: inKindForm.is_anonymous ? null : inKindForm.donor_name,
        donor_email: inKindForm.is_anonymous ? null : inKindForm.donor_email,
        donor_phone: inKindForm.is_anonymous ? null : inKindForm.donor_phone,
        donor_organization: inKindForm.donor_organization || null,

        // Logistics
        pickup_required: inKindForm.pickup_required,
        delivery_address: inKindForm.delivery_address || null,
        special_handling_requirements: inKindForm.special_handling_requirements || null,
        expected_delivery_date: inKindForm.expected_delivery_date || null,
        notes: inKindForm.notes || null,

        // Default values
        status: "pledged",
        tax_deductible: true,
      }

      await createInKindDonation(formattedData).unwrap()

      toast.success("In-Kind Donation Pledge submitted successfully!")
      setOpen(false)
    } catch (error: any) {
      console.error("In-kind donation creation error:", error)
      toast.error(error?.data?.message || error?.data?.detail || "Failed to create in-kind donation pledge")
    }
  }

  // Modify the return statement to conditionally show payment or form
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger}
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Heart className="h-6 w-6 mr-2 text-red-500" />
            {showPayment ? "Complete Payment" : "Make a Donation"}
          </DialogTitle>
          <DialogDescription>
            {showPayment
              ? "Complete your donation payment"
              : selectedCampaign
                ? `Support the "${selectedCampaign.title}" campaign`
                : "Choose how you'd like to support our mission"}
          </DialogDescription>
        </DialogHeader>

        {showPayment && currentDonation ? (
          <PaymentHandler
            donationData={currentDonation}
            onComplete={handlePaymentComplete}
            onCancel={handlePaymentCancel}
          />
        ) : (
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
                            onChange={(option) =>
                              setOneTimeForm({ ...oneTimeForm, payment_method: option?.value || "" })
                            }
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
                            onCheckedChange={(checked) =>
                              setOneTimeForm({ ...oneTimeForm, marketing_opt_in: !!checked })
                            }
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
                          : `Donate ${formatCurrency(selectedCurrencyCode, oneTimeForm.amount) }`}
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
                            onChange={(option) =>
                              setRecurringForm({ ...recurringForm, frequency: option?.value || "" })
                            }
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
                            options={recurringPaymentMethodOptions}
                            value={recurringPaymentMethodOptions.find(
                              (option) => option.value === recurringForm.payment_method,
                            )}
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
                          : `Set up ${formatCurrency(selectedRCurrencyCode, recurringForm.amount) } ${recurringForm.frequency} donation`}
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
                          <Label htmlFor="unit_of_measure">Unit *</Label>
                          <Select
                            id="unit_of_measure"
                            name="unit_of_measure"
                            options={unitOptions}
                            value={unitOptions.find((option) => option.value === inKindForm.unit_of_measure)}
                            onChange={(option) =>
                              setInKindForm({ ...inKindForm, unit_of_measure: option?.value || "" })
                            }
                            styles={selectStyles}
                            placeholder="Select unit"
                          />
                        </div>
                        <div>
                          <Label htmlFor="condition">Condition *</Label>
                          <Select
                            id="condition"
                            name="condition"
                            options={conditionOptions}
                            value={conditionOptions.find((option) => option.value === inKindForm.condition)}
                            onChange={(option) => setInKindForm({ ...inKindForm, condition: option?.value || "" })}
                            styles={selectStyles}
                            placeholder="Select condition"
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
                          <Label htmlFor="valuation_method">Valuation Method *</Label>
                          <Select
                            id="valuation_method"
                            name="valuation_method"
                            options={valuationMethodOptions}
                            value={valuationMethodOptions.find(
                              (option) => option.value === inKindForm.valuation_method,
                            )}
                            onChange={(option) =>
                              setInKindForm({ ...inKindForm, valuation_method: option?.value || "" })
                            }
                            styles={selectStyles}
                            placeholder="Select valuation method"
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
                          <Label htmlFor="special_handling_requirements">
                            Special Handling Requirements (Optional)
                          </Label>
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
        )}
      </DialogContent>
    </Dialog>
  )
}
