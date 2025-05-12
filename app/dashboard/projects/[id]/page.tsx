import type { Metadata } from "next"
import ProjectManagement from "@/components/projects/ProjectManagement"

export const metadata: Metadata = {
  title: "Project Management | Destiny Builders",
  description: "Manage and track organizational projects",
}

export default function ProjectsPage() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="flex-1 p-8">
        <ProjectManagement />
      </div>
    </div>
  )
}
