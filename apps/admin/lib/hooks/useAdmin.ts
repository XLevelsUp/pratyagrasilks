'use client';

import { useAuth } from '@pratyagra/auth/context';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createClient } from '@pratyagra/auth/client';
import { type UserRole, ADMIN_LEVEL_ROLES } from '@pratyagra/core/constants/roles';

interface UseAdminReturn {
    isAdmin: boolean;
    role: UserRole | null;
    loading: boolean;
    user: ReturnType<typeof useAuth>['user'];
}

export function useAdmin(): UseAdminReturn {
    const { user, loading: authLoading, signOut } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [role, setRole] = useState<UserRole | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function checkRole() {
            if (authLoading) return;

            // '/login', not '/auth/login' — that route belongs to the
            // storefront app and does not exist on the admin host.
            if (!user) {
                router.push('/login');
                return;
            }

            // A non-admin must NOT be bounced to '/': on this host '/'
            // redirects to '/admin', which lands back here and loops forever.
            // Sign the session out so the login page can state why.
            async function rejectNonAdmin() {
                await signOut();
                router.push('/login?error=forbidden');
            }

            try {
                const supabase = createClient();
                const { data, error } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', user.id)
                    .single();

                if (error || !data) {
                    await rejectNonAdmin();
                    return;
                }

                const userRole = data.role as UserRole;

                // Defence in depth — middleware already enforces this at the
                // edge before any admin JS ships.
                if (!ADMIN_LEVEL_ROLES.includes(userRole)) {
                    await rejectNonAdmin();
                    return;
                }

                // ── CASHIER guard ────────────────────────────────────────────────
                if (userRole === 'CASHIER') {
                    const CASHIER_ALLOWED =
                        pathname === '/admin/pos' ||
                        pathname.startsWith('/admin/pos/') ||
                        pathname === '/admin/products' ||
                        pathname.startsWith('/admin/products/') ||
                        pathname === '/admin/vendors' ||
                        pathname.startsWith('/admin/vendors/') ||
                        // Customers list + detail (measurement profiles)
                        pathname === '/admin/customers' ||
                        pathname.startsWith('/admin/customers/');

                    const CASHIER_BLOCKED =
                        pathname.startsWith('/admin/settings') ||
                        pathname.startsWith('/admin/analytics') ||
                        pathname.startsWith('/admin/users');

                    if (!CASHIER_ALLOWED || CASHIER_BLOCKED) {
                        router.push('/admin/pos');
                        return;
                    }
                }

                // ── MARKETING guard — blog + comment moderation only ──────────────
                if (userRole === 'MARKETING') {
                    const MARKETING_ALLOWED =
                        pathname === '/admin/blog' ||
                        pathname.startsWith('/admin/blog/');

                    if (!MARKETING_ALLOWED) {
                        router.push('/admin/blog');
                        return;
                    }
                }

                setRole(userRole);
            } catch {
                // Same loop hazard as above — never bounce to '/' here.
                await rejectNonAdmin();
            } finally {
                setLoading(false);
            }
        }

        checkRole();
    }, [user, authLoading, router, pathname, signOut]);

    return {
        isAdmin: role === 'ADMIN',
        role,
        loading,
        user,
    };
}
