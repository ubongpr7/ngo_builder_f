"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useState } from "react"
import { toast } from "react-toastify"
import {
  Settings,
  Edit,
  Save,
  Calendar,
  DollarSign,
  Users,
  ImageIcon,
  Video,
  AlertTriangle,
  CheckCircle,
} from "lucide-react"
import {
  useUpdateDonationCampaignMutation,
  useExtendCampaignDeadlineMutation,
} from "@/redux/features/finance/donation-campaigns"

interface CampaignSettingsProps {
  campaign: any
  campaignId: number
}

export function CampaignSettings({ campaign, campaignId }: CampaignSettingsProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    title: campaign?.title || "",
    description: campaign?.description || "",
    target_amount: campaign?.target_amount || 0,
    minimum_goal: campaign?.minimum_goal || 0,
    allow_anonymous_donations: campaign?.allow_anonymous_donations || false,
    allow_recurring_donations: campaign?.allow_recurring_donations || false,
    allow_in_kind_donations: campaign?.allow_in_kind_donations || false,
    is_featured: campaign?.is_featured || false,
  })
  const [newEndDate, setNewEndDate] = useState("")
  const [extensionReason, setExtensionReason] = useState("")

  const [updateCampaign] = useUpdateDonationCampaignMutation()
  const [extendDeadline] = useExtendCampaignDeadlineMutation()

  const handleSave = async () => {
    try {
      await updateCampaign({
        id: campaignId,
        data: formData,
      }).unwrap()
      toast.success("Campaign updated successfully")
      setIsEditing(false)
    } catch (error) {
      toast.error("Failed to update campaign")
    }
  }

  const handleExtendDeadline = async () => {
    if (!newEndDate) {
      toast.error("Please select a new end date")
      return
    }

    try {
      await extendDeadline({
        id: campaignId,
        new_end_date: newEndDate,
        reason: extensionReason,
      }).unwrap()
      toast.success("Campaign deadline extended successfully")
      setNewEndDate("")
      setExtensionReason("")
    } catch (error) {
      toast.error("Failed to extend deadline")
    }
  }

  return (
    <div className="space-y-6">
      {/* Settings Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold">Campaign Settings</h3>
          <p className="text-muted-foreground">Manage campaign configuration and preferences</p>
        </div>
        <div className="flex space-x-2">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Campaign
            </Button>
          )}
        </div>
      </div>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="h-5 w-5 mr-2" />
            Basic Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Campaign Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                disabled={!isEditing}
              />
            </div>
            <div>
              <Label htmlFor="campaign_type">Campaign Type</Label>
              <Input id="campaign_type" value={campaign?.campaign_type || ""} disabled />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              disabled={!isEditing}
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      {/* Financial Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <DollarSign className="h-5 w-5 mr-2" />
            Financial Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="target_amount">Target Amount</Label>
              <Input
                id="target_amount"
                type="number"
                value={formData.target_amount}
                onChange={(e) => setFormData({ ...formData, target_amount: Number.parseFloat(e.target.value) })}
                disabled={!isEditing}
              />
            </div>
            <div>
              <Label htmlFor="minimum_goal">Minimum Goal</Label>
              <Input
                id="minimum_goal"
                type="number"
                value={formData.minimum_goal}
                onChange={(e) => setFormData({ ...formData, minimum_goal: Number.parseFloat(e.target.value) })}
                disabled={!isEditing}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Campaign Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Donation Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="anonymous">Allow Anonymous Donations</Label>
              <p className="text-sm text-muted-foreground">
                Allow donors to contribute without revealing their identity
              </p>
            </div>
            <Switch
              id="anonymous"
              checked={formData.allow_anonymous_donations}
              onCheckedChange={(checked) => setFormData({ ...formData, allow_anonymous_donations: checked })}
              disabled={!isEditing}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="recurring">Allow Recurring Donations</Label>
              <p className="text-sm text-muted-foreground">Enable monthly or periodic donation subscriptions</p>
            </div>
            <Switch
              id="recurring"
              checked={formData.allow_recurring_donations}
              onCheckedChange={(checked) => setFormData({ ...formData, allow_recurring_donations: checked })}
              disabled={!isEditing}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="in_kind">Allow In-Kind Donations</Label>
              <p className="text-sm text-muted-foreground">Accept non-monetary contributions like goods or services</p>
            </div>
            <Switch
              id="in_kind"
              checked={formData.allow_in_kind_donations}
              onCheckedChange={(checked) => setFormData({ ...formData, allow_in_kind_donations: checked })}
              disabled={!isEditing}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="featured">Featured Campaign</Label>
              <p className="text-sm text-muted-foreground">Display this campaign prominently on the platform</p>
            </div>
            <Switch
              id="featured"
              checked={formData.is_featured}
              onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })}
              disabled={!isEditing}
            />
          </div>
        </CardContent>
      </Card>

      {/* Timeline Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Timeline Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Start Date</Label>
              <Input value={campaign?.start_date || ""} disabled />
            </div>
            <div>
              <Label>Current End Date</Label>
              <Input value={campaign?.end_date || ""} disabled />
            </div>
          </div>

          <div className="border-t pt-4">
            <h4 className="font-medium mb-3">Extend Campaign Deadline</h4>
            <div className="space-y-3">
              <div>
                <Label htmlFor="new_end_date">New End Date</Label>
                <Input
                  id="new_end_date"
                  type="date"
                  value={newEndDate}
                  onChange={(e) => setNewEndDate(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="extension_reason">Reason for Extension</Label>
                <Textarea
                  id="extension_reason"
                  value={extensionReason}
                  onChange={(e) => setExtensionReason(e.target.value)}
                  placeholder="Explain why the deadline needs to be extended..."
                  rows={3}
                />
              </div>
              <Button onClick={handleExtendDeadline} className="w-full">
                <Calendar className="h-4 w-4 mr-2" />
                Extend Deadline
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Media Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <ImageIcon className="h-5 w-5 mr-2" />
            Media Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Campaign Image</Label>
              <div className="mt-2 p-4 border-2 border-dashed rounded-lg text-center">
                {campaign?.image ? (
                  <div>
                    <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                    <p className="text-sm">Image uploaded</p>
                  </div>
                ) : (
                  <div>
                    <ImageIcon className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No image uploaded</p>
                  </div>
                )}
              </div>
            </div>
            <div>
              <Label>Campaign Video</Label>
              <div className="mt-2 p-4 border-2 border-dashed rounded-lg text-center">
                {campaign?.video ? (
                  <div>
                    <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                    <p className="text-sm">Video uploaded</p>
                  </div>
                ) : (
                  <div>
                    <Video className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No video uploaded</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center text-red-600">
            <AlertTriangle className="h-5 w-5 mr-2" />
            Danger Zone
          </CardTitle>
          <CardDescription>Irreversible actions that affect your campaign</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg">
            <div>
              <h4 className="font-medium">Pause Campaign</h4>
              <p className="text-sm text-muted-foreground">Temporarily stop accepting donations</p>
            </div>
            <Button variant="outline" className="border-red-200 text-red-600 hover:bg-red-50">
              Pause Campaign
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg">
            <div>
              <h4 className="font-medium">Cancel Campaign</h4>
              <p className="text-sm text-muted-foreground">Permanently cancel this campaign</p>
            </div>
            <Button variant="destructive">Cancel Campaign</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
