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

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-gray-100/95 backdrop-blur text-gray-900 supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <Image src="/logo.svg" alt="Destiny Builders Logo" width={50} height={50} className="h-10 w-auto" />
          <span className="hidden font-bold text-xl text-green-700 md:inline-block">destinybuilders</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex">
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger>Who We Are</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                    {whoWeAreLinks.map((link) => (
                      <ListItem className="hover:text-gray-50 text-gray-900 hover:bg-green-400" key={link.title} title={link.title} href={link.href} />
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuTrigger>Resources</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                    {resourcesLinks.map((link) => (
                      <ListItem className="hover:text-gray-50 text-gray-900 hover:bg-green-400" key={link.title} title={link.title} href={link.href} />
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuTrigger>Membership</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                    {membershipLinks.map((link) => (
                      <ListItem className="hover:text-gray-50 text-gray-900 hover:bg-green-400" key={link.title} title={link.title} href={link.href} />
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link href="/donate"  legacyBehavior passHref>
                  <NavigationMenuLink className={navigationMenuTriggerStyle()}>Donate</NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link href="/contact" legacyBehavior passHref>
                  <NavigationMenuLink className={navigationMenuTriggerStyle()}>Contact Us</NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        <div className="flex items-center space-x-4">
          <Button asChild variant="default" className="hidden md:inline-flex border border-green-700 hover:bg-green-700">
            <Link href="/membership/portal">Membership Portal</Link>
          </Button>

          {/* Mobile menu button */}
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden">
          <div className="space-y-1 px-4 pb-3 pt-2">
            <MobileNavLink href="/about" title="Who We Are" />
            <MobileNavLink href="/resources" title="Resources" />
            <MobileNavLink href="/membership" title="Membership" />
            <MobileNavLink href="/donate" title="Donate" />
            <MobileNavLink href="/contact" title="Contact Us" />
            <div className="pt-4">
              <Button asChild className="w-full border border-green-700   hover:bg-green-700">
                <Link href="/membership/portal" >Membership Portal</Link>
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

function MobileNavLink({ href, title }: { href: string; title: string }) {
  return (
    <Link
      href={href}
      className="block rounded-md px-3 py-2 text-base font-medium text-foreground hover:bg-gray-400 hover:text-accent-foreground"
    >
      {title}
    </Link>
  )
}
