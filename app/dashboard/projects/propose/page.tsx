"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { SubmitProjectProposalForm } from "@/components/projects/submit-project-proposal-form"
import { useGetLoggedInProfileRolesQuery } from "@/redux/features/profile/readProfileAPISlice"
import { usePermissions } from "@/components/permissionHander"
import { Loader2 } from "lucide-react"

export default function ProposeProjectPage() {
  const router = useRouter()
  const { data: userRoles, isLoading: isLoadingRoles } = useGetLoggedInProfileRolesQuery()

  const userId = userRoles?.user_id || ""

  const isCeo = usePermissions(userRoles, { requiredRoles: ["is_ceo"], requireKYC: true })

  // Redirect non-CEO users
  useEffect(() => {
    if (!isLoadingRoles && !isCeo) {
      router.push("/dashboard/projects")
    }
  }, [isCeo, isLoadingRoles, router])

  if (isLoadingRoles) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        <span className="ml-2 text-gray-500">Loading...</span>
      </div>
    )
  }

  if (!isCeo) {
    return null // Will redirect in useEffect
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Propose New Project</h1>
      <SubmitProjectProposalForm userId={userId} onSuccess={() => router.push("/dashboard/projects")} />
    </div>
  )
}
