'use client';

import { useGetDestinyExecutiveMembersQuery } from '@/redux/features/users/userApiSlice';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useRef } from 'react';


import Image from 'next/image';

type SocialLink = {
  platform: 'facebook' | 'twitter' | 'instagram';
  url: string;
};

type TeamMemberProps = {
  image_url: string;
  name: string;
  position?: string;
  socialLinks: SocialLink[];
};

export function TeamMember({
  image_url,
  name,
  position,
  socialLinks,
}: TeamMemberProps) {
  const iconClasses = {
    facebook: 'fab fa-facebook-f',
    twitter: 'fab fa-x-twitter',
    instagram: 'fab fa-instagram',
  };

  return (
    <div className="relative group mx-auto max-w-sm">
      <div className="bg-white text-white text-left h-full">
        {/* Fixed height container with top-aligned image */}
        <div className="relative h-80 w-full overflow-hidden">
          <Image 
            src={image_url} 
            alt={`Portrait of ${name}`} 
            fill
            className="object-cover object-top"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        </div>
        <div className="p-4">
          <h3 className="text-xl font-semibold text-[#FDD65B] mb-1">{name}</h3>
          {position && <p className="text-gray-900">{position}</p>}
        </div>
      </div>
      
      {/* Social Media Icons */}
      {socialLinks?.length > 0 && (
        <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 flex space-x-4 opacity-0 group-hover:opacity-100 transition-all duration-300">
          {socialLinks?.map((link) => (
            <a
              key={link.platform}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-black bg-white rounded-full p-3 hover:bg-[#469620] hover:text-white transition-all"
              aria-label={`Visit ${name}'s ${link.platform}`}
            >
              <i className={`${iconClasses[link.platform]} w-5 h-5 text-center`}></i>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

export default function MeetOurTeam() {
  const { data: teamMembers = [], isLoading, isError } = useGetDestinyExecutiveMembersQuery();
  const swiperRef = useRef<any>(null);

  if (isLoading) {
    return (
      <div className="bg-[#171717] py-12 pb-0 min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Loading team members...</div>
      </div>
    );
  }

  if (isError || !teamMembers) {
    return (
      <div className="bg-[#171717] py-12 pb-0 min-h-screen flex items-center justify-center">
        <div className="text-red-500 text-xl">Failed to load team members</div>
      </div>
    );
  }

  return (
    <div className="bg-white py-12 pb-0">
      <h1 className="text-4xl md:text-5xl font-extrabold text-black text-center mb-8">
        Meet Our Team
      </h1>
      <div className="h-2 w-16 bg-[#FDD65B] mb-12 mx-auto"></div>
      
      <div className="relative max-w-7xl mx-auto px-4">
        {/* Navigation buttons */}
        <button 
          onClick={() => swiperRef.current?.slidePrev()} 
          className="absolute left-0 top-1/2 z-10 -translate-y-1/2 bg-black/50 rounded-full p-2 text-white hover:bg-[#FDD65B] hover:text-black transition-all hidden md:block"
          aria-label="Previous"
        >
          <ChevronLeft size={32} />
        </button>
        
        <button 
          onClick={() => swiperRef.current?.slideNext()} 
          className="absolute right-0 top-1/2 z-10 -translate-y-1/2 bg-black/50 rounded-full p-2 text-white hover:bg-[#FDD65B] hover:text-black transition-all hidden md:block"
          aria-label="Next"
        >
          <ChevronRight size={32} />
        </button>

        <Swiper
          modules={[Autoplay, Navigation, Pagination]}
          spaceBetween={30}
          slidesPerView={1}
          breakpoints={{
            640: { slidesPerView: 1 },
            768: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
          }}
          autoplay={{ delay: 3000, disableOnInteraction: false }}
          loop={true}
          pagination={{ clickable: true, el: '.custom-pagination' }}
          onSwiper={(swiper) => (swiperRef.current = swiper)}
          className="team-swiper"
        >
          {teamMembers?.map((member) => (
            <SwiperSlide key={member.id}>
              <TeamMember
                image_url={member.image_url}
                name={member.name}
                position={member.position}
                socialLinks={member.socialLinks}
              />
            </SwiperSlide>
          ))}
        </Swiper>
        
        {/* Custom pagination container */}
        <div className="custom-pagination flex justify-center mt-8 space-x-2" />
      </div>
      <br />
      <br />
      {/* 

        <button className="bg-[#FDD65B] text-black font-bold text-2xl px-6 py-2 rounded w-[90%] max-w-md h-[77px] hover:bg-[#469620] hover:text-white transition-all duration-200 ease-in mx-auto mt-8 block">
        SEE FULL PROFILE
        </button>
        */}
    </div>
  );
}