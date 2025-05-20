import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Quote } from "lucide-react"

const testimonials = [
  {
    id: 1,
    quote:
      "The leadership training I received from Destiny Builders transformed my approach to community service. I'm now leading initiatives that are making real change.",
    name: "Sarah Okafor",
    role: "Community Leader",
    image: "https://plus.unsplash.com/premium_photo-1705969326472-e5646839d876?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8U2FyYWglMjBPa2Fmb3J8ZW58MHwwfDB8fHww",
  },
  {
    id: 2,
    quote:
      "Thanks to the digital skills program, I was able to start my own web design business. Now I'm employing other youth in my community.",
    name: "Emmanuel Adeyemi",
    role: "Entrepreneur",
    image: "https://plus.unsplash.com/premium_photo-1680278103253-7e96e8e0da7d?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8RW1tYW51ZWx8ZW58MHwwfDB8fHww",
  },
  {
    id: 3,
    quote:
      "The agricultural training provided by Destiny Builders has helped our cooperative increase crop yields by 40%. This has changed our economic situation completely.",
    name: "Grace Mwangi",
    role: "Farmer",
    image: "https://images.unsplash.com/photo-1530278794942-f0341459d812?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8R3JhY2UlMjBNd2FuZ2l8ZW58MHwwfDB8fHww",
  },
]

export default function Testimonials() {
  return (
    <section className="py-16 bg-gray-50 md:h-full">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">What People Say</h2>
          <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
            Hear from individuals whose lives have been transformed through our programs
          </p>
          <div className="mt-2 h-1 w-20 bg-green-600 mx-auto"></div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {testimonials?.map((testimonial) => (
            <Card key={testimonial.id} className="bg-white">
              <CardContent className="p-6">
                <Quote className="h-8 w-8 text-green-600 mb-4" />
                <p className="text-gray-700 mb-6 italic">"{testimonial.quote}"</p>
                <div className="flex items-center">
                  <div className="relative h-12 w-12 rounded-full overflow-hidden mr-4">
                    <Image
                      src={testimonial.image || "/placeholder.svg"}
                      alt={testimonial.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">{testimonial.name}</h4>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
