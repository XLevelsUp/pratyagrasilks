export { shippingAddressSchema, type ShippingAddress } from './form.schemas';

// Flexible postal code validation based on country
const postalCodeRegex = {
    IN: /^\d{6}$/,
    US: /^\d{5}(-\d{4})?$/,
    GB: /^[A-Z]{1,2}\d{1,2}[A-Z]?\s?\d[A-Z]{2}$/i,
    CA: /^[A-Z]\d[A-Z]\s?\d[A-Z]\d$/i,
    default: /^[A-Z0-9\s-]{3,10}$/i,
};

export function validatePostalCode(postalCode: string, countryCode: string): boolean {
    const regex = postalCodeRegex[countryCode as keyof typeof postalCodeRegex] || postalCodeRegex.default;
    return regex.test(postalCode);
}

export function formatPhoneNumber(phone: string): string {
    const cleaned = phone.trim().replace(/[\s-()]/g, '');
    if (!cleaned) return '';
    if (cleaned.startsWith('+')) return cleaned;
    if (/^\d{10}$/.test(cleaned)) return `+91${cleaned}`;
    if (/^91\d{10}$/.test(cleaned)) return `+${cleaned}`;
    return `+${cleaned}`;
}

export const COUNTRIES = [
    'India',
    'Argentina', 'Australia', 'Austria', 'Bahrain', 'Bangladesh',
    'Belgium', 'Brazil', 'Canada', 'China', 'Czech Republic',
    'Denmark', 'Egypt', 'Finland', 'France', 'Germany',
    'Hong Kong', 'Hungary', 'Indonesia', 'Ireland', 'Israel',
    'Italy', 'Japan', 'Kenya', 'Kuwait', 'Malaysia',
    'Mexico', 'Nepal', 'Netherlands', 'New Zealand', 'Nigeria',
    'Norway', 'Oman', 'Pakistan', 'Philippines', 'Poland',
    'Portugal', 'Qatar', 'Romania', 'Russia', 'Saudi Arabia',
    'Singapore', 'South Africa', 'South Korea', 'Spain', 'Sri Lanka',
    'Sweden', 'Switzerland', 'Taiwan', 'Thailand', 'Turkey',
    'UAE', 'United Kingdom', 'United States', 'Vietnam',
];

export const US_STATES = [
    'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado',
    'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho',
    'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana',
    'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota',
    'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada',
    'New Hampshire', 'New Jersey', 'New Mexico', 'New York',
    'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon',
    'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
    'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington',
    'West Virginia', 'Wisconsin', 'Wyoming', 'District of Columbia',
];

export const CANADIAN_PROVINCES = [
    'Alberta', 'British Columbia', 'Manitoba', 'New Brunswick',
    'Newfoundland and Labrador', 'Northwest Territories', 'Nova Scotia',
    'Nunavut', 'Ontario', 'Prince Edward Island', 'Quebec',
    'Saskatchewan', 'Yukon',
];

export const AUSTRALIAN_STATES = [
    'Australian Capital Territory', 'New South Wales', 'Northern Territory',
    'Queensland', 'South Australia', 'Tasmania', 'Victoria', 'Western Australia',
];

export const INDIAN_STATES = [
    'Andhra Pradesh',
    'Arunachal Pradesh',
    'Assam',
    'Bihar',
    'Chhattisgarh',
    'Delhi',
    'Goa',
    'Gujarat',
    'Haryana',
    'Himachal Pradesh',
    'Jharkhand',
    'Karnataka',
    'Kerala',
    'Madhya Pradesh',
    'Maharashtra',
    'Manipur',
    'Meghalaya',
    'Mizoram',
    'Nagaland',
    'Odisha',
    'Punjab',
    'Rajasthan',
    'Sikkim',
    'Tamil Nadu',
    'Telangana',
    'Tripura',
    'Uttar Pradesh',
    'Uttarakhand',
    'West Bengal',
    'Jammu and Kashmir',
    'Ladakh',
];

export const COUNTRY_STATES: Record<string, string[]> = {
    India: INDIAN_STATES,
    'United States': US_STATES,
    Canada: CANADIAN_PROVINCES,
    Australia: AUSTRALIAN_STATES,
};
