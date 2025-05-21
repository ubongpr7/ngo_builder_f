"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Mail } from "lucide-react"
import Link from "next/link"

export default function PasswordResetSentPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Check Your Email</h1>
          <p className="text-gray-600 mt-2">We've sent you instructions to reset your password</p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex justify-center mb-4">
              <div className="bg-blue-100 p-3 rounded-full">
                <Mail className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            <CardTitle className="text-center">Email Sent</CardTitle>
            <CardDescription className="text-center">
              We've sent password reset instructions to your email address.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-gray-500 mb-4">
              Please check your inbox and follow the link in the email to reset your password. If you don't see the
              email, check your spam folder.
            </p>
            <p className="text-sm text-gray-500">The link will expire in 24 hours.</p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Link href="/membership/portal">
              <Button variant="link" className="px-0">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Login
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
