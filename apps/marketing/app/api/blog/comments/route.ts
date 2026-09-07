import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@pratyagra/auth/server';
import { blogCommentSchema } from '@pratyagra/core/validations/form.schemas';

// Public comment submission — anon INSERT is allowed by RLS ("Anyone can
// submit a comment"), and a BEFORE INSERT trigger on blog_comments forces
// status = 'pending' server-side regardless of what's sent here, so there is
// no client-controllable way to publish a comment without moderation.

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const postId = typeof body.postId === 'string' ? body.postId : '';
        if (!postId) {
            return NextResponse.json({ error: 'postId is required' }, { status: 400 });
        }

        const parsed = blogCommentSchema.safeParse({
            name: (body.name ?? '').trim(),
            email: (body.email ?? '').trim(),
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
                { status: 422 },
            );
        }

        const { name, email, message } = parsed.data;
        const supabase = createClient();

        const { error } = await supabase
            .from('blog_comments')
            .insert([{ post_id: postId, name, email, message }]);

        if (error) {
            console.error('Error inserting blog comment:', error);
            return NextResponse.json({ error: 'Failed to submit comment' }, { status: 500 });
        }

        return NextResponse.json(
            { success: true, message: 'Comment submitted for review' },
            { status: 201 },
        );
    } catch (error) {
        console.error('Blog comment submission error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
