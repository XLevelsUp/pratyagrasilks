import React, { useState, useEffect } from 'react';
import { X, Home, Briefcase, MapPin, Loader2 } from 'lucide-react';
import { Address } from './AddressCard';
import { formatPhoneNumber, COUNTRIES, COUNTRY_STATES } from '@/lib/validations/checkout';

interface AddressModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (addressData: any) => Promise<boolean>;
    address?: Address | null; // If passed, we are in Edit Mode
}

export default function AddressModal({
    isOpen,
    onClose,
    onSave,
    address = null,
}: AddressModalProps) {
    const isEditMode = !!address;

    // Form states
    const [label, setLabel] = useState<'Home' | 'Work' | 'Other'>('Home');
    const [fullName, setFullName] = useState('');
    const [phone, setPhone] = useState('');
    const [addressLine1, setAddressLine1] = useState('');
    const [addressLine2, setAddressLine2] = useState('');
    const [city, setCity] = useState('');
    const [state, setState] = useState('');
    const [postalCode, setPostalCode] = useState('');
    const [country, setCountry] = useState('India');
    const [isDefault, setIsDefault] = useState(false);

    // Validation & loading states
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Populate form fields on edit mode, reset on new address, or load draft
    useEffect(() => {
        if (!isOpen) return;

        const savedDraftStr = typeof window !== 'undefined' ? localStorage.getItem('address_form_draft') : null;
        let loadedFromDraft = false;

        if (savedDraftStr) {
            try {
                const draft = JSON.parse(savedDraftStr);
                const isMatchingCreate = !isEditMode && draft.mode === 'create';
                const isMatchingEdit = isEditMode && draft.mode === 'edit' && draft.id === address?.id;

                if (isMatchingCreate || isMatchingEdit) {
                    setLabel(draft.label || 'Home');
                    setFullName(draft.fullName || '');
                    setPhone(draft.phone || '');
                    setAddressLine1(draft.addressLine1 || '');
                    setAddressLine2(draft.addressLine2 || '');
                    setCity(draft.city || '');
                    setState(draft.state || '');
                    setPostalCode(draft.postalCode || '');
                    setCountry(draft.country || 'India');
                    setIsDefault(draft.isDefault || false);
                    loadedFromDraft = true;
                }
            } catch (e) {
                console.error('Error parsing address draft:', e);
            }
        }

        if (!loadedFromDraft) {
            if (address) {
                setLabel(address.label || 'Home');
                setFullName(address.full_name || '');
                setPhone(address.phone || '');
                setAddressLine1(address.address_line1 || '');
                setAddressLine2(address.address_line2 || '');
                setCity(address.city || '');
                setState(address.state || '');
                setPostalCode(address.postal_code || '');
                setCountry(address.country || 'India');
                setIsDefault(address.is_default || false);
            } else {
                setLabel('Home');
                setFullName('');
                setPhone('');
                setAddressLine1('');
                setAddressLine2('');
                setCity('');
                setState('');
                setPostalCode('');
                setCountry('India');
                setIsDefault(false);
            }
        }
        setErrors({});
    }, [address, isOpen, isEditMode]);

    // Save draft to localStorage whenever fields change
    useEffect(() => {
        if (!isOpen) return; // Only save draft when modal is open and active
        
        const draft = {
            mode: isEditMode ? 'edit' : 'create',
            id: address?.id,
            label,
            fullName,
            phone,
            addressLine1,
            addressLine2,
            city,
            state,
            postalCode,
            country,
            isDefault,
        };
        localStorage.setItem('address_form_draft', JSON.stringify(draft));
    }, [
        isOpen,
        isEditMode,
        address?.id,
        label,
        fullName,
        phone,
        addressLine1,
        addressLine2,
        city,
        state,
        postalCode,
        country,
        isDefault,
    ]);

    if (!isOpen) return null;

    // Form validation
    const validateForm = () => {
        const tempErrors: Record<string, string> = {};

        if (!fullName.trim()) {
            tempErrors.fullName = 'Full name is required.';
        } else if (fullName.trim().length < 2) {
            tempErrors.fullName = 'Full name must be at least 2 characters.';
        }

        const cleanedPhone = phone.trim().replace(/[\s-()]/g, '');
        if (!cleanedPhone) {
            tempErrors.phone = 'Phone number is required.';
        } else if (!/^(\+[1-9]\d{7,14}|\d{10})$/.test(cleanedPhone)) {
            tempErrors.phone = 'Please provide a valid 10-digit mobile number or international number starting with + (e.g. 9876543210 or +919876543210).';
        }

        if (!addressLine1.trim()) {
            tempErrors.addressLine1 = 'Address Line 1 is required.';
        } else if (addressLine1.trim().length < 5) {
            tempErrors.addressLine1 = 'Address Line 1 must be at least 5 characters.';
        }

        if (!city.trim()) {
            tempErrors.city = 'City is required.';
        }

        if (COUNTRY_STATES[country] && !state.trim()) {
            tempErrors.state = 'State is required.';
        }

        if (!postalCode.trim()) {
            tempErrors.postalCode = 'Postal / Pincode code is required.';
        } else if (postalCode.trim().length < 5 || postalCode.trim().length > 10) {
            tempErrors.postalCode = 'Enter a valid postal code (5 to 10 characters).';
        }

        setErrors(tempErrors);
        return Object.keys(tempErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        setIsSubmitting(true);
        const formattedPhone = formatPhoneNumber(phone);
        const data = {
            label,
            full_name: fullName.trim(),
            phone: formattedPhone,
            address_line1: addressLine1.trim(),
            address_line2: addressLine2 ? addressLine2.trim() : null,
            city: city.trim(),
            state: state.trim(),
            postal_code: postalCode.trim(),
            country: country.trim(),
            is_default: isDefault,
        };

        const success = await onSave(data);
        setIsSubmitting(false);

        if (success) {
            localStorage.removeItem('address_form_draft');
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Dark Blurred Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
                onClick={onClose}
            ></div>

            {/* Modal Dialog Content & Form Wrapper */}
            <form onSubmit={handleSubmit} className="relative bg-white rounded-2xl shadow-xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden z-10 scale-95 md:scale-100 transition-all duration-300 border border-gray-100">
                
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-150">
                    <h2 className="text-xl font-bold text-gray-900">
                        {isEditMode ? 'Edit Delivery Address' : 'Add a New Address'}
                    </h2>
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="px-4 py-2 border border-gray-300 text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 rounded-lg transition-colors disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex items-center justify-center gap-2 px-5 py-2 bg-accent hover:bg-accent-dark text-sm font-semibold text-white rounded-lg transition-colors shadow-sm min-w-[100px] disabled:opacity-50"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                'Save Address'
                            )}
                        </button>
                    </div>
                </div>

                {/* Form fields body wrapper */}
                <div className="flex flex-col flex-grow overflow-y-auto">
                    <div className="p-6 space-y-5">
                        
                        {/* Address Label Pills */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2.5">
                                Address Type / Label
                            </label>
                            <div className="flex gap-3">
                                {(['Home', 'Work', 'Other'] as const).map((type) => (
                                    <button
                                        key={type}
                                        type="button"
                                        onClick={() => setLabel(type)}
                                        className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold border transition-all duration-200 ${
                                            label === type
                                                ? type === 'Home'
                                                    ? 'bg-blue-50 text-blue-700 border-blue-200 ring-1 ring-blue-100'
                                                    : type === 'Work'
                                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-1 ring-emerald-100'
                                                    : 'bg-gray-800 text-white border-gray-800 shadow-sm'
                                                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                                        }`}
                                    >
                                        {type === 'Home' && <Home className="w-4 h-4" />}
                                        {type === 'Work' && <Briefcase className="w-4 h-4" />}
                                        {type === 'Other' && <MapPin className="w-4 h-4" />}
                                        {type}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Name & Phone */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                    Full Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    placeholder="First and Last name"
                                    className={`w-full px-3.5 py-2 border rounded-lg text-sm transition-all focus:outline-none focus:ring-2 ${
                                        errors.fullName
                                            ? 'border-red-400 focus:ring-red-100'
                                            : 'border-gray-300 focus:border-accent focus:ring-accent-light'
                                    }`}
                                />
                                {errors.fullName && (
                                    <p className="mt-1 text-xs font-medium text-red-500">{errors.fullName}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                    Phone Number <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => {
                                        let v = e.target.value;
                                        const hasPlus = v.startsWith('+');
                                        v = v.replace(/[^\d]/g, '');
                                        if (hasPlus) {
                                            v = '+' + v;
                                        }
                                        v = v.slice(0, 16);
                                        setPhone(v);
                                        if (errors.phone) {
                                            setErrors((prev) => {
                                                const next = { ...prev };
                                                delete next.phone;
                                                return next;
                                            });
                                        }
                                    }}
                                    placeholder="10-digit mobile or international number"
                                    maxLength={16}
                                    className={`w-full px-3.5 py-2 border rounded-lg text-sm transition-all focus:outline-none focus:ring-2 ${
                                        errors.phone
                                            ? 'border-red-400 focus:ring-red-100'
                                            : 'border-gray-300 focus:border-accent focus:ring-accent-light'
                                    }`}
                                />
                                {errors.phone && (
                                    <p className="mt-1 text-xs font-medium text-red-500">{errors.phone}</p>
                                )}
                            </div>
                        </div>

                        {/* Address Line 1 */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                Flat, House no., Building, Company, Apartment <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={addressLine1}
                                onChange={(e) => setAddressLine1(e.target.value)}
                                placeholder="Street address, P.O. box, company name, c/o"
                                className={`w-full px-3.5 py-2 border rounded-lg text-sm transition-all focus:outline-none focus:ring-2 ${
                                        errors.addressLine1
                                            ? 'border-red-400 focus:ring-red-100'
                                            : 'border-gray-300 focus:border-accent focus:ring-accent-light'
                                    }`}
                            />
                            {errors.addressLine1 && (
                                <p className="mt-1 text-xs font-medium text-red-500">{errors.addressLine1}</p>
                            )}
                        </div>

                        {/* Address Line 2 */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                Area, Street, Sector, Village <span className="text-gray-400 text-xs font-normal">(Optional)</span>
                            </label>
                            <input
                                type="text"
                                value={addressLine2}
                                onChange={(e) => setAddressLine2(e.target.value)}
                                placeholder="Apartment, suite, unit, building, floor, etc."
                                className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm transition-all focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent-light"
                            />
                        </div>

                        {/* City, State & Pincode */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                    Town/City <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={city}
                                    onChange={(e) => setCity(e.target.value)}
                                    placeholder="Mumbai"
                                    className={`w-full px-3.5 py-2 border rounded-lg text-sm transition-all focus:outline-none focus:ring-2 ${
                                        errors.city
                                            ? 'border-red-400 focus:ring-red-100'
                                            : 'border-gray-300 focus:border-accent focus:ring-accent-light'
                                    }`}
                                />
                                {errors.city && (
                                    <p className="mt-1 text-xs font-medium text-red-500">{errors.city}</p>
                                )}
                            </div>

                            {COUNTRY_STATES[country] ? (
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                        State <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={state}
                                        onChange={(e) => setState(e.target.value)}
                                        className={`w-full px-3.5 py-2 border rounded-lg text-sm bg-white text-gray-900 font-medium transition-all focus:outline-none focus:ring-2 ${
                                            errors.state
                                                ? 'border-red-400 focus:ring-red-100'
                                                : 'border-gray-300 focus:border-accent focus:ring-accent-light'
                                        }`}
                                    >
                                        <option value="">Select state</option>
                                        {COUNTRY_STATES[country].map((s) => (
                                            <option key={s} value={s}>{s}</option>
                                        ))}
                                    </select>
                                    {errors.state && (
                                        <p className="mt-1 text-xs font-medium text-red-500">{errors.state}</p>
                                    )}
                                </div>
                            ) : (
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                        State / Province <span className="text-gray-400 text-xs font-normal">(Optional)</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={state}
                                        onChange={(e) => setState(e.target.value)}
                                        placeholder="State or province"
                                        className={`w-full px-3.5 py-2 border rounded-lg text-sm transition-all focus:outline-none focus:ring-2 ${
                                            errors.state
                                                ? 'border-red-400 focus:ring-red-100'
                                                : 'border-gray-300 focus:border-accent focus:ring-accent-light'
                                        }`}
                                    />
                                    {errors.state && (
                                        <p className="mt-1 text-xs font-medium text-red-500">{errors.state}</p>
                                    )}
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                    Pincode / Postal <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={postalCode}
                                    onChange={(e) => setPostalCode(e.target.value)}
                                    placeholder="400001"
                                    className={`w-full px-3.5 py-2 border rounded-lg text-sm transition-all focus:outline-none focus:ring-2 ${
                                        errors.postalCode
                                            ? 'border-red-400 focus:ring-red-100'
                                            : 'border-gray-300 focus:border-accent focus:ring-accent-light'
                                    }`}
                                />
                                {errors.postalCode && (
                                    <p className="mt-1 text-xs font-medium text-red-500">{errors.postalCode}</p>
                                )}
                            </div>
                        </div>

                        {/* Country */}
                        <div className="grid grid-cols-1 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                    Country/Region <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={country}
                                    onChange={(e) => {
                                        setCountry(e.target.value);
                                        setState(''); // Reset state when country changes
                                    }}
                                    className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm bg-white text-gray-900 font-medium transition-all focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent-light"
                                >
                                    {COUNTRIES.map((c) => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Set as Default (checkbox) */}
                        {!address?.is_default && (
                            <div className="flex items-center gap-2 pt-2">
                                <input
                                    type="checkbox"
                                    id="isDefaultCheckbox"
                                    checked={isDefault}
                                    onChange={(e) => setIsDefault(e.target.checked)}
                                    className="w-4 h-4 text-accent border-gray-300 rounded focus:ring-accent-light focus:ring-2 cursor-pointer"
                                />
                                <label
                                    htmlFor="isDefaultCheckbox"
                                    className="text-sm font-medium text-gray-700 cursor-pointer select-none"
                                >
                                    Make this my default delivery address
                                </label>
                            </div>
                        )}
                    </div>

                </div>
            </form>
        </div>
    );
}
