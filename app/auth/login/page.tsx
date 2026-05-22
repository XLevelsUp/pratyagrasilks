import { Suspense } from 'react';
import LoginForm from '@/components/Auth/LoginForm';

export default function LoginPage() {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
            <Suspense fallback={
                <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
            }>
                <LoginForm />
            </Suspense>
        </div>
    );
}
