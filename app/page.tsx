import Hero from "@/components/home/Hero"
import MissionVision from "@/components/home/MissionVision"
import FocusAreas from "@/components/home/FocusAreas"
import LatestProjects from "@/components/home/LatestProjects"
import Testimonials from "@/components/home/Testimonials"
import CallToAction from "@/components/home/CallToAction"

export default function Home() {
  return (
    <div className="flex flex-col w-full">
      <Hero />
      <MissionVision />
      <FocusAreas />
      <LatestProjects />
      <Testimonials />
      <CallToAction />
    </div>
  )
}
