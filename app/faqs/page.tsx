import Link from "next/link"
import type { Metadata } from "next"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export const metadata: Metadata = {
  title: "FAQs | Destiny Builders",
  description: "Frequently asked questions about Destiny Builders Empowerment Foundation",
}

export default function FAQsPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Frequently Asked Questions</h1>

        <div className="prose max-w-none mb-8">
          <p className="text-lg">
            Find answers to common questions about Destiny Builders Empowerment Foundation, our programs, membership,
            and how you can get involved.
          </p>
        </div>

        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">About Destiny Builders</h2>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>What is Destiny Builders Empowerment Foundation?</AccordionTrigger>
              <AccordionContent>
                Destiny Builders Empowerment Foundation is a pan-African non-profit organization dedicated to empowering
                individuals and communities to unlock their full potential. We provide resources, support, and guidance
                for personal, professional, and community development across Africa.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>What is the history of Destiny Builders?</AccordionTrigger>
              <AccordionContent>
                Destiny Builders emerged from the legacy of the Self Developers Empowerment Initiative (SDEI), which
                operated in Nigeria for over a decade. In 2022, we evolved into Destiny Builders Empowerment Foundation
                with an expanded vision to reach all of Africa. Our organization has a rich history of community
                development, leadership training, and empowerment programs.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>Where does Destiny Builders operate?</AccordionTrigger>
              <AccordionContent>
                Destiny Builders currently operates in multiple African countries, with a structured presence in
                Nigeria, Ghana, Kenya, South Africa, and several other nations. Our goal is to establish a presence in
                all 54 African countries through our continental organizational structure.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-4">
              <AccordionTrigger>How is Destiny Builders funded?</AccordionTrigger>
              <AccordionContent>
                Destiny Builders is funded through a combination of membership dues, donations from individuals and
                organizations, grants from foundations and development agencies, and strategic partnerships. We maintain
                transparent financial practices and publish regular reports on our financial activities.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Programs and Activities</h2>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-5">
              <AccordionTrigger>What types of programs does Destiny Builders offer?</AccordionTrigger>
              <AccordionContent>
                Destiny Builders offers a wide range of programs across our strategic focus areas, including leadership
                development, digital literacy and entrepreneurship, community development, health and social well-being,
                education for the underserved, women and girls empowerment, and more. Our programs are designed to
                address the specific needs and opportunities in each community we serve.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-6">
              <AccordionTrigger>How can my community benefit from Destiny Builders' programs?</AccordionTrigger>
              <AccordionContent>
                Communities can benefit from our programs by connecting with the Destiny Builders representative in
                their area or by contacting our national office. We work closely with community leaders to assess needs
                and develop appropriate interventions. You can also apply for specific programs through our website or
                contact us directly to discuss potential collaborations.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-7">
              <AccordionTrigger>Does Destiny Builders provide financial support or grants?</AccordionTrigger>
              <AccordionContent>
                While our primary focus is on capacity building and skills development, some of our programs do include
                financial components such as microloans for entrepreneurs, seed funding for community projects, and
                scholarships for education. These financial supports are typically part of comprehensive programs rather
                than standalone grants.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Membership</h2>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-8">
              <AccordionTrigger>How can I become a member of Destiny Builders?</AccordionTrigger>
              <AccordionContent>
                You can become a member by registering through our Membership Portal on the website. The registration
                process includes providing your personal information, selecting your membership tier, and paying the
                applicable membership dues. Once registered, you will receive a unique membership code and access to
                member resources and opportunities.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-9">
              <AccordionTrigger>What are the different membership tiers?</AccordionTrigger>
              <AccordionContent>
                Destiny Builders offers several membership tiers, including General Members, Executives, Partnering
                CEOs, Volunteers, and Strategic Partners. Each tier has different responsibilities, benefits, and
                contribution levels. Details about each tier are available on our Membership page.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-10">
              <AccordionTrigger>What benefits do members receive?</AccordionTrigger>
              <AccordionContent>
                Members receive various benefits depending on their membership tier, including access to exclusive
                resources and training materials, networking opportunities with other members, participation in special
                events and programs, leadership and volunteer opportunities, and the ability to contribute to and
                influence the organization's activities and direction.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Getting Involved</h2>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-11">
              <AccordionTrigger>How can I volunteer with Destiny Builders?</AccordionTrigger>
              <AccordionContent>
                You can volunteer by registering as a volunteer member through our Membership Portal. We offer various
                volunteer opportunities based on your skills, interests, and availability. Volunteers can contribute to
                program implementation, event organization, administrative support, and more.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-12">
              <AccordionTrigger>Can organizations partner with Destiny Builders?</AccordionTrigger>
              <AccordionContent>
                Yes, we welcome partnerships with organizations that share our vision and values. Organizations can
                partner with us as Strategic Partners, providing financial or in-kind support, or as Implementation
                Partners, collaborating on specific programs or initiatives. Contact our Partnerships team to discuss
                potential collaboration opportunities.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-13">
              <AccordionTrigger>How can I donate to support Destiny Builders' work?</AccordionTrigger>
              <AccordionContent>
                You can make donations through our website's Donate page, which accepts various payment methods. We
                accept one-time and recurring donations, as well as targeted donations for specific programs or
                initiatives. All donations are used in accordance with our financial policies and are reported
                transparently.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        <div className="bg-green-50 p-8 rounded-xl border border-green-100">
          <h2 className="text-2xl font-bold mb-4">Still Have Questions?</h2>
          <p className="mb-6">
            If you couldn't find the answer to your question, please feel free to contact us directly. Our team is ready
            to assist you with any inquiries about Destiny Builders, our programs, or how you can get involved.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button asChild className="bg-green-600 hover:bg-green-700">
              <Link href="/contact">Contact Us</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/membership/join">Join Destiny Builders</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
