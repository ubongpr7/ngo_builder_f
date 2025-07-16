// components/TeamMember.tsx
'use client';

import { useGetDestinyExecutiveMembersQuery } from '@/redux/features/users/userApiSlice';

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
    <div className="relative group">
      <div className="bg-[#171717] text-white text-left">
        {/* Fixed height container with top-aligned image */}
        <div className="relative h-80 w-full mb-4 overflow-hidden">
          <Image 
            src={image_url} 
            alt={name} 
            fill
            className="object-cover object-top"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
        <h3 className="text-xl font-semibold text-[#FDD65B] mb-1">{name}</h3>
        {position && <p className="text-gray-100 mb-4">{position}</p>}
      </div>
      
      {/* Social Media Icons */}
      {socialLinks?.length > 0 && (
        <div className="absolute top-[40%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex space-x-4 opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:-translate-y-1/3">
          {socialLinks?.map((link) => (
            <a
              key={link.platform}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-black bg-white rounded-full p-2 hover:text-green-600"
            >
              <i className={`${iconClasses[link.platform]} w-6 h-5 text-center leading-6`}></i>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}


export default function MeetOurTeam() {
  const { data: teamMembers=[], isLoading, isError } = useGetDestinyExecutiveMembersQuery();
    console.log(teamMembers);

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
    <div className="bg-[#171717] py-12 pb-0">
      <h1 className="text-4xl md:text-5xl font-extrabold text-white text-center mb-8">
        Meet Our Team
      </h1>
      <div className="h-2 w-16 bg-[#FDD65B] mb-12 mx-auto"></div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto px-4">
        {teamMembers?.map((member) => (
          <TeamMember
            key={member.id}
            image_url={member.image_url}
            name={member.name}
            position={member.position}
            socialLinks={member.socialLinks}
          />
        ))}
      </div>
      
      <button className="bg-[#FDD65B] text-black font-bold text-2xl lg:ml-[5%] px-6 py-2 rounded w-[90%] h-[77px] hover:bg-[#469620] hover:text-white transition-all duration-200 ease-in mx-auto mt-8">
        SEE FULL PROFILE
      </button>
    </div>
  );
}