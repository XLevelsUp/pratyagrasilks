import { createServerClient } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';
import { type UserRole, ADMIN_LEVEL_ROLES } from '@/lib/constants/roles';

export async function middleware(request: NextRequest) {
    let response = NextResponse.next({
        request: { headers: request.headers },
    });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    );
                    response = NextResponse.next({ request });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    // Refresh session — must happen before any redirect
    const { data: { user } } = await supabase.auth.getUser();

    const { pathname } = request.nextUrl;

    // ── Unauthenticated → login (all protected routes) ───────────────────────
    if (!user) {
        const loginUrl = request.nextUrl.clone();
        loginUrl.pathname = '/auth/login';
        loginUrl.searchParams.set('next', pathname);
        return NextResponse.redirect(loginUrl);
    }

    // ── /orders — authentication only, no role required ─────────────────────
    if (pathname.startsWith('/orders')) {
        return response;
    }

    // ── /admin — requires an admin-level role ────────────────────────────────
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    const role = profile?.role as UserRole | undefined;

    if (!role || !ADMIN_LEVEL_ROLES.includes(role)) {
        return NextResponse.redirect(new URL('/', request.url));
    }

    // ── CASHIER guard ────────────────────────────────────────────────────────
    if (role === 'CASHIER') {
        const CASHIER_ALLOWED =
            pathname === '/admin/pos'                  ||
            pathname.startsWith('/admin/pos/')         ||
            pathname === '/admin/products'             ||
            pathname.startsWith('/admin/products/')    ||
            pathname === '/admin/vendors'              ||
            pathname.startsWith('/admin/vendors/');

        const CASHIER_BLOCKED =
            pathname.startsWith('/admin/settings')  ||
            pathname.startsWith('/admin/analytics') ||
            pathname.startsWith('/admin/users');

        if (!CASHIER_ALLOWED || CASHIER_BLOCKED) {
            return NextResponse.redirect(new URL('/admin/products', request.url));
        }
    }

    return response;
}

export const config = {
    matcher: ['/admin/:path*', '/orders', '/orders/:path*'],
};
