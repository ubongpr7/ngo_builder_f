"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar, Users, Clock, DollarSign, CheckCircle } from "lucide-react"
import type { Project } from "@/types/project"

interface ProjectOverviewProps {
  project: Project
}

export function ProjectOverview({ project }: ProjectOverviewProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Column - Project Details */}
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Project Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 whitespace-pre-line">{project.description}</p>
          </CardContent>
        </Card>

        {project.beneficiaries && (
          <Card>
            <CardHeader>
              <CardTitle>Beneficiaries</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 whitespace-pre-line">{project.beneficiaries}</p>
            </CardContent>
          </Card>
        )}

        {project.success_criteria && (
          <Card>
            <CardHeader>
              <CardTitle>Success Criteria</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 whitespace-pre-line">{project.success_criteria}</p>
            </CardContent>
          </Card>
        )}

        {project.risks && (
          <Card>
            <CardHeader>
              <CardTitle>Risks & Mitigation</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 whitespace-pre-line">{project.risks}</p>
            </CardContent>
          </Card>
        )}

        {project.notes && (
          <Card>
            <CardHeader>
              <CardTitle>Additional Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 whitespace-pre-line">{project.notes}</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Right Column - Key Information */}
      <div className="space-y-6">
        {/* Project Manager */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Project Manager</CardTitle>
          </CardHeader>
          <CardContent>
            {project.manager_details ? (
              <div className="flex items-center space-x-3">
                <Avatar>
                  <AvatarImage
                    src={`/abstract-geometric-shapes.png?height=40&width=40&query=${encodeURIComponent(project.manager_details.username)}`}
                  />
                  <AvatarFallback>
                    {project.manager_details.first_name?.[0]}
                    {project.manager_details.last_name?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">
                    {project.manager_details.first_name} {project.manager_details.last_name}
                  </div>
                  <div className="text-sm text-gray-500">{project.manager_details.email}</div>
                </div>
              </div>
            ) : (
              <div className="text-gray-500 italic">No manager assigned</div>
            )}
          </CardContent>
        </Card>

        {/* Key Dates */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Key Dates</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <div className="flex items-center text-sm">
                <Calendar className="mr-2 h-4 w-4 text-gray-500" />
                <span>Start Date</span>
              </div>
              <span className="font-medium">{new Date(project.start_date).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <div className="flex items-center text-sm">
                <Calendar className="mr-2 h-4 w-4 text-gray-500" />
                <span>Target End Date</span>
              </div>
              <span className="font-medium">{new Date(project.target_end_date).toLocaleDateString()}</span>
            </div>
            {project.actual_end_date && (
              <div className="flex justify-between">
                <div className="flex items-center text-sm">
                  <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                  <span>Actual End Date</span>
                </div>
                <span className="font-medium">{new Date(project.actual_end_date).toLocaleDateString()}</span>
              </div>
            )}
            <div className="flex justify-between">
              <div className="flex items-center text-sm">
                <Clock className="mr-2 h-4 w-4 text-gray-500" />
                <span>Created</span>
              </div>
              <span className="font-medium">{new Date(project.created_at).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <div className="flex items-center text-sm">
                <Clock className="mr-2 h-4 w-4 text-gray-500" />
                <span>Last Updated</span>
              </div>
              <span className="font-medium">{new Date(project.updated_at).toLocaleDateString()}</span>
            </div>
          </CardContent>
        </Card>

        {/* Financial Summary */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Financial Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <div className="flex items-center text-sm">
                <DollarSign className="mr-2 h-4 w-4 text-gray-500" />
                <span>Total Budget</span>
              </div>
              <span className="font-medium">${project.budget.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <div className="flex items-center text-sm">
                <DollarSign className="mr-2 h-4 w-4 text-gray-500" />
                <span>Funds Allocated</span>
              </div>
              <span className="font-medium">${project.funds_allocated.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <div className="flex items-center text-sm">
                <DollarSign className="mr-2 h-4 w-4 text-gray-500" />
                <span>Funds Spent</span>
              </div>
              <span className={`font-medium ${project.funds_spent > project.budget ? "text-red-500" : ""}`}>
                ${project.funds_spent.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <div className="flex items-center text-sm">
                <DollarSign className="mr-2 h-4 w-4 text-gray-500" />
                <span>Remaining Budget</span>
              </div>
              <span
                className={`font-medium ${(project.budget - project.funds_spent) < 0 ? "text-red-500" : "text-green-500"}`}
              >
                ${(project.budget - project.funds_spent).toLocaleString()}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Team Summary */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Team Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <div className="flex items-center text-sm">
                  <Users className="mr-2 h-4 w-4 text-gray-500" />
                  <span>Team Members</span>
                </div>
                <span className="font-medium">{project.team_members?.length || 0}</span>
              </div>

              
              {project.team_member_details && project.team_member_details.length > 0 && (
                <div className="pt-2">
                  <div className="text-sm font-medium mb-2">Key Officials</div>
                  <div className="flex flex-wrap gap-2">
                    {project.team_member_details.slice(0, 3).map((member) => (
                      <div key={member.id} className="flex items-center space-x-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage
                            src={`${member.profile_image}`}
                          />
                          <AvatarFallback className="text-xs">
                            {member.first_name?.[0]}
                            {member.last_name?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm">
                          {member.first_name} {member.last_name}
                        </span>
                      </div>
                    ))}
                    {project.team_member_details.length > 3 && (
                      <div className="text-sm text-gray-500">+{project.team_member_details.length - 3} more</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <div className="flex items-center text-sm">
                  <Users className="mr-2 h-4 w-4 text-gray-500" />
                  <span>DBEF Officials</span>
                </div>
                <span className="font-medium">{project.officials_details?.length || 0}</span>
              </div>

              
              {project.officials_details && project.officials_details.length > 0 && (
                <div className="pt-2">
                  <div className="text-sm font-medium mb-2">Key Officials</div>
                  <div className="flex flex-wrap gap-2">
                    {project.officials_details.slice(0, 3).map((official) => (
                      <div key={official.id} className="flex items-center space-x-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage
                            src={`${official.profile_image}`}
                          />
                          <AvatarFallback className="text-xs">
                            {official.first_name?.[0]}
                            {official.last_name?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm">
                          {official.first_name} {official.last_name}
                        </span>
                      </div>
                    ))}
                    {project.officials_details.length > 3 && (
                      <div className="text-sm text-gray-500">+{project.officials_details.length - 3} more</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
