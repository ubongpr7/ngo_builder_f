import type React from "react"
import type { Metadata } from "next"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Heart, DollarSign, Repeat, Target } from "lucide-react"

export const metadata: Metadata = {
  title: "Donate | Destiny Builders",
  description: "Support the work of Destiny Builders Empowerment Foundation",
}

export default function DonatePage() {
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
            icon={<Heart className="h-8 w-8 text-green-700" />}
            title="Empower Individuals"
            description="Your donation helps provide training, resources, and support to individuals seeking to develop their skills and potential."
          />
          <DonationImpactCard
            icon={<Target className="h-8 w-8 text-green-700" />}
            title="Transform Communities"
            description="Support community development initiatives that address local needs and create sustainable change."
          />
          <DonationImpactCard
            icon={<Repeat className="h-8 w-8 text-green-700" />}
            title="Create Lasting Impact"
            description="Help build systems and structures that ensure long-term, sustainable impact across Africa."
          />
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-12">
          <div className="p-8">
            <h2 className="text-2xl font-bold mb-6">Make a Donation</h2>

            <Tabs defaultValue="one-time" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8">
                <TabsTrigger value="one-time">One-Time Donation</TabsTrigger>
                <TabsTrigger value="monthly">Monthly Donation</TabsTrigger>
              </TabsList>

              <TabsContent value="one-time">
                <DonationForm recurring={false} />
              </TabsContent>

              <TabsContent value="monthly">
                <DonationForm recurring={true} />
              </TabsContent>
            </Tabs>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="bg-green-50 p-8 rounded-xl border border-green-100">
            <h2 className="text-xl font-bold mb-4">Other Ways to Give</h2>
            <ul className="space-y-4">
              <li className="flex items-start">
                <div className="bg-green-100 p-1 rounded-full mr-3 mt-1">
                  <DollarSign className="h-4 w-4 text-green-700" />
                </div>
                <div>
                  <h3 className="font-bold">Bank Transfer</h3>
                  <p className="text-sm text-gray-600">
                    Make a direct transfer to our bank account. Contact us for our banking details.
                  </p>
                </div>
              </li>
              <li className="flex items-start">
                <div className="bg-green-100 p-1 rounded-full mr-3 mt-1">
                  <DollarSign className="h-4 w-4 text-green-700" />
                </div>
                <div>
                  <h3 className="font-bold">Mobile Money</h3>
                  <p className="text-sm text-gray-600">
                    Use mobile money services to make your donation. Available in select countries.
                  </p>
                </div>
              </li>
              <li className="flex items-start">
                <div className="bg-green-100 p-1 rounded-full mr-3 mt-1">
                  <DollarSign className="h-4 w-4 text-green-700" />
                </div>
                <div>
                  <h3 className="font-bold">In-Kind Donations</h3>
                  <p className="text-sm text-gray-600">
                    Donate goods, services, or expertise to support our programs. Contact us to discuss.
                  </p>
                </div>
              </li>
            </ul>
          </div>

          <div className="bg-green-50 p-8 rounded-xl border border-green-100">
            <h2 className="text-xl font-bold mb-4">Corporate Partnerships</h2>
            <p className="text-gray-600 mb-4">
              We welcome partnerships with corporations and businesses that share our vision and values. Corporate
              partners can support our work through:
            </p>
            <ul className="space-y-2 mb-6">
              <li className="flex items-center">
                <div className="bg-green-100 p-1 rounded-full mr-3">
                  <DollarSign className="h-4 w-4 text-green-700" />
                </div>
                <span>Financial contributions</span>
              </li>
              <li className="flex items-center">
                <div className="bg-green-100 p-1 rounded-full mr-3">
                  <DollarSign className="h-4 w-4 text-green-700" />
                </div>
                <span>Employee volunteer programs</span>
              </li>
              <li className="flex items-center">
                <div className="bg-green-100 p-1 rounded-full mr-3">
                  <DollarSign className="h-4 w-4 text-green-700" />
                </div>
                <span>Cause-related marketing</span>
              </li>
              <li className="flex items-center">
                <div className="bg-green-100 p-1 rounded-full mr-3">
                  <DollarSign className="h-4 w-4 text-green-700" />
                </div>
                <span>Sponsorship of specific programs</span>
              </li>
            </ul>
            <Button className="w-full bg-green-600 hover:bg-green-700">Become a Corporate Partner</Button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Our Commitment to Transparency</h2>
          <p className="text-gray-600 mb-6 max-w-3xl mx-auto">
            Destiny Builders is committed to transparency and accountability in the use of all donations. We regularly
            publish financial reports and impact assessments to show how your contributions are making a difference. You
            can access these reports on our Resources page.
          </p>
          <Button variant="outline">View Financial Reports</Button>
        </div>
      </div>
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
      <div className="bg-green-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  )
}

function DonationForm({ recurring }: { recurring: boolean }) {
  return (
    <form className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-bold">Select Amount</h3>
        <RadioGroup defaultValue="50" className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <RadioGroupItem value="25" id="amount-25" className="sr-only" />
            <Label
              htmlFor="amount-25"
              className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-green-600 [&:has([data-state=checked])]:border-green-600"
            >
              $25
            </Label>
          </div>
          <div>
            <RadioGroupItem value="50" id="amount-50" className="sr-only" />
            <Label
              htmlFor="amount-50"
              className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-green-600 [&:has([data-state=checked])]:border-green-600"
            >
              $50
            </Label>
          </div>
          <div>
            <RadioGroupItem value="100" id="amount-100" className="sr-only" />
            <Label
              htmlFor="amount-100"
              className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-green-600 [&:has([data-state=checked])]:border-green-600"
            >
              $100
            </Label>
          </div>
          <div>
            <RadioGroupItem value="custom" id="amount-custom" className="sr-only" />
            <Label
              htmlFor="amount-custom"
              className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-green-600 [&:has([data-state=checked])]:border-green-600"
            >
              Custom
            </Label>
          </div>
        </RadioGroup>

        <div className="pt-2">
          <Label htmlFor="custom-amount">Custom Amount</Label>
          <div className="relative mt-1">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input id="custom-amount" placeholder="Enter amount" className="pl-10" />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-bold">Personal Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="first-name">First Name</Label>
            <Input id="first-name" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="last-name">Last Name</Label>
            <Input id="last-name" required />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone (Optional)</Label>
          <Input id="phone" type="tel" />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-bold">Donation Purpose (Optional)</h3>
        <div className="space-y-2">
          <Label htmlFor="purpose">Would you like to direct your donation to a specific program?</Label>
          <select id="purpose" className="w-full rounded-md border border-input bg-background px-3 py-2">
            <option value="general">General Support</option>
            <option value="digital">Digital Literacy Programs</option>
            <option value="women">Women Empowerment</option>
            <option value="youth">Youth Leadership</option>
            <option value="health">Community Health</option>
            <option value="education">Education Initiatives</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="comments">Comments or Special Instructions</Label>
          <Textarea id="comments" placeholder="Any additional information you'd like to share" />
        </div>
      </div>

      <Button type="submit" className="w-full bg-green-600 hover:bg-green-700">
        {recurring ? "Donate Monthly" : "Donate Now"}
      </Button>

      <p className="text-xs text-gray-500 text-center">
        By proceeding, you agree to our terms of service and privacy policy. All donations are secure and encrypted.
      </p>
    </form>
  )
}
