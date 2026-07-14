'use client';

import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { fieldsByGroup, MeasurementKey } from '@/lib/constants/measurements';
import { MeasurementProfile } from '@/lib/validations/measurement.schema';

interface MeasurementSheetPrintProps {
    customerName: string;
    customerPhone?: string | null;
    profile: MeasurementProfile;
}

const PURPLE = '#550c72';
const TILE_WASH = '#f7f3fa';
const font = "'Segoe UI', Arial, sans-serif";

function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

/**
 * Value-first stat tile: the number dominates, the field name whispers.
 * Unrecorded fields print as a white tile with a dotted baseline so the
 * designer can pencil the value in at the fitting.
 */
function MeasurementTile({ label, value }: { label: string; value: number | null | undefined }) {
    const recorded = value !== null && value !== undefined;
    return (
        <div
            style={{
                border: recorded ? '1px solid #e2d8ea' : '1px solid #e5e5e5',
                background: recorded ? TILE_WASH : '#fff',
                borderRadius: '4px',
                padding: '3px 6px 4px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: '34px',
                WebkitPrintColorAdjust: 'exact',
                printColorAdjust: 'exact',
            }}
        >
            <div
                style={{
                    fontSize: '8px',
                    fontWeight: 700,
                    letterSpacing: '0.6px',
                    textTransform: 'uppercase',
                    color: '#8a7f93',
                    lineHeight: 1.15,
                }}
            >
                {label}
            </div>
            {recorded && (
                <div
                    style={{
                        fontSize: '16px',
                        fontWeight: 700,
                        color: '#161018',
                        lineHeight: 1.05,
                        fontVariantNumeric: 'tabular-nums',
                    }}
                >
                    {value}
                    <span style={{ fontSize: '10px', fontWeight: 600, color: '#8a7f93', marginLeft: '1px' }}>″</span>
                </div>
            )}
        </div>
    );
}

/**
 * Hard-copy A5 measurement sheet handed to the designer — mirrors the printed
 * "Pratyagra Designer — Customised Measurement Sheet". Hidden off-screen;
 * the @media print block reveals only this sheet (same mechanism as PosReceipt).
 */
