'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { shippingAddressSchema, ShippingAddress, COUNTRIES, COUNTRY_STATES, formatPhoneNumber } from '@/lib/validations/checkout';
import { useState, useEffect } from 'react';
import Input from '@/components/ui/Input';
import { Check, MapPin, Pencil, Loader2 } from 'lucide-react';
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
            // Auto format the phone number to E.164 format (with +91 or +) before submitting/saving
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
        'w-full px-4 py-2 border border-primary-200 rounded-lg outline-none transition-colors focus:ring-1 focus:ring-primary focus:border-primary bg-white text-sm text-textPrimary';

    return (
        <div className="bg-white rounded-2xl border border-primary-100 p-6">
            <h2 className="text-xs font-semibold tracking-[0.2em] uppercase text-textSecondary/60 mb-6">
                <span className="font-playfair text-2xl font-bold text-primary/15 mr-3 normal-case tracking-normal align-middle" aria-hidden="true">02</span>
                Shipping Details
            </h2>

            {isAddressesLoading ? (
                <div className="flex flex-col items-center justify-center p-6 border border-dashed border-primary-200 rounded-xl bg-primary-50/40 mb-6 animate-pulse">
                    <Loader2 className="w-6 h-6 animate-spin text-primary mb-2" />
                    <p className="text-xs text-textSecondary font-medium">Checking for saved addresses...</p>
                </div>
            ) : (
                savedAddresses && savedAddresses.length > 0 && (
                    <div className="mb-6">
                        <label className="block text-xs font-semibold tracking-[0.15em] uppercase text-textSecondary/60 mb-3">
                            Delivery Address
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Option A: Saved Address */}
                            <button
                                type="button"
                                onClick={() => {
                                    setSelectedOption('saved');
                                    const defaultAddress = savedAddresses.find((a) => a.is_default) || savedAddresses[0];
                                    setSelectedAddressId(defaultAddress.id);
                                }}
                                className={`flex items-start gap-3.5 p-4 rounded-xl border text-left transition-all duration-200 ${
                                    selectedOption === 'saved'
                                        ? 'border-primary bg-primary-50/50 ring-1 ring-primary'
                                        : 'border-primary-100 hover:border-primary-300'
                                }`}
                            >
                                <div className={`mt-0.5 w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
                                    selectedOption === 'saved' ? 'border-[5px] border-primary' : 'border-primary-200'
                                }`} />
                                <div>
                                    <span className="block font-semibold text-textPrimary text-sm">Use Saved Address</span>
                                    <span className="block text-xs text-textSecondary/70 mt-0.5">Select a pre-saved location from your account</span>
                                </div>
                            </button>

                            {/* Option B: Manual Entry */}
                            <button
                                type="button"
                                onClick={() => {
                                    setSelectedOption('manual');
                                    setSelectedAddressId(undefined);
                                }}
                                className={`flex items-start gap-3.5 p-4 rounded-xl border text-left transition-all duration-200 ${
                                    selectedOption === 'manual'
                                        ? 'border-primary bg-primary-50/50 ring-1 ring-primary'
                                        : 'border-primary-100 hover:border-primary-300'
                                }`}
                            >
                                <div className={`mt-0.5 w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
                                    selectedOption === 'manual' ? 'border-[5px] border-primary' : 'border-primary-200'
                                }`} />
                                <div>
                                    <span className="block font-semibold text-textPrimary text-sm">Enter a New Address</span>
                                    <span className="block text-xs text-textSecondary/70 mt-0.5">Type address details manually</span>
                                </div>
                            </button>
                        </div>
                    </div>
                )
            )}

            {/* Selectable Saved Address List */}
            {!isAddressesLoading && selectedOption === 'saved' && savedAddresses && savedAddresses.length > 0 && (
                <div className="mb-6 bg-primary-50/40 rounded-xl border border-primary-100 p-4">
                    <label className="block text-xs font-semibold tracking-[0.15em] uppercase text-textSecondary/60 mb-3">
                        Available Addresses
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                        {savedAddresses.map((address) => {
                            const isSelected = selectedAddressId === address.id;
                            return (
                                <div
                                    key={address.id}
                                    onClick={() => setSelectedAddressId(address.id)}
                                    className={`cursor-pointer flex flex-col justify-between p-4 rounded-xl border bg-white transition-all duration-200 select-none ${
                                        isSelected
                                            ? 'border-primary ring-1 ring-primary'
                                            : 'border-primary-100 hover:border-primary-300'
                                    }`}
                                >
                                    <div>
                                        <div className="flex items-center justify-between mb-2.5">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-[0.1em] uppercase bg-primary-50 text-primary border border-primary-100">
                                                {address.label}
                                            </span>
                                            {isSelected && (
                                                <span className="flex items-center text-xs font-semibold text-primary gap-1">
                                                    <Check className="w-3.5 h-3.5" />
                                                    Selected
                                                </span>
                                            )}
                                        </div>
                                        <h4 className="font-semibold text-textPrimary text-sm truncate">{address.full_name}</h4>
                                        <p className="text-xs text-textSecondary/70 truncate mb-2">{address.phone}</p>
                                        <div className="text-xs text-textSecondary space-y-0.5 leading-relaxed">
                                            <p className="truncate">{address.address_line1}</p>
                                            {address.address_line2 && <p className="truncate text-textSecondary/70">{address.address_line2}</p>}
                                            <p>
                                                {address.city}, {address.state} - {address.postal_code}
                                            </p>
                                            <p className="text-[10px] text-textSecondary/50 font-semibold uppercase tracking-[0.1em] mt-1">{address.country}</p>
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

                {isLoggedIn && selectedOption === 'manual' && (
                    <div className="flex items-center gap-3 py-2">
                        <input
                            id="saveAddressToProfile"
                            type="checkbox"
                            checked={saveAddressToProfile}
                            onChange={(e) => setSaveAddressToProfile(e.target.checked)}
                            className="w-4 h-4 accent-primary border-primary-200 rounded focus:ring-primary focus:ring-2 cursor-pointer"
                        />
                        <label htmlFor="saveAddressToProfile" className="text-sm font-medium text-textPrimary cursor-pointer select-none">
                            Save this address to my profile for future purchases
                        </label>
                    </div>
                )}

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="
                        w-full py-3.5 px-6 rounded-full font-semibold text-secondary text-base
                        bg-primary hover:bg-primary-light active:bg-primary-dark
                        disabled:opacity-60 disabled:cursor-not-allowed
                        transition-colors duration-200
                        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2
                    "
                >
                    {isSubmitting ? 'Calculating shipping…' : 'Confirm Address & Continue to Payment'}
                </button>
            </form>
        </div>
    );
}
