'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { Loader2, Ruler } from 'lucide-react';
import Input from '@/components/ui/Input';
import { fieldsByGroup, MEASUREMENT_FIELDS, MeasurementKey } from '@/lib/constants/measurements';
import {
    measurementProfileSchema,
    MeasurementProfile,
    MeasurementProfileFormValues,
} from '@/lib/validations/measurement.schema';
import {
    createMeasurementProfile,
    updateMeasurementProfile,
} from '@/lib/actions/measurement.actions';

interface Props {
    customerId: string;
    /** When provided the form edits this profile; otherwise it creates a new one */
    profile?: MeasurementProfile;
    onSaved: (profile: MeasurementProfile) => void;
    onCancel: () => void;
}

/** Build RHF default values (all strings; null measurements render as '') */
function toFormValues(profile?: MeasurementProfile): MeasurementProfileFormValues {
    const measurements = Object.fromEntries(
        MEASUREMENT_FIELDS.map((f) => {
            const v = profile?.[f.key as MeasurementKey];
            return [f.key, v === null || v === undefined ? '' : String(v)];
        })
    ) as Record<MeasurementKey, string>;

    return {
        profileLabel: profile?.profileLabel ?? '',
        outfitType: profile?.outfitType ?? '',
        designer: profile?.designer ?? '',
        notes: profile?.notes ?? '',
        ...measurements,
    };
}

const inchSuffix = (
    <span className="pr-3 text-gray-400 text-sm select-none" aria-hidden="true">
        ″
    </span>
);

export default function MeasurementProfileForm({ customerId, profile, onSaved, onCancel }: Props) {
    const [submitting, setSubmitting] = useState(false);
    const isEdit = Boolean(profile);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<MeasurementProfileFormValues>({
        resolver: zodResolver(measurementProfileSchema) as never,
        mode: 'onTouched',
        defaultValues: toFormValues(profile),
    });

    const onSubmit = async (values: MeasurementProfileFormValues) => {
        setSubmitting(true);
        try {
            const result = isEdit
                ? await updateMeasurementProfile(profile!.id, customerId, values)
                : await createMeasurementProfile(customerId, values);

            if (result.success && result.profile) {
                toast.success(isEdit ? 'Measurements updated' : 'Measurement profile saved');
                onSaved(result.profile);
            } else {
                toast.error(result.error ?? 'Something went wrong');
            }
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-3 mb-6">
                <span className="flex items-center justify-center w-10 h-10 rounded-full bg-amber-100 text-amber-700">
                    <Ruler className="w-5 h-5" aria-hidden="true" />
                </span>
                <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                        {isEdit ? `Edit “${profile!.profileLabel}”` : 'New Measurement Profile'}
                    </h2>
                    <p className="text-xs text-gray-500">
                        All measurements in inches · leave blank anything not taken yet
                    </p>
                </div>
            </div>

            {/* Identity row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-2">
                <Input
                    label="Profile Label *"
                    placeholder="Self, Daughter…"
                    error={errors.profileLabel?.message}
                    {...register('profileLabel')}
                />
                <Input
                    label="Outfit Type"
                    placeholder="Blouse, Lehenga…"
                    error={errors.outfitType?.message as string | undefined}
                    {...register('outfitType')}
                />
                <Input
                    label="Designer"
                    placeholder="Assigned designer"
                    error={errors.designer?.message as string | undefined}
                    {...register('designer')}
                />
            </div>

            {/* Measurement groups */}
            {fieldsByGroup().map(({ group, fields }) => (
                <fieldset key={group} className="border-t border-gray-200 pt-4 mb-2">
                    <legend className="text-xs font-semibold tracking-[0.15em] uppercase text-gray-500 pr-3">
                        {group}
                    </legend>
                    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-1 mt-3">
                        {fields.map((field) => (
                            <Input
                                key={field.key}
                                label={field.label}
                                type="number"
                                inputMode="decimal"
                                step="0.25"
                                min={1}
                                max={100}
                                placeholder="—"
                                rightIcon={inchSuffix}
                                error={errors[field.key as MeasurementKey]?.message as string | undefined}
                                {...register(field.key as MeasurementKey)}
                            />
                        ))}
                    </div>
                </fieldset>
            ))}

            {/* Notes */}
            <div className="border-t border-gray-200 pt-4">
                <label htmlFor="measurement-notes" className="block text-sm font-medium text-gray-700 mb-1">
                    Notes / Special Instructions
                </label>
                <textarea
                    id="measurement-notes"
                    rows={3}
                    placeholder="Fit preferences, fabric notes, alterations…"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md outline-none transition-colors focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-sm"
                    {...register('notes')}
                />
                <p className="mt-1 text-xs min-h-[1rem] text-red-600" aria-live="polite">
                    {(errors.notes?.message as string | undefined) ?? ''}
                </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 mt-4">
                <button
                    type="submit"
                    disabled={submitting}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                    {submitting && <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />}
                    {submitting ? 'Saving…' : isEdit ? 'Update Measurements' : 'Save Profile'}
                </button>
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={submitting}
                    className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                    Cancel
                </button>
            </div>
        </form>
    );
}
