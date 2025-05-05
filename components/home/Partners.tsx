'use client';

import Image from 'next/image';

export default function Partners() {
    return (
        <div className="bg-[#f9f9f9] py-20">
            <h1 className="text-4xl md:text-5xl font-extrabold text-black text-center mb-8">Our Trusted Partners</h1>
            <div className="h-2 w-16 bg-[#FDD65B] mb-12 mx-auto"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-16 max-w-7xl mx-auto px-0 ">
                {/* Partner 1 */}
                <div className="flex justify-center items-center bg-[#f9f9f9] p-4">
                    <Image src="/partner-1.svg" alt="International Volunteers Day" className="h-24 w-auto object-contain " width={200} height={100} />
                </div>
                {/* Partner 2 */}
                <div className="flex justify-center items-center">
                    <Image src="/partner-2.svg" alt="Community" className="h-24 w-auto object-contain" width={200} height={100} />
                </div>
                {/* Partner 3 */}
                <div className="flex justify-center items-center">
                    <Image src="/partner-3.svg" alt="Charity Hand" className="h-24 w-auto object-contain" width={200} height={100} />
                </div>
                {/* Partner 4 */}
                <div className="flex justify-center items-center">
                    <Image src="/partner-4.svg" alt="Creative Design" className="h-24 w-auto object-contain" width={200} height={100} />
                </div>
            </div>
        </div>
    );
}