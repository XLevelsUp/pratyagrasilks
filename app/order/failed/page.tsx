import { Metadata } from 'next';
import Link from 'next/link';
import { XCircle, ArrowLeft, Home } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Payment Failed | Pratyagra Silks',
    description: 'Payment was not successful',
};

export default function OrderFailedPage() {
    return (
        <div className="min-h-screen py-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto">
                {/* Failed Header */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-red-50 border border-red-200 rounded-full mb-6">
                        <XCircle className="w-8 h-8 text-red-500" />
                    </div>

                    <p className="text-xs font-semibold tracking-[0.25em] uppercase text-textSecondary/50 mb-4">
                        Something went wrong
                    </p>
                    <h1 className="font-playfair text-3xl md:text-4xl font-bold text-textPrimary mb-4">
                        Payment Failed
                    </h1>
                    <p className="text-lg text-textSecondary">
                        We couldn&apos;t process your payment. Please try again.
                    </p>
                </div>

                {/* Info Card */}
                <div className="bg-white rounded-2xl border border-primary-100 p-8 mb-8">
                    <h2 className="text-xs font-semibold tracking-[0.2em] uppercase text-textSecondary/60 mb-4">
                        What happened?
                    </h2>

                    <div className="space-y-3 text-textSecondary mb-6">
                        <p>Your payment could not be completed. This might be due to:</p>
                        <ul className="space-y-2">
                            {[
                                'Insufficient funds in your account',
                                'Payment gateway timeout',
                                'Incorrect payment details',
                                'Bank declined the transaction',
                            ].map((reason) => (
                                <li key={reason} className="flex items-start gap-3 border-t border-primary-100 pt-2 text-sm">
                                    <span className="w-1 h-1 rounded-full bg-primary-300 mt-2 shrink-0" aria-hidden="true" />
                                    {reason}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="bg-primary-50/60 rounded-xl p-4 border border-primary-100">
                        <p className="text-sm text-textPrimary">
                            <strong>Rest assured:</strong> no amount has been deducted from your account.
                            You can safely try again.
                        </p>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                        href="/checkout"
                        className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-primary text-secondary font-semibold rounded-full hover:bg-primary-light transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Try Again
                    </Link>

                    <Link
                        href="/"
                        className="inline-flex items-center justify-center gap-2 px-8 py-3.5 border border-primary-200 text-textPrimary font-semibold rounded-full hover:border-primary hover:text-primary transition-colors"
                    >
                        <Home className="w-5 h-5" />
                        Go Home
                    </Link>
                </div>

                {/* Support */}
                <div className="text-center mt-8 text-sm text-textSecondary">
                    <p>
                        Need help?{' '}
                        <Link href="/contact" className="text-primary underline underline-offset-4 hover:text-primary-light font-medium">
                            Contact Support
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
