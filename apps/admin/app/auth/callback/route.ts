import { createClient } from '@pratyagra/auth/server';
import { safeRedirectPath } from '@pratyagra/core/utils/safe-redirect';
import { NextResponse } from 'next/server';

// OAuth code exchange for staff Google sign-in. Same shape as the storefront's
// callback, but defaults to /admin rather than /.
//
// The admin host must be listed in Supabase Auth -> URL Configuration ->
// Redirect URLs. If it is missing, Supabase does NOT error: it discards the
// requested redirect and falls back to the project's Site URL, which silently
// lands staff on the storefront instead of here.
export async function GET(request: Request) {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get('code');
    const next = safeRedirectPath(requestUrl.searchParams.get('next'), '/admin');

    if (code) {
        const supabase = createClient();
        await supabase.auth.exchangeCodeForSession(code);
    }

    return NextResponse.redirect(new URL(next, request.url));
}
