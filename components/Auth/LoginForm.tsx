'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import Link from 'next/link';
import EmailInput from '@/components/ui/EmailInput';
import PasswordInput from '@/components/ui/PasswordInput';

const MAX_PASSWORD_LENGTH = 20;

export default function LoginForm() {
    const router = useRouter();
    const { signIn, signInWithGoogle } = useAuth();
    const [email, setEmail] = useState('');
    const [emailValid, setEmailValid] = useState(false);
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [loading, setLoading] = useState(false);

    const validatePassword = (value: string): boolean => {
        if (value.length > MAX_PASSWORD_LENGTH) {
            setPasswordError(`Password must not exceed ${MAX_PASSWORD_LENGTH} characters.`);
            return false;
        }
        setPasswordError('');
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        const isPasswordValid = validatePassword(password);
        // emailValid tracks live validity; block if email is currently invalid
        if (!emailValid || !isPasswordValid) return;

        setLoading(true);

        const { error } = await signIn(email, password);

        if (error) {
            setError(error.message);
            setLoading(false);
        } else {
            router.push('/profile');
        }
    };

    const handleGoogleSignIn = async () => {
        setError('');
        setLoading(true);

        const { error } = await signInWithGoogle();

        if (error) {
            setError(error.message);
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md">
            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-8" noValidate>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Login to Your Account</h2>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                        <p className="text-sm text-red-600">{error}</p>
                    </div>
                )}

                <div className="space-y-4">
                    <EmailInput
                        id="email"
                        label="Email"
                        value={email}
                        onChange={setEmail}
                        onValidChange={setEmailValid}
                        required
                        autoComplete="email"
                    />

                    <PasswordInput
                        id="password"
                        label="Password"
                        value={password}
                        onChange={e => {
                            setPassword(e.target.value);
                            if (passwordError) validatePassword(e.target.value);
                        }}
                        onBlur={() => validatePassword(password)}
                        required
                        maxLength={MAX_PASSWORD_LENGTH}
                        placeholder="••••••••"
                        error={passwordError}
                        autoComplete="current-password"
                    />

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary text-white py-3 rounded-md font-semibold hover:bg-primary-light transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </div>

                <div className="mt-6">
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white text-gray-500">Or continue with</span>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={handleGoogleSignIn}
                        disabled={loading}
                        className="mt-4 w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-300 text-gray-700 py-3 rounded-md font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        Sign in with Google
                    </button>
                </div>

                <p className="mt-6 text-center text-sm text-textSecondary">
                    Don't have an account?{' '}
                    <Link href="/auth/signup" className="text-primary hover:text-primary-light font-medium">
                        Sign up
                    </Link>
                </p>
            </form>
        </div>
    );
}
