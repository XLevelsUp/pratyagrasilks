'use client';

import { useEffect, useState } from 'react';
import { MessageSquare, Check, X, Trash2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { getPendingComments, approveComment, rejectComment, deleteComment } from '@/lib/actions/blog-admin.actions';
import { BlogComment } from '@pratyagra/core/types';
import toast from 'react-hot-toast';

const STATUS_STYLES: Record<BlogComment['status'], string> = {
    pending: 'bg-amber-100 text-amber-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-gray-100 text-gray-600',
};

export default function CommentModerationPage() {
    const [comments, setComments] = useState<BlogComment[]>([]);
    const [loading, setLoading] = useState(true);

    const load = async () => {
        try {
            const data = await getPendingComments();
            setComments(data);
        } catch (err) {
            console.error('Failed to load comments:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const handleApprove = async (id: string) => {
        try {
            await approveComment(id);
            setComments((prev) => prev.map((c) => (c.id === id ? { ...c, status: 'approved' } : c)));
            toast.success('Comment approved');
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Failed to approve comment');
        }
    };

    const handleReject = async (id: string) => {
        try {
            await rejectComment(id);
            setComments((prev) => prev.map((c) => (c.id === id ? { ...c, status: 'rejected' } : c)));
            toast.success('Comment rejected');
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Failed to reject comment');
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteComment(id);
            setComments((prev) => prev.filter((c) => c.id !== id));
            toast.success('Comment deleted');
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Failed to delete comment');
        }
    };

    return (
        <div>
            <div className="flex items-center gap-4 mb-8">
                <Link
                    href="/admin/blog"
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <h1 className="text-3xl font-bold text-gray-900">Comment Moderation</h1>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600" />
                    </div>
                ) : comments.length === 0 ? (
                    <div className="text-center py-16">
                        <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">No comments yet.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-200">
                        {comments.map((comment) => (
                            <div key={comment.id} className="p-6">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 mb-1">
                                            <p className="font-medium text-gray-900">{comment.name}</p>
                                            <span className="text-xs text-gray-400">{comment.email}</span>
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[comment.status]}`}>
                                                {comment.status}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-700 whitespace-pre-wrap">{comment.message}</p>
                                        <p className="text-xs text-gray-400 mt-2">
                                            {comment.createdAt.toLocaleDateString('en-IN', {
                                                year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                                            })}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        {comment.status !== 'approved' && (
                                            <button
                                                onClick={() => handleApprove(comment.id)}
                                                className="p-2 rounded-lg text-green-600 hover:bg-green-50"
                                                title="Approve"
                                            >
                                                <Check className="w-4 h-4" />
                                            </button>
                                        )}
                                        {comment.status !== 'rejected' && (
                                            <button
                                                onClick={() => handleReject(comment.id)}
                                                className="p-2 rounded-lg text-gray-500 hover:bg-gray-100"
                                                title="Reject"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleDelete(comment.id)}
                                            className="p-2 rounded-lg text-red-600 hover:bg-red-50"
                                            title="Delete"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
