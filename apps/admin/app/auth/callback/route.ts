import { createClient } from '@pratyagra/auth/server';
import { NextResponse } from 'next/server';

// OAuth code exchange for staff Google sign-in. Same shape as the
// storefront's callback, but defaults to /admin rather than /.
// The admin host must be registered in Supabase Auth -> URL Configuration ->
// Redirect URLs, or Google sign-in returns "redirect_to is not allowed".
export async function GET(request: Request) {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get('code');
    const next = requestUrl.searchParams.get('next') || '/admin';

    if (code) {
        const supabase = createClient();
        await supabase.auth.exchangeCodeForSession(code);
    }

    return NextResponse.redirect(new URL(next, request.url));
}
