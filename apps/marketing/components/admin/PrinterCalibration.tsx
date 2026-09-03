'use client';

import { useState } from 'react';
import { FlaskConical } from 'lucide-react';
import BulkQrWrapper from '@/components/admin/BulkQrWrapper';

const TEST_PRODUCTS = [
    { id: 'test-1', name: 'LEFT — Calibration Test Label A', sku: 'TEST-LEFT-001', price: 12345 },
    { id: 'test-2', name: 'RIGHT — Calibration Test Label B', sku: 'TEST-RIGHT-002', price: 67890 },
];

export default function PrinterCalibration() {
    const [isPrinting, setIsPrinting] = useState(false);

    const handleCalibration = () => {
        setIsPrinting(true);
        setTimeout(() => {
            window.print();
            setIsPrinting(false);
        }, 300);
    };

    return (
        <>
            <button
                onClick={handleCalibration}
                className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
            >
                <FlaskConical className="w-4 h-4" />
                Test TVS Calibration
            </button>
            {isPrinting && <BulkQrWrapper products={TEST_PRODUCTS} />}
        </>
    );
}
