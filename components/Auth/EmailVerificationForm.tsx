'use client';

import React, { useState } from 'react';
import { z } from 'zod';
import { emailField } from '@/lib/validations/form.schemas';

interface EmailVerificationFormProps {
    onSuccess?: (email: string) => void;
}

export default function EmailVerificationForm({ onSuccess }: EmailVerificationFormProps) {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [isValid, setIsValid] = useState(false);

    const validateEmailInput = (value: string) => {
        if (!value.trim()) {
            setError('Email is required');
            setIsValid(false);
            return false;
        }
        
        // Remove spaces (edge case: spaces in email, copy-paste)
        const sanitized = value.replace(/\s+/g, '');
        if (sanitized !== value) {
            setEmail(sanitized);
        }

        const result = emailField.safeParse(sanitized);
        if (!result.success) {
            setError(result.error.issues[0].message);
            setIsValid(false);
            return false;
        }
        
        setError('');
        setIsValid(true);
        return true;
    };

    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setEmail(val);
        
        if (val.trim() === '') {
            setError('');
            setIsValid(false);
            return;
        }

        // Live validation on typing
        validateEmailInput(val);
    };

    const handleEmailBlur = () => {
        validateEmailInput(email);
    };

    const handleEmailSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (validateEmailInput(email)) {
            if (onSuccess) {
                onSuccess(email);
            } else {
                window.location.href = '/';
            }
        }
    };



    return (
        <div className="w-full max-w-md mx-auto p-8 bg-white rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Sign in or create an account</h2>

            <form onSubmit={handleEmailSubmit} className="space-y-4">
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address
                    </label>
                    <div className="relative">
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={handleEmailChange}
                            onBlur={handleEmailBlur}
                            className={`w-full px-4 py-3 rounded-xl border outline-none transition-all duration-200 pr-10
                                ${error 
                                    ? 'border-red-500 focus:ring-4 focus:ring-red-500/20' 
                                    : isValid 
                                        ? 'border-green-500 focus:ring-4 focus:ring-green-500/20'
                                        : 'border-gray-300 focus:border-primary focus:ring-4 focus:ring-primary/20'
                                }`}
                            placeholder="you@example.com"
                        />
                        
                        {/* Validation Icons */}
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            {isValid && (
                                <svg className="w-5 h-5 text-green-500 animate-in zoom-in" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            )}
                            {error && !isValid && (
                                <svg className="w-5 h-5 text-red-500 animate-in zoom-in" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            )}
                        </div>
                    </div>
                    
                    {/* Error Message */}
                    <div className="min-h-[20px] mt-1.5">
                        {error && (
                            <p className="text-sm text-red-500 animate-in fade-in slide-in-from-top-1">
                                {error}
                            </p>
                        )}
                        {isValid && !error && (
                            <p className="text-sm text-green-600 animate-in fade-in slide-in-from-top-1">
                                Looks good!
                            </p>
                        )}
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={!isValid || !!error}
                    className="w-full py-3 px-4 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-colors duration-200"
                >
                    Continue
                </button>
            </form>
        </div>
    );
}
