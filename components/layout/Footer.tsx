import type React from "react"
import Link from "next/link"
import Image from "next/image"
import { Facebook, Twitter, Instagram, Linkedin, Mail, MapPin, Phone } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-[#040b13] text-white mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Logo and About */}
          <div className="space-y-4 text-center sm:text-left">
            <Link href="/" className="flex items-center justify-center sm:justify-start space-x-2">
              <Image
                src="/logo.jpg"
                alt="Destiny Builders Logo"
                width={50}
                height={50}
                className="h-10 w-auto invert"
              />
              <span className="font-bold text-xl">destinybuilders</span>
            </Link>
            <p className="text-green-100 text-sm">
              Building African Destinies, Transforming Lives. Providing resources, support, and guidance to individuals
              and communities seeking control over their personal, professional, and community development.
            </p>
            <div className="flex justify-center sm:justify-start space-x-4">
              <SocialLink href="https://facebook.com" icon={<Facebook size={18} />} />
              <SocialLink href="https://twitter.com" icon={<Twitter size={18} />} />
              <SocialLink href="https://instagram.com" icon={<Instagram size={18} />} />
              <SocialLink href="https://linkedin.com" icon={<Linkedin size={18} />} />
            </div>
          </div>

          {/* Quick Links */}
          <div className="text-center sm:text-left">
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <FooterLink href="/about" text="About Us" />
              <FooterLink href="/programs" text="Our Programs" />
              <FooterLink href="/membership/join" text="Join Us" />
              <FooterLink href="/donate" text="Donate" />
              <FooterLink href="/blog" text="Blog" />
              <FooterLink href="/contact" text="Contact Us" />
              <FooterLink href="/contact" text="Contact Us" />
              <FooterLink href="/dashboard/terms" text="Terms & Conditions" />
              <FooterLink href="/dashboard/policy" text="Privacy & Policies" />
            </ul>
          </div>

          {/* Focus Areas */}
          <div className="text-center sm:text-left">
            <h3 className="text-lg font-semibold mb-4">Focus Areas</h3>
            <ul className="space-y-2">
              <FooterLink href="/focus/leadership" text="Leadership Development" />
              <FooterLink href="/focus/digital" text="Digital Literacy" />
              <FooterLink href="/focus/community" text="Community Development" />
              <FooterLink href="/focus/health" text="Health & Well-being" />
              <FooterLink href="/focus/education" text="Education" />
              <FooterLink href="/focus/women" text="Women Empowerment" />
            </ul>
          </div>

          {/* Contact Info */}
          <div className="text-center sm:text-left">
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-start justify-center sm:justify-start">
                <MapPin className="mr-2 h-5 w-5 text-green-300 flex-shrink-0 mt-0.5" />
                <span>123 Main Street, Lagos, Nigeria</span>
              </li>
              <li className="flex items-center justify-center sm:justify-start">
                <Phone className="mr-2 h-5 w-5 text-green-300 flex-shrink-0" />
                <span>+234 123 456 7890</span>
              </li>
              <li className="flex items-center justify-center sm:justify-start">
                <Mail className="mr-2 h-5 w-5 text-green-300 flex-shrink-0" />
                <span className="text-blue-500">info@destinybuilders.africa</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-green-700 mt-12 pt-8 text-center text-sm text-green-200">
          <p>© {new Date().getFullYear()} Destiny Builders Empowerment Foundation. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

function SocialLink({ href, icon }: { href: string; icon: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="bg-white p-2 rounded-full hover:bg-white transition-colors"
      target="_blank"
      rel="noopener noreferrer"
    >
      {icon}
    </Link>
  )
}

function FooterLink({ href, text }: { href: string; text: string }) {
  return (
    <li>
      <Link href={href} className="text-green-100 hover:text-[#469620] hover:underline transition-colors duration-100 ease-in-out">
        {text}
      </Link>
    </li>
  )
}