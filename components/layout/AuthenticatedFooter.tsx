"use client"

import Link from "next/link"

export default function AuthenticatedFooter() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-white border-t py-4">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="text-sm text-gray-500">
            © {currentYear} Destiny Builders Empowerment Foundation. All rights reserved.
          </div>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link href="/dashboard/help" className="text-sm text-gray-500 hover:text-green-700">
              Help Center
            </Link>
            <Link href="/dashboard/privacy" className="text-sm text-gray-500 hover:text-green-700">
              Privacy Policy
            </Link>
            <Link href="/dashboard/terms" className="text-sm text-gray-500 hover:text-green-700">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
