"use client"

import type React from "react"
import Image from "next/image"
import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  BarChart3,
  Calendar,
  ClipboardList,
  FileText,
  Home,
  LayoutDashboard,
  MessageSquare,
  Package,
  Settings,
  Users,
  Wallet,
  FolderOpen,
  PieChart,
  Camera,
  BookOpen,
  Heart,
  Building,
  ChevronDown,
  X,
  ListTodo,
  CheckSquare,
  Clock,
  AlertTriangle,
  Award,
  UserPlus,
  Briefcase,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useGetUserLoggedInProfileDetailsQuery } from "@/redux/features/profile/readProfileAPISlice"

export default function DashboardSidebar() {
  const pathname = usePathname()
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({
    projects: true,
    tasks: true,
    inventory: false,
    finance: false,
    reporting: false,
  })

  // Fetch user data
  const { data: userData, isLoading: isUserLoading } = useGetUserLoggedInProfileDetailsQuery("")

  // Extract user roles and permissions
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
  }

  const toggleMenu = (menu: string) => {
    setOpenMenus((prev) => ({
      ...prev,
      [menu]: !prev[menu],
    }))
  }

  const isActive = (path: string) => {
    return pathname === path
  }

  const NavItem = ({
    href,
    icon: Icon,
    children,
  }: {
    href: string
    icon: React.ElementType
    children: React.ReactNode
  }) => (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:underline hover:text-green-700",
        isActive(href) ? "text-[#469620] border border-[#469620] font-medium" : "text-gray-600",
      )}
      onClick={() => {
        // Close sidebar on mobile when a link is clicked
        if (window.innerWidth < 768) {
          const sidebar = document.getElementById("dashboard-sidebar")
          sidebar?.classList.add("hidden")
        }
      }}
    >
      <Icon className="h-4 w-4" />
      <span>{children}</span>
    </Link>
  )

  const NavSection = ({
    title,
    name,
    icon: Icon,
    children,
  }: {
    title: string
    name: string
    icon: React.ElementType
    children: React.ReactNode
  }) => (
    <div className="space-y-1">
      <Button
        variant="ghost"
        className="w-full justify-between px-3 py-2 text-sm font-medium"
        onClick={() => toggleMenu(name)}
      >
        <div className="flex items-center gap-3">
          <Icon className="h-4 w-4" />
          <span>{title}</span>
        </div>
        <ChevronDown className={cn("h-4 w-4 transition-transform", openMenus[name] ? "rotate-180" : "")} />
      </Button>
      {openMenus[name] && <div className="ml-6 space-y-1">{children}</div>}
    </div>
  )

  // Get user's full name and role for display
  const userFullName =
    userData?.first_name && userData?.last_name
      ? `${userData.first_name} ${userData.last_name}`
      : userData?.email?.split("@")[0] || "User"

  const userRole = userRoles.isDBAdmin
    ? "Admin"
    : userRoles.isDBExecutive
      ? "Executive"
      : userRoles.isCeo
        ? "CEO"
        : userRoles.isProjectManager
          ? "Project Manager"
          : "Member"

  // Get profile image
  const profileImage = userData?.profile_data?.profile_image || "/user-icon.svg"

  return (
    <div
      id="dashboard-sidebar"
      className="fixed md:relative z-50 h-screen w-64 border-r bg-white hidden md:block lg:w-64"
    >
      <div className="flex h-full flex-col gap-2">
        <div className="flex h-14 items-center justify-between border-b px-4">
          <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
            <LayoutDashboard className="h-5 w-5 text-green-600" />
            <span>Destiny Builders</span>
          </Link>
          <button
            className="md:hidden text-gray-500 hover:text-gray-700"
            onClick={() => {
              const sidebar = document.getElementById("dashboard-sidebar")
              sidebar?.classList.add("hidden")
            }}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 overflow-auto py-2 px-4">
          <nav className="grid gap-1">
            <NavItem href="/dashboard" icon={Home}>
              Overview
            </NavItem>

            {/* Projects Section - Role-based */}
            <NavSection title="Projects" name="projects" icon={FolderOpen}>
              {/* All users can see All Projects */}
              <NavItem href="/dashboard/projects" icon={ClipboardList}>
                All Projects
              </NavItem>

                <NavItem href="/dashboard/projects/my-projects" icon={Briefcase}>
                  My Projects
                </NavItem>


              <NavItem href="/dashboard/projects/milestones" icon={Calendar}>
                Milestones
              </NavItem>

              <NavItem href="/dashboard/projects/teams" icon={Users}>
                Teams
              </NavItem>
            </NavSection>

            {/* Only show Inventory section to specific roles */}
            {(userRoles.isDBAdmin && userRoles.isDBExecutive && userRoles.isCeo) && (
              <NavSection title="Inventory" name="inventory" icon={Package}>
                <NavItem href="/dashboard/inventory" icon={BarChart3}>
                  Overview
                </NavItem>
                <NavItem href="/dashboard/inventory/assets" icon={Package}>
                  Assets
                </NavItem>
                {/* Only show Equipment section to specific roles}
                <NavItem href="/dashboard/inventory/maintenance" icon={Settings}>
                  Maintenance
                </NavItem>
                <NavItem href="/dashboard/inventory/audits" icon={ClipboardList}>
                  Audits
                </NavItem>
                */}
              </NavSection>
            )}

            {/* Only show Finance section to specific roles 
            {(userRoles.isDBAdmin || userRoles.isDBExecutive || userRoles.isCeo) && (
              <NavSection title="Finance" name="finance" icon={Wallet}>
                <NavItem href="/dashboard/finance" icon={BarChart3}>
                  Overview
                </NavItem>
                <NavItem href="/dashboard/finance/donations" icon={Heart}>
                  Donations
                </NavItem>
                <NavItem href="/dashboard/finance/expenses" icon={FileText}>
                  Expenses
                </NavItem>
                <NavItem href="/dashboard/finance/grants" icon={FileText}>
                  Grants
                </NavItem>
                <NavItem href="/dashboard/finance/budgets" icon={PieChart}>
                  Budgets
                </NavItem>
              </NavSection>
            )}
          */}
            {/* Only show Reporting section to specific roles 
            {(userRoles.isDBAdmin || userRoles.isDBExecutive || userRoles.isCeo || userRoles.isProjectManager) && (
              <NavSection title="Reporting" name="reporting" icon={FileText}>
                <NavItem href="/dashboard/reporting" icon={BarChart3}>
                  Overview
                </NavItem>
                <NavItem href="/dashboard/reporting/project-reports" icon={FileText}>
                  Project Reports
                </NavItem>
                <NavItem href="/dashboard/reporting/financial-reports" icon={PieChart}>
                  Financial Reports
                </NavItem>
                <NavItem href="/dashboard/reporting/impact-metrics" icon={BarChart3}>
                  Impact Metrics
                </NavItem>
              </NavSection>
            )}
              */}

            {/* Common sections for all users 
            <NavItem href="/dashboard/events" icon={Calendar}>
              Events
            </NavItem>
            <NavItem href="/dashboard/members" icon={Users}>
              Members
            </NavItem>
            */}
            {/* Only show Volunteers section to specific roles
            {(userRoles.isDBAdmin || userRoles.isDBExecutive || userRoles.isCeo || userRoles.isVolunteer) && (
              <NavItem href="/dashboard/volunteers" icon={Heart}>
                Volunteers
              </NavItem>
            )}
          */}
            {/* Only show Partners section to specific roles
            {(userRoles.isDBAdmin || userRoles.isDBExecutive || userRoles.isCeo || userRoles.isPartner) && (
              <NavItem href="/dashboard/partners" icon={Building}>
                Partners
              </NavItem>
            )}

            <NavItem href="/dashboard/media" icon={Camera}>
              Media Gallery
            </NavItem>
            <NavItem href="/dashboard/blog" icon={BookOpen}>
              Blog
            </NavItem>
            <NavItem href="/dashboard/messages" icon={MessageSquare}>
              Messages
            </NavItem>
             */}
          </nav>
        </div>
        <div className="mt-auto border-t p-1">
          <div className="flex items-center gap-3 rounded-lg px-3 py-2">
            <div className="h-8 w-8 rounded-full bg-gray-200 overflow-hidden">
              <Image
                src={profileImage || "/placeholder.svg"}
                alt={userFullName}
                width={32}
                height={32}
                className="h-full w-full object-cover"
              />
            </div>
            <div>
              <div className="text-sm font-medium">{userFullName}</div>
              <div className="text-xs text-gray-500">{userRole}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
