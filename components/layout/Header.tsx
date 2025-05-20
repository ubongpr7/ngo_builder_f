"use client"

import React from "react"
import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { cn } from "@/lib/utils"
import { Menu, X } from "lucide-react"
import { ToastContainer } from "react-toastify";
import { useAuth } from "@/redux/features/users/useAuth"

const whoWeAreLinks = [
  { title: "About Us", href: "/about" },
  { title: "Our Vision & Mission", href: "/vision-mission" },
  { title: "Core Values", href: "/core-values" },
  { title: "Our History", href: "/history" },
  { title: "Leadership", href: "/leadership" },
]

const resourcesLinks = [
  { title: "Publications", href: "/resources/publications" },
  { title: "Reports", href: "/resources/reports" },
  { title: "Media Gallery", href: "/resources/media" },
  { title: "Blog", href: "/blog" },
  { title: "FAQs", href: "/faqs" },
]

const membershipLinks = [
  { title: "Benefits", href: "/membership/benefits" },
  { title: "How to Join", href: "/membership/join" },
  { title: "Membership Tiers", href: "/membership/tiers" },
  { title: "Volunteer", href: "/membership/volunteer" },
  { title: "Partner With Us", href: "/membership/partner" },
]

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { isLoading, isAuthenticated, isPublic } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white backdrop-blur text-gray-900 supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-screen-2xl mx-auto flex h-20 lg:h-24 items-center justify-between px-6 md:px-12">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <Image src="/logo.jpg" alt="Destiny Builders Logo" width={56} height={80} className="h-20 lg:h-24 w-auto" />
          <span className="hidden font-bold text-xl text-green-700 md:inline-block">destinybuilders</span>
        </Link>
        {/* Desktop Navigation */}
        <div className="hidden md:flex">
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger className="hover:text-[#469620] text-[16px]">Who We Are</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                    {whoWeAreLinks?.map((link) => (
                      <ListItem className="text-gray-900 hover:underline hover:text-[#469620]" key={link.title} title={link.title} href={link.href} />
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuTrigger className="hover:text-[#469620] text-[16px]">Resources</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                    {resourcesLinks?.map((link) => (
                      <ListItem className="hover:underline text-gray-900 hover:text-[#469620]" key={link.title} title={link.title} href={link.href} />
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuTrigger className="hover:text-[#469620] text-[16px]">Membership</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                    {membershipLinks?.map((link) => (
                      <ListItem className="hover:underline text-gray-900 hover:text-[#469620]" key={link.title} title={link.title} href={link.href} />
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link href="/donate" legacyBehavior passHref>
                  <NavigationMenuLink className={navigationMenuTriggerStyle()}>Donate</NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link href="/contact" legacyBehavior passHref >
                  <NavigationMenuLink className={navigationMenuTriggerStyle()}>Contact Us</NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        <div className="flex items-center space-x-4">
          <Button asChild variant="default" className="hidden md:inline-flex border border-green-700 hover:bg-[#469620] hover:text-white hover:shadow-custom">
            <Link href="/membership/portal">Membership Portal</Link>
          </Button>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-md hover:bg-gray-100 text-gray-900 hover:text-[#469620] transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden">
          <div className="space-y-1 px-4 pb-3 pt-2">
            <MobileNavLink href="/about" title="Who We Are" onClick={() => setMobileMenuOpen(false)} />
            <MobileNavLink href="/resources" title="Resources" onClick={() => setMobileMenuOpen(false)} />
            <MobileNavLink href="/membership" title="Membership" onClick={() => setMobileMenuOpen(false)} />
            <MobileNavLink href="/donate" title="Donate" onClick={() => setMobileMenuOpen(false)} />
            <MobileNavLink href="/contact" title="Contact Us" onClick={() => setMobileMenuOpen(false)} />
            <div className="pt-4">
              <Button asChild className="w-full border border-green-700 hover:bg-[#469620]">
                <Link href={ isAuthenticated ? `/dashboard` : `/membership/portal`}>Membership Portal</Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}

const ListItem = React.forwardRef<React.ElementRef<"a">, React.ComponentPropsWithoutRef<"a"> & { title: string }>(
  ({ className, title, children, ...props }, ref) => {
    return (
      <li>
        <NavigationMenuLink asChild>
          <Link
            ref={ref}
            href={props.href || "#"}
            className={cn(
              "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
              className,
            )}
            {...props}
          >
            <div className="text-sm font-medium leading-none">{title}</div>
            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">{children}</p>
          </Link>
        </NavigationMenuLink>
      </li>
    )
  },
)
ListItem.displayName = "ListItem"

function MobileNavLink({
  href,
  title,
  onClick,
}: {
  href: string
  title: string
  onClick?: () => void
}) {
  return (
    <div className="border-b border-gray-200 last:border-b-0">
      <Link
        href={href}
        onClick={onClick}
        className="block rounded-md px-3 py-2 text-black hover:text-green700 text-base font-medium text-foreground hover:underline hover:text-accent-foreground text-center"
      >
        {title}
      </Link>
    </div>
  )
}
