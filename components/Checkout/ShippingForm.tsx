'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { shippingAddressSchema, ShippingAddress, COUNTRIES, COUNTRY_STATES, formatPhoneNumber } from '@/lib/validations/checkout';
import { useState, useEffect } from 'react';
import Input from '@/components/ui/Input';
import { Check, Loader2 } from 'lucide-react';
import type { Address } from '@/components/profile/AddressCard';

interface Props {
    onSubmit: (data: ShippingAddress, selectedAddressId?: string, saveToProfile?: boolean) => Promise<void>;
    initialEmail?: string;
    savedAddresses?: Address[];
    isAddressesLoading?: boolean;
    isLoggedIn?: boolean;
}

export default function ShippingForm({ onSubmit, initialEmail, savedAddresses, isAddressesLoading = false, isLoggedIn = false }: Props) {
    const [country, setCountry] = useState('India');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [saveAddressToProfile, setSaveAddressToProfile] = useState(false);

    const [selectedOption, setSelectedOption] = useState<'saved' | 'manual'>(() => {
        return savedAddresses && savedAddresses.length > 0 ? 'saved' : 'manual';
    });

    const [selectedAddressId, setSelectedAddressId] = useState<string | undefined>(() => {
        if (savedAddresses && savedAddresses.length > 0) {
            const defaultAddress = savedAddresses.find((a) => a.is_default);
            return defaultAddress ? defaultAddress.id : savedAddresses[0].id;
        }
        return undefined;
    });

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm<ShippingAddress>({
        resolver: zodResolver(shippingAddressSchema),
        mode: 'onTouched',
        defaultValues: { country: 'India', email: initialEmail || '' },
    });

    // Sync state when savedAddresses load asynchronously
    useEffect(() => {
        if (savedAddresses && savedAddresses.length > 0) {
            setSelectedOption('saved');
            const defaultAddress = savedAddresses.find((a) => a.is_default) || savedAddresses[0];
            setSelectedAddressId(defaultAddress.id);
        } else {
            setSelectedOption('manual');
            setSelectedAddressId(undefined);
        }
    }, [savedAddresses]);

    // Auto-populate or clear fields
    useEffect(() => {
        if (selectedOption === 'saved' && selectedAddressId && savedAddresses) {
            const address = savedAddresses.find((a) => a.id === selectedAddressId);
            if (address) {
                setValue('fullName', address.full_name, { shouldValidate: true });
                setValue('phone', address.phone, { shouldValidate: true });
                setValue('addressLine1', address.address_line1, { shouldValidate: true });
                setValue('addressLine2', address.address_line2 || '', { shouldValidate: true });
                setValue('city', address.city, { shouldValidate: true });
                setValue('country', address.country, { shouldValidate: true });
                setCountry(address.country);
                setValue('state', address.state || '', { shouldValidate: true });
                setValue('postalCode', address.postal_code, { shouldValidate: true });
            }
        } else if (selectedOption === 'manual') {
            setValue('fullName', '', { shouldValidate: false });
            setValue('phone', '', { shouldValidate: false });
            setValue('addressLine1', '', { shouldValidate: false });
            setValue('addressLine2', '', { shouldValidate: false });
            setValue('city', '', { shouldValidate: false });
            setValue('state', '', { shouldValidate: false });
            setValue('postalCode', '', { shouldValidate: false });
            setValue('country', 'India', { shouldValidate: false });
            setCountry('India');
        }
        setValue('email', initialEmail || '');
    }, [selectedOption, selectedAddressId, savedAddresses, setValue, initialEmail]);

    const handleFormSubmit = async (data: ShippingAddress) => {
        setIsSubmitting(true);
        try {
            const formattedPhone = formatPhoneNumber(data.phone);
            const submittedData = { ...data, phone: formattedPhone };

            let finalAddressId: string | undefined = undefined;

            if (selectedOption === 'saved' && selectedAddressId && savedAddresses) {
                const savedAddress = savedAddresses.find((a) => a.id === selectedAddressId);
                if (savedAddress) {
                    const isUnchanged =
                        submittedData.fullName.trim() === savedAddress.full_name.trim() &&
                        submittedData.phone.replace(/[^\d+]/g, '') === savedAddress.phone.replace(/[^\d+]/g, '') &&
                        submittedData.addressLine1.trim() === savedAddress.address_line1.trim() &&
                        (submittedData.addressLine2 || '').trim() === (savedAddress.address_line2 || '').trim() &&
                        submittedData.city.trim() === savedAddress.city.trim() &&
                        (submittedData.state || '').trim() === (savedAddress.state || '').trim() &&
                        submittedData.postalCode.trim() === savedAddress.postal_code.trim() &&
                        submittedData.country.trim() === savedAddress.country.trim();

                    if (isUnchanged) {
                        finalAddressId = selectedAddressId;
                    }
                }
            }

            await onSubmit(submittedData, finalAddressId, saveAddressToProfile);
        } finally {
            setIsSubmitting(false);
        }
    };

    const selectClass =
        'w-full px-4 py-2 border border-gray-300 rounded-md outline-none transition-colors focus:ring-2 focus:ring-primary focus:border-primary bg-white text-sm text-gray-900';

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Shipping Details</h2>

            {isAddressesLoading ? (
                <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50 mb-6 animate-pulse">
                    <Loader2 className="w-6 h-6 animate-spin text-primary mb-2" />
                    <p className="text-xs text-gray-500 font-medium">Checking for saved addresses...</p>
                </div>
            ) : (
                savedAddresses && savedAddresses.length > 0 && (
                    <div className="mb-6">
                        <label className="block text-sm font-semibold text-gray-800 mb-3">
                            Select Delivery Method
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <button
                                type="button"
                                onClick={() => {
                                    setSelectedOption('saved');
                                    const defaultAddress = savedAddresses.find((a) => a.is_default) || savedAddresses[0];
                                    setSelectedAddressId(defaultAddress.id);
                                }}
                                className={`flex items-start gap-3.5 p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                                    selectedOption === 'saved'
                                        ? 'border-accent bg-accent/5 ring-1 ring-accent'
                                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50/50'
                                }`}
                            >
                                <div className={`mt-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                                    selectedOption === 'saved' ? 'border-accent text-accent' : 'border-gray-300'
                                }`}>
                                    {selectedOption === 'saved' && <div className="w-2.5 h-2.5 rounded-full bg-accent" />}
                                </div>
                                <div>
                                    <span className="block font-bold text-gray-900 text-sm">Use Saved Address</span>
                                    <span className="block text-xs text-gray-500 mt-0.5">Select a pre-saved location from your account</span>
                                </div>
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    setSelectedOption('manual');
                                    setSelectedAddressId(undefined);
                                }}
                                className={`flex items-start gap-3.5 p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                                    selectedOption === 'manual'
                                        ? 'border-accent bg-accent/5 ring-1 ring-accent'
                                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50/50'
                                }`}
                            >
                                <div className={`mt-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                                    selectedOption === 'manual' ? 'border-accent text-accent' : 'border-gray-300'
                                }`}>
                                    {selectedOption === 'manual' && <div className="w-2.5 h-2.5 rounded-full bg-accent" />}
                                </div>
                                <div>
                                    <span className="block font-bold text-gray-900 text-sm">Enter a New Address</span>
                                    <span className="block text-xs text-gray-500 mt-0.5">Type address details manually</span>
                                </div>
                            </button>
                        </div>
                    </div>
                )
            )}

            {/* Selectable Saved Address List */}
            {!isAddressesLoading && selectedOption === 'saved' && savedAddresses && savedAddresses.length > 0 && (
                <div className="mb-6 bg-gray-50/50 rounded-xl border border-gray-200 p-4">
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                        Available Addresses
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                        {savedAddresses.map((address) => {
                            const isSelected = selectedAddressId === address.id;
                            return (
                                <div
                                    key={address.id}
                                    onClick={() => setSelectedAddressId(address.id)}
                                    className={`cursor-pointer flex flex-col justify-between p-4 rounded-lg border-2 bg-white transition-all duration-200 select-none ${
                                        isSelected
                                            ? 'border-accent ring-1 ring-accent shadow-sm'
                                            : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                >
                                    <div>
                                        <div className="flex items-center justify-between mb-2.5">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${
                                                address.label === 'Home'
                                                    ? 'bg-blue-50 text-blue-700 border-blue-100'
                                                    : address.label === 'Work'
                                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                                    : 'bg-gray-50 text-gray-700 border-gray-200'
                                            }`}>
                                                {address.label}
                                            </span>
                                            {isSelected && (
                                                <span className="flex items-center text-xs font-bold text-accent gap-0.5">
                                                    <Check className="w-3.5 h-3.5" />
                                                    Selected
                                                </span>
                                            )}
                                        </div>
                                        <h4 className="font-bold text-gray-900 text-sm truncate">{address.full_name}</h4>
                                        <p className="text-xs text-gray-500 font-medium truncate mb-2">{address.phone}</p>
                                        <div className="text-xs text-gray-600 space-y-0.5 leading-relaxed">
                                            <p className="font-medium truncate">{address.address_line1}</p>
                                            {address.address_line2 && <p className="truncate text-gray-500">{address.address_line2}</p>}
                                            <p className="font-medium">
                                                {address.city}, {address.state} - {address.postal_code}
                                            </p>
                                            <p className="text-xs text-gray-400 font-bold uppercase tracking-wide mt-1">{address.country}</p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit(handleFormSubmit)} noValidate className="space-y-5">
                {/* Full Name */}
                <Input
                    id="fullName"
                    label="Full Name *"
                    type="text"
                    placeholder="Priya Sharma"
                    autoComplete="name"
                    error={errors.fullName?.message}
                    {...register('fullName')}
                />

                {/* Email + Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                        id="email"
                        label="Email *"
                        type="email"
                        placeholder="priya@example.com"
                        autoComplete="email"
                        error={errors.email?.message}
                        readOnly={!!initialEmail}
                        {...register('email')}
                    />
                    <Input
                        id="phone"
                        label="Phone *"
                        type="tel"
                        placeholder="+919876543210"
                        autoComplete="tel"
                        error={errors.phone?.message}
                        {...register('phone')}
                    />
                </div>

                {/* Address Line 1 */}
                <Input
                    id="addressLine1"
                    label="Address Line 1 *"
                    type="text"
                    placeholder="House / Flat no., Street"
                    autoComplete="address-line1"
                    error={errors.addressLine1?.message}
                    {...register('addressLine1')}
                />

                {/* Address Line 2 */}
                <Input
                    id="addressLine2"
                    label="Address Line 2 (optional)"
                    type="text"
                    placeholder="Landmark, Colony"
                    autoComplete="address-line2"
                    {...register('addressLine2')}
                />

                {/* City + Postal Code */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                        id="city"
                        label="City *"
                        type="text"
                        placeholder="Chennai"
                        autoComplete="address-level2"
                        error={errors.city?.message}
                        {...register('city')}
                    />
                    <Input
                        id="postalCode"
                        label="Postal Code *"
                        type="text"
                        placeholder="600001"
                        autoComplete="postal-code"
                        error={errors.postalCode?.message}
                        {...register('postalCode')}
                    />
                </div>

                {/* Country */}
                <div>
                    <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">Country *</label>
                    <select
                        id="country"
                        autoComplete="country"
                        className={selectClass}
                        {...register('country')}
                        onChange={(e) => {
                            setCountry(e.target.value);
                            setValue('country', e.target.value, { shouldValidate: true });
                            setValue('state', '');
                        }}
                    >
                        {COUNTRIES.map((c) => (
                            <option key={c} value={c}>{c}</option>
                        ))}
                    </select>
                    <p className="mt-1 text-xs min-h-[1rem] text-red-600" aria-live="polite">{errors.country?.message ?? ''}</p>
                </div>

                {/* State / Province */}
                {COUNTRY_STATES[country] ? (
                    <div>
                        <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">State *</label>
                        <select id="state" autoComplete="address-level1" className={selectClass} {...register('state')}>
                            <option value="">Select state</option>
                            {COUNTRY_STATES[country].map((s) => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>
                        <p className="mt-1 text-xs min-h-[1rem] text-red-600" aria-live="polite">{errors.state?.message ?? ''}</p>
                    </div>
                ) : (
                    <Input
                        id="state"
                        label="State / Province (optional)"
                        type="text"
                        placeholder="State or province"
                        autoComplete="address-level1"
                        error={errors.state?.message}
                        {...register('state')}
                    />
                )}

                {/* Save to profile checkbox — shown for logged-in users entering a new address */}
                {isLoggedIn && selectedOption === 'manual' && (
                    <div className="flex items-center gap-3 py-2">
                        <input
                            id="saveAddressToProfile"
                            type="checkbox"
                            checked={saveAddressToProfile}
                            onChange={(e) => setSaveAddressToProfile(e.target.checked)}
                            className="w-4 h-4 text-accent border-gray-300 rounded focus:ring-accent focus:ring-2 cursor-pointer"
                        />
                        <label htmlFor="saveAddressToProfile" className="text-sm font-semibold text-gray-700 cursor-pointer select-none">
                            Save this address to my profile for future purchases
                        </label>
                    </div>
                )}

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="
                        w-full py-3 px-6 rounded-lg font-semibold text-white text-sm
                        bg-primary hover:bg-primary-light active:bg-primary-dark
                        disabled:opacity-60 disabled:cursor-not-allowed
                        transition-colors duration-200 shadow-sm
                        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary
                    "
                >
                    {isSubmitting ? 'Calculating shipping…' : 'Confirm Address & Continue to Payment'}
                </button>
            </form>
        </div>
    );
}
