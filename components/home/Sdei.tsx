'use client';

import Image from 'next/image';

export default function SDEIRoadmap() {
  return (
    <div className="flex flex-col-reverse md:flex-row bg-[#171717] text-[#8C8C8C] min-h-screen mb-[5rem] z-10">
      <div className="w-full md:w-[66.33%] pt-0 pb-8 pl-0 pr-0 md:pt-[90px] md:pb-[90px] md:pl-[90px] md:pr-0 text-center md:text-left">
        <h1 className="text-3xl md:text-5xl font-extrabold mb-4 md:mb-8 text-white">SDEI Implementation Roadmap</h1>
        <div className="h-1 md:h-2 w-12 md:w-16 bg-[#FDD65B] mb-4 md:mb-9 mx-auto sm:mx-0"></div>
        <div className="space-y-4 md:space-y-6">
          <div>
            <h2 className="text-lg md:text-xl text-[#FDD65B] mb-1 md:mb-2">Phase 1: Foundation</h2>
            <div className="flex items-center gap-6 md:gap-8">
              <svg className="hidden md:block w-8 md:w-10 h-8 md:h-10 text-[#FDD65B]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.285 2l-11.285 11.567-5.286-5.011-3.714 3.716 9 8.728 15-15.285z" />
              </svg>
              <ul className="list-disc list-outside md:list-inside text-base md:text-xl space-y-2 md:space-y-3 pl-6 md:pl-0">
                <li>Establish a cross-functional team to lead the implementation</li>
                <li>Conduct a stakeholder analysis to identify key influencers</li>
                <li>Develop a comprehensive communication plan</li>
                <li>Define core values, principles, and KPIs</li>
                <li>Create a detailed project timeline and milestones</li>
              </ul>
            </div>
          </div>
          <div>
            <h2 className="text-lg md:text-xl text-[#FDD65B] mb-1 md:mb-2">Phase 2: Awareness and Engagement</h2>
            <div className="flex items-center gap-6 md:gap-8">
              <svg className="hidden md:block w-8 md:w-10 h-8 md:h-10 text-[#FDD65B]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.285 2l-11.285 11.567-5.286-5.011-3.714 3.716 9 8.728 15-15.285z" />
              </svg>
              <ul className="list-disc list-outside md:list-inside text-base md:text-xl space-y-2 md:space-y-3 pl-6 md:pl-0">
                <li>Launch an organization-wide communication campaign</li>
                <li>Host town hall meetings, workshops, or training sessions</li>
                <li>Share success stories and testimonials</li>
                <li>Encourage employee ambassadors to champion values</li>
                <li>Develop interactive content (videos, quizzes, gamification)</li>
              </ul>
            </div>
          </div>
          <div>
            <h2 className="text-lg md:text-xl text-[#FDD65B] mb-1 md:mb-2">Phase 3: Integration</h2>
            <div className="flex items-center gap-6 md:gap-8">
              <svg className="hidden md:block w-8 md:w-10 h-8 md:h-10 text-[#FDD65B]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.285 2l-11.285 11.567-5.286-5.011-3.714 3.716 9 8.728 15-15.285z" />
              </svg>
              <ul className="list-disc list-outside md:list-inside text-base md:text-xl space-y-2 md:space-y-3 pl-6 md:pl-0">
                <li>Incorporate values into performance management</li>
                <li>Align policies, procedures, and processes</li>
                <li>Develop training programs for leaders and employees</li>
                <li>Establish a recognition and reward system</li>
                <li>Conduct regular feedback sessions</li>
              </ul>
            </div>
          </div>
          <div>
            <h2 className="text-lg md:text-xl text-[#FDD65B] mb-1 md:mb-2">Phase 4: Embedding</h2>
            <div className="flex items-center gap-6 md:gap-8">
              <svg className="hidden md:block w-8 md:w-10 h-8 md:h-10 text-[#FDD65B]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.285 2l-11.285 11.567-5.286-5.011-3.714 3.716 9 8.728 15-15.285z" />
              </svg>
              <ul className="list-disc list-outside md:list-inside text-base md:text-xl space-y-2 md:space-y-3 pl-6 md:pl-0">
                <li>Monitor progress through KPIs and feedback</li>
                <li>Continuously communicate successes and challenges</li>
                <li>Celebrate milestones and achievements</li>
                <li>Identify and address gaps or resistances</li>
                <li>Review and refine values and principles</li>
              </ul>
            </div>
          </div>
          <div className="flex space-x-4 mt-4 md:mt-6">
            <button className="bg-[#FDD65B] w-[200px] h-[70px] text-[black] font-bold hover:bg-[#469620] hover:text-white transition-all duration 200 ease-in px-3 py-2 md:px-4 md:py-2 rounded text-xl md:text-base">JOIN US!</button>
            <button className="bg-transparent w-[200px] h-[70px] text-[white] font-bold hover:bg-[#469620] px-3 py-1 transition-all duration 200 ease-in hover:border-[#469620] md:px-4 md:py-2 rounded border-4 border-white text-sm md:text-base">LEARN MORE</button>
          </div>
        </div>
      </div>
      <div className="w-full md:w-[33.67%] bg-gray-800">
        <Image src="/mockup.jpg" alt="Hands" className="w-full h-[300px] md:h-full object-cover" width={500} height={500} />
      </div>
    </div>
  );
}