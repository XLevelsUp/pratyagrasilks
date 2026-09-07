'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import PosReceipt, { PosReceiptData } from '@/components/admin/PosReceipt';

export default function BulkReceiptWrapper({ receipts }: { receipts: PosReceiptData[] }) {
    const [mounted, setMounted] = useState(false);
    useEffect(() => { setMounted(true); }, []);
    if (!mounted) return null;

    return createPortal(
        <>
            <style>{`
                @media print {
                    body > *:not(#bulk-receipt-print-root) { display: none !important; }
                    #bulk-receipt-print-root {
                        display: block !important;
                        position: static !important;
                        left: auto !important;
                        top: auto !important;
                    }
                    .receipt-print-page {
                        page-break-after: always;
                        break-after: page;
                        width: 100%;
                        display: flex;
                        flex-direction: column;
                        min-height: 100vh;
                    }
                    .receipt-print-page:last-child { page-break-after: avoid; break-after: avoid; }
                    .receipt-table {
                        width: 100%;
                        border-collapse: collapse;
                        font-size: 18px;
                    }
                    .receipt-table th {
                        background-color: #f5f0f8 !important;
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }
                    .row-alt {
                        background-color: #faf9fb !important;
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }
                    .total-row {
                        background-color: #550c72 !important;
                        color: #fff !important;
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }
                    @page { size: A5 portrait; margin: 14px; }
                }
            `}</style>
            <div id="bulk-receipt-print-root" style={{ position: 'fixed', left: '-9999px', top: 0 }}>
                {receipts.map((data, i) => (
                    <div key={i} className="receipt-print-page">
                        <PosReceipt data={data} forBulkPrint />
                    </div>
                ))}
            </div>
        </>,
        document.body
    );
}
