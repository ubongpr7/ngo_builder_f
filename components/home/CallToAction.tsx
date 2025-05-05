import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function CallToAction() {
  return (
    <section className="py-20 bg-[#469620] text-white mt-[5rem]">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-[28px] lg:text-[56px] lg:leading-[64px] font-bold mb-6">
          Join Us <br className="hidden lg:inline" />
          in Building African Destinies
        </h2>
        <div className="border-t-[12px] border-[#fdd65b] h-0 w-[55px] mx-auto my-4"></div>
        <p className="text-white max-w-2xl mx-auto mb-8">
          Whether you want to become a member, volunteer your time, or support our work financially, there are many ways
          to get involved with Destiny Builders.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg" className="bg-white text-green-700 hover:bg-green-600 hover:text-white">
            <Link href="/membership/join">Become a Member</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="border-white bg-green-400 text-gray-900 hover:text-white hover:bg-green-600">
            <Link href="/donate">Make a Donation</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="border-white text-gray-900 bg-green-400 hover:text-white hover:bg-green-600">
            <Link href="/membership/volunteer">Volunteer With Us</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
