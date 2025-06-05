"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Heart, DollarSign, Repeat, Target } from "lucide-react"
import { ActiveCampaignsPublic } from "./donations/active-campaigns-public"
import { DonationDialog } from "./donations/donate-dialog"
import { AuthDialog } from "@/components/auth-dialog"
import { useAuth } from "@/redux/features/users/useAuth"
import { useRouter, useSearchParams } from "next/navigation"

export function DonatePageContent() {
  const { user, isLoading, isAuthenticated, isPublic } = useAuth()
  const [showAuthDialog, setShowAuthDialog] = useState(false)
  const [showDonationDialog, setShowDonationDialog] = useState(false)
  const [donationType, setDonationType] = useState<"one-time" | "monthly">("one-time")
  const [selectedCampaign, setSelectedCampaign] = useState<{ id: number; title: string } | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleDonateClick = (type: "one-time" | "monthly", campaign?: { id: number; title: string }) => {
    setDonationType(type)
    setSelectedCampaign(campaign || null)

    if (!isAuthenticated && !isLoading) {
      // Set next URL for after authentication
      const currentUrl = window.location.pathname + window.location.search
      router.push(`${currentUrl}?next=/donate`)
      setShowAuthDialog(true)
    } else if (isAuthenticated) {
      setShowDonationDialog(true)
    }
  }

  const handleAuthSuccess = () => {
    setShowAuthDialog(false)
    // Small delay to ensure auth state is updated
    setTimeout(() => {
      setShowDonationDialog(true)
    }, 100)
  }

  const handleContinueAsGuest = () => {
    setShowAuthDialog(false)
    setShowDonationDialog(true)
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold mb-4">Support Our Mission</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Your donation helps us empower individuals and communities across Africa. Together, we can build African
            destinies and transform lives.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <DonationImpactCard
            icon={<Heart className="h-8 w-8 text-black" />}
            title="Empower Individuals"
            description="Your donation helps provide training, resources, and support to individuals seeking to develop their skills and potential."
          />
          <DonationImpactCard
            icon={<Target className="h-8 w-8 text-black" />}
            title="Transform Communities"
            description="Support community development initiatives that address local needs and create sustainable change."
          />
          <DonationImpactCard
            icon={<Repeat className="h-8 w-8 text-black" />}
            title="Create Lasting Impact"
            description="Help build systems and structures that ensure long-term, sustainable impact across Africa."
          />
        </div>

        {/* Active Campaigns Section */}
        <ActiveCampaignsPublic onDonateClick={handleDonateClick} />

        
        <div id="donation-form" className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-12">
          <div className="p-8">
            <h2 className="text-2xl font-bold mb-6 text-center">Make a Donation</h2>

            <Tabs defaultValue="one-time" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8">
                <TabsTrigger
                  value="one-time"
                  className="data-[state=active]:border-b-2 data-[state=active]:border-green-600"
                >
                  One-Time Donation
                </TabsTrigger>
                <TabsTrigger
                  value="monthly"
                  className="data-[state=active]:border-b-2 data-[state=active]:border-green-600"
                >
                  Monthly Donation
                </TabsTrigger>
              </TabsList>

              <TabsContent value="one-time">
                <div className="text-center">
                  <Button
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => handleDonateClick("one-time", { id: 2, title: "Support Our Mission " })}
                  >
                    <Heart className="mr-2 h-4 w-4" />
                    Donate Now
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="monthly">
                <div className="text-center">
                  <Button
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => handleDonateClick("monthly",{ id: 2, title: "Support Our Mission " })}
                  >
                    <Heart className="mr-2 h-4 w-4" />
                    Donate Monthly
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="bg-[#708238] p-8 rounded-xl border border-grey-500">
            <h2 className="text-xl font-bold mb-4 text-[#FFFF99]">Other Ways to Give</h2>
            <ul className="space-y-4">
              <li className="flex items-start">
                <div className="bg-[#FFFF99] p-1 rounded-full mr-3 mt-1">
                  <DollarSign className="h-4 w-4 text-green-700" />
                </div>
                <div>
                  <h3 className="font-bold text-[#FFFFFF] ">Bank Transfer</h3>
                  <p className="text-sm text-[#FFFFFF]">
                    Make a direct transfer to our bank account. Contact us for our banking details.
                  </p>
                </div>
              </li>
              <li className="flex items-start">
                <div className="bg-[#FFFF99] p-1 rounded-full mr-3 mt-1">
                  <DollarSign className="h-4 w-4 text-green-700" />
                </div>
                <div>
                  <h3 className="font-bold text-[#FFFFFF]">Mobile Money</h3>
                  <p className="text-sm text-[#FFFFFF]">
                    Use mobile money services to make your donation. Available in select countries.
                  </p>
                </div>
              </li>
              <li className="flex items-start">
                <div className="bg-[#FFFF99] p-1 rounded-full mr-3 mt-1">
                  <DollarSign className="h-4 w-4 text-green-700" />
                </div>
                <div>
                  <h3 className="font-bold text-[#FFFFFF]">In-Kind Donations</h3>
                  <p className="text-sm text-[#FFFFFF]">
                    Donate goods, services, or expertise to support our programs. Contact us to discuss.
                  </p>
                </div>
              </li>
            </ul>
          </div>

          <div className="bg-[#708238] p-8 rounded-xl border border-grey-500">
            <h2 className="text-xl font-bold mb-4 text-[#FFFF99]">Corporate Partnerships</h2>
            <p className="mb-4 text-[#FFFFFF]">
              We welcome partnerships with corporations and businesses that share our vision and values. Corporate
              partners can support our work through:
            </p>
            <ul className="space-y-2 mb-6">
              <li className="flex items-center">
                <div className="bg-[#FFFF99] p-1 rounded-full mr-3">
                  <DollarSign className="h-4 w-4 text-green-700" />
                </div>
                <span className="text-[#FFFFFF]">Financial contributions</span>
              </li>
              <li className="flex items-center">
                <div className="bg-[#FFFF99] p-1 rounded-full mr-3">
                  <DollarSign className="h-4 w-4 text-green-700" />
                </div>
                <span className="text-[#FFFFFF]">Employee volunteer programs</span>
              </li>
              <li className="flex items-center">
                <div className="bg-[#FFFF99] p-1 rounded-full mr-3">
                  <DollarSign className="h-4 w-4 text-green-700" />
                </div>
                <span className="text-[#FFFFFF]">Cause-related marketing</span>
              </li>
              <li className="flex items-center">
                <div className="bg-[#FFFF99] p-1 rounded-full mr-3">
                  <DollarSign className="h-4 w-4 text-green-700" />
                </div>
                <span className="text-[#FFFFFF]">Sponsorship of specific programs</span>
              </li>
            </ul>
            <Button className="w-full bg-[#ffffff] hover:bg-green-700 text-black ">Become a Corporate Partner</Button>
          </div>
        </div>

        <div className="bg-[#040b13] text-white rounded-xl shadow-sm border border-gray-100 overflow-hidden p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Our Commitment to Transparency</h2>
          <p className="text-white mb-6 max-w-3xl mx-auto">
            Destiny Builders is committed to transparency and accountability in the use of all donations. We regularly
            publish financial reports and impact assessments to show how your contributions are making a difference. You
            can access these reports on our Resources page.
          </p>
          <Button variant="outline" className="hover:bg-[#469620] hover:text-white border-[#469620]">
            View Financial Reports
          </Button>
        </div>
      </div>

      {/* Auth Dialog */}
      <AuthDialog
        open={showAuthDialog}
        onOpenChange={setShowAuthDialog}
        onAuthSuccess={handleAuthSuccess}
        title="Join Our Community to Donate"
        description="Please login or register to continue with your donation. As a member, you'll be able to track your donations and stay updated on our impact."
      />

      {/* Donation Dialog */}
      {showDonationDialog && (
        <DonationDialog
          setOpen={setShowDonationDialog}
          open={showDonationDialog}
          recurring={donationType === "monthly"}
          selectedCampaign={selectedCampaign}
          trigger={null}
        />
      )}
    </div>
  )
}

function DonationImpactCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 text-center">
      <div className="bg-[#FDD65B] p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  )
}
