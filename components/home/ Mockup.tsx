'use client';

import { useState } from 'react';
import Image from 'next/image';

export default function MembershipRegistration() {
  const [isVisible, setIsVisible] = useState(true);
  const [isChecked, setIsChecked] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-auto py-4">
<div className="bg-white rounded shadow-lg flex flex-col md:flex-row w-full max-w-[400px] md:max-w-[780px] min-h-[400px] md:h-auto max-h-[90vh] overflow-y-auto">
<div className="w-full md:w-1/3 bg-gray-800">
          <Image
            src="/mockup.jpg"
            alt="Hands"
            className="w-full h-full object-cover"
            width={500}
            height={900}
          />
        </div>
        <div className="w-full md:w-2/3 p-4 text-center bg-green-100">
          <div className="flex justify-end">
            <button
              onClick={() => setIsVisible(false)}
              className="text-gray-500 text-3xl hover:text-gray-700"
            >
              X
            </button>
          </div>
          <h2 className="text-3xl font-extrabold mb-4">Membership Registration</h2>
          <p className="text-gray-600 text-[17px] mb-[4rem]">
            Are you passionate about making a difference? Join us today and become part of a vibrant community dedicated to empowering communities.
          </p>
          <div className="flex flex-col md:flex-row items-center">
            <input
              type="email"
              placeholder="Your email.."
              className="border-b-2 border-[#171717] focus:outline-none focus:border-green-700 flex-1 py-2 w-full md:w-auto mb-2 md:mb-0 md:mr-4"
            />
            <button className="bg-[#171717] text-white px-4 py-2 rounded hover:bg-[#fdd65b] w-full md:w-auto">
              Subscribe
            </button>
          </div>
          <div
            className="flex items-center mt-2 cursor-pointer"
            onClick={() => setIsChecked(!isChecked)}
          >
            <input
              type="checkbox"
              checked={isChecked}
              onChange={() => setIsChecked(!isChecked)}
              className="mr-2 w-4 h-4 border-2 border-black"
            />
            <span className="text-black select-none">Do not show popup anymore</span>
          </div>
        </div>
      </div>
    </div>
  );
}
