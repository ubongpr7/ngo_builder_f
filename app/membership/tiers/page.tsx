import type React from "react"
import type { Metadata } from "next"
import { Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Membership Tiers | Destiny Builders",
  description: "Explore the different membership tiers available at Destiny Builders Empowerment Foundation",
}

export default function MembershipTiersPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Membership Tiers</h1>

        <div className="prose max-w-none mb-8">
          <p className="text-lg">
            Destiny Builders offers different membership tiers to accommodate various levels of involvement and
            commitment. Each tier provides unique benefits and opportunities for personal growth, professional
            development, and community impact.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <MembershipTierCard
            title="General Member"
            price="$50"
            period="annually"
            description="Perfect for individuals looking to be part of the Destiny Builders community and access basic resources."
            features={[
              { included: true, text: "Access to member portal" },
              { included: true, text: "Monthly newsletter" },
              { included: true, text: "Participation in community events" },
              { included: true, text: "Basic training resources" },
              { included: false, text: "Leadership development programs" },
              { included: false, text: "Mentorship opportunities" },
              { included: false, text: "Project funding access" },
              { included: false, text: "Executive networking events" },
            ]}
          />

          <MembershipTierCard
            title="Executive Member"
            price="$150"
            period="annually"
            description="Designed for professionals seeking leadership development and deeper involvement in our initiatives."
            features={[
              { included: true, text: "All General Member benefits" },
              { included: true, text: "Leadership development programs" },
              { included: true, text: "Mentorship opportunities" },
              { included: true, text: "Priority event registration" },
              { included: true, text: "Exclusive workshops and seminars" },
              { included: false, text: "Project funding access" },
              { included: false, text: "Executive networking events" },
              { included: false, text: "Strategic planning involvement" },
            ]}
            highlighted={true}
          />

          <MembershipTierCard
            title="Partnering CEO"
            price="$500"
            period="annually"
            description="For business leaders and executives committed to making a significant impact through partnership."
            features={[
              { included: true, text: "All Executive Member benefits" },
              { included: true, text: "Project funding access" },
              { included: true, text: "Executive networking events" },
              { included: true, text: "Strategic planning involvement" },
              { included: true, text: "Speaking opportunities" },
              { included: true, text: "Brand visibility at events" },
              { included: true, text: "Customized partnership options" },
              { included: true, text: "Direct access to leadership team" },
            ]}
          />
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold mb-4">Volunteer Membership</h2>
            <p className="text-gray-600 mb-4">
              For individuals who want to contribute their time and skills to Destiny Builders' initiatives. Volunteer
              members receive many of the same benefits as General Members while making a direct impact through service.
            </p>
            <ul className="space-y-2 mb-6">
              <FeatureItem included={true}>Access to member portal</FeatureItem>
              <FeatureItem included={true}>Monthly newsletter</FeatureItem>
              <FeatureItem included={true}>Volunteer training and resources</FeatureItem>
              <FeatureItem included={true}>Recognition for service</FeatureItem>
              <FeatureItem included={true}>Community service certificate</FeatureItem>
            </ul>
            <Button asChild variant="outline" className="w-full">
              <Link href="/membership/volunteer">Learn More About Volunteering</Link>
            </Button>
          </div>

          <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold mb-4">Strategic Partner</h2>
            <p className="text-gray-600 mb-4">
              For organizations and institutions seeking to collaborate with Destiny Builders on strategic initiatives.
              Partnership terms and benefits are customized based on the nature and scope of the collaboration.
            </p>
            <ul className="space-y-2 mb-6">
              <FeatureItem included={true}>Customized partnership agreement</FeatureItem>
              <FeatureItem included={true}>Co-branding opportunities</FeatureItem>
              <FeatureItem included={true}>Joint program development</FeatureItem>
              <FeatureItem included={true}>Impact reporting</FeatureItem>
              <FeatureItem included={true}>Strategic planning involvement</FeatureItem>
            </ul>
            <Button asChild variant="outline" className="w-full">
              <Link href="/membership/partner">Explore Partnership Opportunities</Link>
            </Button>
          </div>
        </div>

        <div className="bg-green-50 p-8 rounded-xl border border-green-100 text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to Join Destiny Builders?</h2>
          <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
            Select the membership tier that best suits your goals and level of involvement. Join our community today and
            start your journey of personal growth and community impact.
          </p>
          <Button asChild size="lg" className="bg-green-600 hover:bg-green-700">
            <Link href="/membership/join">Join Now</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

function MembershipTierCard({
  title,
  price,
  period,
  description,
  features,
  highlighted = false,
}: {
  title: string
  price: string
  period: string
  description: string
  features: { included: boolean; text: string }[]
  highlighted?: boolean
}) {
  return (
    <div
      className={`rounded-xl overflow-hidden border ${
        highlighted ? "border-green-200 shadow-lg shadow-green-100" : "border-gray-100 shadow-sm"
      }`}
    >
      {highlighted && <div className="bg-green-600 text-white text-center py-2 font-medium">Most Popular</div>}
      <div className={`p-8 ${highlighted ? "bg-green-50" : "bg-white"}`}>
        <h2 className="text-2xl font-bold mb-2">{title}</h2>
        <div className="flex items-baseline mb-4">
          <span className="text-3xl font-bold">{price}</span>
          <span className="text-gray-500 ml-1">/{period}</span>
        </div>
        <p className="text-gray-600 mb-6">{description}</p>
        <ul className="space-y-3 mb-8">
          {features.map((feature, index) => (
            <FeatureItem key={index} included={feature.included}>
              {feature.text}
            </FeatureItem>
          ))}
        </ul>
        <Button
          asChild
          className={`w-full ${highlighted ? "bg-green-600 hover:bg-green-700" : ""}`}
          variant={highlighted ? "default" : "outline"}
        >
          <Link href="/membership/join" className={`${highlighted ? "text-white" : "text-green-600"}`}>Select {title}</Link>
        </Button>
      </div>
    </div>
  )
}

function FeatureItem({ included, children }: { included: boolean; children: React.ReactNode }) {
  return (
    <li className="flex items-start">
      {included ? (
        <Check className="h-5 w-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
      ) : (
        <X className="h-5 w-5 text-gray-400 mr-2 flex-shrink-0 mt-0.5" />
      )}
      <span className={included ? "text-gray-700" : "text-gray-400"}>{children}</span>
    </li>
  )
}
