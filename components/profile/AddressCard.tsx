import React from 'react';
import { Home, Briefcase, MapPin, Pencil, Trash2, Check, ShieldCheck } from 'lucide-react';

export interface Address {
    id: string;
    customer_id: string;
    label: 'Home' | 'Work' | 'Other';
    full_name: string;
    phone: string;
    address_line1: string;
    address_line2?: string | null;
    city: string;
    state: string;
    postal_code: string;
    country: string;
    is_default: boolean;
    created_at?: string;
    updated_at?: string;
}

interface AddressCardProps {
    address: Address;
    onEdit: (address: Address) => void;
    onDelete: (id: string) => void;
    onSetDefault: (id: string) => void;
    isProcessing?: boolean;
}

export default function AddressCard({
    address,
    onEdit,
    onDelete,
    onSetDefault,
    isProcessing = false,
}: AddressCardProps) {
    const {
        id,
        label,
        full_name,
        phone,
        address_line1,
        address_line2,
        city,
        state,
        postal_code,
        country,
        is_default,
    } = address;

    // Custom icon for label tags
    const getLabelIcon = () => {
        switch (label) {
            case 'Home':
                return <Home className="w-3.5 h-3.5 mr-1" />;
            case 'Work':
                return <Briefcase className="w-3.5 h-3.5 mr-1" />;
            default:
                return <MapPin className="w-3.5 h-3.5 mr-1" />;
        }
    };

    // Label badge styling
    const getLabelStyles = () => {
        switch (label) {
            case 'Home':
                return 'bg-blue-50 text-blue-700 border-blue-100';
            case 'Work':
                return 'bg-emerald-50 text-emerald-700 border-emerald-100';
            default:
                return 'bg-gray-50 text-gray-700 border-gray-150';
        }
    };

    return (
        <div
            className={`relative flex flex-col justify-between bg-white border rounded-xl shadow-sm transition-all duration-300 overflow-hidden ${
                is_default
                    ? 'border-accent ring-2 ring-accent-light'
                    : 'border-gray-200 hover:border-accent hover:shadow-md'
            }`}
        >
            {/* Default Ribbon/Header */}
            {is_default && (
                <div className="absolute top-0 right-0 left-0 bg-accent text-white py-1 px-4 flex items-center justify-center gap-1.5 text-xs font-semibold shadow-sm">
                    <ShieldCheck className="w-4 h-4" />
                    Default Delivery Address
                </div>
            )}

            {/* Content Body */}
            <div className={`p-5 flex-grow ${is_default ? 'pt-9' : ''}`}>
                <div className="flex items-center justify-between mb-3.5">
                    {/* Label Badge */}
                    <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getLabelStyles()}`}
                    >
                        {getLabelIcon()}
                        {label}
                    </span>

                    {/* Quick indicator of default address */}
                    {is_default && (
                        <span className="hidden sm:inline-flex items-center text-xs font-bold text-accent">
                            <span className="w-1.5 h-1.5 rounded-full bg-accent mr-1.5 animate-pulse"></span>
                            Primary
                        </span>
                    )}
                </div>

                {/* Receiver Info */}
                <h3 className="font-bold text-gray-900 text-lg leading-snug mb-1">{full_name}</h3>
                <p className="text-sm font-medium text-gray-500 mb-4">{phone}</p>

                {/* Address lines */}
                <div className="text-sm text-gray-700 space-y-1 leading-relaxed">
                    <p className="font-medium text-gray-800">{address_line1}</p>
                    {address_line2 && <p className="text-gray-600">{address_line2}</p>}
                    <p className="text-gray-800 font-medium">
                        {city}, {state} - <span className="font-bold text-gray-900">{postal_code}</span>
                    </p>
                    <p className="text-xs text-gray-400 font-semibold tracking-wide uppercase mt-1.5">{country}</p>
                </div>
            </div>

            {/* Card Footer Actions */}
            <div className="bg-gray-50 px-5 py-3 border-t border-gray-100 flex items-center justify-between gap-2.5">
                {/* Left controls: Edit/Delete */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => onEdit(address)}
                        disabled={isProcessing}
                        className="p-1.5 text-gray-500 hover:text-accent hover:bg-accent-light rounded-lg transition-all duration-200 disabled:opacity-50 disabled:hover:bg-transparent"
                        title="Edit Address"
                    >
                        <Pencil className="w-4.5 h-4.5" />
                    </button>
                    <button
                        onClick={() => onDelete(id)}
                        disabled={isProcessing}
                        className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:hover:bg-transparent"
                        title="Delete Address"
                    >
                        <Trash2 className="w-4.5 h-4.5" />
                    </button>
                </div>

                {/* Right controls: Default button */}
                {!is_default ? (
                    <button
                        onClick={() => onSetDefault(id)}
                        disabled={isProcessing}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 hover:border-accent text-xs font-semibold text-gray-700 hover:text-accent hover:bg-accent-light rounded-lg transition-all duration-200 shadow-sm disabled:opacity-50 disabled:hover:bg-white disabled:hover:text-gray-700 disabled:hover:border-gray-300"
                    >
                        Set as Default
                    </button>
                ) : (
                    <span className="flex items-center gap-1 text-xs font-bold text-emerald-600">
                        <Check className="w-4 h-4" />
                        Active
                    </span>
                )}
            </div>
        </div>
    );
}
