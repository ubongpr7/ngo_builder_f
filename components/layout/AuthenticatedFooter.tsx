"use client"

import Link from "next/link"

export default function AuthenticatedFooter() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-[#040b13] border-t py-10 sm:py-20">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center text-center md:flex-row md:justify-between md:items-center md:text-left">
          <div className="text-sm text-gray-300">
            © {currentYear} Destiny Builders Empowerment Foundation. All rights reserved.
          </div>
          <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-6 mt-4 md:mt-0 justify-center">
            <Link href="/dashboard/help" className="text-sm text-gray-300 hover:text-green-700 hover:underline">
              Help Center
            </Link>
            <Link href="/dashboard/privacy" className="text-sm text-gray-300 hover:text-green-700 hover:underline">
              Privacy Policy
            </Link>
            <Link href="/dashboard/terms" className="text-sm text-gray-300 hover:text-green-700 hover:underline">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}