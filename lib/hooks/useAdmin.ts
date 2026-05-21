'use client';

import { useAuth } from '@/lib/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { type UserRole, ADMIN_LEVEL_ROLES } from '@/lib/constants/roles';

interface UseAdminReturn {
    isAdmin: boolean;
    role: UserRole | null;
    loading: boolean;
    user: ReturnType<typeof useAuth>['user'];
}

export function useAdmin(): UseAdminReturn {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [role, setRole] = useState<UserRole | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function checkRole() {
            if (authLoading) return;

            if (!user) {
                router.push('/auth/login');
                return;
            }

            try {
                const supabase = createClient();
                const { data, error } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', user.id)
                    .single();

                if (error || !data) {
                    router.push('/');
                    return;
                }

                const userRole = data.role as UserRole;

                if (!ADMIN_LEVEL_ROLES.includes(userRole)) {
                    router.push('/');
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
                        pathname.startsWith('/admin/vendors/');

                    const CASHIER_BLOCKED =
                        pathname.startsWith('/admin/settings') ||
                        pathname.startsWith('/admin/analytics') ||
                        pathname.startsWith('/admin/users');

                    if (!CASHIER_ALLOWED || CASHIER_BLOCKED) {
                        router.push('/admin/pos');
                        return;
                    }
                }

                setRole(userRole);
            } catch {
                router.push('/');
            } finally {
                setLoading(false);
            }
        }

        checkRole();
    }, [user, authLoading, router, pathname]);

    return {
        isAdmin: role === 'ADMIN',
        role,
        loading,
        user,
    };
}
