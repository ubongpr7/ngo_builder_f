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
  Bell,
  ChevronDown,
  LogOut,
  Menu,
  Settings,
  User,
  X,
  Users,
  Calendar,
  FileText,
  BarChart3,
  DollarSign,
  ShieldCheck,
  Award,
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

export default function AuthenticatedHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const dispatch = useAppDispatch()
  const [logoutM, { isLoading }] = useLogoutMutation()
  const router = useRouter()

  // Fetch user data
  const { data: userData, isLoading: isUserLoading } = useGetUserLoggedInProfileDetailsQuery("")

  // Extract user information
  const userFullName =
    userData?.first_name && userData?.last_name
      ? `${userData.first_name} ${userData.last_name}`
      : userData?.email?.split("@")[0] || "My Account"

  const userEmail = userData?.email || ""

  // Get profile image from nested profile_data
  const profileImage = userData?.profile_data?.profile_image || ""

  // Get user roles and permissions
  const userRoles = {
    isKycVerified: userData?.profile_data?.is_kyc_verified || false,
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

  // Get first letter of first name and last name for avatar fallback
  const getInitials = () => {
    if (userData?.first_name && userData?.last_name) {
      return `${userData.first_name[0]}${userData.last_name[0]}`.toUpperCase()
    }
    return userEmail ? userEmail[0].toUpperCase() : "U"
  }

  // Get KYC status badge
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

  // Dynamic navigation based on user roles
  const getDynamicNavigation = () => {
    const baseNavigation = [
      { name: "Dashboard", href: "/dashboard", icon: <BarChart3 className="h-4 w-4 mr-2" /> },
    ]

    // Add role-specific navigation items
    if (userRoles.isDBAdmin || userRoles.isDBExecutive) {
      baseNavigation.push(
        // { name: "Admin Panel", href: "/admin/dashboard", icon: <ShieldCheck className="h-4 w-4 mr-2" /> },
        { name: "KYC Verification", href: "/admin/kyc-verification", icon: <UserCog className="h-4 w-4 mr-2" /> },
      )
    }

    if (userRoles.isDBStaff || userRoles.isDBExecutive || userRoles.isDBAdmin) {
    }

    // baseNavigation.push(
    //   { name: "Events", href: "/membership/events", icon: <Calendar className="h-4 w-4 mr-2" /> },
    //   { name: "Resources", href: "/membership/resources", icon: <FileText className="h-4 w-4 mr-2" /> },
    // )

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

    return baseNavigation
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
        <div className="flex lg:flex-1">
          <Link href="/" className="-m-1.5 p-1.5 flex items-center">
            <Image src="/logo.jpg" alt="Destiny Builders Logo" width={56} height={56} className="h-10 w-auto" />
            <span className="text-2xl font-bold text-green-700 ml-3 tracking-tight">destinybuilders</span>
          </Link>
        </div>

        <div className="flex lg:hidden">
          <button
            type="button"
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-green-700"
            onClick={() => setMobileMenuOpen(true)}
          >
            <span className="sr-only">Open main menu</span>
            <Menu className="h-8 w-8" aria-hidden="true" />
          </button>
        </div>

        <div className="hidden lg:flex lg:gap-x-8">
          {navigation.slice(0, 4).map((item) => (
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

          {/* More dropdown for additional navigation items */}
          {navigation.length > 4 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="text-sm font-medium flex items-center text-gray-700 hover:text-green-700">
                  More <ChevronDown className="h-4 w-4 ml-1" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {navigation.slice(4).map((item) => (
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

        <div className="hidden lg:flex lg:flex-1 lg:justify-end lg:gap-x-4">
          {/* Notifications dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="relative p-2 rounded-md text-gray-700 hover:text-green-700">
                <Bell className="h-6 w-6" />
                <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500"></span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="max-h-[300px] overflow-y-auto">
                <div className="p-3 border-b">
                  <p className="font-medium text-sm">Your KYC verification is pending</p>
                  <p className="text-xs text-gray-500 mt-1">Please complete your verification to access all features</p>
                </div>
                <div className="p-3 border-b">
                  <p className="font-medium text-sm">New event: Annual Conference</p>
                  <p className="text-xs text-gray-500 mt-1">Join us for our annual conference on June 15th</p>
                </div>
                <div className="p-3">
                  <p className="font-medium text-sm">Welcome to Destiny Builders!</p>
                  <p className="text-xs text-gray-500 mt-1">Thank you for joining our community</p>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link
                  href="/notifications"
                  className="flex justify-center text-center text-sm font-medium text-green-700"
                >
                  View all notifications
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

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
                    <span className="text-xs text-gray-500">
                      {userRoles.isDBAdmin
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
                                  : "Member"}
                    </span>
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

              {/* User section */}
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
              </DropdownMenuGroup>
              <DropdownMenuSeparator />

              {/* Role-based section */}
              {userRoles.isDBAdmin && (
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4" />
                    <span>Admin</span>
                  </DropdownMenuSubTrigger>
                  <DropdownMenuPortal>
                    <DropdownMenuSubContent>
                      
                      <DropdownMenuItem asChild>
                        <Link href="/admin/users">Manage Users</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/admin/kyc-verification">KYC Verification</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/admin/settings">System Settings</Link>
                      </DropdownMenuItem>
                    </DropdownMenuSubContent>
                  </DropdownMenuPortal>
                </DropdownMenuSub>
              )}

              {userRoles.isDBExecutive && (
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger className="flex items-center gap-2">
                    <Award className="h-4 w-4" />
                    <span>Executive</span>
                  </DropdownMenuSubTrigger>
                </DropdownMenuSub>
              )}

              {userRoles.isPartner && (
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger className="flex items-center gap-2">
                    <Handshake className="h-4 w-4" />
                    <span>Partnership</span>
                  </DropdownMenuSubTrigger>
                  <DropdownMenuPortal>
                    <DropdownMenuSubContent>
                      <DropdownMenuItem asChild>
                        <Link href="/partnership/dashboard">Partnership Dashboard</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/partnership/projects">Joint Projects</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/partnership/agreements">Agreements</Link>
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
                      <DropdownMenuItem asChild>
                        <Link href="/donations/tax-receipts">Tax Receipts</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/donations/impact">Impact Reports</Link>
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
                      <DropdownMenuItem asChild>
                        <Link href="/volunteer/hours">My Hours</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/volunteer/schedule">Schedule</Link>
                      </DropdownMenuItem>
                    </DropdownMenuSubContent>
                  </DropdownMenuPortal>
                </DropdownMenuSub>
              )}

              <DropdownMenuSeparator />

              {/* Settings and logout */}
              
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
      </nav>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden">
          <div className="fixed inset-0 z-[9999] bg-black" />
          <div className="fixed top-0 right-0 z-[10000] w-full sm:max-w-sm h-screen overflow-y-auto bg-white px-4 py-4">
            <div className="flex items-center justify-between">
              <Link href="/" className="-m-1.5 p-1.5 flex items-center">
                <Image src="/logo.jpg" alt="Destiny Builders Logo" width={56} height={56} className="h-10 w-auto" />
                <span className="text-2xl font-bold text-green-700 ml-3 tracking-tight">destinybuilders</span>
              </Link>
              <button
                type="button"
                className="-m-2.5 rounded-md p-2.5 text-green-700"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="sr-only">Close menu</span>
                <X className="h-8 w-8" aria-hidden="true" />
              </button>
            </div>

            {/* User profile in mobile menu */}
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

            <div className="flow-root">
              <div className="divide-y divide-gray-500/10">
                {/* Main navigation */}
                <div className="space-y-2 py-3">
                  {navigation.map((item) => (
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

                {/* Role-based sections */}
                {(userRoles.isDBAdmin ||
                  userRoles.isDBExecutive ||
                  userRoles.isPartner ||
                  userRoles.isDonor ||
                  userRoles.isVolunteer) && (
                  <div className="py-3">
                    <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                      Role-specific
                    </p>

                    {userRoles.isDBAdmin && (
                      <>
                        <p className="px-3 text-sm font-medium text-gray-900 mt-3 mb-1">Admin</p>
                       
                        <Link
                          href="/admin/kyc-verification"
                          className="flex items-center rounded-lg px-3 py-2 text-base font-medium text-gray-900 hover:bg-gray-50"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <UserCog className="h-4 w-4 mr-2" />
                          KYC Verification
                        </Link>
                      </>
                    )}

                    {userRoles.isDBExecutive && (
                      <>
                        
                        <Link
                          href="/executive/reports"
                          className="flex items-center rounded-lg px-3 py-2 text-base font-medium text-gray-900 hover:bg-gray-50"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          Reports
                        </Link>
                      </>
                    )}

                    
                    {userRoles.isDonor && (
                      <>
                        <p className="px-3 text-sm font-medium text-gray-900 mt-3 mb-1">Donations</p>
                        <Link
                          href="/donations/history"
                          className="flex items-center rounded-lg px-3 py-2 text-base font-medium text-gray-900 hover:bg-gray-50"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <DollarSign className="h-4 w-4 mr-2" />
                          Donation History
                        </Link>
                      </>
                    )}

                    {userRoles.isVolunteer && (
                      <>
                        <p className="px-3 text-sm font-medium text-gray-900 mt-3 mb-1">Volunteer</p>
                        <Link
                          href="/volunteer/opportunities"
                          className="flex items-center rounded-lg px-3 py-2 text-base font-medium text-gray-900 hover:bg-gray-50"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <Heart className="h-4 w-4 mr-2" />
                          Volunteer Opportunities
                        </Link>
                      </>
                    )}
                  </div>
                )}

                {/* User section */}
                <div className="py-3">
                  <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Your Account</p>
                  <Link
                    href="/profile"
                    className="flex items-center rounded-lg px-3 py-2 text-base font-medium text-gray-900 hover:bg-gray-50"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <User className="h-4 w-4 mr-2" />
                    My Profile
                  </Link>
                  <Link
                    href="/profile/update"
                    className="flex items-center rounded-lg px-3 py-2 text-base font-medium text-gray-900 hover:bg-gray-50"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Update Profile
                  </Link>
                  <Link
                    href="/settings"
                    className="flex items-center rounded-lg px-3 py-2 text-base font-medium text-gray-900 hover:bg-gray-50"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout()
                      setMobileMenuOpen(false)
                    }}
                    className="flex w-full items-center rounded-lg px-3 py-2 text-base font-medium text-red-600 hover:bg-red-50"
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
    </header>
  )
}
