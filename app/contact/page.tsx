import type React from "react"
import type { Metadata } from "next"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { MapPin, Phone, Mail, Clock } from "lucide-react"

export const metadata: Metadata = {
  title: "Contact Us | Destiny Builders",
  description: "Get in touch with Destiny Builders Empowerment Foundation",
}

export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold mb-4">Contact Us</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Have questions or want to get involved? We'd love to hear from you. Reach out to us using the contact form
            or through our contact information below.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <ContactInfoCard
            icon={<MapPin className="h-6 w-6 text-green-700" />}
            title="Our Location"
            details={["123 Main Street", "Lagos, Nigeria"]}
          />
          <ContactInfoCard
            icon={<Phone className="h-6 w-6 text-green-700" />}
            title="Phone & Email"
            details={["+234 123 456 7890", "info@destinybuilders.africa"]}
          />
          <ContactInfoCard
            icon={<Clock className="h-6 w-6 text-green-700" />}
            title="Office Hours"
            details={["Monday-Friday: 9am - 5pm", "Saturday: 10am - 2pm"]}
          />
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden p-8">
            <h2 className="text-2xl font-bold mb-6">Send Us a Message</h2>
            <form className="space-y-4">
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
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input id="subject" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea id="message" rows={5} required />
              </div>
              <Button type="submit" className="w-full bg-green-600 hover:bg-green-700">
                Send Message
              </Button>
            </form>
          </div>

          <div>
            <div className="bg-green-50 rounded-xl border border-green-100 overflow-hidden p-8 mb-8">
              <h2 className="text-2xl font-bold mb-4">Continental Offices</h2>
              <p className="text-gray-600 mb-6">
                Destiny Builders has a presence across Africa. Contact our continental offices for region-specific
                inquiries.
              </p>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="bg-green-100 p-1 rounded-full mr-3 mt-1">
                    <MapPin className="h-4 w-4 text-green-700" />
                  </div>
                  <div>
                    <h3 className="font-bold">West Africa</h3>
                    <p className="text-sm text-gray-600">
                      Lagos, Nigeria
                      <br />
                      westafrica@destinybuilders.africa
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-green-100 p-1 rounded-full mr-3 mt-1">
                    <MapPin className="h-4 w-4 text-green-700" />
                  </div>
                  <div>
                    <h3 className="font-bold">East Africa</h3>
                    <p className="text-sm text-gray-600">
                      Nairobi, Kenya
                      <br />
                      eastafrica@destinybuilders.africa
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-green-100 p-1 rounded-full mr-3 mt-1">
                    <MapPin className="h-4 w-4 text-green-700" />
                  </div>
                  <div>
                    <h3 className="font-bold">Southern Africa</h3>
                    <p className="text-sm text-gray-600">
                      Johannesburg, South Africa
                      <br />
                      southernafrica@destinybuilders.africa
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden p-8">
              <h2 className="text-2xl font-bold mb-4">Media Inquiries</h2>
              <p className="text-gray-600 mb-4">
                For media inquiries, interviews, or press information, please contact our communications team.
              </p>
              <div className="flex items-center mb-6">
                <Mail className="h-5 w-5 text-green-700 mr-2" />
                <span>media@destinybuilders.africa</span>
              </div>
              <Button variant="outline" className="w-full">
                Download Press Kit
              </Button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="aspect-video w-full">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d253682.45932537!2d3.1191195!3d6.5483!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x103b8b2ae68280c1%3A0xdc9e87a367c3d9cb!2sLagos%2C%20Nigeria!5e0!3m2!1sen!2sus!4v1650000000000!5m2!1sen!2sus"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Destiny Builders Location"
            ></iframe>
          </div>
        </div>
      </div>
    </div>
  )
}

function ContactInfoCard({
  icon,
  title,
  details,
}: {
  icon: React.ReactNode
  title: string
  details: string[]
}) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 text-center">
      <div className="bg-green-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <div className="text-gray-600">
        {details.map((detail, index) => (
          <p key={index}>{detail}</p>
        ))}
      </div>
    </div>
  )
}
