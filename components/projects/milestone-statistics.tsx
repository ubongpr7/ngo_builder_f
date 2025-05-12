"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { useGetMilestoneStatisticsQuery } from "@/redux/features/projects/milestoneApiSlice"
import { Loader2, AlertTriangle, CheckCircle, Clock, AlertCircle, Flag } from "lucide-react"

interface MilestoneStatisticsProps {
  projectId: number
}

export function MilestoneStatistics({ projectId }: MilestoneStatisticsProps) {
  const { data: statistics, isLoading, error } = useGetMilestoneStatisticsQuery(projectId)

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-6">
        <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
        <span className="ml-2 text-gray-500">Loading statistics...</span>
      </div>
    )
  }

  if (error || !statistics) {
    return (
      <div className="flex justify-center items-center py-6 text-red-500">
        <AlertTriangle className="h-6 w-6 mr-2" />
        <span>Failed to load milestone statistics</span>
      </div>
    )
  }

  // Extract data from statistics
  const totalMilestones = statistics.total_milestones || 0
  const statusCounts = statistics.status_counts || []
  const priorityCounts = statistics.priority_counts || []
  const avgCompletion = statistics.avg_completion?.avg_completion || 0
  const overdueCount = statistics.overdue_count || 0
  const upcomingCount = statistics.upcoming_count || 0

  // Calculate percentages for status
  const getStatusPercentage = (status: string) => {
    const count = statusCounts.find((s) => s.status === status)?.count || 0
    return totalMilestones > 0 ? Math.round((count / totalMilestones) * 100) : 0
  }

  // Calculate percentages for priority
  const getPriorityPercentage = (priority: string) => {
    const count = priorityCounts.find((p) => p.priority === priority)?.count || 0
    return totalMilestones > 0 ? Math.round((count / totalMilestones) * 100) : 0
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Milestone Statistics</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="status">
          <TabsList className="mb-4">
            <TabsTrigger value="status">Status</TabsTrigger>
            <TabsTrigger value="priority">Priority</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
          </TabsList>

          <TabsContent value="status" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Overall Completion</span>
                  <span className="text-sm font-medium">{Math.round(avgCompletion)}%</span>
                </div>
                <Progress value={avgCompletion} className="h-2" />
              </div>

              <div>
                <div className="flex items-center mb-1">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  <span className="text-sm font-medium">Completed</span>
                  <span className="ml-auto text-sm">{getStatusPercentage("completed")}%</span>
                </div>
                <Progress value={getStatusPercentage("completed")} className="h-2 bg-gray-100" />
              </div>

              <div>
                <div className="flex items-center mb-1">
                  <Clock className="h-4 w-4 text-blue-500 mr-2" />
                  <span className="text-sm font-medium">In Progress</span>
                  <span className="ml-auto text-sm">{getStatusPercentage("in_progress")}%</span>
                </div>
                <Progress value={getStatusPercentage("in_progress")} className="h-2 bg-gray-100" />
              </div>

              <div>
                <div className="flex items-center mb-1">
                  <Flag className="h-4 w-4 text-gray-500 mr-2" />
                  <span className="text-sm font-medium">Pending</span>
                  <span className="ml-auto text-sm">{getStatusPercentage("pending")}%</span>
                </div>
                <Progress value={getStatusPercentage("pending")} className="h-2 bg-gray-100" />
              </div>

              <div>
                <div className="flex items-center mb-1">
                  <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
                  <span className="text-sm font-medium">Delayed</span>
                  <span className="ml-auto text-sm">{getStatusPercentage("delayed")}%</span>
                </div>
                <Progress value={getStatusPercentage("delayed")} className="h-2 bg-gray-100" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              {statusCounts.map((status) => (
                <Card key={status.status} className="p-3">
                  <div className="font-medium">{status.status.charAt(0).toUpperCase() + status.status.slice(1)}</div>
                  <div className="text-2xl font-bold">{status.count}</div>
                  <div className="text-sm text-gray-500">milestones</div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="priority" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex items-center mb-1">
                  <span className="text-sm font-medium text-red-600">Critical</span>
                  <span className="ml-auto text-sm">{getPriorityPercentage("critical")}%</span>
                </div>
                <Progress value={getPriorityPercentage("critical")} className="h-2 bg-gray-100" />
              </div>

              <div>
                <div className="flex items-center mb-1">
                  <span className="text-sm font-medium text-orange-500">High</span>
                  <span className="ml-auto text-sm">{getPriorityPercentage("high")}%</span>
                </div>
                <Progress value={getPriorityPercentage("high")} className="h-2 bg-gray-100" />
              </div>

              <div>
                <div className="flex items-center mb-1">
                  <span className="text-sm font-medium text-blue-500">Medium</span>
                  <span className="ml-auto text-sm">{getPriorityPercentage("medium")}%</span>
                </div>
                <Progress value={getPriorityPercentage("medium")} className="h-2 bg-gray-100" />
              </div>

              <div>
                <div className="flex items-center mb-1">
                  <span className="text-sm font-medium text-green-500">Low</span>
                  <span className="ml-auto text-sm">{getPriorityPercentage("low")}%</span>
                </div>
                <Progress value={getPriorityPercentage("low")} className="h-2 bg-gray-100" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              {priorityCounts.map((priority) => (
                <Card key={priority.priority} className="p-3">
                  <div className="font-medium">
                    {priority.priority.charAt(0).toUpperCase() + priority.priority.slice(1)}
                  </div>
                  <div className="text-2xl font-bold">{priority.count}</div>
                  <div className="text-sm text-gray-500">milestones</div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="timeline" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Card className="p-4">
                <div className="flex items-center">
                  <AlertCircle className="h-8 w-8 text-red-500 mr-3" />
                  <div>
                    <div className="text-2xl font-bold">{overdueCount}</div>
                    <div className="text-sm text-gray-500">Overdue Milestones</div>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center">
                  <Clock className="h-8 w-8 text-blue-500 mr-3" />
                  <div>
                    <div className="text-2xl font-bold">{upcomingCount}</div>
                    <div className="text-sm text-gray-500">Upcoming (30 days)</div>
                  </div>
                </div>
              </Card>

              <Card className="p-4 col-span-2">
                <div className="flex items-center">
                  <CheckCircle className="h-8 w-8 text-green-500 mr-3" />
                  <div>
                    <div className="text-2xl font-bold">{Math.round(avgCompletion)}%</div>
                    <div className="text-sm text-gray-500">Average Completion</div>
                  </div>
                </div>
                <Progress value={avgCompletion} className="h-2 mt-2" />
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
