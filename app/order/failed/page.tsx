import { Metadata } from 'next';
import Link from 'next/link';
import { XCircle, ArrowLeft, Home } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Payment Failed | Pratyagra Silks',
    description: 'Payment was not successful',
};

export default function OrderFailedPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto">
                {/* Failed Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-red-400 to-red-500 rounded-full mb-6 shadow-lg">
                        <XCircle className="w-12 h-12 text-white" />
                    </div>

                    <h1 className="text-4xl font-bold text-gray-900 mb-3">
                        Payment Failed
                    </h1>

                    <p className="text-lg text-gray-600 mb-6">
                        We couldn't process your payment. Please try again.
                    </p>
                </div>

                {/* Info Card */}
                <div className="bg-white rounded-2xl shadow-xl p-8 mb-6 border border-red-100">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">
                        What happened?
                    </h2>

                    <div className="space-y-3 text-gray-600 mb-6">
                        <p>Your payment could not be completed. This might be due to:</p>
                        <ul className="list-disc list-inside space-y-2 ml-4">
                            <li>Insufficient funds in your account</li>
                            <li>Payment gateway timeout</li>
                            <li>Incorrect payment details</li>
                            <li>Bank declined the transaction</li>
                        </ul>
                    </div>

                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                        <p className="text-sm text-blue-800">
                            <strong>Note:</strong> No amount has been deducted from your account.
                            You can safely try again.
                        </p>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                        href="/checkout"
                        className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Try Again
                    </Link>

                    <Link
                        href="/"
                        className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-gray-700 font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 border-2 border-gray-200 hover:border-gray-300"
                    >
                        <Home className="w-5 h-5" />
                        Go Home
                    </Link>
                </div>

                {/* Support */}
                <div className="text-center mt-8 text-sm text-gray-600">
                    <p>Need help? <Link href="/contact" className="text-purple-600 hover:underline font-semibold">Contact Support</Link></p>
                </div>
            </div>
        </div>
    );
}
