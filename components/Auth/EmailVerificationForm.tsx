'use client';

import React, { useRef } from 'react';
import { useState } from 'react';
import EmailInput, { EmailInputHandle } from '@/components/ui/EmailInput';

interface EmailVerificationFormProps {
    onSuccess?: (email: string) => void;
}

export default function EmailVerificationForm({ onSuccess }: EmailVerificationFormProps) {
    const [email, setEmail] = useState('');
    const [emailValid, setEmailValid] = useState(false);
    const emailRef = useRef<EmailInputHandle>(null);

    const handleEmailSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Trigger full validation UI before submitting
        const valid = emailRef.current?.validate() ?? emailValid;
        if (!valid) return;

        if (onSuccess) {
            onSuccess(email);
        } else {
            window.location.href = '/';
        }
    };

    return (
        <div className="w-full">
            <p className="text-sm text-textSecondary mb-5">
                We&apos;ll send your order confirmation and delivery updates here.
            </p>

            <form onSubmit={handleEmailSubmit} className="space-y-4" noValidate>
                <EmailInput
                    ref={emailRef}
                    id="email"
                    label="Email Address"
                    value={email}
                    onChange={setEmail}
                    onValidChange={setEmailValid}
                    required
                    autoComplete="email"
                />

                <button
                    type="submit"
                    disabled={!emailValid}
                    className="w-full py-3.5 px-4 bg-primary hover:bg-primary-light disabled:bg-gray-300 disabled:cursor-not-allowed text-secondary disabled:text-white font-semibold rounded-full transition-colors duration-200"
                >
                    Continue
                </button>
            </form>
        </div>
    );
}
