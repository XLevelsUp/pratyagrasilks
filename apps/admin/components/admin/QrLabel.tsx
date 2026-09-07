'use client';

import { QRCodeSVG } from 'qrcode.react';
import { Printer } from 'lucide-react';

interface QrLabelProps {
    productName: string;
    sku: string;
    price: number;
}

export default function QrLabel({ productName, sku, price }: QrLabelProps) {
    const formattedPrice = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
    }).format(price);

    return (
        <>
            <style>{`
                @media print {
                    body > * { display: none !important; }
                    #thermal-label-print-root {
                        display: block !important;
                        position: fixed;
                        inset: 0;
                        margin: 0;
                        padding: 0;
                    }
                    #thermal-label {
                        display: flex !important;
                        width: 50mm;
                        height: 25mm;
                        overflow: hidden;
                        page-break-after: avoid;
                        box-shadow: none !important;
                        border: none !important;
                    }
                    @page { size: 50mm 25mm; margin: 0; }
                }
            `}</style>

            <div className="flex flex-col items-start gap-4">
                <div id="thermal-label-print-root">
                    <div
                        id="thermal-label"
                        className="flex flex-row items-center bg-white border-2 border-gray-300 rounded-lg shadow-md"
                        style={{
                            width: '189px',
                            height: '94px',
                            padding: '4px',
                            fontFamily: 'monospace',
                            gap: '6px',
                        }}
                    >
                        {/* QR Code — left column */}
                        <div style={{ flexShrink: 0 }}>
                            <QRCodeSVG
                                value={sku}
                                size={72}
                                level="M"
                                bgColor="#ffffff"
                                fgColor="#000000"
                            />
                        </div>

                        {/* Text info — right column */}
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            flex: 1,
                            overflow: 'hidden',
                            height: '72px',
                        }}>
                            <p style={{
                                fontSize: '6px',
                                fontWeight: 700,
                                color: '#550c72',
                                letterSpacing: '0.06em',
                                textTransform: 'uppercase',
                                margin: 0,
                                lineHeight: 1,
                            }}>
                                ✦ Pratyagra Silks ✦
                            </p>
                            <p style={{
                                fontSize: '5.5px',
                                fontWeight: 600,
                                color: '#221D10',
                                lineHeight: 1.2,
                                margin: 0,
                                overflow: 'hidden',
                                display: '-webkit-box',
                                WebkitLineClamp: 3,
                                WebkitBoxOrient: 'vertical',
                            }}>
                                {productName}
                            </p>
                            <p style={{
                                fontSize: '6px',
                                fontWeight: 400,
                                color: '#666',
                                margin: 0,
                                lineHeight: 1,
                            }}>
                                {sku}
                            </p>
                            <p style={{
                                fontSize: '8px',
                                fontWeight: 700,
                                color: '#D97706',
                                letterSpacing: '0.04em',
                                margin: 0,
                                lineHeight: 1,
                            }}>
                                {formattedPrice}
                            </p>
                        </div>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={() => window.print()}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-light transition-colors shadow-sm print:hidden"
                >
                    <Printer className="w-4 h-4" />
                    Print QR Label
                </button>

                <p className="text-xs text-gray-400 print:hidden">
                    50mm × 25mm · QR Code · Thermal label
                </p>
            </div>
        </>
    );
}
