import { Shield, CheckCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"

interface VerifiedUserCardProps {
  name: string
  position?: string
  organization?: string
  profileImage?: string
  verificationDate?: string
  profileUrl?: string
  className?: string
}

export function VerifiedUserCard({
  name,
  position,
  organization,
  profileImage,
  verificationDate,
  profileUrl = "#",
  className,
}: VerifiedUserCardProps) {
  // Get initials for avatar fallback
  const getInitials = () => {
    if (!name) return "U"

    const parts = name.split(" ")
    if (parts?.length === 1) return parts[0].charAt(0).toUpperCase()

    return `${parts[0].charAt(0)}${parts[parts?.length - 1].charAt(0)}`.toUpperCase()
  }

  return (
    <Card className={`overflow-hidden hover:shadow-md transition-shadow ${className}`}>
      <Link href={profileUrl}>
        <CardHeader className="p-4 pb-0">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Avatar className="h-12 w-12 border border-gray-200">
                <AvatarImage src={profileImage || "/placeholder.svg"} alt={name} />
                <AvatarFallback className="bg-green-100 text-green-800">{getInitials()}</AvatarFallback>
              </Avatar>
              <div className="absolute -top-1 -right-1 bg-white rounded-full p-0.5 shadow-sm">
                <Shield className="h-4 w-4 text-green-600" />
              </div>
            </div>
            <div>
              <CardTitle className="text-base">{name}</CardTitle>
              {(position || organization) && (
                <CardDescription className="text-xs mt-0.5">
                  {position} {organization ? `at ${organization}` : ""}
                </CardDescription>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-3">
          <div className="flex items-center justify-between">
            <Badge className="bg-green-600 text-white text-xs">
              <CheckCircle className="h-3 w-3 mr-1" /> Verified
            </Badge>
            {verificationDate && <span className="text-xs text-gray-500">Since {verificationDate}</span>}
          </div>
        </CardContent>
      </Link>
    </Card>
  )
}
