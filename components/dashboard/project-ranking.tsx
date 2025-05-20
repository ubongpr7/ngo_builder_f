"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { rankProjectsByMilestones } from "@/utils/chart-helpers"
import type { Project } from "@/types/project"
import Link from "next/link"

interface ProjectRankingProps {
  projects: Project[]
  isLoading?: boolean
  onRefresh?: () => void
}

export function ProjectRanking({ projects, isLoading = false, onRefresh }: ProjectRankingProps) {
  const rankedProjects = rankProjectsByMilestones(projects)

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-base font-medium">Top Performing Projects</CardTitle>
          <CardDescription>Ranked by milestone completion</CardDescription>
        </div>
        {onRefresh && (
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onRefresh} title="Refresh data">
            <RefreshCw className="h-4 w-4" />
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5]?.map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-2 w-full" />
              </div>
            ))}
          </div>
        ) : rankedProjects?.length > 0 ? (
          <div className="space-y-5">
            {rankedProjects?.map((project) => {
              const completionPercentage = project.milestones_count
                ? (project?.milestones_completed_count||0 / project.milestones_count) * 100
                : 0

              return (
                <div key={project.id} className="space-y-1">
                  <Link href={`/dashboard/projects/${project.id}`} className="hover:underline">
                    <h3 className="font-medium text-sm">{project.title}</h3>
                  </Link>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>
                      {project.milestones_completed_count} of {project.milestones_count} milestones
                    </span>
                    <span>{completionPercentage.toFixed(0)}%</span>
                  </div>
                  <Progress value={completionPercentage} className="h-1.5" />
                </div>
              )
            })}
          </div>
        ) : (
          <div className="py-8 text-center text-sm text-gray-500">
            <p>No projects with milestones found</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
