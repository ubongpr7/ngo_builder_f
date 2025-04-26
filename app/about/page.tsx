import type { Metadata } from "next"
import Image from "next/image"

export const metadata: Metadata = {
  title: "About Us | Destiny Builders",
  description: "Learn about Destiny Builders Empowerment Foundation and our mission",
}

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">About Destiny Builders</h1>

        <div className="prose max-w-none">
          <p className="text-lg mb-6">
            Emerging from the impactful legacy of the Self Developers Empowerment Initiative (SDEI), the Destiny
            Builders Empowerment Foundation (DESTINY BUILDERS) represents a bold, pan-African evolution of the same
            divine vision. With over a decade of impact across Nigeria, DESTINY BUILDERS now scales this vision to reach
            the entirety of Africa and beyond.
          </p>

          <div className="my-8 relative h-80 rounded-xl overflow-hidden">
            <Image src="/about-image.jpg" alt="Destiny Builders team members" fill className="object-cover" />
          </div>

          <h2 className="text-2xl font-bold mt-8 mb-4">Our Story</h2>
          <p className="mb-4">
            Destiny Builders Empowerment Foundation was founded with a clear purpose: to empower individuals and
            communities to unlock their full potential. Our journey began with small community initiatives in Nigeria,
            focusing on education and skills development.
          </p>
          <p className="mb-4">
            Over the years, we have expanded our reach and impact, developing comprehensive programs that address the
            diverse needs of communities across Africa. From leadership development to digital literacy, from health
            initiatives to women empowerment, our work spans multiple domains to ensure holistic development.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">Our Approach</h2>
          <p className="mb-4">
            At Destiny Builders, we believe in a community-centered approach to development. We work closely with local
            leaders and stakeholders to understand the unique challenges and opportunities in each community. This
            collaborative approach ensures that our programs are relevant, effective, and sustainable.
          </p>
          <p className="mb-4">
            We are committed to transparency, accountability, and excellence in all our operations. Our work is guided
            by our core values and a deep commitment to making a positive impact in the lives of individuals and
            communities across Africa.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">Our Impact</h2>
          <p className="mb-4">Since our inception, Destiny Builders has:</p>
          <ul className="list-disc pl-6 mb-6">
            <li>Trained over 10,000 youth in digital skills</li>
            <li>Supported 500+ women entrepreneurs</li>
            <li>Implemented community development projects in 20+ communities</li>
            <li>Provided health education and services to 5,000+ individuals</li>
            <li>Developed leadership capacity in 1,000+ community leaders</li>
          </ul>

          <p>
            We continue to expand our reach and deepen our impact, working towards our vision of empowered individuals
            and transformed communities across Africa.
          </p>
        </div>
      </div>
    </div>
  )
}
