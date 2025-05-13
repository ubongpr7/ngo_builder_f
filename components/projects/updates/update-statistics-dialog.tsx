"use client"

import { BarChart, PieChart, LineChart, Calendar } from "lucide-react"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

import type { UpdateStatistics } from "@/types/project"

interface UpdateStatisticsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  statistics?: UpdateStatistics
  isLoading: boolean
}

export function UpdateStatisticsDialog({ open, onOpenChange, statistics, isLoading }: UpdateStatisticsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Update Statistics</DialogTitle>
          <DialogDescription>View statistics and analytics for project updates.</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="summary" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="summary">
              <BarChart className="mr-2 h-4 w-4" />
              Summary
            </TabsTrigger>
            <TabsTrigger value="types">
              <PieChart className="mr-2 h-4 w-4" />
              By Type
            </TabsTrigger>
            <TabsTrigger value="timeline">
              <LineChart className="mr-2 h-4 w-4" />
              Timeline
            </TabsTrigger>
            <TabsTrigger value="calendar">
              <Calendar className="mr-2 h-4 w-4" />
              Calendar
            </TabsTrigger>
          </TabsList>

          <TabsContent value="summary" className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <StatCard
                title="Total Updates"
                value={statistics?.total_updates}
                description="Total number of updates"
                isLoading={isLoading}
              />
              <StatCard
                title="Updates This Month"
                value={statistics?.updates_this_month}
                description="Updates created in the current month"
                isLoading={isLoading}
              />
              <StatCard
                title="Media Files"
                value={statistics?.total_media}
                description="Total media files attached"
                isLoading={isLoading}
              />
              <StatCard
                title="Contributors"
                value={statistics?.unique_contributors}
                description="Unique team members who created updates"
                isLoading={isLoading}
              />
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Update activity over the last 30 days</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-[200px] w-full" />
                ) : (
                  <div className="h-[200px] w-full flex items-center justify-center">
                    <p className="text-muted-foreground">Activity chart will be displayed here</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="types" className="space-y-4 pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Updates by Type</CardTitle>
                <CardDescription>Distribution of updates across different types</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-[300px] w-full" />
                ) : (
                  <div className="h-[300px] w-full">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center justify-center">
                        <p className="text-muted-foreground">Pie chart will be displayed here</p>
                      </div>
                      <div className="space-y-4">
                        <TypeStat
                          type="Progress"
                          value={statistics?.updates_by_type?.progress || 0}
                          total={statistics?.total_updates || 1}
                          color="bg-blue-500"
                        />
                        <TypeStat
                          type="Milestone"
                          value={statistics?.updates_by_type?.milestone || 0}
                          total={statistics?.total_updates || 1}
                          color="bg-green-500"
                        />
                        <TypeStat
                          type="Issue"
                          value={statistics?.updates_by_type?.issue || 0}
                          total={statistics?.total_updates || 1}
                          color="bg-red-500"
                        />
                        <TypeStat
                          type="Change"
                          value={statistics?.updates_by_type?.change || 0}
                          total={statistics?.total_updates || 1}
                          color="bg-yellow-500"
                        />
                        <TypeStat
                          type="Other"
                          value={statistics?.updates_by_type?.other || 0}
                          total={statistics?.total_updates || 1}
                          color="bg-gray-500"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="timeline" className="space-y-4 pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Update Timeline</CardTitle>
                <CardDescription>Updates over time</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-[300px] w-full" />
                ) : (
                  <div className="h-[300px] w-full flex items-center justify-center">
                    <p className="text-muted-foreground">Timeline chart will be displayed here</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="calendar" className="space-y-4 pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Update Calendar</CardTitle>
                <CardDescription>Calendar view of updates</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-[300px] w-full" />
                ) : (
                  <div className="h-[300px] w-full flex items-center justify-center">
                    <p className="text-muted-foreground">Calendar view will be displayed here</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

// Stat card component
function StatCard({
  title,
  value,
  description,
  isLoading,
}: {
  title: string
  value?: number
  description: string
  isLoading: boolean
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-8 w-20" />
        ) : (
          <>
            <div className="text-2xl font-bold">{value || 0}</div>
            <p className="text-xs text-muted-foreground">{description}</p>
          </>
        )}
      </CardContent>
    </Card>
  )
}

// Type stat component
function TypeStat({
  type,
  value,
  total,
  color,
}: {
  type: string
  value: number
  total: number
  color: string
}) {
  const percentage = Math.round((value / total) * 100)

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span>{type}</span>
        <span className="font-medium">
          {value} ({percentage}%)
        </span>
      </div>
      <div className="h-2 w-full rounded-full bg-muted">
        <div className={`h-2 rounded-full ${color}`} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  )
}
