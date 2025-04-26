import type React from "react"
import type { Metadata } from "next"
import { CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Membership Benefits | Destiny Builders",
  description: "Discover the benefits of becoming a member of Destiny Builders Empowerment Foundation",
}

export default function MembershipBenefitsPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Membership Benefits</h1>

        <div className="prose max-w-none mb-8">
          <p className="text-lg">
            Joining Destiny Builders Empowerment Foundation as a member opens doors to a wealth of opportunities for
            personal growth, professional development, and community impact. Our membership program is designed to
            empower individuals to reach their full potential while contributing to the transformation of communities
            across Africa.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold mb-4">Personal Development</h2>
            <ul className="space-y-3">
              <BenefitItem>Access to exclusive training programs and workshops</BenefitItem>
              <BenefitItem>Mentorship opportunities with experienced professionals</BenefitItem>
              <BenefitItem>Leadership development resources and courses</BenefitItem>
              <BenefitItem>Personal growth assessment tools</BenefitItem>
              <BenefitItem>Digital skills training and certification</BenefitItem>
            </ul>
          </div>

          <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold mb-4">Professional Advancement</h2>
            <ul className="space-y-3">
              <BenefitItem>Networking with industry leaders and professionals</BenefitItem>
              <BenefitItem>Career development resources and guidance</BenefitItem>
              <BenefitItem>Access to job opportunities within our network</BenefitItem>
              <BenefitItem>Professional skills enhancement programs</BenefitItem>
              <BenefitItem>Business development support for entrepreneurs</BenefitItem>
            </ul>
          </div>

          <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold mb-4">Community Impact</h2>
            <ul className="space-y-3">
              <BenefitItem>Opportunities to participate in community projects</BenefitItem>
              <BenefitItem>Platform to initiate and lead social impact initiatives</BenefitItem>
              <BenefitItem>Collaboration with like-minded change-makers</BenefitItem>
              <BenefitItem>Access to resources for community development</BenefitItem>
              <BenefitItem>Recognition for community service and impact</BenefitItem>
            </ul>
          </div>

          <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold mb-4">Exclusive Resources</h2>
            <ul className="space-y-3">
              <BenefitItem>Access to our digital resource library</BenefitItem>
              <BenefitItem>Subscription to our monthly newsletter</BenefitItem>
              <BenefitItem>Discounted rates for events and programs</BenefitItem>
              <BenefitItem>Priority registration for high-demand workshops</BenefitItem>
              <BenefitItem>Access to funding opportunities for projects</BenefitItem>
            </ul>
          </div>
        </div>

        <div className="bg-green-50 p-8 rounded-xl border border-green-100 text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to Join Destiny Builders?</h2>
          <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
            Become part of a community dedicated to building African destinies and transforming lives. Join Destiny
            Builders today and start your journey of personal growth and community impact.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-green-600 hover:bg-green-700">
              <Link href="/membership/join">Join Now</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/membership/tiers" className="text-green-600 hover:text-green-700">View Membership Tiers</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

function BenefitItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start">
      <CheckCircle className="h-5 w-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
      <span>{children}</span>
    </li>
  )
}
