"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText, Clock, CheckCircle, XCircle } from "lucide-react"
import { Progress } from "@/components/ui/progress"

interface GrantPipelineProps {
  data: any
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

  // Extract data from the response
  const summary = data?.summary || {};
  const pipelineStatus = data?.pipeline_status || [];
  const upcomingDeadlines = data?.upcoming_deadlines || [];

  const totalGrants = summary.total_grants || 0;
  const totalPipelineValue = summary.total_pipeline_value || 0;
  const activeGrants = summary.active_grants || 0;
  const successRate = summary.success_rate || 0;

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
            <div className="text-2xl font-bold text-blue-600">{totalGrants}</div>
            <div className="text-sm text-gray-600">Total Grants</div>
          </div>
          <div className="text-center p-3 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">{pipelineStatus.filter(g => g.status === "under_review").length}</div>
            <div className="text-sm text-gray-600">Under Review</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{pipelineStatus.filter(g => g.status === "approved").length}</div>
            <div className="text-sm text-gray-600">Approved</div>
          </div>
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">{pipelineStatus.filter(g => g.status === "rejected").length}</div>
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
            <span>${totalPipelineValue.toLocaleString()} total</span>
          </div>
        </div>

        {/* Upcoming Deadlines */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm text-gray-700">Upcoming Deadlines</h4>
          {upcomingDeadlines.map((deadline, index) => (
            <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-yellow-600" />
                <div>
                  <div className="font-medium text-sm">{deadline.grant_title || "Unknown Grant"}</div>
                  <div className="text-xs text-gray-600">{deadline.report_type || "Unknown Report"}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-medium text-sm">{new Date(deadline.due_date).toLocaleDateString()}</div>
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                  Due in {deadline.days_until_due} days
                </Badge>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">${totalPipelineValue.toLocaleString()}</div>
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
