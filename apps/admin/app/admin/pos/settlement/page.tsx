'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
    ArrowLeft,
    Printer,
    RefreshCw,
    TrendingUp,
    Banknote,
    Smartphone,
    CreditCard,
    ReceiptText,
    AlertCircle,
} from 'lucide-react';
import { getTodaySettlement, EodSettlement } from '@/lib/actions/eod.actions';
import EodReceipt from '@/components/admin/EodReceipt';

const fmt = (n: number) =>
    new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
    }).format(n);

const fmtTime = (iso: string) =>
    new Date(iso).toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
    });

const PAYMENT_BADGE: Record<string, string> = {
    CASH: 'bg-green-100 text-green-800',
    UPI: 'bg-blue-100 text-blue-800',
    CARD: 'bg-purple-100 text-purple-800',
};

interface MetricCardProps {
    icon: React.ReactNode;
    label: string;
    value: string;
    sub?: string;
    accent?: string;
}

function MetricCard({ icon, label, value, sub, accent = 'bg-white' }: MetricCardProps) {
    return (
        <div className={`${accent} rounded-2xl border border-gray-100 shadow-sm p-5 flex items-start gap-4`}>
            <div className="w-11 h-11 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                {icon}
            </div>
            <div className="min-w-0">
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-0.5 truncate">{value}</p>
                {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
            </div>
        </div>
    );
}

function SkeletonCard() {
    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 animate-pulse">
            <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-gray-200" />
                <div className="flex-1">
                    <div className="h-3 bg-gray-200 rounded w-24 mb-2" />
                    <div className="h-7 bg-gray-200 rounded w-32" />
                </div>
            </div>
        </div>
    );
}

