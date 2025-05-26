"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Activity,
  Search,
  Filter,
  DollarSign,
  Heart,
  Gift,
  Repeat,
  CreditCard,
  Building,
  Smartphone,
  Calendar,
  User,
  MessageSquare,
  Eye,
  Download,
} from "lucide-react"
import { toast } from "react-toastify"
import type { DonationCampaign } from "@/types/finance"

interface RecentDonationsFeedProps {
  campaign: DonationCampaign
  onDataChange: () => void
}

export function RecentDonationsFeed({ campaign, onDataChange }: RecentDonationsFeedProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [timeFilter, setTimeFilter] = useState("all")

  // Sample recent donations data
  const recentDonations = [
    {
      id: 1,
      donor_name: "John Smith",
      donor_email: "john@example.com",
      amount: 250,
      donation_type: "regular",
      payment_method: "credit_card",
      is_anonymous: false,
      message: "Keep up the great work!",
      created_at: "2024-01-20T10:30:00Z",
      status: "completed",
      receipt_number: "RCP-001234",
      avatar: null,
    },
    {
      id: 2,
      donor_name: "Anonymous",
      donor_email: null,
      amount: 100,
      donation_type: "regular",
      payment_method: "paypal",
      is_anonymous: true,
      message: null,
      created_at: "2024-01-20T09:15:00Z",
      status: "completed",
      receipt_number: "RCP-001235",
      avatar: null,
    },
    {
      id: 3,
      donor_name: "Sarah Johnson",
      donor_email: "sarah@example.com",
      amount: 50,
      donation_type: "recurring",
      payment_method: "bank_transfer",
      is_anonymous: false,
      message: "Monthly support for this amazing cause",
      created_at: "2024-01-20T08:45:00Z",
      status: "completed",
      receipt_number: "RCP-001236",
      avatar: null,
    },
    {
      id: 4,
      donor_name: "Tech Corp",
      donor_email: "donations@techcorp.com",
      amount: 1500,
      donation_type: "in_kind",
      payment_method: null,
      is_anonymous: false,
      message: "Laptop donation for educational program",
      created_at: "2024-01-19T16:20:00Z",
      status: "pending",
      receipt_number: "RCP-001237",
      avatar: null,
    },
    {
      id: 5,
      donor_name: "Michael Brown",
      donor_email: "michael@example.com",
      amount: 75,
      donation_type: "regular",
      payment_method: "mobile_money",
      is_anonymous: false,
      message: null,
      created_at: "2024-01-19T14:10:00Z",
      status: "completed",
      receipt_number: "RCP-001238",
      avatar: null,
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
      case "completed":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "failed":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getDonationTypeIcon = (type: string) => {
    switch (type) {
      case "recurring":
        return <Repeat className="h-4 w-4 text-purple-500" />
      case "in_kind":
        return <Gift className="h-4 w-4 text-orange-500" />
      default:
        return <DollarSign className="h-4 w-4 text-green-500" />
    }
  }

  const getPaymentMethodIcon = (method: string | null) => {
    if (!method) return null
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

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return "Just now"
    if (diffInHours < 24) return `${diffInHours}h ago`
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays}d ago`
    return date.toLocaleDateString()
  }

  const filteredDonations = recentDonations.filter((donation) => {
    const matchesSearch =
      donation.donor_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (donation.donor_email && donation.donor_email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      donation.receipt_number.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesType = typeFilter === "all" || donation.donation_type === typeFilter

    const matchesTime =
      timeFilter === "all" ||
      (() => {
        const donationDate = new Date(donation.created_at)
        const now = new Date()
        const diffInDays = Math.floor((now.getTime() - donationDate.getTime()) / (1000 * 60 * 60 * 24))

        switch (timeFilter) {
          case "today":
            return diffInDays === 0
          case "week":
            return diffInDays <= 7
          case "month":
            return diffInDays <= 30
          default:
            return true
        }
      })()

    return matchesSearch && matchesType && matchesTime
  })

  const handleViewDonation = (donation: any) => {
    toast.info(`Opening details for donation ${donation.receipt_number}`)
  }

  const handleThankDonor = (donation: any) => {
    if (donation.is_anonymous) {
      toast.warning("Cannot thank anonymous donors directly")
      return
    }
    toast.success(`Thank you message sent to ${donation.donor_name}`)
    onDataChange()
  }

  const handleExportDonations = () => {
    toast.info("Exporting donation data...")
  }

  const totalAmount = filteredDonations.reduce((sum, donation) => sum + donation.amount, 0)
  const completedDonations = filteredDonations.filter((d) => d.status === "completed").length

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Recent Donations
        </CardTitle>
        <CardDescription>Latest donation activity for this campaign</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{filteredDonations.length}</div>
            <div className="text-xs text-blue-600">Total Donations</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{completedDonations}</div>
            <div className="text-xs text-green-600">Completed</div>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{formatCurrency(totalAmount)}</div>
            <div className="text-xs text-purple-600">Total Amount</div>
          </div>
          <div className="text-center p-3 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">
              {filteredDonations.filter((d) => d.donation_type === "recurring").length}
            </div>
            <div className="text-xs text-orange-600">Recurring</div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search by donor, email, or receipt number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="regular">Regular</SelectItem>
              <SelectItem value="recurring">Recurring</SelectItem>
              <SelectItem value="in_kind">In-Kind</SelectItem>
            </SelectContent>
          </Select>
          <Select value={timeFilter} onValueChange={setTimeFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Time" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleExportDonations}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>

        {/* Donations Table */}
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Donor</TableHead>
                <TableHead>Amount & Type</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDonations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No donations found matching your criteria
                  </TableCell>
                </TableRow>
              ) : (
                filteredDonations.map((donation) => (
                  <TableRow key={donation.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={donation.avatar || ""} />
                          <AvatarFallback>
                            {donation.is_anonymous ? "?" : getInitials(donation.donor_name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">
                            {donation.is_anonymous ? "Anonymous Donor" : donation.donor_name}
                          </div>
                          {!donation.is_anonymous && donation.donor_email && (
                            <div className="text-sm text-muted-foreground">{donation.donor_email}</div>
                          )}
                          <div className="text-xs text-muted-foreground">{donation.receipt_number}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium flex items-center gap-2">
                          {getDonationTypeIcon(donation.donation_type)}
                          {formatCurrency(donation.amount)}
                        </div>
                        <div className="text-sm text-muted-foreground capitalize">
                          {donation.donation_type.replace("_", " ")}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {donation.payment_method ? (
                        <div className="flex items-center gap-2">
                          {getPaymentMethodIcon(donation.payment_method)}
                          <span className="text-sm capitalize">{donation.payment_method.replace("_", " ")}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">N/A</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(donation.status)}>{donation.status.toUpperCase()}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatTimeAgo(donation.created_at)}
                        </div>
                        <div className="text-muted-foreground">
                          {new Date(donation.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="outline" size="sm" onClick={() => handleViewDonation(donation)}>
                          <Eye className="h-3 w-3" />
                        </Button>
                        {!donation.is_anonymous && donation.status === "completed" && (
                          <Button variant="outline" size="sm" onClick={() => handleThankDonor(donation)}>
                            <Heart className="h-3 w-3" />
                          </Button>
                        )}
                        {donation.message && (
                          <Button variant="outline" size="sm">
                            <MessageSquare className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Recent Activity Feed */}
        <div className="space-y-3">
          <h3 className="font-medium">Recent Activity</h3>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {filteredDonations.slice(0, 5).map((donation) => (
              <div key={donation.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="p-2 bg-white rounded-full">{getDonationTypeIcon(donation.donation_type)}</div>
                <div className="flex-1">
                  <div className="text-sm">
                    <span className="font-medium">
                      {donation.is_anonymous ? "Anonymous donor" : donation.donor_name}
                    </span>{" "}
                    donated <span className="font-medium">{formatCurrency(donation.amount)}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formatTimeAgo(donation.created_at)}
                    {donation.message && " • Left a message"}
                  </div>
                </div>
                <Badge variant="outline" className={getStatusColor(donation.status)}>
                  {donation.status}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2 pt-4 border-t">
          <Button variant="outline" size="sm">
            <Heart className="h-4 w-4 mr-2" />
            Thank All Donors
          </Button>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Advanced Filters
          </Button>
          <Button variant="outline" size="sm">
            <User className="h-4 w-4 mr-2" />
            Donor Insights
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
