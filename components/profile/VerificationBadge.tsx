import { CheckCircle, ShieldAlert, ShieldCheck, Clock } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

interface VerificationBadgeProps {
  isVerified: boolean
  verificationStatus?: string
  verificationDate?: string
  className?: string
  size?: "sm" | "md" | "lg"
  showTooltip?: boolean
}

export function VerificationBadge({
  isVerified,
  verificationStatus = "pending",
  verificationDate,
  className,
  size = "md",
  showTooltip = true,
}: VerificationBadgeProps) {
  // Size mappings
  const sizeClasses = {
    sm: "text-xs px-1.5 py-0.5",
    md: "text-xs px-2 py-0.5",
    lg: "text-sm px-2.5 py-1",
  }

  const iconSizes = {
    sm: "h-2.5 w-2.5 mr-0.5",
    md: "h-3 w-3 mr-1",
    lg: "h-4 w-4 mr-1.5",
  }

  // If verified, show the verified badge
  if (isVerified) {
    const badge = (
      <Badge className={cn("bg-green-600 text-white font-medium hover:bg-green-700", sizeClasses[size], className)}>
        <ShieldCheck className={iconSizes[size]} />
        Verified {verificationDate ? `on ${verificationDate}` : ""}
      </Badge>
    )

    if (showTooltip) {
      return (
        <div className="bg-gray-50 -z-30"
        <TooltipProvider>
          <Tooltip >
            <TooltipTrigger asChild>{badge}</TooltipTrigger>
            <TooltipContent>
              <p>This user's identity has been verified</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        </div>
      )
    }

    return badge
  }

  // If not verified, show status-based badge
  let badgeContent
  let tooltipContent
  let badgeStyle

  switch (verificationStatus?.toLowerCase()) {
    case "pending":
      badgeContent = (
        <>
          <Clock className={iconSizes[size]} />
          Verification Pending
        </>
      )
      tooltipContent = "Identity verification is in progress"
      badgeStyle = "bg-yellow-500 text-white hover:bg-yellow-600"
      break
    case "rejected":
      badgeContent = (
        <>
          <ShieldAlert className={iconSizes[size]} />
          Verification Failed
        </>
      )
      tooltipContent = "Identity verification was unsuccessful"
      badgeStyle = "bg-red-500 text-white hover:bg-red-600"
      break
    default:
      badgeContent = (
        <>
          <CheckCircle className={iconSizes[size]} />
          Unverified
        </>
      )
      tooltipContent = "This user has not completed identity verification"
      badgeStyle = "bg-gray-400 text-white hover:bg-gray-500"
  }

  const badge = <Badge className={cn(badgeStyle, sizeClasses[size], className)}>{badgeContent}</Badge>

  if (showTooltip) {
    return (
        <div className="bg-gray-50 -z-30"
      <TooltipProvider>
        <Tooltip className="bg-gray-50 -z-30">
          <TooltipTrigger asChild>{badge}</TooltipTrigger>
          <TooltipContent>
            <p>{tooltipContent}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
        </div>
    )
  }

  return badge
}
