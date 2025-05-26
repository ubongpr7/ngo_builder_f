"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Repeat,
  Search,
  Plus,
  Pause,
  Play,
  Edit,
  Calendar,
  DollarSign,
  CreditCard,
  AlertTriangle,
  CheckCircle,
} from "lucide-react"
import { toast } from "react-toastify"
import type { DonationCampaign } from "@/types/finance"

interface RecurringDonationsSectionProps {
  campaign: DonationCampaign
  onDataChange: () => void
}

export function RecurringDonationsSection({ campaign, onDataChange }: RecurringDonationsSectionProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [frequencyFilter, setFrequencyFilter] = useState("all")

  // Sample recurring donations data
  const recurringDonations = [
    {
      id: 1,
      donor_name: "John Smith",
      donor_email: "john@example.com",
      amount: 100,
      frequency: "monthly",
      status: "active",
      start_date: "2024-01-01",
      next_payment: "2024-02-01",
      total_payments: 12,
      successful_payments: 11,
      failed_payments: 1,
      payment_method: "credit_card",
      last_payment_date: "2024-01-01",
      last_payment_status: "successful",
    },
    {
      id: 2,
      donor_name: "Sarah Johnson",
      donor_email: "sarah@example.com",
      amount: 50,
      frequency: "weekly",
      status: "active",
      start_date: "2023-12-01",
      next_payment: "2024-01-22",
      total_payments: 8,
      successful_payments: 8,
      failed_payments: 0,
      payment_method: "bank_transfer",
      last_payment_date: "2024-01-15",
      last_payment_status: "successful",
    },
    {
      id: 3,
      donor_name: "Michael Brown",
      donor_email: "michael@example.com",
      amount: 25,
      frequency: "monthly",
      status: "paused",
      start_date: "2023-11-01",
      next_payment: null,
      total_payments: 3,
      successful_payments: 2,
      failed_payments: 1,
      payment_method: "paypal",
      last_payment_date: "2024-01-01",
      last_payment_status: "failed",
    },
  ]

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: campaign.target_currency?.code || "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "paused":
        return "bg-yellow-100 text-yellow-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      case "expired":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case "credit_card":
        return <CreditCard className="h-4 w-4" />
      case "bank_transfer":
        return <DollarSign className="h-4 w-4" />
      case "paypal":
        return <CreditCard className="h-4 w-4" />
      default:
        return <CreditCard className="h-4 w-4" />
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  const filteredDonations = recurringDonations.filter((donation) => {
    const matchesSearch =
      donation.donor_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      donation.donor_email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || donation.status === statusFilter
    const matchesFrequency = frequencyFilter === "all" || donation.frequency === frequencyFilter

    return matchesSearch && matchesStatus && matchesFrequency
  })

  const handleToggleStatus = (donationId: number, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "paused" : "active"
    toast.success(`Recurring donation ${newStatus === "active" ? "resumed" : "paused"}`)
    onDataChange()
  }

  const handleEditDonation = (donation: any) => {
    toast.info(`Opening edit form for ${donation.donor_name}'s recurring donation`)
  }

  const totalMonthlyRevenue = recurringDonations
    .filter((d) => d.status === "active")
    .reduce((sum, donation) => {
      const monthlyAmount = donation.frequency === "weekly" ? donation.amount * 4.33 : donation.amount
      return sum + monthlyAmount
    }, 0)

  const activeSubscriptions = recurringDonations.filter((d) => d.status === "active").length
  const pausedSubscriptions = recurringDonations.filter((d) => d.status === "paused").length

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Repeat className="h-5 w-5" />
          Recurring Donations
        </CardTitle>
        <CardDescription>Manage subscription-based donations and recurring supporters</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{activeSubscriptions}</div>
            <div className="text-xs text-green-600">Active Subscriptions</div>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{formatCurrency(totalMonthlyRevenue)}</div>
            <div className="text-xs text-blue-600">Monthly Revenue</div>
          </div>
          <div className="text-center p-3 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">{pausedSubscriptions}</div>
            <div className="text-xs text-yellow-600">Paused</div>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {((activeSubscriptions / Math.max(recurringDonations.length, 1)) * 100).toFixed(1)}%
            </div>
            <div className="text-xs text-purple-600">Retention Rate</div>
          </div>
        </div>

        {/* Filters and Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search by donor name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="paused">Paused</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <Select value={frequencyFilter} onValueChange={setFrequencyFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Frequency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Frequencies</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="quarterly">Quarterly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
            </SelectContent>
          </Select>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Recurring
          </Button>
        </div>

        {/* Donations Table */}
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Donor</TableHead>
                <TableHead>Amount & Frequency</TableHead>
                <TableHead>Payment Method</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Next Payment</TableHead>
                <TableHead>Performance</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDonations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No recurring donations found matching your criteria
                  </TableCell>
                </TableRow>
              ) : (
                filteredDonations.map((donation) => (
                  <TableRow key={donation.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>{getInitials(donation.donor_name)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{donation.donor_name}</div>
                          <div className="text-sm text-muted-foreground">{donation.donor_email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium">{formatCurrency(donation.amount)}</div>
                        <div className="text-sm text-muted-foreground capitalize">{donation.frequency}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getPaymentMethodIcon(donation.payment_method)}
                        <span className="text-sm capitalize">{donation.payment_method.replace("_", " ")}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <Badge className={getStatusColor(donation.status)}>{donation.status.toUpperCase()}</Badge>
                        {donation.last_payment_status === "failed" && (
                          <div className="flex items-center gap-1 text-red-600">
                            <AlertTriangle className="h-3 w-3" />
                            <span className="text-xs">Last payment failed</span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {donation.next_payment ? (
                        <div className="text-sm">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(donation.next_payment).toLocaleDateString()}
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">N/A</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="text-sm">
                          <span className="text-green-600">{donation.successful_payments}</span>
                          <span className="text-muted-foreground"> / {donation.total_payments}</span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {donation.failed_payments > 0 && (
                            <span className="text-red-600">{donation.failed_payments} failed</span>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleStatus(donation.id, donation.status)}
                        >
                          {donation.status === "active" ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleEditDonation(donation)}>
                          <Edit className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2 pt-4 border-t">
          <Button variant="outline" size="sm">
            <CheckCircle className="h-4 w-4 mr-2" />
            Retry Failed Payments
          </Button>
          <Button variant="outline" size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            Schedule Reminders
          </Button>
          <Button variant="outline" size="sm">
            <DollarSign className="h-4 w-4 mr-2" />
            Revenue Forecast
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
