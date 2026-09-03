'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { QRCodeSVG } from 'qrcode.react';
import { chunkArray } from '@/lib/utils/arrays';

interface LabelProduct {
    id: string;
    name: string;
    sku: string;
    price: number;
}

interface BulkQrWrapperProps {
    products: LabelProduct[];
}

const fmt = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
});

function SingleLabel({ product }: { product: LabelProduct }) {
    return (
        <div style={{
            width: '49mm',
            height: '25mm',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            gap: '3px',
            padding: '3px',
            boxSizing: 'border-box',
            background: 'white',
        }}>
            <div style={{ flexShrink: 0 }}>
                <QRCodeSVG
                    value={product.sku}
                    size={55}
                    level="M"
                    bgColor="#ffffff"
                    fgColor="#000000"
                />
            </div>
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                flex: 1,
                overflow: 'hidden',
                height: '68px',
            }}>
                <p style={{
                    fontSize: '9px', fontWeight: 800, color: '#000000',
                    letterSpacing: '0.025em', textTransform: 'uppercase',
                     margin: '0 0 0 10px', lineHeight: 1, 
                }}>
                    ❤︎ Pratyagra Silks
                </p>
                <p style={{
                    fontSize: '10px',
                    fontWeight: 700,
                    color: '#000000',
                    lineHeight: 1.2,
                    margin: '0 0 0 10px',
                    overflow: 'hidden',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    letterSpacing: '0.025em',
                } as React.CSSProperties}>
                    {product.name}
                </p>
                <p style={{
                    fontSize: '10px', fontWeight: 700, color: '#000000',
                    margin: '0 0 0 10px', lineHeight: 1, letterSpacing: '0.025em',
                }}>
                    {product.sku}
                </p>
                <p style={{
                    fontSize: '14px', fontWeight: 800, color: '#000000',
                    letterSpacing: '0.05em', margin: '0 0 0 10px', lineHeight: 1,
                }}>
                    {fmt.format(product.price)}
                </p>
            </div>
        </div>
    );
}

export default function BulkQrWrapper({ products }: BulkQrWrapperProps) {
    const [mounted, setMounted] = useState(false);
    useEffect(() => { setMounted(true); }, []);
    if (!mounted) return null;

    const pairs = chunkArray(products, 2);

    return createPortal(
        <>
            <style>{`
                @media print {
                    body > *:not(#bulk-label-print-root) { display: none !important; }

                    #bulk-label-print-root {
                        display: block !important;
                        position: static !important;
                        left: auto !important;
                        top: auto !important;
                    }

                    .bulk-label-row {
                        display: flex;
                        flex-direction: row;
                        justify-content: flex-start;
                        gap: 2mm;
                        width: 100mm;
                        height: 25mm;
                        overflow: hidden;
                        break-after: page;
                        page-break-after: always;
                        box-sizing: border-box;
                    }

                    @page { size: 100mm 25mm; margin: 0; }
                }
            `}</style>

            <div
                id="bulk-label-print-root"
                style={{ position: 'fixed', left: '-9999px', top: 0 }}
            >
                {pairs.map((pair, i) => (
                    <div key={i} className="bulk-label-row">
                        {pair.map(product => (
                            <SingleLabel key={product.id} product={product} />
                        ))}
                    </div>
                ))}
            </div>
        </>,
        document.body
    );
}
