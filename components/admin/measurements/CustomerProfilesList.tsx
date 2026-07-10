'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { Pencil, Ruler, Trash2 } from 'lucide-react';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { fieldsByGroup, MEASUREMENT_COUNT, MeasurementKey } from '@/lib/constants/measurements';
import { MeasurementProfile } from '@/lib/validations/measurement.schema';
import { deleteMeasurementProfile } from '@/lib/actions/measurement.actions';

interface Props {
    customerId: string;
    profiles: MeasurementProfile[];
    canDelete: boolean;
    onEdit: (profile: MeasurementProfile) => void;
    onDeleted: (profileId: string) => void;
    onAddNew: () => void;
}

function recordedCount(profile: MeasurementProfile): number {
    return fieldsByGroup()
        .flatMap((g) => g.fields)
        .filter((f) => profile[f.key as MeasurementKey] !== null && profile[f.key as MeasurementKey] !== undefined)
        .length;
}

function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function CustomerProfilesList({
    customerId,
    profiles,
    canDelete,
    onEdit,
    onDeleted,
    onAddNew,
}: Props) {
    const [deleteTarget, setDeleteTarget] = useState<MeasurementProfile | null>(null);
    const [deleting, setDeleting] = useState(false);

    const handleDelete = async () => {
        if (!deleteTarget) return;
        setDeleting(true);
        try {
            const result = await deleteMeasurementProfile(deleteTarget.id, customerId);
            if (result.success) {
                toast.success(`“${deleteTarget.profileLabel}” deleted`);
                onDeleted(deleteTarget.id);
            } else {
                toast.error(result.error ?? 'Failed to delete');
            }
        } finally {
            setDeleting(false);
            setDeleteTarget(null);
        }
    };

    if (profiles.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow p-12 text-center">
                <Ruler className="w-10 h-10 text-gray-300 mx-auto mb-4" aria-hidden="true" />
                <h3 className="text-lg font-semibold text-gray-900 mb-1">No measurement profiles yet</h3>
                <p className="text-sm text-gray-500 mb-6">
                    Record this customer&apos;s first set of tailoring measurements.
                </p>
                <button
                    onClick={onAddNew}
                    className="px-6 py-3 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700 transition-colors"
                >
                    + New Measurement Profile
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {profiles.map((profile) => {
                const recorded = recordedCount(profile);
                return (
                    <div key={profile.id} className="bg-white rounded-lg shadow overflow-hidden">
                        {/* Card header */}
                        <div className="flex flex-wrap items-center gap-3 px-6 py-4 border-b border-gray-100">
                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                                {profile.profileLabel}
                            </span>
                            {profile.outfitType ? (
                                <span className="text-sm text-gray-600">{profile.outfitType}</span>
                            ) : null}
                            {profile.designer ? (
                                <span className="text-xs text-gray-400">Designer: {profile.designer}</span>
                            ) : null}
                            <span
                                className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${recorded === MEASUREMENT_COUNT
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-gray-100 text-gray-600'
                                    }`}
                            >
                                {recorded} of {MEASUREMENT_COUNT} recorded
                            </span>
                            <span className="text-xs text-gray-400 ml-auto">
                                Updated {formatDate(profile.updatedAt)}
                            </span>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => onEdit(profile)}
                                    className="p-2 rounded-md text-gray-500 hover:text-amber-700 hover:bg-amber-50 transition-colors"
                                    aria-label={`Edit ${profile.profileLabel}`}
                                >
                                    <Pencil className="w-4 h-4" />
                                </button>
                                {canDelete && (
                                    <button
                                        onClick={() => setDeleteTarget(profile)}
                                        className="p-2 rounded-md text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                                        aria-label={`Delete ${profile.profileLabel}`}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Measurements — null renders as a muted em-dash, never breaks */}
                        <div className="px-6 py-4 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-x-8 gap-y-4">
                            {fieldsByGroup().map(({ group, fields }) => (
                                <div key={group}>
                                    <p className="text-[11px] font-semibold tracking-[0.15em] uppercase text-gray-400 mb-2">
                                        {group}
                                    </p>
                                    <dl className="flex flex-col gap-y-1 space-y-1">
                                        {fields.map((field) => {
                                            const value = profile[field.key as MeasurementKey] as number | null;
                                            return (
                                                <div key={field.key} className="flex items-baseline justify-between gap-2 text-sm border-b">
                                                    <dt className="text-gray-600">{field.label}</dt>
                                                    {value !== null && value !== undefined ? (
                                                        <dd className="font-medium text-gray-900 tabular-nums">{value}</dd>
                                                    ) : (
                                                        <dd className="text-gray-300 select-none" aria-label="Not recorded">—</dd>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </dl>
                                </div>
                            ))}
                        </div>

                        {profile.notes ? (
                            <div className="px-6 py-3 bg-amber-50/60 border-t border-amber-100 text-sm text-gray-700">
                                <span className="text-[11px] font-semibold tracking-[0.15em] uppercase text-amber-700 mr-2">
                                    Notes
                                </span>
                                {profile.notes}
                            </div>
                        ) : null}
                    </div>
                );
            })}

            <ConfirmDialog
                isOpen={deleteTarget !== null}
                onClose={() => setDeleteTarget(null)}
                onConfirm={handleDelete}
                title="Delete measurement profile?"
                message={`“${deleteTarget?.profileLabel ?? ''}” and all its recorded measurements will be permanently removed.`}
                confirmText={deleting ? 'Deleting…' : 'Delete'}
                cancelText="Cancel"
                variant="danger"
            />
        </div>
    );
}
