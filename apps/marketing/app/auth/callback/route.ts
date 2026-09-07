import { createClient } from '@pratyagra/auth/server';
import { safeRedirectPath } from '@pratyagra/core/utils/safe-redirect';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get('code');
    // Guarded: `new URL(next, base)` drops the base for an absolute `next`,
    // so an unvalidated ?next= here would redirect off-site.
    const next = safeRedirectPath(requestUrl.searchParams.get('next'), '/');

    if (code) {
        const supabase = createClient();
        await supabase.auth.exchangeCodeForSession(code);
    }

    // Redirect to next or home page
    return NextResponse.redirect(new URL(next, request.url));
}
