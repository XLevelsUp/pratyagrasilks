'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { Loader2, Pencil, UserPlus, X } from 'lucide-react';
import Input from '@/components/ui/Input';
import {
    walkInCustomerSchema,
    WalkInCustomerFormValues,
    WalkInCustomerPayload,
} from '@/lib/validations/walkInCustomer.schema';
import { createWalkInCustomer, updateCustomer } from '@/lib/actions/customer.actions';

export interface EditableCustomer {
    id: string;
    fullName: string;
    phone: string;
    email: string;
    isGuest: boolean;
}

interface CustomerFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    /** Present → edit mode; absent → create walk-in mode */
    customer?: EditableCustomer;
    /** Edit mode: receives the saved values so the page can refresh local state */
    onUpdated?: (c: { fullName: string; phone: string; email: string | null }) => void;
}

/**
 * Create mode: quick-create for walk-in (guest) customers — name + phone,
 * Enter to submit, then straight to the measurement entry screen. A known
 * phone jumps to the existing customer instead of duplicating.
 * Edit mode (ADMIN only): fix mistakes made while adding. Email is locked
 * for registered customers — it is managed by their account login.
 */
export default function CustomerFormModal({ isOpen, onClose, customer, onUpdated }: CustomerFormModalProps) {
    const router = useRouter();
    const isEdit = !!customer;
    const emailLocked = isEdit && !customer.isGuest;

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<WalkInCustomerFormValues, unknown, WalkInCustomerPayload>({
        resolver: zodResolver(walkInCustomerSchema),
        mode: 'onTouched',
        defaultValues: { fullName: '', phone: '', email: '' },
    });

    // Close on Escape key (inert mid-submit)
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen && !isSubmitting) {
                onClose();
            }
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, isSubmitting, onClose]);

    // Prevent body scroll while open; seed fields (edit) / clear them (create) on open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            reset({
                fullName: customer?.fullName ?? '',
                phone: customer?.phone ?? '',
                email: customer?.email ?? '',
            });
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, customer, reset]);

    const onSubmit = handleSubmit(async (values) => {
        if (isEdit) {
            const result = await updateCustomer(customer.id, values);
            if (!result.success || !result.customer) {
                toast.error(result.error ?? 'Failed to update customer');
                return;
            }
            toast.success('Customer updated');
            onUpdated?.(result.customer);
            onClose();
            return;
        }

        const result = await createWalkInCustomer(values);
        if (!result.success || !result.customerId) {
            toast.error(result.error ?? 'Failed to create customer');
            return;
        }
        if (result.existing) {
            toast(`${result.existingName || 'Customer'} already exists — opening their profile`, { icon: 'ℹ️' });
        } else {
            toast.success('Walk-in customer created');
        }
        router.push(`/admin/customers/${result.customerId}?newProfile=1`);
    });

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm"
            onClick={() => !isSubmitting && onClose()}
        >
            <div
                className="bg-white rounded-lg shadow-xl max-w-md w-full transform transition-all"
                onClick={(e) => e.stopPropagation()}
            >
                <form onSubmit={onSubmit}>
                    {/* Header */}
                    <div className="flex items-start justify-between p-6 pb-4">
                        <div className="flex items-center gap-3">
                            <div className="flex-shrink-0 text-amber-600">
                                {isEdit ? <Pencil className="w-6 h-6" /> : <UserPlus className="w-6 h-6" />}
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">
                                    {isEdit ? 'Edit Customer' : 'New Walk-in Customer'}
                                </h3>
                                <p className="text-sm text-gray-500">
                                    {isEdit
                                        ? 'Correct the customer’s details'
                                        : 'Create a profile to start taking measurements'}
                                </p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="text-gray-400 hover:text-textSecondary transition-colors disabled:opacity-50"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Fields */}
                    <div className="px-6 pb-2 space-y-2">
                        <Input
                            label="Full Name"
                            placeholder="Customer name"
                            autoFocus
                            autoComplete="off"
                            {...register('fullName')}
                            error={errors.fullName?.message}
                        />
                        <Input
                            label="Phone Number"
                            placeholder="9876543210"
                            type="tel"
                            inputMode="tel"
                            autoComplete="off"
                            {...register('phone')}
                            error={errors.phone?.message}
                        />
                        <div>
                            <Input
                                label={emailLocked ? 'Email' : 'Email (optional)'}
                                placeholder="customer@example.com"
                                type="email"
                                autoComplete="off"
                                disabled={emailLocked}
                                className={emailLocked ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}
                                {...register('email')}
                                error={errors.email?.message}
                            />
                            {emailLocked && (
                                <p className="-mt-3 text-xs text-gray-500">
                                    Managed by the customer’s account login — cannot be edited here.
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3 px-6 py-4 bg-gray-50 rounded-b-lg">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                            {isSubmitting
                                ? 'Saving…'
                                : isEdit
                                  ? 'Save Changes'
                                  : 'Create & Add Measurements'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
