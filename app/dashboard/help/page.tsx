import Link from "next/link"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Search, Mail, Phone, MessageSquare } from "lucide-react"

export default function HelpPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-2">Help Center</h1>
      <p className="text-gray-600 mb-8">Find answers to common questions or contact our support team</p>

      <div className="relative mb-8">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <Input type="text" placeholder="Search for help articles..." className="pl-10 pr-4 py-2 w-full md:max-w-md" />
      </div>

      <div className="grid gap-8 md:grid-cols-3 mb-12">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center">
              <Mail className="mr-2 h-5 w-5 text-green-600" />
              Email Support
            </CardTitle>
            <CardDescription>Get help via email</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm mb-4">Send us an email and we'll respond within 24 hours.</p>
            <Button className="w-full bg-green-600 text-white hover:bg-[#FDD65B] hover:text-black">
              <Mail className="mr-2 h-4 w-4 text-white" /> Email Us
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center">
              <Phone className="mr-2 h-5 w-5 text-green-600" />
              Phone Support
            </CardTitle>
            <CardDescription>Talk to a representative</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm mb-4">Available Monday-Friday, 9am-5pm WAT.</p>
            <Button className="w-full bg-green-600 text-white hover:bg-[#FDD65B] hover:text-black">
              <Phone className="mr-2 h-4 w-4 text-white" /> Call Us
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center">
              <MessageSquare className="mr-2 h-5 w-5 text-green-600" />
              Live Chat
            </CardTitle>
            <CardDescription>Chat with our support team</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm mb-4">Get instant help from our support team.</p>
            <Button className="w-full bg-green-600 text-white hover:bg-[#FDD65B] hover:text-black">
              <MessageSquare className="mr-2 h-4 w-4 text-white" /> Start Chat
            </Button>
          </CardContent>
        </Card>
      </div>

      <h2 className="text-2xl font-bold mb-6 text-center">Frequently Asked Questions</h2>

      <Accordion type="single" collapsible className="w-full mb-12">
        <AccordionItem value="item-1">
          <AccordionTrigger>How do I update my profile information?</AccordionTrigger>
          <AccordionContent>
            To update your profile information, log in to your account and navigate to the Profile section from your
            dashboard. Click on the "Edit Profile" button to make changes to your personal information, contact details,
            or profile picture.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-2">
          <AccordionTrigger>How do I reset my password?</AccordionTrigger>
          <AccordionContent>
            If you've forgotten your password, click on the "Forgot Password" link on the login page. Enter the email
            address associated with your account, and we'll send you instructions to reset your password.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-3">
          <AccordionTrigger>How do I register for events?</AccordionTrigger>
          <AccordionContent>
            To register for events, go to the Events section in your dashboard. Browse the list of upcoming events,
            click on the event you're interested in, and then click the "Register" button. You'll receive a confirmation
            email with details about the event.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-4">
          <AccordionTrigger>How do I update my membership level?</AccordionTrigger>
          <AccordionContent>
            To update your membership level, go to the Membership section in your dashboard. Click on "Upgrade
            Membership" and follow the instructions to select a new membership level and complete the payment process.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-5">
          <AccordionTrigger>How do I access membership resources?</AccordionTrigger>
          <AccordionContent>
            Membership resources are available in the Resources section of your dashboard. You can browse different
            categories of resources, download documents, watch videos, and access other materials based on your
            membership level.
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <div className="bg-[#171717] p-6 rounded-lg border border-green-200">
        <h2 className="text-xl font-bold mb-2 text-[#fdd65b]">Still Need Help?</h2>
        <p className="mb-4 text-white">Our support team is here to assist you with any questions or issues you may have.</p>
        <div className="flex flex-wrap gap-4">
          <Link href="/dashboard/contact" className="bg-[#fdd65b] text-black px-4 py-2 rounded hover:bg-green-700">
            Contact Support
          </Link>
          <Link
            href="/dashboard/faq"
            className="bg-transparent border-2 border-white text-white px-4 py-2 rounded hover:bg-green-50"
          >
            View All FAQs
          </Link>
        </div>
      </div>
    </div>
  )
}
