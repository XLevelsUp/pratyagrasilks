// Moved to @pratyagra/core so the storefront's agent API normalises phones
// the same way the POS does. Re-exported here to keep admin imports stable.
export { normalizeToE164, isValidPhone } from '@pratyagra/core/utils/phone';
