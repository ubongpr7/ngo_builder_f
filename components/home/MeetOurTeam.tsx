'use client';

import Image from 'next/image';

// Note: Ensure Font Awesome CDN is included in your app's layout or head:
// <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" integrity="sha512-DTOQO9RWCH3ppGqcWaEA1BIZOC6xxalwEsw9c2QQeAIftl+Vegovlnee1c9QX4TctnWMn13TZye+giMm8e2Lw==" crossorigin="anonymous" referrerpolicy="no-referrer" />

export default function MeetOurTeam() {
    return (
        <div className="bg-[#171717] py-12 pb-0">
            <h1 className="text-4xl md:text-5xl font-extrabold text-white text-center mb-8">Meet Our Team</h1>
            <div className="h-2 w-16 bg-[#FDD65B] mb-12 mx-auto"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto px-4">
                {/* Team Member 1 */}
                <div className="relative group">
                    <div className="bg-[#171717] text-white text-left">
                        <Image src="/president.jpg" alt="Mr Treasure Edwin Inyang" className="w-full  object-cover mb-4" width={400} height={400} />
                        <h3 className="text-xl font-semibold text-[#FDD65B] mb-1">Mr Treasure Edwin Inyang</h3>
                        <p className="text-gray-100 mb-4">President/CEO</p>
                    </div>
                    {/* Social Media Icons with Animation */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex space-x-4 opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:-translate-y-1/3">
                        <a href="https://www.facebook.com/" target='_blank' className="text-black bg-white rounded-full p-2 hover:text-green-600">
                            <i className="fab fa-facebook-f w-6 h-5 text-center leading-6"></i>
                        </a>
                        <a href="https://x.com/" target='_blank' className="text-black bg-white rounded-full p-2 hover:text-green-600">
                            <i className="fab fa-x-twitter w-6 h-5 text-center leading-6"></i>
                        </a>
                        <a href="https://www.instagram.com/" target='_blank' className="text-black bg-white rounded-full p-2 hover:text-green-600">
                            <i className="fab fa-instagram w-6 h-5 text-center leading-6"></i>
                        </a>
                    </div>
                </div>
                {/* Team Member 2 */}
                <div className="relative group">
                    <div className="bg-[#171717] text-white text-left">
                        <Image src="/secretary.jpg" alt="Dcns Iniobong Daniel Inyang" className="w-full  object-cover mb-4" width={400} height={400} />
                        <h3 className="text-xl font-semibold text-[#FDD65B] mb-1">Dcns Iniobong Daniel Inyang</h3>
                        <p className="text-gray-100 mb-4">Secretary General, BoT</p>
                    </div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex space-x-4 opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:-translate-y-1/3">
                        <a href="https://www.facebook.com/" target='_blank' className="text-black bg-white rounded-full p-2 hover:text-green-600">
                            <i className="fab fa-facebook-f w-6 h-5 text-center leading-6"></i>
                        </a>
                        <a href="https://x.com/" target='_blank' className="text-black bg-white rounded-full p-2 hover:text-green-600">
                            <i className="fab fa-x-twitter w-6 h-5 text-center leading-6"></i>
                        </a>
                        <a href="https://www.instagram.com/" target='_blank' className="text-black bg-white rounded-full p-2 hover:text-green-600">
                            <i className="fab fa-instagram w-6 h-5 text-center leading-6"></i>
                        </a>
                    </div>
                </div>
                {/* Team Member 3 */}
                <div className="relative group">
                    <div className="bg-[#171717] text-white text-left">
                        <Image src="/southeast.jpg" alt="Mrs Chikezie Augusta Akudo" className="w-full  object-cover mb-4" width={400} height={400} />
                        <h3 className="text-xl font-semibold text-[#FDD65B] mb-1">Mrs Chikezie Augusta Akudo</h3>
                        <p className="text-gray-100 mb-4">South East Regional Coordinator</p>
                    </div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex space-x-4 opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:-translate-y-1/3">
                        <a href="https://www.facebook.com/" target='_blank' className="text-black bg-white rounded-full p-2 hover:text-green-600">
                            <i className="fab fa-facebook-f w-6 h-5 text-center leading-6"></i>
                        </a>
                        <a href="https://x.com/" target='_blank' className="text-black bg-white rounded-full p-2 hover:text-green-600">
                            <i className="fab fa-x-twitter w-6 h-5 text-center leading-6"></i>
                        </a>
                        <a href="https://www.instagram.com/" target='_blank' className="text-black bg-white rounded-full p-2 hover:text-green-600">
                            <i className="fab fa-instagram w-6 h-5 text-center leading-6"></i>
                        </a>
                    </div>
                </div>
                {/* Team Member 4 */}
                <div className="relative group">
                    <div className="bg-[#171717] text-white text-left">
                        <Image src="/south-south.jpg" alt="Oluyemi Alaba Sunday" className="w-full  object-cover mb-4" width={400} height={400} />
                        <h3 className="text-xl font-semibold text-[#FDD65B] mb-1">Oluyemi Alaba Sunday</h3>
                        <p className="text-gray-100 mb-4">South West Regional Coordinator</p>
                    </div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex space-x-4 opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:-translate-y-1/3">
                        <a href="https://www.facebook.com/" target='_blank' className="text-black bg-white rounded-full p-2 hover:text-green-600">
                            <i className="fab fa-facebook-f w-6 h-5 text-center leading-6"></i>
                        </a>
                        <a href="https://x.com/" target='_blank' className="text-black bg-white rounded-full p-2 hover:text-green-600">
                            <i className="fab fa-x-twitter w-6 h-5 text-center leading-6"></i>
                        </a>
                        <a href="https://www.instagram.com/" target='_blank' className="text-black bg-white rounded-full p-2 hover:text-green-600">
                            <i className="fab fa-instagram w-6 h-5 text-center leading-6"></i>
                        </a>
                    </div>
                </div>
                {/* Team Member 5 */}
                <div className="relative group">
                    <div className="bg-[#171717] text-white text-left">
                        <Image src="/soth-west.jpg" alt="Comrade Attah James" className="w-full  object-cover mb-4" width={400} height={400} />
                        <h3 className="text-xl font-semibold text-[#FDD65B] mb-1">Comrade Attah James</h3>
                        <p className="text-gray-100 mb-4">North Central Regional Coordinator</p>
                    </div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex space-x-4 opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:-translate-y-1/3">
                        <a href="https://www.facebook.com/" target='_blank' className="text-black bg-white rounded-full p-2 hover:text-green-600">
                            <i className="fab fa-facebook-f w-6 h-5 text-center leading-6"></i>
                        </a>
                        <a href="https://x.com/" target='_blank' className="text-black bg-white rounded-full p-2 hover:text-green-600">
                            <i className="fab fa-x-twitter w-6 h-5 text-center leading-6"></i>
                        </a>
                        <a href="https://www.instagram.com/" target='_blank' className="text-black bg-white rounded-full p-2 hover:text-green-600">
                            <i className="fab fa-instagram w-6 h-5 text-center leading-6"></i>
                        </a>
                    </div>
                </div>
                {/* Team Member 6 */}
                <div className="relative group">
                    <div className="bg-[#171717] text-white text-left">
                        <Image src="/north-central.jpg" alt="Ekpe-Iko Kennedy" className="w-full  object-cover mb-4" width={400} height={400} />
                        <h3 className="text-xl font-semibold text-[#FDD65B] mb-1">Ekpe-Iko Kennedy</h3>
                        <p className="text-gray-100 mb-4">South South Regional Coordinator</p>
                    </div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex space-x-4 opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:-translate-y-1/3">
                        <a href="https://www.facebook.com/" target='_blank' className="text-black bg-white rounded-full p-2 hover:text-green-600">
                            <i className="fab fa-facebook-f w-6 h-5 text-center leading-6"></i>
                        </a>
                        <a href="https://x.com/" target='_blank' className="text-black bg-white rounded-full p-2 hover:text-green-600">
                            <i className="fab fa-x-twitter w-6 h-5 text-center leading-6"></i>
                        </a>
                        <a href="https://www.instagram.com/" target='_blank' className="text-black bg-white rounded-full p-2 hover:text-green-600">
                            <i className="fab fa-instagram w-6 h-5 text-center leading-6"></i>
                        </a>
                    </div>
                </div>
                {/* Team Member 7 */}
                <div className="relative group">
                    <div className="bg-[#171717] text-white text-left">
                        <Image src="/north-east-1.jpg" alt="Ibrahim Alhaji Musa" className="w-full  object-cover mb-4" width={400} height={400} />
                        <h3 className="text-xl font-semibold text-[#FDD65B] mb-1">Ibrahim Alhaji Musa</h3>
                        <p className="text-gray-100 mb-4">North East Regional Coordinator</p>
                    </div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex space-x-4 opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:-translate-y-1/3">
                        <a href="https://www.facebook.com/" target='_blank' className="text-black bg-white rounded-full p-2 hover:text-green-600">
                            <i className="fab fa-facebook-f w-6 h-5 text-center leading-6"></i>
                        </a>
                        <a href="https://x.com/" target='_blank' className="text-black bg-white rounded-full p-2 hover:text-green-600">
                            <i className="fab fa-x-twitter w-6 h-5 text-center leading-6"></i>
                        </a>
                        <a href="https://www.instagram.com/" target='_blank' className="text-black bg-white rounded-full p-2 hover:text-green-600">
                            <i className="fab fa-instagram w-6 h-5 text-center leading-6"></i>
                        </a>
                    </div>
                </div>
            </div>
            <button className="bg-[#FDD65B] text-black font-bold text-2xl px-6 py-2 rounded w-[90%] h-[77px] hover:bg-[#469620] hover:text-white transition-all duration-200 ease-in mx-auto mt-8">SEE FULL PROFILE</button>
        </div>
    );
}