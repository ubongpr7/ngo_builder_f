"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Target, Calendar, MoreVertical, Edit2, Trash2, TrendingUp } from "lucide-react"
import { AddEditCampaignDialog } from "./add-edit-campaign-dialog"
import { useDeleteCampaignMutation } from "@/redux/features/finance/financeApiSlice"
import type { DonationCampaign } from "@/types/finance"

interface CampaignCardProps {
  campaign: DonationCampaign
}

export function CampaignCard({ campaign }: CampaignCardProps) {
  const [deleteCampaign] = useDeleteCampaignMutation()

  const getStatusColor = (isActive: boolean, isCompleted: boolean) => {
    if (isCompleted) return "bg-green-100 text-green-800 border-green-300"
    if (isActive) return "bg-blue-100 text-blue-800 border-blue-300"
    return "bg-gray-100 text-gray-800 border-gray-300"
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this campaign?")) {
      try {
        await deleteCampaign(campaign.id).unwrap()
      } catch (error) {
        console.error("Failed to delete campaign:", error)
      }
    }
  }

  const progress = campaign.progress_percentage || 0
  const isCompleted = campaign.is_completed || progress >= 100

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center space-x-2">
          <Target className="h-4 w-4 text-blue-600" />
          <span className="text-sm font-medium text-gray-500">Campaign</span>
          {campaign.is_featured && <Badge variant="secondary">Featured</Badge>}
        </div>
        <div className="flex items-center space-x-2">
          <Badge className={getStatusColor(campaign.is_active, isCompleted)}>
            {isCompleted ? "Completed" : campaign.is_active ? "Active" : "Inactive"}
          </Badge>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <AddEditCampaignDialog
                campaign={campaign}
                trigger={
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <Edit2 className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                }
              />
              <DropdownMenuItem onClick={handleDelete} className="text-red-600">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div>
            <h3 className="font-semibold text-lg line-clamp-1">{campaign.title}</h3>
            <p className="text-sm text-gray-600 line-clamp-2 mt-1">{campaign.description}</p>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Progress</span>
              <span className="font-medium">{progress.toFixed(1)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Raised: {formatCurrency(campaign.current_amount || 0)}</span>
              <span className="text-gray-500">Goal: {formatCurrency(campaign.target_amount)}</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center">
              <Calendar className="mr-1 h-3 w-3" />
              {formatDate(campaign.start_date)} - {formatDate(campaign.end_date)}
            </div>
            <div className="flex items-center">
              <TrendingUp className="mr-1 h-3 w-3" />
              {campaign.donations_count || 0} donations
            </div>
          </div>

          {campaign.project_name && (
            <div className="text-sm">
              <span className="text-gray-500">Project:</span>
              <span className="ml-1 font-medium">{campaign.project_name}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
