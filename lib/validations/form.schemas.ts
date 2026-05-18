import { z } from 'zod';

// ── Shared field definitions ──────────────────────────────────────────────────

const fullNameField = z
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name is too long')
    .regex(/^[a-zA-Z\s'-]+$/, 'Name should only contain letters and spaces');

export const emailField = z
    .string()
    .trim()
    .min(1, 'Email is required')
    .refine((val) => {
        // Block invalid formats like example@gmail.comm, @gmail.com, maha@
        const regex = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
        const parts = val.split('@');
        if (parts.length !== 2) return false;
        
        const [local, domain] = parts;
        if (!local || !domain) return false; // Blocks @gmail.com, maha@
        
        const domainParts = domain.split('.');
        if (domainParts.length < 2) return false;
        
        const tld = domainParts[domainParts.length - 1];
        
        // Block common typos like .commm, .con, .comm
        if (tld === 'comm' || tld === 'commm' || tld === 'con') return false;

        return (
            regex.test(val) &&
            !local.startsWith('.') &&
            !local.endsWith('.') &&
            !local.includes('..') &&
            tld.length >= 2 && tld.length <= 6
        );
    }, {
        message: 'Please enter a valid email address',
    });

// E.164 format: + followed by 8–15 digits, first digit of country code non-zero
const phoneField = z
    .string()
    .trim()
    .regex(
        /^\+[1-9]\d{7,14}$/,
        'Please provide a valid international phone number starting with + (e.g. +919876543210)'
    );

// ── Contact Form ──────────────────────────────────────────────────────────────

export const contactFormSchema = z.object({
    name: fullNameField,
    email: emailField,
    subject: z.string().trim().min(1, 'Please select a subject'),
    message: z.string().trim().min(10, 'Message must be at least 10 characters').max(2000, 'Message is too long'),
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
