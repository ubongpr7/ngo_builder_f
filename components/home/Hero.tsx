"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import clsx from "clsx"

const images = [
  "https://sdeinigeria.org/wp-content/uploads/2024/11/SDEI-1-2.jpg",
  "https://sdeinigeria.org/wp-content/uploads/2024/11/SDEI-4.jpg",
  "https://sdeinigeria.org/wp-content/uploads/2024/11/SDEI-2-1.jpg",
  "https://sdeinigeria.org/wp-content/uploads/2024/11/SDEI-5.jpg",
]

export default function Hero() {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative lg:h-screen overflow-hidden">
      {/* Image layers */}
      {images.map((img, index) => (
        <div
          key={index}
          className={clsx(
            "absolute inset-0 bg-center bg-cover transition-opacity duration-1000 ease-in-out scale-100",
            {
              "opacity-0": index !== current,
              "opacity-100 scale-110": index === current,
            }
          )}
          style={{ backgroundImage: `url(${img})`, transition: 'transform 7s ease-in-out, opacity 0.25s ease' }}
        >
          <div className="absolute inset-0 bg-black/40" />
        </div>
      ))}

      {/* Foreground content */}
      <div className="relative z-10 container mx-auto px-4 py-16 md:py-24 lg:py-32">
        <div className="max-w-3xl space-y-6 text-white">
          <div className="inline-block bg-green-100 text-green-800 px-4 py-1 rounded-full text-sm font-medium">
            DESTINY BUILDERS EMPOWERMENT FOUNDATION
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight">
            Building African Destinies, Transforming Lives
          </h1>
          <p className="text-xl max-w-2xl">
            Providing resources, support, and guidance to individuals and communities seeking control over their
            personal, professional, and community development.
          </p>
          <div className="flex flex-wrap gap-4 pt-4">
            <Button asChild size="lg" className="bg-green-600 hover:bg-green-700 text-white lg:text-[20px]">
              <Link href="/membership/join">Join Our Community</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="text-white border-white hover:bg-white hover:text-green-700 lg:text-[20px]"
            >
              <Link href="/about">Learn More</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
