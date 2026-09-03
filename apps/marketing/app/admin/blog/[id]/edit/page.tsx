import { getPostById } from '@/lib/actions/blog-admin.actions';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import BlogPostForm from '@/components/admin/blog/BlogPostForm';

interface EditBlogPostPageProps {
    params: { id: string };
}

export default async function EditBlogPostPage({ params }: EditBlogPostPageProps) {
    const post = await getPostById(params.id);
    if (!post) redirect('/admin/blog');

    return (
        <div>
            <div className="flex items-center gap-4 mb-8">
                <Link
                    href="/admin/blog"
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Edit Post</h1>
                    <p className="text-sm text-gray-500 mt-0.5">{post.title}</p>
                </div>
            </div>

            <BlogPostForm initialData={post} />
        </div>
    );
}
