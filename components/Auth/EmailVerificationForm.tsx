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
        <div className="w-full max-w-md mx-auto p-8 bg-white rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Sign in or create an account</h2>

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
                    className="w-full py-3 px-4 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-colors duration-200"
                >
                    Continue
                </button>
            </form>
        </div>
    );
}
