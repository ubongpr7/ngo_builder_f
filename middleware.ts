// middleware.ts
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import env from "./env_file"

// Role-based route permissions
const rolePermissions: Record<string, string[]> = {
  admin: ["/admin", "/admin/kyc-verification", ],
  executive: ["/executive-dashboard", "/projects/approvals","/admin", "/admin/kyc-verification", ],
  donor: ["/donations", "/impact-reports"],
  partner: ["/partnership", "/joint-projects"],
  volunteer: ["/volunteer"],
  staff: ["/staff-dashboard", "/inventory"]
}

// KYC-protected routes
const kycProtectedPaths = [
  "/donate",
  "/volunteer",
  "/projects",
  "/membership/benefits",
  ...Object.values(rolePermissions).flat()
]

// Public paths
const publicPaths = [
  "/",
  "/activate",
  "/accounts/verify",
  "/membership/portal",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
  "/about",
  "/vision-mission",
  "/core-values",
  "/history",
  "/leadership",
  "/resources",
  "/resources/publications",
  "/resources/reports",
  "/resources/media",
  "/blog",
  "/blog/category",
  "/faqs",
  "/contact",
  "/donate",
  "/privacy-policy",
  "/terms-of-service",
  "/membership/benefits",
  "/membership/join",
  "/membership/tiers",
  "/membership/volunteer",
  "/membership/partner",
  "/kyc",
  "/admin/member-verification",
  "/membership/verification",
  "/unauthorized"
]

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname
  const accessToken = request.cookies.get("accessToken")?.value || ""
  const userId = request.cookies.get("userID")?.value || ""

  // Check if current path is public
  const isPublicPath = publicPaths.some(publicPath => 
    path === publicPath || path.startsWith(`${publicPath}/`)
  )

  // Redirect authenticated users from auth pages
  if (["/membership/portal", "/membership/register"].some(authPath => 
    path.startsWith(authPath)) && accessToken
  ) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  // Allow public paths and API routes
  if (isPublicPath || path.startsWith("/api")) {
    return NextResponse.next()
  }

  // Fetch user data for protected routes
  let userData = null
  try {
    const response = await fetch(`${env.BACKEND_HOST_URL}/profile_api/users/me/`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      }
    })

    if (!response.ok) throw new Error("Unauthorized")
    userData = await response.json()
  } catch (error) {
    // Clear invalid credentials and redirect
    const response = NextResponse.redirect(new URL("/membership/portal", request.url))
    response.cookies.delete("accessToken")
    response.cookies.delete("userID")
    return response
  }

  // Extract KYC status and roles
  const profileData = userData.profile_data
  const kycStatus = profileData?.kyc_status
  const isKycVerified = profileData?.is_kyc_verified
  const userRoles = {
    isAdmin: profileData?.is_DB_admin,
    isExecutive: profileData?.is_DB_executive,
    isDonor: profileData?.is_donor,
    isPartner: profileData?.is_partner,
    isVolunteer: profileData?.is_volunteer,
    isStaff: profileData?.is_DB_staff
  }

  // KYC Verification Check
  if (kycProtectedPaths.some(p => path.startsWith(p))) {
    if (!isKycVerified || kycStatus !== "approved") {
      return NextResponse.redirect(
        new URL(`/profile/update`, request.url)
        // new URL(`/profile/update?error=kyc_required&next=${encodeURIComponent(path)}`, request.url)
      )
    }
  }

  // Role-Based Access Control
  const requiredRole = Object.entries(rolePermissions).find(([_, paths]) => 
    paths.some(p => path.startsWith(p))
  )?.[0]

  if (requiredRole) {
    const roleKey = `is${requiredRole.charAt(0).toUpperCase()}${requiredRole.slice(1)}`
    if (!userRoles[roleKey as keyof typeof userRoles]) {
      return NextResponse.redirect(new URL("/unauthorized", request.url))
    }
  }

  // Specific role area protection
  if (path.startsWith("/admin") && !userRoles.isAdmin) {
    return NextResponse.redirect(new URL("/unauthorized", request.url))
  }

  if (path.startsWith("/executive") && !userRoles.isExecutive) {
    return NextResponse.redirect(new URL("/unauthorized", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|images|assets|.*\\.png$|.*\\.jpg$|.*\\.svg$).*)"],
}