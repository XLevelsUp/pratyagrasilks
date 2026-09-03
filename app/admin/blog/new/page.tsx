import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import BlogPostForm from '@/components/admin/blog/BlogPostForm';

export default function NewBlogPostPage() {
    return (
        <div>
            <div className="flex items-center gap-4 mb-8">
                <Link
                    href="/admin/blog"
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <h1 className="text-3xl font-bold text-gray-900">New Post</h1>
            </div>

            <BlogPostForm />
        </div>
    );
}
