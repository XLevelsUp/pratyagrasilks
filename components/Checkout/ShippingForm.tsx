'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { shippingAddressSchema, ShippingAddress, COUNTRIES, COUNTRY_STATES } from '@/lib/validations/checkout';
import { useState } from 'react';
import Input from '@/components/ui/Input';

interface Props {
    onSubmit: (data: ShippingAddress) => Promise<void>;
    initialEmail?: string;
}

export default function ShippingForm({ onSubmit, initialEmail }: Props) {
    const [country, setCountry] = useState('India');
    const [isSubmitting, setIsSubmitting] = useState(false);

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

    const handleFormSubmit = async (data: ShippingAddress) => {
        setIsSubmitting(true);
        try {
            await onSubmit(data);
        } finally {
            setIsSubmitting(false);
        }
    };

    const selectClass =
        'w-full px-4 py-2 border border-gray-300 rounded-md outline-none transition-colors focus:ring-2 focus:ring-primary focus:border-primary bg-white text-sm text-gray-900';

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Shipping Details</h2>

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
