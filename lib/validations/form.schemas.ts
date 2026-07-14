import { z } from 'zod';

// ── Shared field definitions ──────────────────────────────────────────────────

export const fullNameField = z
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must not exceed 100 characters')
    .regex(/^[a-zA-Z\s'-]+$/, 'Name should only contain letters and spaces');

// Strict email regex — enforces a valid TLD (alphabetic, min 2 chars, max 3 chars to reject .comm)
const STRICT_EMAIL_REGEX = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,3}$/;

export const emailField = z
    .string()
    .trim()
    .min(1, 'Email is required')
    .refine((val) => {
        if (!STRICT_EMAIL_REGEX.test(val)) return false;

        const parts = val.split('@');
        if (parts.length !== 2) return false;

        const [local, domain] = parts;
        if (!local || !domain) return false;

        // Block leading/trailing/consecutive dots in local part
        if (local.startsWith('.') || local.endsWith('.') || local.includes('..')) return false;

        return true;
    }, {
        message: 'Please enter a valid email address',
    });

// Allow international E.164 format or standard 10-digit national format
const phoneField = z
    .string()
    .trim()
    .regex(
        /^(\+[1-9]\d{7,14}|\d{10})$/,
        'Please provide a valid 10-digit mobile number or international number starting with + (e.g. 9876543210 or +919876543210)'
    );

// ── Contact Form ──────────────────────────────────────────────────────────────

export const contactFormSchema = z.object({
    name: fullNameField,
    email: emailField,
    subject: z.string().trim().min(1, 'Please select a subject').max(150, 'Subject must not exceed 150 characters'),
    message: z.string().trim().min(10, 'Message must be at least 10 characters').max(2000, 'Message must not exceed 2000 characters'),
});

export type ContactFormData = z.infer<typeof contactFormSchema>;

// ── Shipping Address ──────────────────────────────────────────────────────────

export const shippingAddressSchema = z.object({
    fullName: fullNameField,
    email: emailField,
    phone: phoneField,
    addressLine1: z.string().trim().min(5, 'Address must be at least 5 characters').max(200, 'Address is too long'),
    addressLine2: z.string().trim().max(200, 'Address is too long').optional(),
    city: z.string().trim().min(2, 'City is required').max(100, 'City name is too long'),
    state: z.string().trim().optional(),
    postalCode: z
        .string()
        .trim()
        .min(3, 'Postal code is required')
        .max(10, 'Postal code is too long')
        .regex(/^[A-Z0-9\s-]+$/i, 'Invalid postal code format'),
    country: z.string().trim().min(1, 'Please select a country'),
});

export type ShippingAddress = z.infer<typeof shippingAddressSchema>;
