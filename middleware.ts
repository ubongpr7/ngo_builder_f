// middleware.ts
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname
  const accessToken = request.cookies.get("accessToken")?.value || ""
  const userId = request.cookies.get("userID")?.value || ""

  // Public paths that don't require authentication
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
  ]

  // Auth pages that should redirect to dashboard for logged-in users
  const authPages = [
    "/membership/portal",
    "/membership/register"
  ]

  // Paths accessible even with valid token
  const allowedWithTokenPaths = [
    "/activate",
    "/accounts/verify",
    "/logout",
    "/api/auth",
  ]

  // Check path types
  const isPublicPath = publicPaths.some(publicPath => 
    path === publicPath || path.startsWith(`${publicPath}/`)
  )

  const isAuthPage = authPages.some(authPage => 
    path === authPage || path.startsWith(`${authPage}/`)
  )

  const isAllowedWithToken = allowedWithTokenPaths.some(allowedPath =>
    path.startsWith(allowedPath)
  )

  // Handle activation paths
  const isActivationPath = path.startsWith("/activate")
  const isDirectActivationLink = path.match(/^\/activate\/[^\/]+\/[^\/]+$/)

  // Special case: Direct activation links (from email)
  if (isDirectActivationLink) {
    // Allow access without any cookies
    if (!accessToken && !userId) return NextResponse.next()
    
    // If logged in but accessing activation link, allow completion
    if (accessToken) return NextResponse.next()
  }

  // Special case: Verification status page
  if (path.startsWith("/accounts/verify")) {
    if (!userId) {
      return NextResponse.redirect(new URL("/membership/portal", request.url))
    }
    return NextResponse.next()
  }

  // Redirect logged-in users from auth pages (login/register) to dashboard
  if (isAuthPage && accessToken) {
    return NextResponse.redirect(new URL("/membership/dashboard", request.url))
  }

  // Protect private paths from unauthenticated users
  if (!isPublicPath && !accessToken && !isAllowedWithToken) {
    return NextResponse.redirect(new URL("/membership/portal", request.url))
  }

  // Final check for activation paths
  if (isActivationPath && !isDirectActivationLink && !userId) {
    return NextResponse.redirect(new URL("/membership/portal", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|images|assets|.*\\.png$|.*\\.jpg$|.*\\.svg$).*)",
  ],
}