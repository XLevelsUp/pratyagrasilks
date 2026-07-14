import { z } from 'zod';
import { emailField, fullNameField } from '@/lib/validations/form.schemas';
import { normalizeToE164 } from '@/lib/utils/phone';

/**
 * Walk-in (guest) customer created by staff from the admin dashboard.
 * Phone is the identifying key for walk-ins: validated with libphonenumber-js
 * and transformed to canonical E.164 (+91... for bare Indian numbers), the
 * same format enforced DB-side by normalize_phone_e164().
 */
export const walkInCustomerSchema = z.object({
    fullName: fullNameField,
    phone: z
        .string()
        .trim()
        .min(1, 'Phone number is required')
        .transform((val, ctx) => {
            const e164 = normalizeToE164(val);
            if (!e164) {
                ctx.addIssue({
                    code: 'custom',
                    message: 'Enter a valid 10-digit mobile number (e.g. 9876543210)',
                });
                return z.NEVER;
            }
            return e164;
        }),
    email: z.preprocess(
        (v) => (typeof v === 'string' && v.trim() === '' ? undefined : v),
        emailField.optional()
    ),
});

/** What the form inputs hold (pre-transform, all strings) */
export type WalkInCustomerFormValues = z.input<typeof walkInCustomerSchema>;
/** Validated payload (phone already E.164) */
export type WalkInCustomerPayload = z.output<typeof walkInCustomerSchema>;
