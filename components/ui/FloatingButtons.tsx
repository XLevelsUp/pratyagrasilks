'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/context/AuthContext';
import { usePathname } from 'next/navigation';
import { getWhatsAppUrl } from '@/lib/utils/whatsapp';
import { createClient } from '@/lib/supabase/client';
import { isAdminLevelRole, type UserRole } from '@/lib/constants/roles';

const ENQUIRY_MESSAGE = "Hi, I'm interested in sarees from Kandangi Sarees. Can you help me?";

const FloatingButtons = () => {
    const { user } = useAuth();
    const pathname = usePathname();
    const isAdminPage = pathname?.startsWith('/admin');
    const [isAdminLevel, setIsAdminLevel] = useState(false);

    useEffect(() => {
        if (!user) {
            setIsAdminLevel(false);
            return;
        }
        const supabase = createClient();
        supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()
            .then(({ data }) => {
                setIsAdminLevel(isAdminLevelRole((data?.role as UserRole) ?? null));
            });
    }, [user]);

    const whatsappUrl = getWhatsAppUrl(ENQUIRY_MESSAGE);

    return (
        <>
            <style>{`
                .wa-pulse::before {
                    content: '';
                    position: absolute;
                    inset: 0;
                    border-radius: 50%;
                    background: #25D366;
                    animation: pulse-ring 3s ease-out infinite;
                    z-index: -1;
                }
            `}</style>

            <div className="fixed bottom-5 right-5 z-[9999] flex flex-col items-end gap-3">

                {/* Admin Panel Button — only visible to admin-level users, hidden on admin pages */}
                {isAdminLevel && !isAdminPage && (
                    <div className="group flex items-center justify-center">
                        <div className="absolute right-[calc(100%+16px)] px-3 py-1.5 bg-white text-gray-800 text-sm font-medium rounded-full shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap border border-gray-100">
                            Admin Panel
                        </div>
                        <Link
                            href="/admin"
                            className="relative flex items-center justify-center w-12 h-12 md:w-[52px] md:h-[52px] bg-gray-800 hover:bg-gray-700 rounded-full shadow-lg transition-transform duration-300 hover:scale-110"
                            aria-label="Go to Admin Panel"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="text-white w-5 h-5 md:w-6 md:h-6"
                            >
                                <rect width="7" height="9" x="3" y="3" rx="1" />
                                <rect width="7" height="5" x="14" y="3" rx="1" />
                                <rect width="7" height="9" x="14" y="12" rx="1" />
                                <rect width="7" height="5" x="3" y="16" rx="1" />
                            </svg>
                        </Link>
                    </div>
                )}

                {/* WhatsApp Button */}
                {!isAdminPage && (
                    <div className="group flex items-center justify-center">
                        <div className="absolute right-[calc(100%+16px)] px-3 py-1.5 bg-white text-gray-800 text-sm font-medium rounded-full shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap border border-gray-100">
                            Chat with us
                        </div>
                        <a
                            href={whatsappUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="Chat with us on WhatsApp"
                            className="wa-pulse relative flex items-center justify-center w-14 h-14 md:w-[60px] md:h-[60px] rounded-full shadow-lg transition-transform duration-300 hover:scale-110 active:scale-95"
                            style={{ backgroundColor: '#25D366' }}
                        >
                            <svg
                                viewBox="0 0 24 24"
                                fill="white"
                                className="w-7 h-7 md:w-8 md:h-8"
                                aria-hidden="true"
                            >
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                            </svg>
                        </a>
                    </div>
                )}
            </div>
        </>
    );
};

export default FloatingButtons;
