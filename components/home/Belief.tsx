import Image from "next/image";

const beliefs = [
  {
    id: 1,
    title: "Core Values",
    image: "/core-values.jpg",
    background: "bg-yellow-500",
    textColor: "text-[#171717]",
    listItems: [
      "Integrity: Ethical and transparent decision-making",
      "Respect: Valuing diversity, inclusivity, and individual perspectives",
      "Excellence: Striving for exceptional quality and performance",
      "Accountability: Taking responsibility for actions and outcomes",
      "Teamwork: Collaborative and supportive work environment",
      "Innovation: Embracing creativity and continuous improvement",
      "Customer Focus: Prioritizing customer satisfaction and needs",
      "Adaptability: Embracing change and resilience",
    ],
  },
  {
    id: 2,
    title: "Operating Principles",
    image: "/operating-principles.jpg",
    background: "bg-white",
    textColor: "text-gray-800",
    listItems: [
      "Clear Communication: Open, honest, and timely information sharing",
      "Strategic Planning: Aligning goals, objectives, and resources",
      "Continuous Learning: Encouraging growth and development",
      "Accountability: Taking responsibility for actions and outcomes",
      "Efficient Processes: Streamlining operations and minimizing waste",
      "Data-Driven Decision-Making: Using metrics to inform choices",
    ],
  },
  {
    id: 3,
    title: "Financial Principles",
    image: "/fiancial.jpg",
    background: "bg-green-500",
    textColor: "text-black",
    listItems: [
      "Fiscal Discipline: Managing resources responsibly",
      "Long-Term Focus: Prioritizing sustainable growth",
      "Investment in Innovation: Fueling growth and competitiveness",
      "Transparency: Clear financial reporting",
      "Efficient Processes: Streamlining operations and minimizing waste",
      "Risk Management: Mitigating potential threats",
    ],
  },
];

export default function Belief() {
  return (
    <section className="py-[120px] bg-[#469620]">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center text-center mb-10 px-4 gap-5">
          <h1 className="text-white text-3xl md:text-5xl font-bold mb-4">Our Core Beliefs</h1>
          <div className="h-2 w-16 bg-[#FDD65B] mb-2"></div>
          <p className="text-white max-w-2xl mx-auto md:text-2xl mb-10">
            Our organization truly believes that by working together, we can empower more lives than ever before.
          </p>
        </div>

        <div className="w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-[3.5rem]">
            {beliefs?.map((belief) => (
              <div
                key={belief.id}
                className={`group rounded-lg shadow-lg overflow-hidden transition-all duration-300 hover:-translate-y-4 cursor-pointer ${belief.background}`}
              >
                <div className="relative w-full aspect-video">
                  <Image
                    src={belief.image}
                    alt={belief.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                </div>
                <div className="p-6 bg-white h-full">
                  <h2 className={`text-3xl font-bold mb-4 ${belief.textColor} group-hover:text-green-600 transition-colors duration-300`}>
                    {belief.title}
                  </h2>
                  <ul className={`list-disc pl-5 space-y-2 ${belief.textColor}`}>
                    {belief.listItems?.map((item, index) => (
                      <li key={index} className="text-left text-[#5c5c5c] text-[17px]">
                        <span className="font-semibold text-[#5c5c5c]">{item.split(":")[0]}:</span>
                        {item.split(":")[1]}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}