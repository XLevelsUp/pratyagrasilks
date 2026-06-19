'use client';

import { useState } from 'react';
import { Mail, Loader2, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function TestMailButton() {
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);

    const handleSendTest = async () => {
        setSending(true);
        try {
            const res = await fetch('/api/admin/test-email', { method: 'POST' });
            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to send test email');
            }

            setSent(true);
            toast.success('Test email sent to pratyagra.in@gmail.com');
            setTimeout(() => setSent(false), 3000);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to send test email';
            toast.error(message);
        } finally {
            setSending(false);
        }
    };

    return (
        <button
            onClick={handleSendTest}
            disabled={sending}
            className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-colors disabled:opacity-50"
        >
            {sending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : sent ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
            ) : (
                <Mail className="w-3.5 h-3.5" />
            )}
            {sending ? 'Sending...' : sent ? 'Sent!' : 'Test Mail'}
        </button>
    );
}
