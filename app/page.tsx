import Hero from "@/components/home/Hero"
import MissionVision from "@/components/home/MissionVision"
import FocusAreas from "@/components/home/FocusAreas"
import LatestProjects from "@/components/home/LatestProjects"
import Testimonials from "@/components/home/Testimonials"
import CallToAction from "@/components/home/CallToAction"
import Belief from "@/components/home/Belief"
import Commitment from "@/components/home/Commitment"
import Mockup from "@/components/home/ Mockup"
import Sdei from "@/components/home/Sdei"
import MeetOurTeam from "@/components/home/MeetOurTeam"
import Partners from "@/components/home/Partners"


export default function Home() {
  return (
    <div className="flex flex-col w-full">
      <Hero />
      <MissionVision />
      <FocusAreas />
      <LatestProjects />
      <Belief/>
      <Commitment/>
      <Testimonials />
      <Sdei/>
      <MeetOurTeam/>
      <Partners/>
      <CallToAction />
    </div>
  )
}
