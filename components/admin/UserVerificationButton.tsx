"use client"

import { Button, type ButtonProps } from "@/components/ui/button"
import { Eye } from "lucide-react"
import { UserProfileDialog } from "./UserProfileDialog"

interface UserVerificationButtonProps extends ButtonProps {
  userId: number
  userName?: string
  onVerificationChange?: () => void
}

export function UserVerificationButton({
  userId,
  userName,
  onVerificationChange,
  ...props
}: UserVerificationButtonProps) {
  return (
    <UserProfileDialog
      userId={userId}
      onVerificationChange={onVerificationChange}
      trigger={
        <Button variant="outline" size="sm" {...props}>
          <Eye className="h-4 w-4 mr-1" /> {userName ? `View ${userName}` : "View"}
        </Button>
      }
    />
  )
}
