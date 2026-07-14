import { parsePhoneNumberFromString, type CountryCode } from 'libphonenumber-js/min';

/**
 * Normalize any staff/customer-entered phone to canonical E.164.
 * "9876543210" | "+91 98765-43210" | "919876543210" → "+919876543210".
 * Returns null when the input is empty or not a valid number — matches the
 * SQL-side normalize_phone_e164() so app and DB agree on the stored format.
 */
export function normalizeToE164(
    input: string | null | undefined,
    defaultCountry: CountryCode = 'IN'
): string | null {
    const raw = input?.trim();
    if (!raw) return null;
    const parsed = parsePhoneNumberFromString(raw, defaultCountry);
    if (!parsed || !parsed.isValid()) return null;
    return parsed.number;
}

export function isValidPhone(input: string, defaultCountry: CountryCode = 'IN'): boolean {
    return normalizeToE164(input, defaultCountry) !== null;
}
