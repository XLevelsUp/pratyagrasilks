import { EodSettlement } from '@/lib/actions/eod.actions';

const fmtR = (n: number) =>
    new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(n);

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
    return (
        <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '1.5mm',
            fontWeight: bold ? 'bold' : 'normal',
        }}>
            <span>{label}</span>
            <span>{value}</span>
        </div>
    );
}

function Divider({ double }: { double?: boolean }) {
    return (
        <div style={{
            borderTop: double ? '2px solid #000' : '1px dashed #000',
            margin: '2mm 0',
        }} />
    );
}

function SectionTitle({ children }: { children: string }) {
    return (
        <div style={{
            textAlign: 'center',
            fontSize: '10px',
            fontWeight: 'bold',
            letterSpacing: '0.5px',
            margin: '2mm 0',
        }}>
            — {children} —
        </div>
    );
}

interface EodReceiptProps {
    data: EodSettlement;
    printedAt: string;
}

export default function EodReceipt({ data, printedAt }: EodReceiptProps) {
    const avgTicket = data.totalOrders > 0
        ? data.totalRevenue / data.totalOrders
        : 0;

    return (
        <>
            <style>{`
                @media print {
                    body * { visibility: hidden !important; }
                    #eod-receipt-print,
                    #eod-receipt-print * { visibility: visible !important; }
                    #eod-receipt-print {
                        position: fixed !important;
                        top: 0 !important;
                        left: 0 !important;
                        width: 80mm !important;
                        margin: 0 !important;
                        padding: 0 !important;
                    }
                    @page { size: 80mm auto; margin: 0; }
                }
            `}</style>

            <div
                id="eod-receipt-print"
                style={{
                    width: '80mm',
                    fontFamily: "'Courier New', Courier, monospace",
                    fontSize: '11px',
                    color: '#000',
                    padding: '4mm 3mm',
                    lineHeight: '1.5',
                    position: 'fixed',
                    left: '-9999px',
                    top: 0,
                }}
            >
                {/* ── Header ─────────────────────────────────────────── */}
                <div style={{ textAlign: 'center', marginBottom: '2mm' }}>
                    <div style={{ fontSize: '10px', letterSpacing: '1px' }}>
                        *** END OF DAY REPORT ***
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: 'bold', marginTop: '1.5mm' }}>
                        PRATYAGRA SILKS
                    </div>
                    <div style={{ fontSize: '9px', marginTop: '1mm' }}>
                        NO 178, 2nd Floor A Rammachnadra Road, RS Puram, Coimbatore - 641002
                    </div>
                    <div style={{ fontSize: '9px' }}>GSTIN: 09XXXXXXXXXXXXX</div>
                </div>

                <Divider />

                <Row label="Report Date:" value={data.date} />
                <Row label="Printed At:" value={printedAt} />

                <Divider double />

                {/* ── Sales Summary ───────────────────────────────────── */}
                <SectionTitle>SALES SUMMARY</SectionTitle>

                <Row
                    label="Gross Sales:"
                    value={fmtR(data.totalRevenue)}
                    bold
                />
                <Row
                    label="Total Transactions:"
                    value={String(data.totalOrders)}
                    bold
                />
                <Row
                    label="Avg. Ticket Value:"
                    value={fmtR(avgTicket)}
                />

                <Divider />

                {/* ── Payment Breakdown ───────────────────────────────── */}
                <SectionTitle>PAYMENT BREAKDOWN</SectionTitle>

                <Row label="Cash Collected:" value={fmtR(data.breakdown.CASH)} bold />
                <Row label="UPI Collected:" value={fmtR(data.breakdown.UPI)} bold />
                <Row label="Card Collected:" value={fmtR(data.breakdown.CARD)} bold />

                <Divider double />

                {/* ── Transaction Log ─────────────────────────────────── */}
                <SectionTitle>TRANSACTION LOG</SectionTitle>

                {/* Column headers */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '9px',
                    fontWeight: 'bold',
                    borderBottom: '1px solid #000',
                    paddingBottom: '1mm',
                    marginBottom: '1.5mm',
                }}>
                    <span style={{ flex: 3 }}>Time / Order</span>
                    <span style={{ flex: 1, textAlign: 'center' }}>Pay</span>
                    <span style={{ flex: 2, textAlign: 'right' }}>Amount</span>
                </div>

                {data.transactions.length === 0 ? (
                    <div style={{ textAlign: 'center', fontSize: '9px', color: '#555', margin: '2mm 0' }}>
                        No transactions today
                    </div>
                ) : (
                    data.transactions.map(tx => {
                        const txTime = new Date(tx.createdAt).toLocaleTimeString('en-IN', {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true,
                        });
                        const shortOrder = tx.orderNumber.split('-').pop() ?? tx.orderNumber;

                        return (
                            <div key={tx.id} style={{
                                fontSize: '9px',
                                marginBottom: '1.5mm',
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ flex: 3 }}>{txTime} #{shortOrder}</span>
                                    <span style={{ flex: 1, textAlign: 'center' }}>{tx.paymentMethod.substring(0, 4)}</span>
                                    <span style={{ flex: 2, textAlign: 'right' }}>{fmtR(tx.totalAmount)}</span>
                                </div>
                            </div>
                        );
                    })
                )}

                <Divider double />

                {/* ── Signature Block ─────────────────────────────────── */}
                <div style={{ fontSize: '10px' }}>
                    <div style={{ marginBottom: '1mm' }}>Cashier Name:</div>
                    <div style={{ borderBottom: '1px solid #000', marginBottom: '5mm', height: '5mm' }} />

                    <div style={{ marginBottom: '1mm' }}>Cashier Signature:</div>
                    <div style={{ borderBottom: '1px solid #000', marginBottom: '5mm', height: '5mm' }} />

                    <div style={{ marginBottom: '1mm' }}>Manager Verification:</div>
                    <div style={{ borderBottom: '1px solid #000', marginBottom: '3mm', height: '5mm' }} />
                </div>

                <Divider />

                {/* ── Footer ──────────────────────────────────────────── */}
                <div style={{ textAlign: 'center', fontSize: '9px' }}>
                    <div style={{ fontWeight: 'bold' }}>** CONFIDENTIAL — INTERNAL USE ONLY **</div>
                    <div style={{ marginTop: '1mm' }}>Pratyagra Silks — Z-Report</div>
                </div>

                {/* Tear margin */}
                <div style={{ height: '10mm' }} />
            </div>
        </>
    );
}
