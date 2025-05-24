"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Target, Calendar, User, Building, Eye, Loader2, Star, CheckCircle, Clock, ImageIcon, X } from "lucide-react"
import { useGetCampaignByIdQuery } from "@/redux/features/finance/financeApiSlice"
import { format } from "date-fns"

interface CampaignDetailDialogProps {
  campaignId: number
  trigger?: React.ReactNode
}

interface ImagePreviewDialogProps {
  imageUrl: string
  title: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

function ImagePreviewDialog({ imageUrl, title, open, onOpenChange }: ImagePreviewDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="flex items-center justify-between">
            <span>{title}</span>
            <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>
        <div className="p-6 pt-0">
          <img
            src={imageUrl || "/placeholder.svg"}
            alt={title}
            className="w-full h-auto max-h-[70vh] object-contain rounded-lg"
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function CampaignDetailDialog({ campaignId, trigger }: CampaignDetailDialogProps) {
  const [open, setOpen] = useState(false)
  const [imagePreviewOpen, setImagePreviewOpen] = useState(false)
  const {
    data: campaign,
    isLoading,
    error,
  } = useGetCampaignByIdQuery(campaignId, {
    skip: !open,
  })

  const formatCurrency = (amount: string | number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(Number(amount))
  }

  const getStatusBadge = (campaign: any) => {
    const now = new Date()
    const startDate = new Date(campaign.start_date)
    const endDate = new Date(campaign.end_date)

    if (!campaign.is_active) {
      return <Badge variant="secondary">Inactive</Badge>
    }

    if (campaign.is_completed) {
      return (
        <Badge variant="default" className="bg-green-600">
          Completed
        </Badge>
      )
    }

    if (now < startDate) {
      return <Badge variant="outline">Upcoming</Badge>
    }

    if (now > endDate) {
      return <Badge variant="destructive">Expired</Badge>
    }

    return <Badge variant="default">Active</Badge>
  }

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {trigger || (
            <Button variant="ghost" size="sm">
              <Eye className="h-4 w-4 mr-1" />
              View Details
            </Button>
          )}
        </DialogTrigger>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Campaign Details</DialogTitle>
          </DialogHeader>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-600">Failed to load campaign details</p>
            </div>
          ) : campaign ? (
            <div className="space-y-6">
              {/* Header Info */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-2xl font-bold">{campaign.title}</h3>
                    {campaign.is_featured && <Star className="h-5 w-5 text-yellow-500 fill-current" />}
                  </div>
                  <div className="flex items-center gap-2 mb-4">
                    {getStatusBadge(campaign)}
                    {campaign.is_completed && <CheckCircle className="h-4 w-4 text-green-600" />}
                  </div>
                </div>
              </div>

              {/* Campaign Image */}
              {campaign.image && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <ImageIcon className="h-5 w-5 mr-2" />
                      Campaign Image
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="relative">
                      <img
                        src={campaign.image || "/placeholder.svg"}
                        alt={campaign.title}
                        className="w-full h-64 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => setImagePreviewOpen(true)}
                      />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black bg-opacity-20 rounded-lg cursor-pointer">
                        <Button variant="secondary" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          View Full Size
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Separator />

              {/* Progress Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Target className="h-5 w-5 mr-2" />
                    Fundraising Progress
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Progress</span>
                    <span className="text-sm font-bold">{campaign.progress_percentage?.toFixed(1)}%</span>
                  </div>
                  <Progress value={campaign.progress_percentage} className="h-3" />
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Raised</label>
                      <p className="text-lg font-bold text-green-600">{formatCurrency(campaign.current_amount)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Target</label>
                      <p className="text-lg font-bold">{formatCurrency(campaign.target_amount)}</p>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Remaining</label>
                    <p className="text-sm">
                      {formatCurrency(Math.max(0, Number(campaign.target_amount) - Number(campaign.current_amount)))}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Campaign Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2" />
                    Campaign Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Start Date</label>
                      <p className="text-sm flex items-center">
                        <Clock className="h-4 w-4 mr-1 text-green-600" />
                        {campaign.start_date ? format(new Date(campaign.start_date), "PPP") : "N/A"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">End Date</label>
                      <p className="text-sm flex items-center">
                        <Clock className="h-4 w-4 mr-1 text-red-600" />
                        {campaign.end_date ? format(new Date(campaign.end_date), "PPP") : "N/A"}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Status</label>
                      <p className="text-sm">{campaign.is_active ? "Active" : "Inactive"}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Featured</label>
                      <p className="text-sm flex items-center">
                        {campaign.is_featured ? (
                          <>
                            <Star className="h-4 w-4 mr-1 text-yellow-500 fill-current" />
                            Yes
                          </>
                        ) : (
                          "No"
                        )}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Project Information */}
              {campaign.project_name && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Building className="h-5 w-5 mr-2" />
                      Associated Project
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{campaign.project_name}</p>
                  </CardContent>
                </Card>
              )}

              {/* Description */}
              <Card>
                <CardHeader>
                  <CardTitle>Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{campaign.description}</p>
                </CardContent>
              </Card>

              {/* Creation Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    Campaign Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Created By</label>
                      <p className="text-sm">{campaign.created_by_name || "System"}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Created At</label>
                      <p className="text-sm">
                        {campaign.created_at ? format(new Date(campaign.created_at), "PPp") : "N/A"}
                      </p>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Last Updated</label>
                    <p className="text-sm">
                      {campaign.updated_at ? format(new Date(campaign.updated_at), "PPp") : "N/A"}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* Image Preview Dialog */}
      {campaign?.image && (
        <ImagePreviewDialog
          imageUrl={campaign.image}
          title={campaign.title}
          open={imagePreviewOpen}
          onOpenChange={setImagePreviewOpen}
        />
      )}
    </>
  )
}
