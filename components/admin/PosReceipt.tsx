export interface PosReceiptData {
    orderNumber: string;
    orderId: string;
    invoiceNumber?: string;
    items: Array<{
        name: string;
        sku: string;
        quantity: number;
        unitPrice: number;
    }>;
    grandTotal: number;
    taxableValue: number;
    cgst: number;
    sgst: number;
    paymentMethod: string;
    date: string;
    customerName?: string;
    customerPhone?: string;
}

const fmtR = (n: number) =>
    new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(n);

interface PosReceiptProps {
    data: PosReceiptData;
    forBulkPrint?: boolean;
}

export default function PosReceipt({ data, forBulkPrint }: PosReceiptProps) {
    const font = "'Segoe UI', Arial, sans-serif";

    return (
        <>
            {!forBulkPrint && (
                <style>{`
                    @media print {
                        body > * { visibility: hidden !important; }
                        #pos-receipt-print,
                        #pos-receipt-print * { visibility: visible !important; }
                        /* Target: EPSON — A5 (148×210mm) — 14px margins */
                        #pos-receipt-print {
                            position: fixed !important;
                            left: 0 !important;
                            top: 0 !important;
                            width: 100% !important;
                            max-width: 100% !important;
                            padding: 14px !important;
                            margin: 0 auto !important;
                            min-height: 100vh !important;
                            display: flex !important;
                            flex-direction: column !important;
                        }
                        @page {
                            size: A5 portrait;
                            margin: 14px;
                        }
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
                    }
                `}</style>
            )}

            <div
                id={forBulkPrint ? undefined : 'pos-receipt-print'}
                style={{
                    ...(forBulkPrint
                        ? { fontFamily: font, fontSize: '18px', color: '#444', lineHeight: 1.5, width: '100%', background: '#fff', display: 'flex', flexDirection: 'column', minHeight: '100vh' }
                        : { position: 'fixed', left: '-9999px', top: 0, fontFamily: font, fontSize: '18px', color: '#444', lineHeight: 1.5, width: '520px', margin: '0 auto', background: '#fff', display: 'flex', flexDirection: 'column', minHeight: '100vh' }
                    ),
                }}
            >
                {/* Watermark Logo */}
                <div
                    style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        opacity: 0.10,
                        zIndex: 0,
                        pointerEvents: 'none',
                        rotate: '-30deg',
                    }}
                >
                    <img
                        src="/Pratyagra_Silks_Logo.svg"
                        alt=""
                        style={{ height: '340px', width: 'auto', display: 'block' }}
                    />
                </div>
                
                {/* ── Header ──────────────────────────────────────────────── */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                    {/* Left: store details */}
                    <div>
                        <img
                            src="/Pratyagra_Silks_Logo.svg"
                            alt="Pratyagra Silks"
                            style={{ height: '48px', width: 'auto', display: 'block', marginBottom: '4px' }}
                        />
                        <div style={{ fontSize: '18px', color: '#444', marginTop: '4px', lineHeight: 1.5 }}>
                            NO 178, 2nd Floor A Ramachandra Road<br />
                            RS Puram, Coimbatore – 641002<br />
                            Tel: +91 73588 66646<br />
                            GSTIN: 33ABIFP4964F1Z3
                        </div>
                    </div>

                    {/* Right: invoice label + meta */}
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '18px', fontWeight: 700, color: '#550c72', letterSpacing: '1px' }}>
                            TAX INVOICE
                        </div>
                        <div style={{ fontSize: '18px', color: '#444', marginTop: '6px', lineHeight: 1.6 }}>
                            {data.invoiceNumber && <div><strong>Invoice #:</strong> {data.invoiceNumber}</div>}
                            <div><strong>Order #:</strong> {data.orderNumber}</div>
                            <div><strong>Date:</strong> {data.date}</div>
                            <div>
                                <span style={{
                                    display: 'inline-block',
                                    background: '#550c72',
                                    color: '#444',
                                    fontSize: '18px',
                                    fontWeight: 700,
                                    padding: '2px 8px',
                                    borderRadius: '4px',
                                    marginTop: '2px',
                                    letterSpacing: '0.5px',
                                }}>
                                    {data.paymentMethod}
                                </span>
                            </div>
                            {data.customerName && (
                                <div style={{ marginTop: '6px' }}>
                                    <strong>Customer:</strong> {data.customerName}
                                    {data.customerPhone && <div style={{ fontSize: '16px' }}><strong>Phone:</strong> {data.customerPhone}</div>}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div style={{ borderTop: '2px solid #550c72', marginTop: '14px', marginBottom: '14px' }} />

                {/* ── Items Table ──────────────────────────────────────────── */}
                <table className="receipt-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '18px' }}>
                    <thead>
                        <tr style={{ background: '#f5f0f8' }}>
                            <th style={{ padding: '7px 6px', textAlign: 'left', fontSize: '18px', fontWeight: 700, width: '5%', borderBottom: '1px solid #ddd' }}>#</th>
                            <th style={{ padding: '7px 6px', textAlign: 'left', fontSize: '18px', fontWeight: 700, width: '35%', borderBottom: '1px solid #ddd' }}>Item</th>
                            <th style={{ padding: '7px 6px', textAlign: 'left', fontSize: '18px', fontWeight: 700, width: '20%', borderBottom: '1px solid #ddd' }}>SKU</th>
                            <th style={{ padding: '7px 6px', textAlign: 'center', fontSize: '18px', fontWeight: 700, width: '8%', borderBottom: '1px solid #ddd' }}>Qty</th>
                            <th style={{ padding: '7px 6px', textAlign: 'right', fontSize: '18px', fontWeight: 700, width: '16%', borderBottom: '1px solid #ddd' }}>Rate (₹)</th>
                            <th style={{ padding: '7px 6px', textAlign: 'right', fontSize: '18px', fontWeight: 700, width: '16%', borderBottom: '1px solid #ddd' }}>Amount (₹)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.items.map((item, idx) => (
                            <tr key={idx} className={idx % 2 === 1 ? 'row-alt' : ''} style={{ background: idx % 2 === 1 ? '#faf9fb' : '#fff' }}>
                                <td style={{ padding: '7px 6px', borderBottom: '1px solid #eee', color: '#666', fontSize: '18px' }}>{idx + 1}</td>
                                <td style={{ padding: '7px 6px', borderBottom: '1px solid #eee', fontWeight: 600, fontSize: '18px' }}>{item.name}</td>
                                <td style={{ padding: '7px 6px', borderBottom: '1px solid #eee', color: '#666', fontSize: '18px' }}>{item.sku}</td>
                                <td style={{ padding: '7px 6px', borderBottom: '1px solid #eee', textAlign: 'center', fontSize: '18px' }}>{item.quantity}</td>
                                <td style={{ padding: '7px 6px', borderBottom: '1px solid #eee', textAlign: 'right', fontSize: '18px' }}>{fmtR(item.unitPrice)}</td>
                                <td style={{ padding: '7px 6px', borderBottom: '1px solid #eee', textAlign: 'right', fontWeight: 600, fontSize: '18px' }}>{fmtR(item.unitPrice * item.quantity)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Spacer — pushes tax summary + footer to the bottom of the page */}
                <div style={{ flex: 1 }} />

                {/* ── Tax Summary ──────────────────────────────────────────── */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '14px' }}>
                    <div style={{ width: '360px', fontSize: '22px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid #eee' }}>
                            <span style={{ color: '#555' }}>Total MRP (Incl. GST)</span>
                            <span style={{ fontWeight: 600 }}>{fmtR(data.grandTotal)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid #eee' }}>
                            <span style={{ color: '#555' }}>Taxable Value</span>
                            <span>{fmtR(data.taxableValue)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid #eee' }}>
                            <span style={{ color: '#555' }}>CGST @ 2.5%</span>
                            <span>{fmtR(data.cgst)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                            <span style={{ color: '#555' }}>SGST @ 2.5%</span>
                            <span>{fmtR(data.sgst)}</span>
                        </div>

                        {/* Grand Total */}
                        <div
                            className="total-row"
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                background: '#550c72',
                                color: '#fff',
                                padding: '10px 10px',
                                borderRadius: '6px',
                                marginTop: '8px',
                            }}
                        >
                            <span style={{ fontSize: '20px', fontWeight: 700, letterSpacing: '0.5px' }}>GRAND TOTAL</span>
                            <span style={{ fontSize: '22px', fontWeight: 800 }}>{fmtR(data.grandTotal)}</span>
                        </div>
                    </div>
                </div>

                {/* ── Footer ───────────────────────────────────────────────── */}
                <div style={{ borderTop: '1px solid #ddd', marginTop: '20px', paddingTop: '14px', textAlign: 'center', fontSize: '11px', color: '#666' }}>
                    <div style={{ fontWeight: 600, color: '#550c72', fontSize: '18px' }}>
                        Thank you for shopping with Pratyagra Silks!
                    </div>
                    <div style={{ marginTop: '4px', fontStyle: 'italic', fontSize: '16px' }}>
                        Reviving Tradition with a New Touch
                    </div>
                    <div style={{ marginTop: '6px', fontSize: '16px', color: '#999' }}>
                        * All prices are inclusive of GST &nbsp;|&nbsp; Goods once sold cannot be returned
                    </div>
                </div>
            </div>
        </>
    );
}
