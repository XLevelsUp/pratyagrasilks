'use client';

import React, { useState } from 'react';
import { emailField } from '@/lib/validations/form.schemas';

interface EmailInputProps {
    id?: string;
    name?: string;
    label?: string;
    placeholder?: string;
    value: string;
    onChange: (value: string) => void;
    /** Called whenever the validity state changes — useful for submit-button gating. */
    onValidChange?: (isValid: boolean) => void;
    /** Force-show an external error (e.g. from server); clears isValid. */
    externalError?: string;
    autoComplete?: string;
    required?: boolean;
    className?: string;
}

export interface EmailInputHandle {
    /** Returns true if currently valid; also triggers full validation UI. */
    validate: () => boolean;
}

const EmailInput = React.forwardRef<EmailInputHandle, EmailInputProps>(
    (
        {
            id = 'email',
            name = 'email',
            label = 'Email Address',
            placeholder = 'you@example.com',
            value,
            onChange,
            onValidChange,
            externalError,
            autoComplete = 'email',
            required,
            className = '',
        },
        ref
    ) => {
        const [error, setError] = useState('');
        const [isValid, setIsValid] = useState(false);

        /** Core validation — trims spaces, runs Zod schema, updates state. */
        const runValidation = (raw: string): boolean => {
            if (!raw.trim()) {
                setError(required ? 'Email is required' : '');
                setIsValid(false);
                onValidChange?.(false);
                return false;
            }

            // Sanitise accidental spaces (common in copy-paste)
            const sanitized = raw.replace(/\s+/g, '');
            if (sanitized !== raw) {
                onChange(sanitized);
            }

            const result = emailField.safeParse(sanitized);
            if (!result.success) {
                setError(result.error.issues[0].message);
                setIsValid(false);
                onValidChange?.(false);
                return false;
            }

            setError('');
            setIsValid(true);
            onValidChange?.(true);
            return true;
        };

        // Expose validate() to parent via ref
        React.useImperativeHandle(ref, () => ({
            validate: () => runValidation(value),
        }));

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const val = e.target.value;
            onChange(val);

            // Clear valid/error state when field is empty
            if (val.trim() === '') {
                setError('');
                setIsValid(false);
                onValidChange?.(false);
                return;
            }

            // Live validate while typing
            runValidation(val);
        };

        const handleBlur = () => {
            runValidation(value);
        };

        // Merge internal error with any external (server-side) error
        const displayError = externalError || error;
        const showValid = isValid && !displayError;

        const borderClass = displayError
            ? 'border-red-500 focus:ring-4 focus:ring-red-500/20'
            : showValid
            ? 'border-green-500 focus:ring-4 focus:ring-green-500/20'
            : 'border-gray-300 focus:border-primary focus:ring-4 focus:ring-primary/20';

        return (
            <div className={`w-full ${className}`}>
                {label && (
                    <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
                        {label}
                    </label>
                )}

                <div className="relative">
                    <input
                        id={id}
                        name={name}
                        type="email"
                        value={value}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        autoComplete={autoComplete}
                        required={required}
                        placeholder={placeholder}
                        className={`w-full px-4 py-2 rounded-md border outline-none transition-all duration-200 pr-10 focus:ring-2 ${borderClass}`}
                        aria-invalid={!!displayError}
                        aria-describedby={displayError ? `${id}-error` : showValid ? `${id}-success` : undefined}
                    />

                    {/* Validation icons */}
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                        {showValid && (
                            <svg
                                className="w-5 h-5 text-green-500"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                aria-hidden="true"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        )}
                        {displayError && (
                            <svg
                                className="w-5 h-5 text-red-500"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                aria-hidden="true"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        )}
                    </div>
                </div>

                {/* Feedback messages */}
                <div className="min-h-[1.25rem] mt-1">
                    {displayError && (
                        <p id={`${id}-error`} className="text-xs text-red-600" aria-live="polite">
                            {displayError}
                        </p>
                    )}
                    {showValid && (
                        <p id={`${id}-success`} className="text-xs text-green-600">
                            Looks good!
                        </p>
                    )}
                </div>
            </div>
        );
    }
);

EmailInput.displayName = 'EmailInput';
export default EmailInput;
