import Image from "next/image";

const commitments = [
  {
    id: 1,
    number: "01",
    title: "Transparency",
    desc: "We are dedicated to transparency in our operations and finances, ensuring that our partners can trust that their contributions are making a genuine impact.",
  },
  {
    id: 2,
    number: "02",
    title: "Collaboration",
    desc: "Collaboration is at the heart of our mission. We actively seek partnerships with like-minded organizations, governments, and individuals to amplify our collective impact and address complex challenges.",
  },
  {
    id: 3,
    number: "03",
    title: "Innovation",
    desc: "Embracing innovation allows us to find creative and effective solutions to evolving issues. We continually explore new approaches to maximize the reach and effectiveness of our programs.",
  },
];

export default function Commitment() {
  return (
    <section className="bg-[#469620] mb-10">
      <div className="w-full">
        <div className="flex flex-col lg:flex-row w-full">
          {/* Image Section */}
          <div className="w-full lg:w-1/2">
            <div className="relative w-full aspect-square lg:aspect-auto lg:h-[44.73em]">
              <Image
                src="/greenpeace.jpg"
                alt="Commitment Image"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 50vw"
                priority
              />
            </div>
          </div>
          
          {/* Content Section - Added lg:pb-0 here */}
          <div className="w-full lg:w-1/2 bg-[#171717] text-white p-8 lg:p-20 lg:pb-0 h-fit">
            <div className="text-center sm:text-left">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">Our Commitment</h1>
              <div className="h-2 w-16 bg-[#FDD65B] mb-9 mx-auto sm:mx-0"></div>
            </div>
            
            {commitments?.map((commitment) => (
              <div key={commitment.id} className="mb-6 flex flex-col items-center sm:items-start sm:flex-row gap-4 sm:gap-10 text-center sm:text-left">
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#FDD65B]">{commitment.number}</h2>
                <div>
                  <p className="text-lg sm:text-xl font-semibold">{commitment.title}</p>
                  <p className="mt-2 text-[#8C8C8C]">{commitment.desc}</p>
                </div>
              </div>
            ))}
            
            {/* Get Involved Button */}
            <div className="mt-8 -mx-8 lg:-mx-20">
              <a
                href="#"
                className="block bg-[#FDD65B] text-[#1A2526] font-extrabold py-5 lg:py-7 w-full uppercase text-center hover:bg-[#469620] hover:text-white text-xl lg:text-2xl relative overflow-hidden group transition-all duration-300 hover:border-b-4 hover:border-b-[#1A2526]"
              >
                <span className="relative z-10">Get Involved</span>
                <span 
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                ></span>
              </a>
            </div>
          </div>
        </div>
      </div>
      
      {/* Membership Registration Section */}
      <div className="py-8 lg:py-12 bg-[#469620] px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl font-bold text-white text-center">
            Online Membership Registration Ongoing!!
          </h2>
          <div className="h-2 w-16 bg-[#FDD65B] mt-4 mx-auto"></div>
        </div>
      </div>
    </section>
  );
}