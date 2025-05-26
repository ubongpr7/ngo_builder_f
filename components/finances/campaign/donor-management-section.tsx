"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Users, Search, Mail, Phone, MapPin, TrendingUp, Heart, Star, Download, Repeat } from "lucide-react"
import { toast } from "react-toastify"
import type { DonationCampaign } from "@/types/finance"

interface DonorManagementSectionProps {
  campaign: DonationCampaign
  onDataChange: () => void
}

export function DonorManagementSection({ campaign, onDataChange }: DonorManagementSectionProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSegment, setSelectedSegment] = useState("all")
  const [selectedTab, setSelectedTab] = useState("all")

  // Sample donor data - in real implementation, this would come from API
  const donors = [
    {
      id: 1,
      name: "John Smith",
      email: "john@example.com",
      phone: "+1234567890",
      location: "New York, NY",
      total_donated: 2500,
      donation_count: 5,
      first_donation: "2024-01-15",
      last_donation: "2024-01-20",
      is_recurring: true,
      segment: "major",
      avatar: null,
    },
    {
      id: 2,
      name: "Sarah Johnson",
      email: "sarah@example.com",
      phone: "+1234567891",
      location: "Los Angeles, CA",
      total_donated: 150,
      donation_count: 3,
      first_donation: "2024-01-10",
      last_donation: "2024-01-18",
      is_recurring: false,
      segment: "regular",
      avatar: null,
    },
    {
      id: 3,
      name: "Michael Brown",
      email: "michael@example.com",
      phone: "+1234567892",
      location: "Chicago, IL",
      total_donated: 75,
      donation_count: 2,
      first_donation: "2024-01-12",
      last_donation: "2024-01-19",
      is_recurring: false,
      segment: "small",
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

  const getSegmentColor = (segment: string) => {
    switch (segment) {
      case "major":
        return "bg-purple-100 text-purple-800"
      case "regular":
        return "bg-blue-100 text-blue-800"
      case "small":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  const filteredDonors = donors.filter((donor) => {
    const matchesSearch =
      donor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      donor.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSegment = selectedSegment === "all" || donor.segment === selectedSegment
    const matchesTab =
      selectedTab === "all" ||
      (selectedTab === "recurring" && donor.is_recurring) ||
      (selectedTab === "one-time" && !donor.is_recurring)

    return matchesSearch && matchesSegment && matchesTab
  })

  const handleExportDonors = () => {
    toast.info("Donor data export has been initiated")
  }

  const handleContactDonor = (donor: any) => {
    toast.info(`Opening contact form for ${donor.name}`)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Donor Management
        </CardTitle>
        <CardDescription>Manage and analyze your campaign donors</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Donor Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{campaign.donors_count}</div>
            <div className="text-xs text-blue-600">Total Donors</div>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{campaign.recurring_donors_count}</div>
            <div className="text-xs text-purple-600">Recurring</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(campaign.current_amount_in_target_currency / Math.max(campaign.donors_count, 1))}
            </div>
            <div className="text-xs text-green-600">Avg Donation</div>
          </div>
          <div className="text-center p-3 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">
              {((campaign.recurring_donors_count / Math.max(campaign.donors_count, 1)) * 100).toFixed(1)}%
            </div>
            <div className="text-xs text-orange-600">Retention Rate</div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search donors by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedSegment} onValueChange={setSelectedSegment}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by segment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Segments</SelectItem>
              <SelectItem value="major">Major Donors</SelectItem>
              <SelectItem value="regular">Regular Donors</SelectItem>
              <SelectItem value="small">Small Donors</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleExportDonors}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>

        {/* Donor Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList>
            <TabsTrigger value="all">All Donors</TabsTrigger>
            <TabsTrigger value="recurring">Recurring</TabsTrigger>
            <TabsTrigger value="one-time">One-time</TabsTrigger>
          </TabsList>

          <TabsContent value={selectedTab} className="mt-4">
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Donor</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Total Donated</TableHead>
                    <TableHead>Donations</TableHead>
                    <TableHead>Segment</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDonors.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No donors found matching your criteria
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredDonors.map((donor) => (
                      <TableRow key={donor.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={donor.avatar || ""} />
                              <AvatarFallback>{getInitials(donor.name)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{donor.name}</div>
                              <div className="text-sm text-muted-foreground flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {donor.location}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="text-sm flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {donor.email}
                            </div>
                            <div className="text-sm text-muted-foreground flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {donor.phone}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{formatCurrency(donor.total_donated)}</div>
                          <div className="text-sm text-muted-foreground">
                            Avg: {formatCurrency(donor.total_donated / donor.donation_count)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{donor.donation_count}</span>
                            {donor.is_recurring && (
                              <Badge variant="outline" className="text-xs">
                                <Repeat className="h-3 w-3 mr-1" />
                                Recurring
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Last: {new Date(donor.last_donation).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getSegmentColor(donor.segment)}>
                            {donor.segment.charAt(0).toUpperCase() + donor.segment.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleContactDonor(donor)}>
                              <Mail className="h-3 w-3" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Heart className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2 pt-4 border-t">
          <Button variant="outline" size="sm">
            <Mail className="h-4 w-4 mr-2" />
            Send Thank You
          </Button>
          <Button variant="outline" size="sm">
            <Star className="h-4 w-4 mr-2" />
            Create Segment
          </Button>
          <Button variant="outline" size="sm">
            <TrendingUp className="h-4 w-4 mr-2" />
            Analyze Trends
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
