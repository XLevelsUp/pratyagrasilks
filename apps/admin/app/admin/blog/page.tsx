'use client';

import { useEffect, useState } from 'react';
import { Plus, Search, Newspaper, Edit, Eye, Trash2, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { getPosts, deletePost, getPendingComments } from '@/lib/actions/blog-admin.actions';
import { STOREFRONT_URL } from '@/lib/constants/urls';
import { BlogPost } from '@pratyagra/core/types';
import { isSupabaseImage } from '@pratyagra/core/utils/image';
import ConfirmDialog from '@pratyagra/ui/ConfirmDialog';
import toast from 'react-hot-toast';

export default function AdminBlogPage() {
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [postToDelete, setPostToDelete] = useState<string | null>(null);
    const [pendingCommentCount, setPendingCommentCount] = useState(0);

    useEffect(() => {
        (async () => {
            try {
                const { posts } = await getPosts({ limit: 200 });
                setPosts(posts);
            } catch (err) {
                console.error('Failed to load blog posts:', err);
            } finally {
                setLoading(false);
            }
        })();
        (async () => {
            try {
                const comments = await getPendingComments();
                setPendingCommentCount(comments.filter((c) => c.status === 'pending').length);
            } catch (err) {
                console.error('Failed to load pending comment count:', err);
            }
        })();
    }, []);

    const handleDelete = (id: string) => {
        setPostToDelete(id);
        setDeleteConfirmOpen(true);
    };

    const confirmDelete = async () => {
        if (!postToDelete) return;
        try {
            await deletePost(postToDelete);
            setPosts((prev) => prev.filter((p) => p.id !== postToDelete));
            toast.success('Post deleted');
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Failed to delete post');
        }
        setPostToDelete(null);
    };

    const filtered = posts.filter((p) => {
        const q = search.toLowerCase();
        return (
            p.title.toLowerCase().includes(q) ||
            p.author.toLowerCase().includes(q) ||
            (p.category?.name ?? '').toLowerCase().includes(q)
        );
    });

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Blog Posts</h1>
                <div className="flex items-center gap-3">
                    <Link
                        href="/admin/blog/comments"
                        className="relative flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                    >
                        <MessageSquare className="w-5 h-5" />
                        Comments
                        {pendingCommentCount > 0 && (
                            <span className="absolute -top-2 -right-2 flex items-center justify-center min-w-[20px] h-5 px-1 rounded-full bg-red-500 text-white text-xs font-bold">
                                {pendingCommentCount}
                            </span>
                        )}
                    </Link>
                    <Link
                        href="/admin/blog/new"
                        className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700 transition-colors"
                    >
                        <Plus className="w-5 h-5" />
                        New Post
                    </Link>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4 mb-6">
                <div className="relative max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by title, author, category…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-sm"
                    />
                </div>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600" />
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-16">
                        <Newspaper className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 mb-4">
                            {search ? 'No posts match your search.' : 'No blog posts yet.'}
                        </p>
                        {!search && (
                            <Link
                                href="/admin/blog/new"
                                className="inline-block text-amber-600 hover:text-amber-700 font-medium"
                            >
                                Write your first post
                            </Link>
                        )}
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Post
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Category
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Author
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Published
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filtered.map((post) => (
                                    <tr key={post.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <Link href={`/admin/blog/${post.id}/edit`}>
                                                <div className="flex items-center gap-3">
                                                    <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                                                        {post.featuredImageUrl ? (
                                                            <Image
                                                                src={post.featuredImageUrl}
                                                                alt={post.featuredImageAlt ?? post.title}
                                                                fill
                                                                className="object-cover"
                                                                sizes="48px"
                                                                unoptimized={isSupabaseImage(post.featuredImageUrl)}
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center">
                                                                <Newspaper className="w-5 h-5 text-gray-300" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <p className="font-medium text-gray-900 line-clamp-2 max-w-[280px]">
                                                        {post.title}
                                                    </p>
                                                </div>
                                            </Link>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {post.category ? (
                                                <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                                                    {post.category.name}
                                                </span>
                                            ) : (
                                                <span className="text-gray-400 text-xs">—</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                            {post.author}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {post.publishedAt.toLocaleDateString('en-IN', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric',
                                            })}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                {/* Cross-origin: the published post lives on the
                                                    storefront, so a plain anchor, not next/link. */}
                                                <a
                                                    href={`${STOREFRONT_URL}/blog/${post.slug}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-gray-500 hover:text-gray-700"
                                                    title="View live"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </a>
                                                <Link
                                                    href={`/admin/blog/${post.id}/edit`}
                                                    className="text-amber-600 hover:text-amber-700"
                                                    title="Edit post"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(post.id)}
                                                    className="text-red-600 hover:text-red-700"
                                                    title="Delete post"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <ConfirmDialog
                isOpen={deleteConfirmOpen}
                onClose={() => setDeleteConfirmOpen(false)}
                onConfirm={confirmDelete}
                title="Delete Post"
                message="Are you sure you want to delete this post? This action cannot be undone."
                confirmText="Delete"
                cancelText="Cancel"
                variant="danger"
            />
        </div>
    );
}
