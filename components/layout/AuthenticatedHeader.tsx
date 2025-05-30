"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useLogoutMutation } from "@/redux/features/authApiSlice"
import Image from "next/image"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu"
import {
  ChevronDown,
  LogOut,
  Menu,
  Settings,
  User,
  X,
  BarChart3,
  DollarSign,
  ShieldCheck,
  Handshake,
  Heart,
  UserCog,
  AlertTriangle,
  CheckCircle2,
  Clock,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { toast } from "react-toastify"
import { useRouter } from "next/navigation"
import { logout } from "@/redux/features/authSlice"
import { useAppDispatch } from "@/redux/store"
import { useGetUserLoggedInProfileDetailsQuery } from "@/redux/features/profile/readProfileAPISlice"
import { NotificationBell } from "@/components/notifications/notification-bell"

export default function AuthenticatedHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const dispatch = useAppDispatch()
  const [logoutM, { isLoading }] = useLogoutMutation()
  const router = useRouter()

  const { data: userData, isLoading: isUserLoading } = useGetUserLoggedInProfileDetailsQuery("")

  const userFullName =
    userData?.first_name && userData?.last_name
      ? `${userData.first_name} ${userData.last_name}`
      : userData?.email?.split("@")[0] || "My Account"

  const userEmail = userData?.email || ""
  const profileImage = userData?.profile_data?.profile_image || ""

  const userRoles = {
    isKycVerified: userData?.profile_data?.kyc_status === "approved" || false,
    isExecutive: userData?.profile_data?.is_executive || false,
    isCeo: userData?.profile_data?.is_ceo || false,
    isProjectManager: userData?.profile_data?.is_project_manager || false,
    isDonor: userData?.profile_data?.is_donor || false,
    isVolunteer: userData?.profile_data?.is_volunteer || false,
    isPartner: userData?.profile_data?.is_partner || false,
    isDBStaff: userData?.profile_data?.is_DB_staff || false,
    isStandardMember: userData?.profile_data?.is_standard_member || false,
    isDBExecutive: userData?.profile_data?.is_DB_executive || false,
    isDBAdmin: userData?.profile_data?.is_DB_admin || false,
    kycStatus: userData?.profile_data?.kyc_status || "pending",
  }

  const getInitials = () => {
    if (userData?.first_name && userData?.last_name) {
      return `${userData.first_name[0]}${userData.last_name[0]}`.toUpperCase()
    }
    return userEmail ? userEmail[0].toUpperCase() : "U"
  }

  const getKycStatusBadge = () => {
    const status = userData?.profile_data?.kyc_status || "pending"
    switch (status) {
      case "approved":
        return (
          <Badge className="ml-2 bg-green-500 hover:bg-green-600">
            <CheckCircle2 className="h-3 w-3 mr-1" /> Verified
          </Badge>
        )
      case "pending":
        return (
          <Badge className="ml-2 bg-yellow-500 hover:bg-yellow-600">
            <Clock className="h-3 w-3 mr-1" /> Pending
          </Badge>
        )
      case "rejected":
        return (
          <Badge className="ml-2 bg-red-500 hover:bg-red-600">
            <AlertTriangle className="h-3 w-3 mr-1" /> Rejected
          </Badge>
        )
      case "flagged":
        return (
          <Badge className="ml-2 bg-orange-500 hover:bg-orange-600">
            <AlertTriangle className="h-3 w-3 mr-1" /> Flagged
          </Badge>
        )
      case "scammer":
        return (
          <Badge className="ml-2 bg-red-700 hover:bg-red-800">
            <AlertTriangle className="h-3 w-3 mr-1" /> Scammer
          </Badge>
        )
      default:
        return null
    }
  }

  const shouldShowRoleFeatures = () => {
    return userRoles.kycStatus === "approved" && userRoles.isKycVerified
  }

  const getDynamicNavigation = () => {
    const baseNavigation = [{ name: "Dashboard", href: "/dashboard", icon: <BarChart3 className="h-4 w-4 mr-2" /> }]

    if (shouldShowRoleFeatures()) {
      if (userRoles.isDBAdmin || userRoles.isDBExecutive) {
        baseNavigation.push({
          name: "KYC Verification",
          href: "/admin/kyc-verification",
          icon: <UserCog className="h-4 w-4 mr-2" />,
        })
      }

      if (userRoles.isDonor) {
        baseNavigation.push({
          name: "My Donations",
          href: "/membership/donations",
          icon: <DollarSign className="h-4 w-4 mr-2" />,
        })
      }

      if (userRoles.isPartner) {
        baseNavigation.push({
          name: "Partnership",
          href: "/membership/partnership",
          icon: <Handshake className="h-4 w-4 mr-2" />,
        })
      }

      if (userRoles.isVolunteer) {
        baseNavigation.push({
          name: "Volunteer",
          href: "/membership/volunteer",
          icon: <Heart className="h-4 w-4 mr-2" />,
        })
      }
    }

    // Add notifications to navigation
    baseNavigation.push({
      name: "Notifications",
      href: "/notifications",
      icon: <BarChart3 className="h-4 w-4 mr-2" />,
    })

    return baseNavigation
  }

  const getRoleDisplayText = () => {
    if (!shouldShowRoleFeatures()) {
      return "Member"
    }
    return userRoles.isDBAdmin
      ? "Admin"
      : userRoles.isDBExecutive
        ? "Executive"
        : userRoles.isDBStaff
          ? "Staff"
          : userRoles.isPartner
            ? "Partner"
            : userRoles.isDonor
              ? "Donor"
              : userRoles.isVolunteer
                ? "Volunteer"
                : "Member"
  }

  const navigation = getDynamicNavigation()

  const handleLogout = async () => {
    try {
      dispatch(logout())
      toast.success("Logged out successfully")
      window.location.href = "/"
    } catch (error) {
      dispatch(logout())
      window.location.href = "/"
      toast.error("Logout failed. Please try again.")
    }
  }

  return (
    <header className="bg-white shadow-sm border border-b-grey-400">
      <nav className="mx-auto flex max-w-7xl items-center justify-between p-3 sm:p-4 lg:px-8" aria-label="Global">
        {/* Logo and mobile menu button */}
        <div className="flex lg:flex-1">
          <Link href="/" className="-m-1.5 p-1.5 flex items-center">
            <Image src="/logo.jpg" alt="Destiny Builders Logo" width={56} height={56} className="h-10 w-auto" />
            <span className="text-2xl font-bold text-green-700 ml-3 tracking-tight">destinybuilders</span>
          </Link>
        </div>

        {/* Mobile notification bell and menu button */}
        <div className="flex items-center gap-2 lg:hidden">
          {/* Mobile notification bell - positioned next to menu button */}
          <div className="flex items-center">
            <NotificationBell />
          </div>

          <button
            type="button"
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-green-700"
            onClick={() => setMobileMenuOpen(true)}
          >
            <span className="sr-only">Open main menu</span>
            <Menu className="h-8 w-8" aria-hidden="true" />
          </button>
        </div>

        {/* Desktop navigation */}
        <div className="hidden lg:flex lg:gap-x-8">
          {navigation.slice(0, 4)?.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`text-sm font-medium flex items-center ${
                pathname === item.href
                  ? "text-green-700 border-b-2 border-green-700"
                  : "text-gray-700 hover:text-green-700"
              }`}
            >
              {item.icon}
              {item.name}
            </Link>
          ))}
          {navigation?.length > 4 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="text-sm font-medium flex items-center text-gray-700 hover:text-green-700">
                  More <ChevronDown className="h-4 w-4 ml-1" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {navigation.slice(4)?.map((item) => (
                  <DropdownMenuItem key={item.name} asChild>
                    <Link href={item.href} className="flex items-center">
                      {item.icon}
                      {item.name}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Right section */}
        <div className="hidden lg:flex lg:flex-1 lg:justify-end lg:gap-x-4">
          {/* Notification Bell - Standalone for desktop */}
          <NotificationBell />

          {/* User dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 p-2 rounded-md text-gray-700 hover:text-green-700">
                <Avatar className="h-8 w-8">
                  {profileImage ? (
                    <AvatarImage src={profileImage || "/placeholder.svg"} alt={userFullName} />
                  ) : (
                    <AvatarFallback>{getInitials()}</AvatarFallback>
                  )}
                </Avatar>
                <div className="hidden md:flex md:flex-col md:items-start">
                  <span className="max-w-[150px] truncate text-sm font-medium">{userFullName}</span>
                  <div className="flex items-center">
                    <span className="text-xs text-gray-500">{getRoleDisplayText()}</span>
                    {getKycStatusBadge()}
                  </div>
                </div>
                <ChevronDown className="h-4 w-4 hidden md:block" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{userFullName}</p>
                  <p className="text-xs leading-none text-gray-500 truncate">{userEmail}</p>
                  <div className="flex items-center mt-1">{getKycStatusBadge()}</div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />

              <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="flex items-center gap-2 cursor-pointer">
                    <User className="h-4 w-4" />
                    <span>My Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/profile/update" className="flex items-center gap-2 cursor-pointer">
                    <Settings className="h-4 w-4" />
                    <span>Update Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings/notifications" className="flex items-center gap-2 cursor-pointer">
                    <Settings className="h-4 w-4" />
                    <span>Notification Settings</span>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />

              {shouldShowRoleFeatures() ? (
                <>
                  {userRoles.isDBAdmin && (
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger className="flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4" />
                        <span>Admin</span>
                      </DropdownMenuSubTrigger>
                      <DropdownMenuPortal>
                        <DropdownMenuSubContent>
                          <DropdownMenuItem asChild>
                            <Link href="/admin/kyc-verification">KYC Verification</Link>
                          </DropdownMenuItem>
                        </DropdownMenuSubContent>
                      </DropdownMenuPortal>
                    </DropdownMenuSub>
                  )}

                  {userRoles.isDonor && (
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        <span>Donations</span>
                      </DropdownMenuSubTrigger>
                      <DropdownMenuPortal>
                        <DropdownMenuSubContent>
                          <DropdownMenuItem asChild>
                            <Link href="/donations/history">Donation History</Link>
                          </DropdownMenuItem>
                        </DropdownMenuSubContent>
                      </DropdownMenuPortal>
                    </DropdownMenuSub>
                  )}

                  {userRoles.isVolunteer && (
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger className="flex items-center gap-2">
                        <Heart className="h-4 w-4" />
                        <span>Volunteer</span>
                      </DropdownMenuSubTrigger>
                      <DropdownMenuPortal>
                        <DropdownMenuSubContent>
                          <DropdownMenuItem asChild>
                            <Link href="/volunteer/opportunities">Opportunities</Link>
                          </DropdownMenuItem>
                        </DropdownMenuSubContent>
                      </DropdownMenuPortal>
                    </DropdownMenuSub>
                  )}
                </>
              ) : (
                <DropdownMenuItem className="text-xs text-yellow-600 bg-yellow-50 cursor-default">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  <span>Complete KYC to access special features</span>
                </DropdownMenuItem>
              )}

              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="flex items-center gap-2 cursor-pointer text-red-600 hover:text-red-700"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden">
            <div className="fixed inset-0 z-[9999] bg-black/50" />
            <div className="fixed top-0 right-0 z-[10000] w-full sm:max-w-sm h-screen overflow-y-auto bg-white px-4 py-4">
              {/* Mobile menu header */}
              <div className="flex items-center justify-between">
                <Link href="/" className="-m-1.5 p-1.5 flex items-center">
                  <Image src="/logo.jpg" alt="Logo" width={56} height={56} className="h-10 w-auto" />
                  <span className="text-2xl font-bold text-green-700 ml-3">destinybuilders</span>
                </Link>
                <button
                  type="button"
                  className="-m-2.5 rounded-md p-2.5 text-green-700"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <X className="h-8 w-8" />
                </button>
              </div>

              {/* Mobile user info */}
              <div className="mt-6 mb-4 flex items-center">
                <Avatar className="h-12 w-12 mr-3">
                  {profileImage ? (
                    <AvatarImage src={profileImage || "/placeholder.svg"} alt={userFullName} />
                  ) : (
                    <AvatarFallback>{getInitials()}</AvatarFallback>
                  )}
                </Avatar>
                <div>
                  <div className="flex items-center">
                    <p className="text-base font-medium">{userFullName}</p>
                    {getKycStatusBadge()}
                  </div>
                  <p className="text-sm text-gray-500 truncate">{userEmail}</p>
                </div>
              </div>

              {/* Mobile navigation */}
              <div className="flow-root">
                <div className="divide-y divide-gray-500/10">
                  <div className="space-y-2 py-3">
                    {navigation?.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={`flex items-center rounded-lg px-3 py-2 text-base font-medium ${
                          pathname === item.href ? "text-green-700 bg-green-50" : "text-gray-900 hover:bg-gray-50"
                        }`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {item.icon}
                        {item.name}
                      </Link>
                    ))}
                  </div>

                  {shouldShowRoleFeatures() && (
                    <div className="py-3">
                      <p className="px-3 text-xs font-semibold text-gray-500 uppercase mb-2">Role Features</p>
                      {userRoles.isDBAdmin && (
                        <Link
                          href="/admin/kyc-verification"
                          className="flex items-center px-3 py-2 text-base font-medium text-gray-900 hover:bg-gray-50"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <UserCog className="h-4 w-4 mr-2" />
                          KYC Verification
                        </Link>
                      )}
                      {userRoles.isDonor && (
                        <Link
                          href="/donations/history"
                          className="flex items-center px-3 py-2 text-base font-medium text-gray-900 hover:bg-gray-50"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <DollarSign className="h-4 w-4 mr-2" />
                          Donation History
                        </Link>
                      )}
                    </div>
                  )}

                  <div className="py-3">
                    <p className="px-3 text-xs font-semibold text-gray-500 uppercase mb-2">Account</p>
                    <Link
                      href="/profile"
                      className="flex items-center px-3 py-2 text-base font-medium text-gray-900 hover:bg-gray-50"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <User className="h-4 w-4 mr-2" />
                      My Profile
                    </Link>
                    <Link
                      href="/settings/notifications"
                      className="flex items-center px-3 py-2 text-base font-medium text-gray-900 hover:bg-gray-50"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Notification Settings
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout()
                        setMobileMenuOpen(false)
                      }}
                      className="flex w-full items-center px-3 py-2 text-base font-medium text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}
