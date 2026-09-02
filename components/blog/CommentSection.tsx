'use client';

import { useState } from 'react';
import { MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';
import type { BlogComment } from '@/lib/types';

interface CommentSectionProps {
    postId: string;
    initialComments: BlogComment[];
}

// Submits straight to /api/blog/comments (public route, not a server action,
// since this renders on an unauthenticated page). Every comment starts
// 'pending' server-side — it will not appear here until an admin/marketing
// user approves it in /admin/blog/comments, so the list only ever shows what
// was fetched at page-load time (no client-side re-fetch after submit).
export default function CommentSection({ postId, initialComments }: CommentSectionProps) {
    const [comments] = useState<BlogComment[]>(initialComments);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await fetch('/api/blog/comments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ postId, name, email, message }),
            });
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.error || 'Could not submit your comment.');
            }
            setName('');
            setEmail('');
            setMessage('');
            setSubmitted(true);
            toast.success('Thanks! Your comment is awaiting review.');
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Could not submit your comment.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div id="comments" className="scroll-mt-24">
            <div className="flex items-center gap-2 mb-6">
                <MessageSquare className="w-5 h-5 text-primary" />
                <h2 className="text-2xl font-playfair font-bold text-primary">
                    Comments {comments.length > 0 && `(${comments.length})`}
                </h2>
            </div>

            {comments.length > 0 && (
                <div className="space-y-6 mb-10">
                    {comments.map((comment) => (
                        <div key={comment.id} className="border-b border-primary-100 pb-6">
                            <div className="flex items-center gap-3 mb-1">
                                <p className="font-semibold text-primary">{comment.name}</p>
                                <span className="text-xs text-textSecondary/60">
                                    {comment.createdAt.toLocaleDateString('en-IN', {
                                        year: 'numeric', month: 'short', day: 'numeric',
                                    })}
                                </span>
                            </div>
                            <p className="text-textSecondary whitespace-pre-wrap">{comment.message}</p>
                        </div>
                    ))}
                </div>
            )}

            <form onSubmit={handleSubmit} className="bg-primary-50 rounded-xl p-6 space-y-4">
                <h3 className="font-semibold text-primary">Leave a comment</h3>
                {submitted ? (
                    <p className="text-sm text-textSecondary">
                        Thanks for your comment!
                    </p>
                ) : (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Your name"
                                required
                                className="w-full px-4 py-2.5 rounded-lg border border-primary-200 bg-white focus:ring-2 focus:ring-accent focus:border-accent"
                            />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Your email"
                                required
                                className="w-full px-4 py-2.5 rounded-lg border border-primary-200 bg-white focus:ring-2 focus:ring-accent focus:border-accent"
                            />
                        </div>
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Share your thoughts…"
                            required
                            rows={4}
                            className="w-full px-4 py-2.5 rounded-lg border border-primary-200 bg-white focus:ring-2 focus:ring-accent focus:border-accent"
                        />
                        <button
                            type="submit"
                            disabled={submitting}
                            className="px-6 py-2.5 bg-primary text-secondary rounded-full font-semibold hover:bg-primary-light transition-colors disabled:opacity-50"
                        >
                            {submitting ? 'Submitting…' : 'Post Comment'}
                        </button>
                    </>
                )}
            </form>
        </div>
    );
}
