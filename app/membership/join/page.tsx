import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import MembershipRegister from "@/components/membership/MembershipRegister"

export const metadata: Metadata = {
  title: "Join Membership | Destiny Builders",
  description: "Join Destiny Builders Empowerment Foundation and be part of our community",
}

export default function JoinMembershipPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Join Destiny Builders</h1>

        <div className="prose max-w-none mb-8">
          <p className="text-lg">
            Becoming a member of Destiny Builders Empowerment Foundation is your first step toward personal growth,
            professional development, and making a positive impact in your community. Our membership process is designed
            to be simple and straightforward.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div>
            <h2 className="text-2xl font-bold mb-4">How to Join</h2>
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <div className="bg-green-100 text-green-800 w-8 h-8 rounded-full flex items-center justify-center font-bold mb-3">
                  1
                </div>
                <h3 className="font-bold mb-2">Complete the Registration Form</h3>
                <p className="text-gray-600">
                  Fill out the membership registration form with your personal information and areas of interest.
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <div className="bg-green-100 text-green-800 w-8 h-8 rounded-full flex items-center justify-center font-bold mb-3">
                  2
                </div>
                <h3 className="font-bold mb-2">Select Your Membership Tier</h3>
                <p className="text-gray-600">
                  Choose the membership tier that best suits your goals and level of involvement.
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <div className="bg-green-100 text-green-800 w-8 h-8 rounded-full flex items-center justify-center font-bold mb-3">
                  3
                </div>
                <h3 className="font-bold mb-2">Pay Membership Dues</h3>
                <p className="text-gray-600">Complete the payment process for your selected membership tier.</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <div className="bg-green-100 text-green-800 w-8 h-8 rounded-full flex items-center justify-center font-bold mb-3">
                  4
                </div>
                <h3 className="font-bold mb-2">Receive Confirmation</h3>
                <p className="text-gray-600">
                  You'll receive a confirmation email with your membership details and access to the member portal.
                </p>
              </div>
            </div>
            <div className="mt-8">
              <h2 className="text-2xl font-bold mb-4">Need More Information?</h2>
              <p className="text-gray-600 mb-4">
                If you have questions about membership or need assistance with the registration process, please don't
                hesitate to contact us.
              </p>
              <Button asChild variant="outline">
                <Link href="/contact" className="text-green-600 hover:bg-[#469620] hover:text-white">Contact Us</Link>
              </Button>
            </div>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Membership Registration</CardTitle>
                <CardDescription>Fill out the form below to join Destiny Builders</CardDescription>
              </CardHeader>
              <CardContent>
                <MembershipRegister />
              </CardContent>
              <CardFooter className="flex justify-between">
                <p className="text-sm text-gray-500">
                  Already a member?{" "}
                  <Link href="/membership/portal" className="text-green-600 hover:underline">
                    Sign in
                  </Link>
                </p>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
