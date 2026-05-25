'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/context/AuthContext';
import { usePathname } from 'next/navigation';

const FloatingButtons = () => {
  const { user } = useAuth();
  const pathname = usePathname();
  const phoneNumber = '+917358866646';
  const message = "Hi, I'm interested in Pratyagra Silks products.";
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
    message,
  )}`;

  // Don't show floating buttons on admin pages (admin has its own layout)
  const isAdminPage = pathname.startsWith('/admin');

  return (
    <div className='fixed bottom-5 right-5 z-[9999] flex flex-col items-end gap-3'>

      {/* Admin Panel Button — only visible to logged-in users, hidden on admin pages */}
      {user && !isAdminPage && (
        <div className='group flex items-center justify-center'>
          {/* Tooltip */}
          <div className='absolute right-[calc(100%+16px)] px-3 py-1.5 bg-white text-gray-800 text-sm font-medium rounded-full shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap border border-gray-100'>
            Admin Panel
          </div>

          <Link
            href='/admin'
            className='relative flex items-center justify-center w-12 h-12 md:w-[52px] md:h-[52px] bg-gray-800 hover:bg-gray-700 rounded-full shadow-lg transition-transform duration-300 hover:scale-110'
            aria-label='Go to Admin Panel'
          >
            <svg
              xmlns='http://www.w3.org/2000/svg'
              width='24'
              height='24'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth='2'
              strokeLinecap='round'
              strokeLinejoin='round'
              className='text-white w-5 h-5 md:w-6 md:h-6'
            >
              <rect width='7' height='9' x='3' y='3' rx='1' />
              <rect width='7' height='5' x='14' y='3' rx='1' />
              <rect width='7' height='9' x='14' y='12' rx='1' />
              <rect width='7' height='5' x='3' y='16' rx='1' />
            </svg>
          </Link>
        </div>
      )}

      {/* WhatsApp Button */}
      <div className='group flex items-center justify-center'>
        {/* Tooltip */}
        <div className='absolute right-[calc(100%+16px)] px-3 py-1.5 bg-white text-gray-800 text-sm font-medium rounded-full shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap border border-gray-100'>
          Chat with us
        </div>

        <a
          href={whatsappUrl}
          target='_blank'
          rel='noopener noreferrer'
          className='relative flex items-center justify-center w-14 h-14 md:w-[60px] md:h-[60px] bg-[#25D366] hover:bg-[#1ebe57] rounded-full shadow-lg transition-transform duration-300 hover:scale-110'
          aria-label='Chat on WhatsApp'
        >
          <svg
            xmlns='http://www.w3.org/2000/svg'
            width='32'
            height='32'
            fill='currentColor'
            className='text-white w-8 h-8 md:w-9 md:h-9'
            viewBox='0 0 16 16'
          >
            <path d='M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c-.003 1.396.366 2.76 1.056 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.004-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z' />
          </svg>
        </a>
      </div>
    </div>
  );
};

export default FloatingButtons;
