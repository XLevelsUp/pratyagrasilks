'use client';

import { useAuth } from '@/lib/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { User, Mail, Phone, Calendar, Package } from 'lucide-react';

export default function ProfilePage() {
    const { user, loading, signOut } = useAuth();
    const router = useRouter();

    const [customerData, setCustomerData] = useState<any>(null);

    useEffect(() => {
        if (!loading && !user) {
            router.push('/auth/login');
        } else if (user) {
            fetch('/api/profile', { cache: 'no-store' })
                .then(res => res.json())
                .then(data => {
                    if (data.customer) {
                        const ts = Date.now();
                        setCustomerData({
                            ...data.customer,
                            avatar_url: data.customer.avatar_url
                                ? `${data.customer.avatar_url.split('?')[0]}?t=${ts}`
                                : null,
                        });
                    }
                })
                .catch(err => console.error(err));
        }
    }, [user, loading, router]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    const handleSignOut = async () => {
        await signOut();
        router.push('/');
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    return (
        <div className="min-h-screen max-w-7xl mx-auto">
            {/* Header */}
            <div className="bg-white border-b shadow-md">
                <div className="container mx-auto px-4 py-6">
                    <h1 className="text-3xl font-bold text-gray-900">My Account</h1>
                    <p className="text-textSecondary mt-1">Manage your profile and orders</p>
                </div>
            </div>

            {/* Content */}
            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <div className="flex items-center gap-4 mb-6 pb-6 border-b">
                                <div className="relative w-16 h-16 bg-accent-light rounded-full flex items-center justify-center flex-shrink-0">
                                    {(customerData?.avatar_url || user.user_metadata?.avatar_url) ? (
                                        <Image
                                            src={customerData?.avatar_url || user.user_metadata?.avatar_url}
                                            alt="Profile"
                                            fill
                                            className="rounded-full object-cover"
                                        />
                                    ) : (
                                        <User className="w-8 h-8 text-accent" />
                                    )}
                                </div>
                                <div>
                                    <h2 className="font-semibold text-gray-900">
                                        {customerData?.full_name || user.user_metadata?.full_name || 'User'}
                                    </h2>
                                    <p className="text-sm text-gray-500">{user.email}</p>
                                </div>
                            </div>

                            <nav className="space-y-2">
                                <Link
                                    href="/profile"
                                    className="flex items-center gap-3 px-4 py-3 rounded-lg bg-accent-light text-accent-700 font-medium"
                                >
                                    <User className="w-5 h-5" />
                                    Profile
                                </Link>
                                <Link
                                    href="/orders"
                                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    <Package className="w-5 h-5" />
                                    Orders
                                </Link>
                                <Link
                                    href="/wishlist"
                                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                    </svg>
                                    Wishlist
                                </Link>
                                <button
                                    onClick={handleSignOut}
                                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                    </svg>
                                    Sign Out
                                </button>
                            </nav>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Profile Information */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Profile Information</h2>

                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <User className="w-5 h-5 text-gray-400 mt-0.5" />
                                    <div>
                                        <p className="text-sm text-gray-500">Full Name</p>
                                        <p className="font-medium text-gray-900">
                                            {customerData?.full_name || user.user_metadata?.full_name || 'Not set'}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                                    <div>
                                        <p className="text-sm text-gray-500">Email</p>
                                        <p className="font-medium text-gray-900">{user.email}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                                    <div>
                                        <p className="text-sm text-gray-500">Phone</p>
                                        <p className="font-medium text-gray-900">
                                            {customerData?.phone || user.user_metadata?.phone || 'Not set'}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                                    <div>
                                        <p className="text-sm text-gray-500">Member Since</p>
                                        <p className="font-medium text-gray-900">
                                            {formatDate(user.created_at)}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <Link
                                href="/profile/edit"
                                className="inline-block mt-6 px-6 py-2 border-2 border-accent text-accent rounded-lg font-semibold hover:bg-accent-light transition-colors"
                            >
                                Edit Profile
                            </Link>
                        </div>

                        {/* Quick Actions */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Link
                                    href="/orders"
                                    className="p-4 border-2 border-gray-200 rounded-lg hover:border-accent hover:bg-accent-light transition-colors"
                                >
                                    <Package className="w-6 h-6 text-accent mb-2" />
                                    <h3 className="font-semibold text-gray-900">View Orders</h3>
                                    <p className="text-sm text-textSecondary">Track your orders</p>
                                </Link>

                                <Link
                                    href="/wishlist"
                                    className="p-4 border-2 border-gray-200 rounded-lg hover:border-accent hover:bg-accent-light transition-colors"
                                >
                                    <svg className="w-6 h-6 text-accent mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                    </svg>
                                    <h3 className="font-semibold text-gray-900">Wishlist</h3>
                                    <p className="text-sm text-textSecondary">View saved items</p>
                                </Link>

                                <Link
                                    href="/collection"
                                    className="p-4 border-2 border-gray-200 rounded-lg hover:border-accent hover:bg-accent-light transition-colors"
                                >
                                    <svg className="w-6 h-6 text-accent mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                    </svg>
                                    <h3 className="font-semibold text-gray-900">Continue Shopping</h3>
                                    <p className="text-sm text-textSecondary">Browse our collection</p>
                                </Link>

                                <Link
                                    href="/profile/addresses"
                                    className="p-4 border-2 border-gray-200 rounded-lg hover:border-accent hover:bg-accent-light transition-colors"
                                >
                                    <svg className="w-6 h-6 text-accent mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    <h3 className="font-semibold text-gray-900">Addresses</h3>
                                    <p className="text-sm text-textSecondary">Manage addresses</p>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
