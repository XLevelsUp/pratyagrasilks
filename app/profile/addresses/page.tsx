'use client';

import { useAuth } from '@/lib/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { User, Mail, Phone, Calendar, Package, Plus, MapPin, Loader2, ArrowLeft } from 'lucide-react';
import AddressCard, { Address } from '@/components/profile/AddressCard';
import AddressModal from '@/components/profile/AddressModal';

export default function AddressesPage() {
    const { user, loading, signOut } = useAuth();
    const router = useRouter();

    const [customerData, setCustomerData] = useState<any>(null);
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [isAddressesLoading, setIsAddressesLoading] = useState(true);
    
    // Modal & Toast states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAddress, setEditingAddress] = useState<Address | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [alertMessage, setAlertMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Redirect guest users & fetch initial profile info
    useEffect(() => {
        if (!loading && !user) {
            router.push('/auth/login');
        } else if (user) {
            // Load Sidebar profile data
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
                .catch(err => console.error('Error fetching sidebar profile:', err));

            // Load saved addresses
            fetchAddresses();
        }
    }, [user, loading, router]);

    // Clear alert messages after 5 seconds
    useEffect(() => {
        if (alertMessage) {
            const timer = setTimeout(() => setAlertMessage(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [alertMessage]);

    const fetchAddresses = async () => {
        setIsAddressesLoading(true);
        try {
            const res = await fetch('/api/profile/addresses');
            const data = await res.json();
            if (data.addresses) {
                setAddresses(data.addresses);
            } else if (data.error) {
                showAlert('error', data.error);
            }
        } catch (err) {
            console.error('Error loading addresses:', err);
            showAlert('error', 'Failed to retrieve addresses.');
        } finally {
            setIsAddressesLoading(false);
        }
    };

    const showAlert = (type: 'success' | 'error', text: string) => {
        setAlertMessage({ type, text });
    };

    const handleSignOut = async () => {
        await signOut();
        router.push('/');
    };

    // Save Address handler (Both create and update)
    const handleSaveAddress = async (addressData: any): Promise<boolean> => {
        setIsProcessing(true);
        try {
            const url = editingAddress
                ? `/api/profile/addresses/${editingAddress.id}`
                : '/api/profile/addresses';
            
            const method = editingAddress ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(addressData),
            });

            const data = await res.json();

            if (res.ok && data.success) {
                showAlert('success', editingAddress ? 'Address updated successfully!' : 'Address added successfully!');
                await fetchAddresses(); // reload list
                return true;
            } else {
                showAlert('error', data.error || 'Failed to save address.');
                return false;
            }
        } catch (err) {
            console.error('Error saving address:', err);
            showAlert('error', 'Network error. Failed to save address.');
            return false;
        } finally {
            setIsProcessing(false);
        }
    };

    // Delete Address handler
    const handleDeleteAddress = async (id: string) => {
        if (!confirm('Are you sure you want to delete this address?')) return;
        
        setIsProcessing(true);
        try {
            const res = await fetch(`/api/profile/addresses/${id}`, {
                method: 'DELETE',
            });
            const data = await res.json();

            if (res.ok && data.success) {
                showAlert('success', 'Address deleted successfully!');
                await fetchAddresses();
            } else {
                showAlert('error', data.error || 'Failed to delete address.');
            }
        } catch (err) {
            console.error('Error deleting address:', err);
            showAlert('error', 'Network error. Failed to delete address.');
        } finally {
            setIsProcessing(false);
        }
    };

    // Set Default address handler
    const handleSetDefault = async (id: string) => {
        setIsProcessing(true);
        try {
            const res = await fetch(`/api/profile/addresses/${id}/default`, {
                method: 'PATCH',
            });
            const data = await res.json();

            if (res.ok && data.success) {
                showAlert('success', 'Default delivery address updated!');
                await fetchAddresses();
            } else {
                showAlert('error', data.error || 'Failed to update default address.');
            }
        } catch (err) {
            console.error('Error setting default address:', err);
            showAlert('error', 'Network error. Failed to update default address.');
        } finally {
            setIsProcessing(false);
        }
    };

    const openCreateModal = () => {
        setEditingAddress(null);
        setIsModalOpen(true);
    };

    const openEditModal = (address: Address) => {
        setEditingAddress(address);
        setIsModalOpen(true);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="min-h-screen max-w-7xl mx-auto bg-gray-50/50">
            {/* Header */}
            <div className="bg-white border-b shadow-sm">
                <div className="container mx-auto px-4 py-6 flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                            <Link href="/profile" className="hover:text-accent flex items-center gap-1">
                                <ArrowLeft className="w-3.5 h-3.5" /> Account
                            </Link>
                            <span>/</span>
                            <span className="text-gray-900">Addresses</span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">Delivery Addresses</h1>
                        <p className="text-sm text-gray-500 mt-1">Add, edit, or configure your delivery locations</p>
                    </div>
                </div>
            </div>

            {/* Content body layout */}
            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Unified Profile Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-150 p-6">
                            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
                                <div className="relative w-16 h-16 bg-accent-light rounded-full flex items-center justify-center flex-shrink-0 shadow-inner">
                                    {(customerData?.avatar_url || user.user_metadata?.avatar_url) ? (
                                        <Image
                                            src={customerData?.avatar_url || user.user_metadata?.avatar_url}
                                            alt="Profile"
                                            fill
                                            className="rounded-full object-cover border-2 border-white shadow-sm"
                                        />
                                    ) : (
                                        <User className="w-8 h-8 text-accent" />
                                    )}
                                </div>
                                <div>
                                    <h2 className="font-bold text-gray-900 leading-snug">
                                        {customerData?.full_name || user.user_metadata?.full_name || 'User'}
                                    </h2>
                                    <p className="text-sm text-gray-500 truncate max-w-[180px]">{user.email}</p>
                                </div>
                            </div>

                            <nav className="space-y-1.5">
                                <Link
                                    href="/profile"
                                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-50 hover:text-gray-900 font-semibold transition-all duration-200"
                                >
                                    <User className="w-5 h-5 text-gray-400" />
                                    Profile
                                </Link>
                                <Link
                                    href="/orders"
                                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-50 hover:text-gray-900 font-semibold transition-all duration-200"
                                >
                                    <Package className="w-5 h-5 text-gray-400" />
                                    Orders
                                </Link>
                                <Link
                                    href="/profile/addresses"
                                    className="flex items-center gap-3 px-4 py-3 rounded-xl bg-accent-light text-accent hover:text-accent-dark font-bold transition-all duration-200"
                                >
                                    <MapPin className="w-5 h-5 text-accent" />
                                    Addresses
                                </Link>
                                <Link
                                    href="/wishlist"
                                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-50 hover:text-gray-900 font-semibold transition-all duration-200"
                                >
                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                    </svg>
                                    Wishlist
                                </Link>
                                <button
                                    onClick={handleSignOut}
                                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 font-semibold transition-all duration-200 text-left"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                    </svg>
                                    Sign Out
                                </button>
                            </nav>
                        </div>
                    </div>

                    {/* Main addresses list / actions grid */}
                    <div className="lg:col-span-2 space-y-6">
                        
                        {/* Status notification alerts */}
                        {alertMessage && (
                            <div
                                className={`p-4 rounded-xl border font-semibold text-sm transition-all duration-300 animate-slide-in ${
                                    alertMessage.type === 'success'
                                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                                        : 'bg-red-50 border-red-200 text-red-800'
                                }`}
                            >
                                {alertMessage.text}
                            </div>
                        )}

                        {/* Addresses Grid View */}
                        {isAddressesLoading ? (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-150 p-12 flex flex-col items-center justify-center min-h-[350px]">
                                <Loader2 className="w-10 h-10 text-accent animate-spin mb-3" />
                                <p className="text-sm font-semibold text-gray-500">Retrieving your address book...</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                
                                {/* ＋ Add Address Dotted Card Trigger */}
                                <div
                                    onClick={openCreateModal}
                                    className="flex flex-col items-center justify-center min-h-[220px] p-6 bg-white border-2 border-dashed border-gray-300 hover:border-accent hover:bg-accent-light/35 rounded-xl cursor-pointer transition-all duration-300 group shadow-sm hover:shadow-md"
                                >
                                    <div className="w-12 h-12 rounded-full bg-gray-50 group-hover:bg-accent-light flex items-center justify-center mb-3.5 transition-colors border border-gray-100">
                                        <Plus className="w-6 h-6 text-gray-400 group-hover:text-accent transition-colors" />
                                    </div>
                                    <h3 className="font-bold text-gray-800 text-base mb-1 group-hover:text-accent">Add New Address</h3>
                                    <p className="text-xs text-gray-400 font-medium">Deliver packages here</p>
                                </div>

                                {/* Active Address Cards List */}
                                {addresses.map((address) => (
                                    <AddressCard
                                        key={address.id}
                                        address={address}
                                        onEdit={openEditModal}
                                        onDelete={handleDeleteAddress}
                                        onSetDefault={handleSetDefault}
                                        isProcessing={isProcessing}
                                    />
                                ))}

                                {/* Empty State display (Only shows if no addresses exist) */}
                                {addresses.length === 0 && (
                                    <div className="col-span-1 md:col-span-2 border border-gray-200 bg-white rounded-xl p-8 flex flex-col items-center text-center shadow-sm">
                                        <MapPin className="w-12 h-12 text-gray-300 mb-3" />
                                        <h3 className="font-bold text-gray-800 text-lg mb-1">No Delivery Locations</h3>
                                        <p className="text-sm text-gray-500 max-w-sm">
                                            You haven't saved any locations yet. Add a new address above to make shopping and checkout much faster!
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Reusable Form Modal Overlay */}
            <AddressModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveAddress}
                address={editingAddress}
            />
        </div>
    );
}