export default function MeasurementSheetPrint({ customerName, customerPhone, profile }: MeasurementSheetPrintProps) {
    const groups = fieldsByGroup();
    const sheetRef = useRef<HTMLDivElement>(null);

    // Self-heal: if a stale copy of the sheet is ever left in <body> (e.g. a
    // hot-reload orphan), both copies share this id and BOTH would print —
    // remove every node that isn't the one this instance owns.
    useEffect(() => {
        document.querySelectorAll('#measurement-sheet-print').forEach((el) => {
            if (el !== sheetRef.current) el.remove();
        });
    }, []);

    /** Inline meta item; missing values print as a dotted hand-fill segment */
    const metaItem = (label: string, value: string | null | undefined) => (
        <span key={label} style={{ display: 'inline-flex', alignItems: 'baseline', gap: '4px', whiteSpace: 'nowrap' }}>
            <span style={{ fontSize: '8px', fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase', color: '#8a7f93' }}>
                {label}
            </span>
            {value ? (
                <span style={{ fontSize: '10px', fontWeight: 600, color: '#222' }}>{value}</span>
            ) : (
                <span style={{ display: 'inline-block', borderBottom: '1px dotted #999', width: '64px', height: '10px' }} />
            )}
        </span>
    );

    // Portal to <body>: in print, everything except this sheet is display:none,
    // so the document is exactly one sheet tall. The sheet itself must NOT be
    // position:fixed while printing — paged media repeats fixed elements on
    // every page, which printed the same sheet twice.
    return createPortal(
        <>
            <style>{`
                @media print {
                    body > *:not(#measurement-sheet-print) { display: none !important; }
                    html, body {
                        height: auto !important;
                        overflow: visible !important;
                        background: #fff !important;
                    }
                    #measurement-sheet-print {
                        position: static !important;
                        left: 0 !important;
                        top: 0 !important;
                        width: 100% !important;
                        max-width: 100% !important;
                        padding: 8px !important;
                        margin: 0 auto !important;
                        min-height: 0 !important;
                        height: auto !important;
                        display: flex !important;
                        flex-direction: column !important;
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }
                    @page {
                        size: A5 portrait;
                        margin: 10px;
                    }
                }
            `}</style>

            <div
                id="measurement-sheet-print"
                ref={sheetRef}
                style={{
                    position: 'fixed',
                    left: '-9999px',
                    top: 0,
                    fontFamily: font,
                    color: '#333',
                    lineHeight: 1.3,
                    width: '520px',
                    background: '#fff',
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >
                {/* Watermark logo */}
                <div
                    style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        opacity: 0.07,
                        zIndex: 0,
                        pointerEvents: 'none',
                        rotate: '-30deg',
                    }}
                >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/Pratyagra_Silks_Logo.svg" alt="" style={{ height: '300px', width: 'auto', display: 'block' }} />
                </div>

                {/* ── Compact header ─────────────────────────────────────── */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', position: 'relative', zIndex: 1 }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/Pratyagra_Silks_Logo.svg" alt="Pratyagra Silks" style={{ height: '30px', width: 'auto', display: 'block' }} />
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '12px', fontWeight: 800, color: PURPLE, letterSpacing: '2px' }}>
                            MEASUREMENT SHEET
                        </div>
                        <div style={{ fontSize: '10px', color: '#999', letterSpacing: '0.5px' }}>
                            Pratyagra Designers · Printed {formatDate(new Date().toISOString())}
                        </div>
                    </div>
                </div>
                <div style={{ borderTop: `2px solid ${PURPLE}`, marginTop: '6px', marginBottom: '8px' }} />

                {/* ── Client identity band ───────────────────────────────── */}
                <div style={{ position: 'relative', zIndex: 1, marginBottom: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '20px', fontWeight: 800, color: '#161018', lineHeight: 1.1 }}>
                            {customerName}
                        </span>
                        <span
                            style={{
                                fontSize: '10px',
                                fontWeight: 700,
                                letterSpacing: '0.8px',
                                textTransform: 'uppercase',
                                color: '#fff',
                                background: PURPLE,
                                padding: '2px 9px',
                                borderRadius: '9px',
                                WebkitPrintColorAdjust: 'exact',
                                printColorAdjust: 'exact',
                            }}
                        >
                            {profile.profileLabel}
                        </span>
                    </div>
                    <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', marginTop: '5px' }}>
                        {metaItem('Phone', customerPhone || null)}
                        {metaItem('Outfit', profile.outfitType || null)}
                        {metaItem('Designer', profile.designer || null)}
                        {metaItem('Measured', formatDate(profile.updatedAt))}
                    </div>
                </div>

                {/* ── Measurement tile sections ──────────────────────────── */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', position: 'relative', zIndex: 1 }}>
                    {groups.map(({ group, fields }) => (
                        <div key={group}>
                            <div
                                style={{
                                    fontSize: '10px',
                                    fontWeight: 800,
                                    letterSpacing: '2px',
                                    textTransform: 'uppercase',
                                    color: PURPLE,
                                    padding: '3px 8px',
                                    borderBottom: '1px solid',
                                    marginTop: '4px',
                                    marginBottom: '4px',
                                    WebkitPrintColorAdjust: 'exact',
                                    printColorAdjust: 'exact',
                                }}
                            >
                                {group}
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px' }}>
                                {fields.map((field) => (
                                    <MeasurementTile
                                        key={field.key}
                                        label={field.label}
                                        value={profile[field.key as MeasurementKey] as number | null}
                                    />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Spacer — pushes notes + signatures to the bottom */}
                <div style={{ flex: 1, minHeight: '6px' }} />

                {/* ── Notes ──────────────────────────────────────────────── */}
                <div style={{ position: 'relative', zIndex: 1, marginTop: '8px' }}>
                    <div style={{ fontSize: '8px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#8a7f93', marginBottom: '2px' }}>
                        Special Instructions
                    </div>
                    <div style={{ border: '1px solid #e5e0ea', borderRadius: '4px', padding: '5px 8px', minHeight: '36px' }}>
                        {profile.notes ? (
                            <div style={{ fontSize: '10px', color: '#333', whiteSpace: 'pre-wrap' }}>{profile.notes}</div>
                        ) : (
                            <>
                                <div style={{ borderBottom: '1px dotted #bbb', height: '13px' }} />
                                <div style={{ height: '13px', borderBottom: '1px dotted #bbb' }} />
                            </>
                        )}
                    </div>
                </div>

                {/* ── Signatures ─────────────────────────────────────────── */}
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '40px', marginTop: '16px', position: 'relative', zIndex: 1 }}>
                    {['Client Signature', 'Designer Signature'].map((label) => (
                        <div key={label} style={{ flex: 1, textAlign: 'center' }}>
                            <div style={{ borderBottom: '1px solid #999', height: '20px' }} />
                            <div style={{ fontSize: '8px', color: '#777', marginTop: '2px', letterSpacing: '1px', textTransform: 'uppercase' }}>
                                {label}
                            </div>
                        </div>
                    ))}
                </div>

                {/* ── Footer ─────────────────────────────────────────────── */}
                <div style={{ borderTop: '1px solid #ddd', marginTop: '9px', paddingTop: '4px', textAlign: 'center', position: 'relative', zIndex: 1 }}>
                    <div style={{ fontSize: '8px', fontWeight: 600, color: PURPLE }}>
                        Pratyagra Silks · NO 178, 2nd Floor A Ramachandra Road, RS Puram, Coimbatore – 641002 · Tel: +91 73588 66646
                    </div>
                    <div style={{ fontSize: '8px', fontStyle: 'italic', color: '#aaa' }}>
                        Reviving Tradition with a New Touch
                    </div>
                </div>
            </div>
        </>,
        document.body
    );
}