export default function SettlementPage() {
    const [data, setData] = useState<EodSettlement | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [printedAt, setPrintedAt] = useState('');

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        const result = await getTodaySettlement();
        if (result.success && result.data) {
            setData(result.data);
        } else {
            setError(result.error ?? 'Failed to load settlement data');
        }
        setLoading(false);
    }, []);

    useEffect(() => { load(); }, [load]);

    const handlePrint = () => {
        setPrintedAt(
            new Date().toLocaleString('en-IN', {
                day: '2-digit', month: '2-digit', year: 'numeric',
                hour: '2-digit', minute: '2-digit', second: '2-digit',
                hour12: true,
            })
        );
        // Allow state to flush before triggering print
        setTimeout(() => window.print(), 150);
    };

    const avgTicket = data && data.totalOrders > 0
        ? data.totalRevenue / data.totalOrders
        : 0;

    return (
        <>
            {/* Z-Report: hidden on screen, rendered on print */}
            {data && printedAt && <EodReceipt data={data} printedAt={printedAt} />}

            <div className="max-w-5xl mx-auto space-y-6">

                {/* ── Page Header ──────────────────────────────────────────── */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link
                            href="/admin/pos"
                            className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                        </Link>
                        <div className="w-10 h-10 rounded-xl bg-[#550c72] flex items-center justify-center">
                            <ReceiptText className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">End of Day Settlement</h1>
                            <p className="text-sm text-gray-500">
                                {data ? `Date: ${data.date}` : 'Loading today\'s POS sales…'}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={load}
                            disabled={loading}
                            className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                        >
                            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                            Refresh
                        </button>
                        <button
                            onClick={handlePrint}
                            disabled={!data || loading}
                            className="flex items-center gap-2 px-5 py-2 bg-[#550c72] hover:bg-[#8430AB] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-sm font-bold transition-colors shadow-md shadow-purple-200"
                        >
                            <Printer className="w-4 h-4" />
                            Print Z-Report
                        </button>
                    </div>
                </div>

                {/* ── Error State ───────────────────────────────────────────── */}
                {error && (
                    <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <span className="text-sm font-medium">{error}</span>
                        <button onClick={load} className="ml-auto text-sm underline hover:no-underline">
                            Retry
                        </button>
                    </div>
                )}

                {/* ── Metric Cards ──────────────────────────────────────────── */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {loading ? (
                        Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
                    ) : data ? (
                        <>
                            <MetricCard
                                icon={<TrendingUp className="w-5 h-5 text-[#550c72]" />}
                                label="Total Revenue"
                                value={fmt(data.totalRevenue)}
                                sub={`${data.totalOrders} transaction${data.totalOrders !== 1 ? 's' : ''} · Avg ${fmt(avgTicket)}`}
                            />
                            <MetricCard
                                icon={<Banknote className="w-5 h-5 text-green-600" />}
                                label="Cash Drawer"
                                value={fmt(data.breakdown.CASH)}
                                sub="Expected in till"
                            />
                            <MetricCard
                                icon={<Smartphone className="w-5 h-5 text-blue-600" />}
                                label="UPI Total"
                                value={fmt(data.breakdown.UPI)}
                                sub="Check UPI app"
                            />
                            <MetricCard
                                icon={<CreditCard className="w-5 h-5 text-purple-600" />}
                                label="Card Total"
                                value={fmt(data.breakdown.CARD)}
                                sub="Check card terminal"
                            />
                        </>
                    ) : null}
                </div>

                {/* ── Transaction Table ─────────────────────────────────────── */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                        <h2 className="text-base font-bold text-gray-900">
                            Today&apos;s Transactions
                        </h2>
                        {data && (
                            <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">
                                {data.totalOrders} total
                            </span>
                        )}
                    </div>

                    {loading ? (
                        <div className="divide-y divide-gray-100">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <div key={i} className="px-6 py-4 flex items-center gap-4 animate-pulse">
                                    <div className="h-4 bg-gray-200 rounded w-36" />
                                    <div className="h-4 bg-gray-200 rounded w-20 ml-auto" />
                                    <div className="h-6 bg-gray-200 rounded w-12" />
                                    <div className="h-4 bg-gray-200 rounded w-24" />
                                </div>
                            ))}
                        </div>
                    ) : !data || data.transactions.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-3">
                                <ReceiptText className="w-8 h-8 text-gray-300" />
                            </div>
                            <p className="text-gray-500 font-medium">No POS sales today</p>
                            <p className="text-sm text-gray-400 mt-1">
                                Completed transactions will appear here
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-gray-50 text-left">
                                        <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                            Order #
                                        </th>
                                        <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                            Time
                                        </th>
                                        <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                            Payment
                                        </th>
                                        <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide text-right">
                                            Amount
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {data.transactions.map(tx => (
                                        <tr
                                            key={tx.id}
                                            className="hover:bg-gray-50 transition-colors"
                                        >
                                            <td className="px-6 py-4 font-mono text-xs text-gray-700">
                                                {tx.orderNumber}
                                            </td>
                                            <td className="px-6 py-4 text-gray-600">
                                                {fmtTime(tx.createdAt)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${PAYMENT_BADGE[tx.paymentMethod] ?? 'bg-gray-100 text-gray-700'}`}>
                                                    {tx.paymentMethod}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 font-semibold text-gray-900 text-right">
                                                {fmt(tx.totalAmount)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr className="bg-gray-50 border-t-2 border-gray-200">
                                        <td colSpan={3} className="px-6 py-4 text-sm font-bold text-gray-900">
                                            Total
                                        </td>
                                        <td className="px-6 py-4 text-lg font-bold text-[#550c72] text-right">
                                            {fmt(data.totalRevenue)}
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    )}
                </div>

                {/* ── Reconciliation Guide ──────────────────────────────────── */}
                {data && data.totalOrders > 0 && (
                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
                        <h3 className="text-sm font-bold text-amber-800 mb-3">
                            Cash Drawer Reconciliation Checklist
                        </h3>
                        <ul className="space-y-2 text-sm text-amber-700">
                            <li className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded border border-amber-400 flex-shrink-0" />
                                Count physical cash in drawer — should match{' '}
                                <strong>{fmt(data.breakdown.CASH)}</strong> (plus opening float)
                            </li>
                            <li className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded border border-amber-400 flex-shrink-0" />
                                Verify UPI app collections total{' '}
                                <strong>{fmt(data.breakdown.UPI)}</strong>
                            </li>
                            <li className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded border border-amber-400 flex-shrink-0" />
                                Check card terminal batch total —{' '}
                                <strong>{fmt(data.breakdown.CARD)}</strong>
                            </li>
                            <li className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded border border-amber-400 flex-shrink-0" />
                                Print and sign the Z-Report for records
                            </li>
                        </ul>
                    </div>
                )}
            </div>
        </>
    );
}
