import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { contactFormSchema } from '@/lib/validations/form.schemas';

// Service-role client — bypasses RLS for public contact form submissions

export async function POST(request: NextRequest) {
    const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { autoRefreshToken: false, persistSession: false } }
    );
    try {
        const body = await request.json();
        const parsed = contactFormSchema.safeParse({
            name: (body.name ?? '').trim(),
            email: (body.email ?? '').trim(),
            subject: (body.subject ?? '').trim(),
            message: (body.message ?? '').trim(),
        });

        if (!parsed.success) {
            const fieldErrors: Record<string, string[]> = {};
            for (const issue of parsed.error.issues) {
                const key = String(issue.path[0]);
                if (!fieldErrors[key]) fieldErrors[key] = [];
                fieldErrors[key].push(issue.message);
            }
            return NextResponse.json(
                { error: 'Please check your submission', details: fieldErrors },
                { status: 422 }
            );
        }

        const { name, email, subject, message } = parsed.data;

        const { data, error } = await supabaseAdmin
            .from('contact_messages')
            .insert([{ name, email, subject, message }])
            .select()
            .single();

        if (error) {
            console.error('Error inserting contact message:', error);
            return NextResponse.json(
                { error: 'Failed to submit contact message' },
                { status: 500 }
            );
        }

        return NextResponse.json(
            { success: true, message: 'Contact message submitted successfully', data },
            { status: 201 }
        );
    } catch (error) {
        console.error('Contact form submission error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// GET — admin only, uses cookie-based auth
export async function GET(request: NextRequest) {
    try {
        const supabase = createServerClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '50');
        const offset = parseInt(searchParams.get('offset') || '0');
        const unreadOnly = searchParams.get('unread') === 'true';

        let query = supabase
            .from('contact_messages')
            .select('*', { count: 'exact' })
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (unreadOnly) query = query.eq('read', false);

        const { data, error, count } = await query;

        if (error) {
            console.error('Error fetching contact messages:', error);
            return NextResponse.json({ error: 'Failed to fetch contact messages' }, { status: 500 });
        }

        return NextResponse.json({ success: true, data, count, limit, offset });
    } catch (error) {
        console.error('Error in GET /api/contact:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
