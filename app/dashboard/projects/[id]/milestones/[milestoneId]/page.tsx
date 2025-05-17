"use client"

import { useParams } from "next/navigation"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { MilestoneDetail } from "@/components/projects/milestones/milestone-details"
import { usePermissions } from "@/components/permissionHander"
import { useGetLoggedInProfileRolesQuery } from "@/redux/features/profile/readProfileAPISlice"
import { useGetProjectByIdQuery } from "@/redux/features/projects/projectsAPISlice"


export default function MilestoneDetailPage() {
  const params = useParams()
  const projectId = Number(params.id)
  const milestoneId = Number(params.milestoneId)
  const { data: userRoles } = useGetLoggedInProfileRolesQuery()
  const { data: project } = useGetProjectByIdQuery(projectId)
  const isManager = usePermissions(userRoles, {
    requiredRoles: ["is_ceo"],
    requireKYC: true,
    customCheck: (user) => user.user_id === project?.manager_details?.id,
  })
  const is_DB_admin = usePermissions(userRoles, { requiredRoles: ["is_DB_admin"], requireKYC: true })
  const isTeamMember = usePermissions(userRoles, {
    requiredRoles: [],
    requireKYC: true,
  })

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Breadcrumbs */}
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard/projects">Projects</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href={`/dashboard/projects/${projectId}}`}>{project?.title.slice(0, 20)}</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink>Milestone/BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <MilestoneDetail milestoneId={milestoneId} isManager={isManager} is_DB_admin={is_DB_admin} isTeamMember={isTeamMember} />
    </div>
  )
}
