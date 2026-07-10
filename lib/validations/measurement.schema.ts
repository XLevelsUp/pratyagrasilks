import { z } from 'zod';
import { MEASUREMENT_FIELDS, MeasurementKey } from '@/lib/constants/measurements';

/**
 * Optional-measurement pattern: empty input → null (partial entry is a
 * first-class state for rapid shop-floor sessions); any provided value must
 * be numeric within 1–100 inches. Handles both raw string input and
 * react-hook-form's NaN-for-empty number inputs.
 */
export const measurementValue = z.preprocess(
    (v) => {
        if (v === '' || v === null || v === undefined) return null;
        if (typeof v === 'number' && Number.isNaN(v)) return null;
        return v;
    },
    z.union([
        z.null(),
        z.coerce.number().min(1, 'Min 1″').max(100, 'Max 100″'),
    ])
);

const measurementShape = Object.fromEntries(
    MEASUREMENT_FIELDS.map((f) => [f.key, measurementValue])
) as { [K in MeasurementKey]: typeof measurementValue };

const optionalText = (max: number) =>
    z.preprocess(
        (v) => (typeof v === 'string' ? v.trim() : v),
        z.union([z.literal(''), z.string().max(max, `Max ${max} characters`)]).nullable().optional()
    );

export const measurementProfileSchema = z.object({
    profileLabel: z
        .string()
        .trim()
        .min(1, 'Profile label is required (e.g. “Self”, “Daughter”)')
        .max(40, 'Max 40 characters'),
    outfitType: optionalText(60),
    designer: optionalText(60),
    notes: optionalText(2000),
    ...measurementShape,
});

/** Validated payload — measurements are number | null */
export type MeasurementProfilePayload = z.infer<typeof measurementProfileSchema>;

/**
 * Form value shape for react-hook-form: everything is a string in the DOM;
 * the schema (via zodResolver) converts and bounds-checks.
 */
export type MeasurementProfileFormValues = {
    profileLabel: string;
    outfitType: string;
    designer: string;
    notes: string;
} & Record<MeasurementKey, string>;

/** Saved profile as returned by the server actions (camelCase) */
export type MeasurementProfile = MeasurementProfilePayload & {
    id: string;
    customerId: string;
    createdAt: string;
    updatedAt: string;
};
