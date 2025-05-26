"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { DollarSign, CreditCard, Repeat, Gift, QrCode, Share2, Copy, Building, Smartphone } from "lucide-react"
import { toast } from "react-toastify"
import type { DonationCampaign } from "@/types/finance"

interface DonationOptionsPanelProps {
  campaign: DonationCampaign
  onDonationMade: () => void
}

export function DonationOptionsPanel({ campaign, onDonationMade }: DonationOptionsPanelProps) {
  const [selectedAmount, setSelectedAmount] = useState("")
  const [customAmount, setCustomAmount] = useState("")
  const [donationType, setDonationType] = useState("one-time")
  const [frequency, setFrequency] = useState("monthly")
  const [paymentMethod, setPaymentMethod] = useState("")
  const [donorMessage, setDonorMessage] = useState("")
  const [isAnonymous, setIsAnonymous] = useState(false)

  const predefinedAmounts = [25, 50, 100, 250, 500, 1000]

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: campaign.target_currency?.code || "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case "credit_card":
        return <CreditCard className="h-4 w-4" />
      case "bank_transfer":
        return <Building className="h-4 w-4" />
      case "mobile_money":
        return <Smartphone className="h-4 w-4" />
      default:
        return <CreditCard className="h-4 w-4" />
    }
  }

  const handleDonate = () => {
    const amount = customAmount || selectedAmount
    if (!amount || !paymentMethod) {
      toast.error("Please select an amount and payment method")
      return
    }

    toast.success(`Processing ${formatCurrency(Number(amount))} ${donationType} donation`)
    onDonationMade()
  }

  const handleCopyLink = () => {
    const donationLink = `${window.location.origin}/donate/${campaign.id}`
    navigator.clipboard.writeText(donationLink)
    toast.success("Donation link copied to clipboard")
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: campaign.title,
        text: campaign.description,
        url: `${window.location.origin}/donate/${campaign.id}`,
      })
    } else {
      handleCopyLink()
    }
  }

  const availablePaymentMethods =
    campaign.campaign_bank_accounts
      ?.filter((cba) => cba.is_active)
      .map((cba) => ({
        id: cba.bank_account.id,
        type: cba.bank_account.account_type,
        name: cba.bank_account.name,
        institution: cba.bank_account.financial_institution.name,
      })) || []

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Donation Options
        </CardTitle>
        <CardDescription>Configure and test donation options for this campaign</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Donation Type Tabs */}
        <Tabs value={donationType} onValueChange={setDonationType}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="one-time" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              One-time
            </TabsTrigger>
            <TabsTrigger value="recurring" className="flex items-center gap-2">
              <Repeat className="h-4 w-4" />
              Recurring
            </TabsTrigger>
            <TabsTrigger value="in-kind" className="flex items-center gap-2">
              <Gift className="h-4 w-4" />
              In-Kind
            </TabsTrigger>
          </TabsList>

          <TabsContent value="one-time" className="space-y-4">
            {/* Amount Selection */}
            <div className="space-y-3">
              <label className="text-sm font-medium">Select Amount</label>
              <div className="grid grid-cols-3 gap-2">
                {predefinedAmounts.map((amount) => (
                  <Button
                    key={amount}
                    variant={selectedAmount === amount.toString() ? "default" : "outline"}
                    onClick={() => {
                      setSelectedAmount(amount.toString())
                      setCustomAmount("")
                    }}
                  >
                    {formatCurrency(amount)}
                  </Button>
                ))}
              </div>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="number"
                  placeholder="Custom amount"
                  value={customAmount}
                  onChange={(e) => {
                    setCustomAmount(e.target.value)
                    setSelectedAmount("")
                  }}
                  className="pl-10"
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="recurring" className="space-y-4">
            {/* Recurring Amount and Frequency */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Amount</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    type="number"
                    placeholder="Monthly amount"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Frequency</label>
                <Select value={frequency} onValueChange={setFrequency}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="in-kind" className="space-y-4">
            <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
              <Gift className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">In-Kind Donations</h3>
              <p className="text-gray-500 mb-4">Contact us directly to arrange in-kind donations</p>
              <Button variant="outline">Contact Campaign Manager</Button>
            </div>
          </TabsContent>
        </Tabs>

        {/* Payment Method Selection */}
        {donationType !== "in-kind" && (
          <div className="space-y-3">
            <label className="text-sm font-medium">Payment Method</label>
            <div className="space-y-2">
              {availablePaymentMethods.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">No payment methods available</div>
              ) : (
                availablePaymentMethods.map((method) => (
                  <div
                    key={method.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      paymentMethod === method.id.toString()
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => setPaymentMethod(method.id.toString())}
                  >
                    <div className="flex items-center gap-3">
                      {getPaymentMethodIcon(method.type)}
                      <div className="flex-1">
                        <div className="font-medium">{method.name}</div>
                        <div className="text-sm text-muted-foreground">{method.institution}</div>
                      </div>
                      {paymentMethod === method.id.toString() && <Badge variant="default">Selected</Badge>}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Donor Message */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Message (Optional)</label>
          <Textarea
            placeholder="Leave a message with your donation..."
            value={donorMessage}
            onChange={(e) => setDonorMessage(e.target.value)}
            rows={3}
          />
        </div>

        {/* Anonymous Donation */}
        <div className="flex items-center justify-between p-3 border rounded-lg">
          <div>
            <div className="font-medium">Anonymous Donation</div>
            <div className="text-sm text-muted-foreground">Hide your name from public donor lists</div>
          </div>
          <Switch checked={isAnonymous} onCheckedChange={setIsAnonymous} />
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            onClick={handleDonate}
            className="w-full"
            disabled={(!customAmount && !selectedAmount) || (!paymentMethod && donationType !== "in-kind")}
          >
            {donationType === "recurring" ? "Start Recurring Donation" : "Donate Now"}
          </Button>

          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" onClick={handleCopyLink}>
              <Copy className="h-4 w-4 mr-2" />
              Copy Link
            </Button>
            <Button variant="outline" onClick={handleShare}>
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
        </div>

        {/* QR Code Section */}
        <div className="text-center p-4 border rounded-lg bg-gray-50">
          <QrCode className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <div className="text-sm text-muted-foreground">QR code for mobile donations</div>
          <Button variant="link" size="sm">
            Generate QR Code
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
