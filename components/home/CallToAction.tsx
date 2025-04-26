import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function CallToAction() {
  return (
    <section className="py-16 bg-green-700 text-white">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">Join Us in Building African Destinies</h2>
        <p className="text-green-100 max-w-2xl mx-auto mb-8">
          Whether you want to become a member, volunteer your time, or support our work financially, there are many ways
          to get involved with Destiny Builders.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg" className="bg-white text-green-700 hover:bg-gray-100">
            <Link href="/membership/join">Become a Member</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-green-600">
            <Link href="/donate">Make a Donation</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-green-600">
            <Link href="/membership/volunteer">Volunteer With Us</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
