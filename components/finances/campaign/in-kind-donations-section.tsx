"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Gift, Search, Plus, Eye, Edit, Check, X, Package, Calendar, DollarSign, User, FileText } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { DonationCampaign } from "@/types/finance"

interface InKindDonationsSectionProps {
  campaign: DonationCampaign
  onDataChange: () => void
}

export function InKindDonationsSection({ campaign, onDataChange }: InKindDonationsSectionProps) {
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  // Sample in-kind donations data
  const inKindDonations = [
    {
      id: 1,
      donor_name: "Tech Corp",
      donor_email: "donations@techcorp.com",
      item_description: "10 Laptops - Dell XPS 13",
      category: "electronics",
      estimated_value: 15000,
      quantity: 10,
      unit: "pieces",
      status: "received",
      date_pledged: "2024-01-15",
      date_received: "2024-01-20",
      condition: "new",
      notes: "Brand new laptops for educational program",
    },
    {
      id: 2,
      donor_name: "Local Restaurant",
      donor_email: "manager@restaurant.com",
      item_description: "Catering for 100 people",
      category: "food",
      estimated_value: 2500,
      quantity: 100,
      unit: "servings",
      status: "pledged",
      date_pledged: "2024-01-18",
      date_received: null,
      condition: "fresh",
      notes: "For upcoming fundraising event",
    },
    {
      id: 3,
      donor_name: "Office Supplies Inc",
      donor_email: "donations@office.com",
      item_description: "Office furniture and supplies",
      category: "office_supplies",
      estimated_value: 3200,
      quantity: 1,
      unit: "lot",
      status: "pending_review",
      date_pledged: "2024-01-19",
      date_received: null,
      condition: "used",
      notes: "Desks, chairs, and various office supplies",
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
      case "received":
        return "bg-green-100 text-green-800"
      case "pledged":
        return "bg-blue-100 text-blue-800"
      case "pending_review":
        return "bg-yellow-100 text-yellow-800"
      case "declined":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "electronics":
        return "💻"
      case "food":
        return "🍽️"
      case "office_supplies":
        return "📋"
      case "clothing":
        return "👕"
      case "books":
        return "📚"
      default:
        return "📦"
    }
  }

  const filteredDonations = inKindDonations.filter((donation) => {
    const matchesSearch =
      donation.item_description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      donation.donor_name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || donation.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const handleUpdateStatus = (donationId: number, newStatus: string) => {
    toast({
      title: "Status Updated",
      description: `In-kind donation status updated to ${newStatus}`,
    })
    onDataChange()
  }

  const handleViewDetails = (donation: any) => {
    toast({
      title: "View Details",
      description: `Opening details for ${donation.item_description}`,
    })
  }

  const totalEstimatedValue = inKindDonations.reduce((sum, donation) => sum + donation.estimated_value, 0)
  const receivedValue = inKindDonations
    .filter((d) => d.status === "received")
    .reduce((sum, donation) => sum + donation.estimated_value, 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gift className="h-5 w-5" />
          In-Kind Donations
        </CardTitle>
        <CardDescription>Manage non-monetary donations and contributions</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{campaign.in_kind_donors_count}</div>
            <div className="text-xs text-blue-600">In-Kind Donors</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{formatCurrency(totalEstimatedValue)}</div>
            <div className="text-xs text-green-600">Total Estimated</div>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{formatCurrency(receivedValue)}</div>
            <div className="text-xs text-purple-600">Received Value</div>
          </div>
          <div className="text-center p-3 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">
              {inKindDonations.filter((d) => d.status === "pending_review").length}
            </div>
            <div className="text-xs text-orange-600">Pending Review</div>
          </div>
        </div>

        {/* Filters and Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search by item or donor name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pledged">Pledged</SelectItem>
              <SelectItem value="received">Received</SelectItem>
              <SelectItem value="pending_review">Pending Review</SelectItem>
              <SelectItem value="declined">Declined</SelectItem>
            </SelectContent>
          </Select>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add In-Kind
          </Button>
        </div>

        {/* Donations Table */}
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item & Donor</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Estimated Value</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDonations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No in-kind donations found matching your criteria
                  </TableCell>
                </TableRow>
              ) : (
                filteredDonations.map((donation) => (
                  <TableRow key={donation.id}>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium">{donation.item_description}</div>
                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {donation.donor_name}
                        </div>
                        {donation.notes && (
                          <div className="text-xs text-muted-foreground flex items-center gap-1">
                            <FileText className="h-3 w-3" />
                            {donation.notes.substring(0, 50)}...
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{getCategoryIcon(donation.category)}</span>
                        <span className="capitalize text-sm">{donation.category.replace("_", " ")}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-medium">{donation.quantity}</div>
                        <div className="text-muted-foreground">{donation.unit}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{formatCurrency(donation.estimated_value)}</div>
                      <div className="text-xs text-muted-foreground">
                        {formatCurrency(donation.estimated_value / donation.quantity)} per {donation.unit}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(donation.status)}>
                        {donation.status.replace("_", " ").toUpperCase()}
                      </Badge>
                      <div className="text-xs text-muted-foreground mt-1">Condition: {donation.condition}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Pledged: {new Date(donation.date_pledged).toLocaleDateString()}
                        </div>
                        {donation.date_received && (
                          <div className="text-muted-foreground">
                            Received: {new Date(donation.date_received).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="outline" size="sm" onClick={() => handleViewDetails(donation)}>
                          <Eye className="h-3 w-3" />
                        </Button>
                        {donation.status === "pending_review" && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUpdateStatus(donation.id, "received")}
                            >
                              <Check className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUpdateStatus(donation.id, "declined")}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </>
                        )}
                        <Button variant="outline" size="sm">
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
            <Package className="h-4 w-4 mr-2" />
            Bulk Update
          </Button>
          <Button variant="outline" size="sm">
            <FileText className="h-4 w-4 mr-2" />
            Generate Report
          </Button>
          <Button variant="outline" size="sm">
            <DollarSign className="h-4 w-4 mr-2" />
            Value Assessment
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
