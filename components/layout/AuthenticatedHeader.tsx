"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useDispatch } from "react-redux"
import { useLogoutMutation } from '../../redux/features/authApiSlice';
import Image from "next/image"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Bell, ChevronDown, LogOut, Menu, Settings, User, X } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "react-toastify"
import { useRouter } from "next/navigation"
import { logout } from "@/redux/features/authSlice"
import { useAppDispatch } from "@/redux/store"

const navigation = [
  { name: "Dashboard", href: "/membership/dashboard" },
  { name: "Members", href: "/membership/dashboard/" },
  { name: "Events", href: "/membership/dashboard/" },
]

export default function AuthenticatedHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const dispatch = useAppDispatch()
  const [logoutM, { isLoading }] = useLogoutMutation();
  const router = useRouter()
  const handleLogout = async () => {
    try {
      // await logoutM('').unwrap();
      dispatch(logout());
      toast.success('Logged out successfully');
      // router.push('/');
      window.location.href = '/';
    } catch (error) {
      dispatch(logout());
      router.push('/');
      window.location.href = '/';

      toast.error('Logout failed. Please try again.');
    }
  };

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
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`text-sm font-medium ${pathname === item.href
                  ? "text-green-700 border-b-2 border-green-700"
                  : "text-gray-700 hover:text-green-700"
                }`}
            >
              {item.name}
            </Link>
          ))}
        </div>

        <div className="hidden lg:flex lg:flex-1 lg:justify-end lg:gap-x-4">
        <button className="relative p-2 rounded-md text-gray-700 hover:text-green-700">
            <Bell className="h-6 w-6" />
            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500"></span>
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 p-2 rounded-md text-gray-700 hover:text-green-700">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/user-icon.svg" alt="User" />
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
                <span className="hidden md:inline">My Account</span>
                <ChevronDown className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile" className="flex items-center gap-2 cursor-pointer">
                  <User className="h-4 w-4" />
                  <span>Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/settings" className="flex items-center gap-2 cursor-pointer">
                  <Settings className="h-4 w-4" />
                  <span>Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/profile/update" className="flex items-center gap-2 cursor-pointer">
                  <Settings className="h-4 w-4" />
                  <span>Update Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="flex items-center gap-2 cursor-pointer">
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
          <div className="fixed inset-0 z-50 bg-black/50" />
          <div className="absolute top-0 right-0 z-50 w-full sm:max-w-sm h-auto max-h-screen overflow-y-auto bg-white px-4 py-4">
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
            <div className="mt-6 flow-root">
              <div className="divide-y divide-gray-500/10">
                <div className="space-y-4 py-3 px-0 flex flex-col items-center">
                  {navigation.map((item) => (
                    <div key={item.name} className="border-b border-gray-200 last:border-b-0 w-full">
                      <Link
                        href={item.href}
                        className={`block rounded-lg px-3 py-2 text-[18px] font-bold tracking-tight text-center ${pathname === item.href ? "text-green-700 underline" : "text-black hover:underline hover:text-green-700"
                          }`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {item.name}
                      </Link>
                    </div>
                  ))}
                </div>
                <div className="space-y-4 py-3 px-0 flex flex-col items-center">
                  <div className="border-b border-gray-200 last:border-b-0 w-full">
                    <Link
                      href="/profile"
                      className={`block rounded-lg px-3 py-2 text-2xl font-bold tracking-tight text-center ${pathname === "/dashboard/profile" ? "text-green-700 underline" : "text-black hover:underline hover:text-green-700"
                        }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Profile
                    </Link>
                  </div>
                  <div className="border-b border-gray-200 last:border-b-0 w-full">
                    <Link
                      href="/dashboard/settings"
                      className={`block rounded-lg px-3 py-2 text-[18px] font-bold tracking-tight text-center ${pathname === "/dashboard/settings" ? "text-green-700 underline" : "text-black hover:underline hover:text-green-700"
                        }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Settings
                    </Link>
                  </div>
                  <div className="border-b border-gray-200 last:border-b-0 w-full">
                    <Link
                      href="/profile/update"
                      className={`block rounded-lg px-3 py-2 text-[18px] font-bold tracking-tight text-center ${pathname === "/profile/update" ? "text-green-700 underline" : "text-black hover:underline hover:text-green-700"
                        }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Update Profile
                    </Link>
                  </div>
                  <div className="border-b border-gray-200 last:border-b-0 w-full">
                    <button
                      onClick={() => {
                        handleLogout()
                        setMobileMenuOpen(false)
                      }}
                      className="block rounded-lg px-3 py-2 text-[18px] font-bold tracking-tight text-black hover:underline hover:text-green-700 w-full text-center"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}