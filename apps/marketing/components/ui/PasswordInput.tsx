'use client';

import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import Input from './Input';

interface PasswordInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
    label?: string;
    error?: string;
}

export default function PasswordInput({ ...props }: PasswordInputProps) {
    const [show, setShow] = useState(false);

    return (
        <Input
            type={show ? 'text' : 'password'}
            rightIcon={
                <button
                    type="button"
                    onClick={() => setShow(v => !v)}
                    className="px-3 text-gray-400 hover:text-gray-600 transition-colors"
                    tabIndex={-1}
                    aria-label={show ? 'Hide password' : 'Show password'}
                >
                    {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
            }
            {...props}
        />
    );
}
