'use client';

import { useState } from 'react';
import { Printer } from 'lucide-react';
import PosReceipt, { PosReceiptData } from './PosReceipt';

const GRAND_TOTAL = 40000;
const TAXABLE_VALUE = Math.round((GRAND_TOTAL / 1.05) * 100) / 100;
const TOTAL_GST = GRAND_TOTAL - TAXABLE_VALUE;
const CGST = Math.round((TOTAL_GST / 2) * 100) / 100;
const SGST = Math.round((TOTAL_GST / 2) * 100) / 100;

const TEST_RECEIPT: PosReceiptData = {
    orderNumber: 'POS-TEST-0001',
    orderId: 'test',
    items: [
        { name: 'Kanjivaram Pure Silk Saree (Test)', sku: 'KAN-TEST-001', quantity: 1, unitPrice: 15000 },
        { name: 'Banarasi Silk Saree (Test)', sku: 'BAN-TEST-002', quantity: 2, unitPrice: 12500 },
    ],
    grandTotal: GRAND_TOTAL,
    taxableValue: TAXABLE_VALUE,
    cgst: CGST,
    sgst: SGST,
    paymentMethod: 'CASH',
    date: '',   // filled at runtime
    customerName: 'Test Customer',
    customerPhone: '9876543210',
};

export default function TestBillPrint() {
    const [isPrinting, setIsPrinting] = useState(false);
    const [receipt, setReceipt] = useState<PosReceiptData | null>(null);

    const handlePrint = () => {
        const data: PosReceiptData = {
            ...TEST_RECEIPT,
            date: new Date().toLocaleString('en-IN', {
                day: '2-digit', month: '2-digit', year: 'numeric',
                hour: '2-digit', minute: '2-digit', hour12: true,
            }),
        };
        setReceipt(data);
        setIsPrinting(true);
        setTimeout(() => {
            window.print();
            setReceipt(null);
            setIsPrinting(false);
        }, 400);
    };

    return (
        <>
            {receipt && <PosReceipt data={receipt} />}
            <button
                onClick={handlePrint}
                disabled={isPrinting}
                className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-colors disabled:opacity-50"
            >
                <Printer className="w-3.5 h-3.5" />
                Test Bill
            </button>
        </>
    );
}
