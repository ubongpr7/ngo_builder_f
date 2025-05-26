"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText, Clock, CheckCircle, XCircle } from "lucide-react"
import { Progress } from "@/components/ui/progress"

interface GrantPipelineProps {
  data: any[]
  isLoading?: boolean
}

export function GrantPipeline({ data, isLoading }: GrantPipelineProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="h-6 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  // Mock data for when API doesn't return array
  const mockData = [
    {
      title: "Education Initiative Grant",
      funder: "Gates Foundation",
      amount: 250000,
      status: "approved",
      submitted_date: "2024-01-15",
    },
    {
      title: "Healthcare Access Program",
      funder: "WHO Foundation",
      amount: 180000,
      status: "under_review",
      submitted_date: "2024-02-01",
    },
    {
      title: "Clean Water Project",
      funder: "Water.org",
      amount: 320000,
      status: "submitted",
      submitted_date: "2024-02-15",
    },
    {
      title: "Women Empowerment Fund",
      funder: "UN Women",
      amount: 150000,
      status: "rejected",
      submitted_date: "2024-01-30",
    },
    {
      title: "Youth Development Program",
      funder: "UNICEF",
      amount: 200000,
      status: "approved",
      submitted_date: "2024-01-10",
    },
  ]

  // Ensure data is an array
  const grantData = Array.isArray(data) ? data : mockData

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-600" />
      case "under_review":
        return <Clock className="h-4 w-4 text-yellow-600" />
      default:
        return <FileText className="h-4 w-4 text-blue-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      case "under_review":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-blue-100 text-blue-800"
    }
  }

  const statusCounts =
    grantData?.reduce(
      (acc, grant) => {
        const status = grant?.status || "submitted"
        acc[status] = (acc[status] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    ) || {}

  const totalAmount = grantData?.reduce((sum, grant) => sum + (grant?.amount || 0), 0) || 0
  const approvedAmount =
    grantData?.filter((g) => g?.status === "approved").reduce((sum, grant) => sum + (grant?.amount || 0), 0) || 0

  const successRate = grantData?.length ? ((statusCounts.approved || 0) / grantData.length) * 100 : 0

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-purple-600" />
          Grant Pipeline
        </CardTitle>
        <CardDescription>Current grant applications and their status</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Pipeline Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{statusCounts.submitted || 0}</div>
            <div className="text-sm text-gray-600">Submitted</div>
          </div>
          <div className="text-center p-3 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">{statusCounts.under_review || 0}</div>
            <div className="text-sm text-gray-600">Under Review</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{statusCounts.approved || 0}</div>
            <div className="text-sm text-gray-600">Approved</div>
          </div>
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">{statusCounts.rejected || 0}</div>
            <div className="text-sm text-gray-600">Rejected</div>
          </div>
        </div>

        {/* Success Rate */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Success Rate</span>
            <span className="text-sm text-gray-600">{successRate.toFixed(1)}%</span>
          </div>
          <Progress value={successRate} className="h-2" />
          <div className="flex justify-between text-xs text-gray-600 mt-1">
            <span>${approvedAmount.toLocaleString()} approved</span>
            <span>${totalAmount.toLocaleString()} total</span>
          </div>
        </div>

        {/* Recent Grants */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm text-gray-700">Recent Applications</h4>
          {grantData?.slice(0, 5).map((grant, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                {getStatusIcon(grant?.status || "submitted")}
                <div>
                  <div className="font-medium text-sm">{grant?.title || "Unknown Grant"}</div>
                  <div className="text-xs text-gray-600">{grant?.funder || "Unknown Funder"}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-medium text-sm">${(grant?.amount || 0).toLocaleString()}</div>
                <Badge variant="secondary" className={getStatusColor(grant?.status || "submitted")}>
                  {(grant?.status || "submitted").replace("_", " ")}
                </Badge>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">${totalAmount.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Total Pipeline Value</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">${approvedAmount.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Approved Amount</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
