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
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export default function DashboardSidebar() {
  const pathname = usePathname()
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({
    projects: true,
    inventory: false,
    finance: false,
    reporting: false,
  })

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
          const sidebar = document.getElementById('dashboard-sidebar');
          sidebar?.classList.add('hidden');
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

  return (
    <div 
      id="dashboard-sidebar"
      className="fixed md:relative z-50 h-screen w-64 border-r bg-white hidden md:block lg:w-64"
    >
      <div className="flex h-full flex-col gap-2">
        <div className="flex h-14 items-center justify-between border-b px-4">
          <Link href="/membership/dashboard" className="flex items-center gap-2 font-semibold">
            <LayoutDashboard className="h-5 w-5 text-green-600" />
            <span>Destiny Builders</span>
          </Link>
          <button 
            className="md:hidden text-gray-500 hover:text-gray-700"
            onClick={() => {
              const sidebar = document.getElementById('dashboard-sidebar');
              sidebar?.classList.add('hidden');
            }}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 overflow-auto py-2 px-4">
          <nav className="grid gap-1">
            <NavItem href="/membership/dashboard" icon={Home}>
              Overview
            </NavItem>
            <NavSection title="Projects" name="projects" icon={FolderOpen}>
              <NavItem href="/membership/dashboard/projects" icon={ClipboardList}>
                All Projects
              </NavItem>
              <NavItem href="/membership/dashboard/projects/daily-updates" icon={FileText}>
                Daily Updates
              </NavItem>
              <NavItem href="/membership/dashboard/projects/tasks" icon={ClipboardList}>
                Tasks
              </NavItem>
              <NavItem href="/membership/dashboard/projects/milestones" icon={Calendar}>
                Milestones
              </NavItem>
              <NavItem href="/membership/dashboard/projects/teams" icon={Users}>
                Teams
              </NavItem>
            </NavSection>

            <NavSection title="Inventory" name="inventory" icon={Package}>
              <NavItem href="/membership/dashboard/inventory" icon={BarChart3}>
                Overview
              </NavItem>
              <NavItem href="/membership/dashboard/inventory/assets" icon={Package}>
                Assets
              </NavItem>
              <NavItem href="/membership/dashboard/inventory/maintenance" icon={Settings}>
                Maintenance
              </NavItem>
              <NavItem href="/membership/dashboard/inventory/audits" icon={ClipboardList}>
                Audits
              </NavItem>
            </NavSection>

            <NavSection title="Finance" name="finance" icon={Wallet}>
              <NavItem href="/membership/dashboard/finance" icon={BarChart3}>
                Overview
              </NavItem>
              <NavItem href="/membership/dashboard/finance/donations" icon={Heart}>
                Donations
              </NavItem>
              <NavItem href="/membership/dashboard/finance/expenses" icon={FileText}>
                Expenses
              </NavItem>
              <NavItem href="/membership/dashboard/finance/grants" icon={FileText}>
                Grants
              </NavItem>
              <NavItem href="/membership/dashboard/finance/budgets" icon={PieChart}>
                Budgets
              </NavItem>
            </NavSection>

            <NavSection title="Reporting" name="reporting" icon={FileText}>
              <NavItem href="/membership/dashboard/reporting" icon={BarChart3}>
                Overview
              </NavItem>
              <NavItem href="/membership/dashboard/reporting/project-reports" icon={FileText}>
                Project Reports
              </NavItem>
              <NavItem href="/membership/dashboard/reporting/financial-reports" icon={PieChart}>
                Financial Reports
              </NavItem>
              <NavItem href="/membership/dashboard/reporting/impact-metrics" icon={BarChart3}>
                Impact Metrics
              </NavItem>
            </NavSection>

            <NavItem href="/membership/dashboard/events" icon={Calendar}>
              Events
            </NavItem>
            <NavItem href="/membership/dashboard/members" icon={Users}>
              Members
            </NavItem>
            <NavItem href="/membership/dashboard/volunteers" icon={Heart}>
              Volunteers
            </NavItem>
            <NavItem href="/membership/dashboard/partners" icon={Building}>
              Partners
            </NavItem>
            <NavItem href="/membership/dashboard/media" icon={Camera}>
              Media Gallery
            </NavItem>
            <NavItem href="/membership/dashboard/blog" icon={BookOpen}>
              Blog
            </NavItem>
            <NavItem href="/membership/dashboard/messages" icon={MessageSquare}>
              Messages
            </NavItem>
          </nav>
        </div>
        <div className="mt-auto border-t p-1">
          <div className="flex items-center gap-3 rounded-lg px-3 py-2">
            <div className="h-8 w-8 rounded-full bg-gray-200">
              <Image src="/user-icon.svg" alt="Destiny Builders Logo" width={50} height={50}/>
            </div>
            <div>
              <div className="text-sm font-medium">John Doe</div>
              <div className="text-xs text-gray-500">Project Manager</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}