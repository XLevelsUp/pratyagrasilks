'use client';

import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { isSupabaseImage } from '@pratyagra/core/utils/image';
import { Search, Trash2, CreditCard, X, ShoppingCart, Banknote, Smartphone, CheckCircle2, Loader2, User, Tag, RotateCcw } from 'lucide-react';
import { Product } from '@pratyagra/core/types';
import { useQrScanner } from '@/hooks/useQrScanner';
import { processOfflineSale } from '@/lib/actions/pos.actions';
import { lookupOrCreateCustomer, getCustomerByPhone } from '@/lib/actions/crm.actions';
import type { PosActionItem, PosCustomer } from '@pratyagra/core/types';
import PosReceipt, { PosReceiptData } from '@/components/admin/PosReceipt';
import TestBillPrint from '@/components/admin/TestBillPrint';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { hasDiscount, getEffectivePrice, getDiscountPercent } from '@pratyagra/core/utils/discount';

interface PosCartItem {
    product: Product;
    quantity: number;
}

type PaymentMethod = 'CASH' | 'UPI' | 'CARD';
type DiscountMode = 'AMT' | 'PCT';

const fmt = (n: number) =>
    new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
    }).format(n);

const PAYMENT_OPTIONS: { method: PaymentMethod; label: string; icon: React.ReactNode }[] = [
    { method: 'CASH', label: 'Cash', icon: <Banknote className="w-6 h-6" /> },
    { method: 'UPI', label: 'UPI', icon: <Smartphone className="w-6 h-6" /> },
    { method: 'CARD', label: 'Card', icon: <CreditCard className="w-6 h-6" /> },
];

export default function PosPage() {
    const [cartItems, setCartItems] = useState<PosCartItem[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<Product[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>('CASH');
    const [isProcessing, setIsProcessing] = useState(false);
    const [receiptData, setReceiptData] = useState<PosReceiptData | null>(null);
    const [customerPhone, setCustomerPhone] = useState('');
    const [customerName, setCustomerName] = useState('');
    const [customer, setCustomer] = useState<PosCustomer | null>(null);
    const [isLookingUp, setIsLookingUp] = useState(false);
    const [showOrderConfirm, setShowOrderConfirm] = useState(false);
    const [isScanProcessing, setIsScanProcessing] = useState(false);
    const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // ── Offer / Discount ─────────────────────────────────────────────────────
    // Draft state lives in the dialog; only Confirm commits to appliedDiscount,
    // so Order Summary never flickers while the cashier is still typing.
    const [showOfferDialog, setShowOfferDialog] = useState(false);
    const [discountMode, setDiscountMode] = useState<DiscountMode>('AMT');
    const [discountValue, setDiscountValue] = useState('');
    const [finalAmount, setFinalAmount] = useState('');
    const [isAmountOverridden, setIsAmountOverridden] = useState(false);
    const [appliedDiscount, setAppliedDiscount] = useState(0);

    // Discounts never survive a cart change — an offer is negotiated against a
    // specific basket, so it must not outlive the items it was given for.
    const clearDiscount = useCallback(() => {
        setAppliedDiscount(0);
        setDiscountValue('');
        setFinalAmount('');
        setIsAmountOverridden(false);
        setDiscountMode('AMT');
    }, []);

    // ── Cart Operations ──────────────────────────────────────────────────────
    const addToCart = useCallback((product: Product) => {
        setCartItems(prev => {
            const existing = prev.find(item => item.product.id === product.id);
            if (existing) {
                return prev.map(item =>
                    item.product.id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            return [...prev, { product, quantity: 1 }];
        });
        if (appliedDiscount > 0) toast('Offer removed — cart changed', { icon: '🏷️' });
        clearDiscount();
    }, [appliedDiscount, clearDiscount]);

    const removeFromCart = useCallback((productId: string) => {
        setCartItems(prev => prev.filter(item => item.product.id !== productId));
        if (appliedDiscount > 0) toast('Offer removed — cart changed', { icon: '🏷️' });
        clearDiscount();
    }, [appliedDiscount, clearDiscount]);

    const clearCart = useCallback(() => {
        setCartItems([]);
        clearDiscount();
    }, [clearDiscount]);

    const resetForNewSale = useCallback(() => {
        setCartItems([]);
        setCustomerPhone('');
        setCustomerName('');
        setCustomer(null);
        setSelectedPayment('CASH');
        setReceiptData(null);
        setSearchQuery('');
        setSearchResults([]);
        clearDiscount();
    }, [clearDiscount]);

    // ── QR Scanner ───────────────────────────────────────────────────────────
    const handleQrScan = useCallback(async (sku: string) => {
        // Cancel any pending debounced search and wipe the input immediately
        if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
        setSearchQuery('');
        setSearchResults([]);
        setIsSearching(false);
        setIsScanProcessing(true);
        try {
            const res = await fetch(`/api/admin/pos/search?sku=${encodeURIComponent(sku)}`);
            if (!res.ok) { toast.error('Product not found'); return; }
            const { product } = await res.json();
            addToCart(product);
            toast.success(`Added: ${product.name}`);
        } catch {
            toast.error('Scan failed. Please try again.');
        } finally {
            setIsScanProcessing(false);
        }
    }, [addToCart]);

    // ── Customer Lookup ──────────────────────────────────────────────────────
    const triggerPhoneLookup = async (cleanPhone: string) => {
        setIsLookingUp(true);
        try {
            const result = await getCustomerByPhone(cleanPhone);
            if (result.success && result.customer) {
                setCustomer(result.customer);
                setCustomerName(result.customer.full_name);
            } else {
                setCustomer(null);
            }
        } finally {
            setIsLookingUp(false);
        }
    };

    // Auto-lookup when exactly 10 digits are entered; clear when edited back below 10
    useEffect(() => {
        const clean = customerPhone.replace(/\D/g, '');
        if (clean.length !== 10) {
            setCustomer(null);
            setCustomerName('');
            return;
        }
        triggerPhoneLookup(clean);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [customerPhone]);

    // Name blur — create new customer if phone is valid and no customer found yet
    const handleNameBlur = async () => {
        if (customer) return;
        const cleanPhone = customerPhone.replace(/\D/g, '');
        if (cleanPhone.length < 10) return;

        setIsLookingUp(true);
        try {
            const result = await lookupOrCreateCustomer(customerPhone, customerName || undefined);
            if (result.success && result.customer) {
                setCustomer(result.customer);
            }
        } finally {
            setIsLookingUp(false);
        }
    };

    useQrScanner({ onScan: handleQrScan, enabled: !showPaymentModal && !showOfferDialog });

    // ── Debounced Search ─────────────────────────────────────────────────────
    useEffect(() => {
        if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
        if (searchQuery.length < 2) { setSearchResults([]); return; }

        searchTimerRef.current = setTimeout(async () => {
            setIsSearching(true);
            try {
                const res = await fetch(`/api/admin/pos/search?q=${encodeURIComponent(searchQuery)}`);
                if (res.ok) {
                    const { products } = await res.json();
                    setSearchResults(products || []);
                }
            } finally {
                setIsSearching(false);
            }
        }, 300);

        return () => { if (searchTimerRef.current) clearTimeout(searchTimerRef.current); };
    }, [searchQuery]);

    // ── Tax Math (reverse-calculate from GST-inclusive prices) ───────────────
    // grandTotal is the pre-discount MRP; payableTotal is what's actually
    // collected, and GST is derived from that so tax follows the discount.
    // Product-level website offers apply in-store too, so the counter price
    // always matches what the customer saw online.
    const grandTotal = useMemo(
        () => cartItems.reduce((s, i) => s + getEffectivePrice(i.product) * i.quantity, 0),
        [cartItems]
    );
    const payableTotal = useMemo(
        () => Math.max(grandTotal - appliedDiscount, 0),
        [grandTotal, appliedDiscount]
    );
    const taxableValue = useMemo(
        () => Math.round((payableTotal / 1.05) * 100) / 100,
        [payableTotal]
    );
    const totalGst = useMemo(() => payableTotal - taxableValue, [payableTotal, taxableValue]);
    const cgst = useMemo(() => Math.round((totalGst / 2) * 100) / 100, [totalGst]);
    const sgst = useMemo(() => Math.round((totalGst / 2) * 100) / 100, [totalGst]);
    const itemCount = useMemo(() => cartItems.reduce((s, i) => s + i.quantity, 0), [cartItems]);

    // ── Offer Dialog Math ────────────────────────────────────────────────────
    // Draft discount from the ₹/% input, clamped to the cart total.
    const draftDiscount = useMemo(() => {
        const v = parseFloat(discountValue) || 0;
        if (v <= 0) return 0;
        const raw = discountMode === 'PCT' ? (grandTotal * v) / 100 : v;
        return Math.min(Math.round(raw), grandTotal);
    }, [discountValue, discountMode, grandTotal]);

    // Auto-fill Final Amount unless the cashier has typed over it (the latch).
    useEffect(() => {
        if (isAmountOverridden) return;
        setFinalAmount(Math.max(grandTotal - draftDiscount, 0).toString());
    }, [draftDiscount, grandTotal, isAmountOverridden]);

    // What Confirm will commit — derived from the final amount either way, so a
    // manual override and a typed discount both resolve to a single number.
    const draftFinal = useMemo(() => {
        const v = parseFloat(finalAmount);
        if (isNaN(v)) return grandTotal;
        return Math.min(Math.max(Math.round(v), 0), grandTotal);
    }, [finalAmount, grandTotal]);

    const draftSavings = useMemo(() => Math.max(grandTotal - draftFinal, 0), [grandTotal, draftFinal]);

    const openOfferDialog = () => {
        // Re-seed the draft from whatever is currently applied
        if (appliedDiscount > 0) {
            setDiscountMode('AMT');
            setDiscountValue(appliedDiscount.toString());
            setFinalAmount((grandTotal - appliedDiscount).toString());
        } else {
            setDiscountValue('');
            setFinalAmount(grandTotal.toString());
        }
        setIsAmountOverridden(false);
        setShowOfferDialog(true);
    };

    const confirmOffer = () => {
        setAppliedDiscount(draftSavings);
        setShowOfferDialog(false);
    };

    // ── Payment Flow ─────────────────────────────────────────────────────────
    const handleConfirmPayment = async () => {
        setIsProcessing(true);
        try {
            const actionItems: PosActionItem[] = cartItems.map(i => ({
                productId: i.product.id,
                name: i.product.name,
                sku: i.product.sku,
                quantity: i.quantity,
                unitPrice: getEffectivePrice(i.product),
            }));

            const result = await processOfflineSale(actionItems, selectedPayment, customer?.id, appliedDiscount);

            if (!result.success || !result.orderNumber) {
                toast.error(result.error || 'Sale failed. Please try again.');
                return;
            }

            const receipt: PosReceiptData = {
                orderNumber: result.orderNumber,
                orderId: result.orderId!,
                invoiceNumber: result.invoiceNumber,
                items: actionItems,
                grandTotal: payableTotal,
                subtotal: grandTotal,
                discount: appliedDiscount,
                taxableValue,
                cgst,
                sgst,
                paymentMethod: selectedPayment,
                date: new Date().toLocaleString('en-IN', {
                    day: '2-digit', month: '2-digit', year: 'numeric',
                    hour: '2-digit', minute: '2-digit', hour12: true,
                }),
                customerName: customerName || undefined,
                customerPhone: customerPhone || undefined,
            };

            setReceiptData(receipt);
            setShowPaymentModal(false);
            toast.success(`Sale complete! Order ${result.orderNumber}`);

            setTimeout(() => {
                const cleanup = () => {
                    resetForNewSale();
                    window.removeEventListener('afterprint', cleanup);
                };
                window.addEventListener('afterprint', cleanup);
                window.print();
            }, 400);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <>
            {/* Thermal receipt — hidden on screen, rendered on print */}
            {receiptData && <PosReceipt data={receiptData} />}

            <div className="h-[calc(100vh-8rem)] flex flex-col gap-4">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#550c72] flex items-center justify-center">
                            <ShoppingCart className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Point of Sale</h1>
                            <p className="text-sm text-gray-500">Scan or search products to add to cart</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <TestBillPrint />
                        {isScanProcessing && (
                            <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
                                <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
                                <span className="text-xs font-medium text-blue-700">Adding product...</span>
                            </div>
                        )}
                        <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-xs font-medium text-green-700">Scanner Ready</span>
                        </div>
                    </div>
                </div>

                {/* Two-column layout */}
                <div className="flex gap-6 flex-1 min-h-0">

                    {/* LEFT: Cart area */}
                    <div className="flex-[3] flex flex-col gap-4 min-h-0">

                        {/* Search bar */}
                        <div className="relative">
                            <div className="flex items-center gap-2 bg-white border-2 border-gray-200 rounded-xl px-4 py-3 focus-within:border-[#550c72] transition-colors">
                                <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
                                <input
                                    type="text"
                                    placeholder="Search products by name..."
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    className="flex-1 outline-none text-gray-900 placeholder-gray-400 bg-transparent text-sm"
                                />
                                {isSearching && (
                                    <div className="w-4 h-4 border-2 border-[#550c72] border-t-transparent rounded-full animate-spin flex-shrink-0" />
                                )}
                                {searchQuery && !isSearching && (
                                    <button
                                        onClick={() => { setSearchQuery(''); setSearchResults([]); }}
                                        className="text-gray-400 hover:text-gray-600"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                )}
                            </div>

                            {searchResults.length > 0 && (
                                <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                                    {searchResults.map(product => (
                                        <button
                                            key={product.id}
                                            onClick={() => {
                                                addToCart(product);
                                                toast.success(`Added: ${product.name}`);
                                                setSearchQuery('');
                                                setSearchResults([]);
                                            }}
                                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-purple-50 transition-colors text-left border-b border-gray-100 last:border-0"
                                        >
                                            {product.images[0] ? (
                                                <img
                                                    src={product.images[0]}
                                                    alt={product.name}
                                                    className="w-10 h-10 object-cover rounded-lg flex-shrink-0"
                                                />
                                            ) : (
                                                <div className="w-10 h-10 bg-gray-100 rounded-lg flex-shrink-0" />
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-gray-900 truncate">{product.name}</p>
                                                <p className="text-xs text-gray-500">SKU: {product.sku}</p>
                                            </div>
                                            <span className="text-sm font-bold text-[#550c72] flex-shrink-0 flex items-baseline gap-1.5">
                                                {hasDiscount(product) && (
                                                    <span className="text-xs font-normal text-gray-400 line-through">{fmt(product.price)}</span>
                                                )}
                                                {fmt(getEffectivePrice(product))}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Cart items list */}
                        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                            {cartItems.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-center py-16">
                                    <div className="w-20 h-20 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
                                        <ShoppingCart className="w-10 h-10 text-gray-300" />
                                    </div>
                                    <p className="text-gray-500 font-medium">Cart is empty</p>
                                    <p className="text-sm text-gray-400 mt-1">Scan a QR code or search above</p>
                                </div>
                            ) : (
                                cartItems.map(({ product, quantity }) => (
                                    <div
                                        key={product.id}
                                        className="flex items-center gap-4 bg-white rounded-xl p-3 shadow-sm border border-gray-100"
                                    >
                                        <div className="relative w-16 h-16 flex-shrink-0">
                                            {product.images[0] ? (
                                                <Image
                                                    src={product.images[0]}
                                                    alt={product.name}
                                                    fill
                                                    className="object-cover rounded-lg"
                                                    sizes="64px"
                                                    unoptimized={isSupabaseImage(product.images[0])}
                                                />
                                            ) : (
                                                <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                                                    <ShoppingCart className="w-6 h-6 text-gray-300" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-gray-900 truncate">{product.name}</p>
                                            <p className="text-xs text-gray-500 mt-0.5">SKU: {product.sku}</p>
                                            <p className="text-sm font-bold text-[#550c72] mt-1 flex items-baseline gap-1.5 flex-wrap">
                                                {hasDiscount(product) ? (
                                                    <>
                                                        <span className="text-xs font-normal text-gray-400 line-through">{fmt(product.price)}</span>
                                                        <span>{fmt(getEffectivePrice(product))}</span>
                                                        <span className="px-1.5 py-0.5 text-[10px] font-bold text-green-700 bg-green-50 border border-green-200 rounded">
                                                            {getDiscountPercent(product)}% OFF
                                                        </span>
                                                    </>
                                                ) : (
                                                    fmt(product.price)
                                                )}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-3 flex-shrink-0">
                                            <span className="bg-[#550c72] text-white text-sm font-bold rounded-full w-8 h-8 flex items-center justify-center">
                                                {quantity}
                                            </span>
                                            <span className="text-sm font-semibold text-gray-700 w-20 text-right">
                                                {fmt(getEffectivePrice(product) * quantity)}
                                            </span>
                                            <button
                                                onClick={() => removeFromCart(product.id)}
                                                className="text-red-400 hover:text-red-600 transition-colors p-1"
                                                aria-label={`Remove ${product.name}`}
                                            >
                                                <X className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* RIGHT: Checkout area */}
                    <div className="flex-[2] flex flex-col gap-4">

                        {/* Customer Details Card */}
                        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-5">
                            <div className="flex items-center gap-2 mb-4">
                                <User className="w-5 h-5 text-[#550c72]" />
                                <h3 className="text-base font-bold text-gray-900">Customer Details</h3>
                            </div>
                            <div className="2xl:grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-semibold text-gray-600 uppercase">Phone Number</label>
                                    <div className="relative mt-1.5 flex items-center">
                                        <input
                                            type="tel"
                                            placeholder="10-digit phone"
                                            value={customerPhone}
                                            onChange={e => setCustomerPhone(e.target.value)}
                                            className="flex-1 px-3 py-2 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#550c72] transition-colors"
                                            maxLength={10}
                                        />
                                        {isLookingUp && (
                                            <Loader2 className="absolute right-3 w-4 h-4 text-[#550c72] animate-spin" />
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-gray-600 uppercase">Customer Name</label>
                                    <input
                                        type="text"
                                        placeholder="Optional"
                                        value={customerName}
                                        onChange={e => setCustomerName(e.target.value)}
                                        onBlur={handleNameBlur}
                                        className="w-full mt-1.5 px-3 py-2 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#550c72] transition-colors"
                                        disabled={isLookingUp}
                                    />
                                </div>
                                {customer && (
                                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-3">
                                        <p className="text-xs text-green-700 font-medium">
                                            ✓ Returning Customer
                                        </p>
                                        <p className="text-xs text-green-600 mt-1">
                                            Lifetime Value: <span className="font-semibold">{fmt(customer.total_spent)}</span>
                                        </p>
                                        <p className="text-xs text-green-600">
                                            Previous Orders: <span className="font-semibold">{customer.total_orders}</span>
                                        </p>
                                        <Link
                                            href={`/admin/customers/${customer.id}`}
                                            className="inline-block text-xs font-semibold text-amber-700 hover:text-amber-800 mt-2 underline underline-offset-2"
                                        >
                                            Measurements →
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Order Summary Card */}
                        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 flex-1 overflow-y-auto">
                            <div className="flex items-center justify-between mb-5">
                                <h2 className="text-lg font-bold text-gray-900">Order Summary</h2>
                                <button
                                    onClick={openOfferDialog}
                                    disabled={cartItems.length === 0}
                                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#550c72] bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                >
                                    <Tag className="w-3.5 h-3.5" />
                                    Apply Offer
                                </button>
                            </div>

                            <div className="space-y-3 border-b border-gray-100 pb-4 mb-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">
                                        Total MRP
                                        <span className="ml-2 text-xs text-gray-400">({itemCount} item{itemCount !== 1 ? 's' : ''})</span>
                                    </span>
                                    <span className="font-semibold text-gray-900">{fmt(grandTotal)}</span>
                                </div>
                                {appliedDiscount > 0 && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-green-700 flex items-center gap-1.5">
                                            <Tag className="w-3.5 h-3.5" />
                                            Discount
                                        </span>
                                        <span className="font-semibold text-green-700">− {fmt(appliedDiscount)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Taxable Value</span>
                                    <span className="font-semibold text-gray-700">{fmt(taxableValue)}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-500 flex items-center gap-1">
                                        CGST
                                        <span className="text-xs bg-amber-100 text-[#D97706] font-medium px-1.5 py-0.5 rounded">2.5%</span>
                                    </span>
                                    <span className="text-[#D97706] font-medium">{fmt(cgst)}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-500 flex items-center gap-1">
                                        SGST
                                        <span className="text-xs bg-amber-100 text-[#D97706] font-medium px-1.5 py-0.5 rounded">2.5%</span>
                                    </span>
                                    <span className="text-[#D97706] font-medium">{fmt(sgst)}</span>
                                </div>
                            </div>

                            <div className="flex justify-between items-center mb-5">
                                <span className="text-lg font-bold text-gray-900">Grand Total</span>
                                <span className="flex items-baseline gap-2">
                                    {appliedDiscount > 0 && (
                                        <span className="text-sm text-gray-400 line-through">{fmt(grandTotal)}</span>
                                    )}
                                    <span className="text-2xl font-bold text-[#550c72]">{fmt(payableTotal)}</span>
                                </span>
                            </div>

                            {cartItems.length > 0 && (
                                <div className="pt-4 border-t border-gray-100 space-y-1.5">
                                    {cartItems.map(({ product, quantity }) => (
                                        <div key={product.id} className="flex justify-between text-xs text-gray-500">
                                            <span className="truncate flex-1 mr-2">{product.name} ×{quantity}</span>
                                            <span className="flex-shrink-0">{fmt(getEffectivePrice(product) * quantity)}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="grid xl:grid-cols-3 gap-3 flex-wrap">
                            <button
                                onClick={() => setShowPaymentModal(true)}
                                disabled={cartItems.length === 0 || customerPhone.replace(/\D/g, '').length < 10}
                                className="xl:col-span-2 w-full py-4 bg-[#550c72] hover:bg-[#8430AB] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-colors shadow-lg shadow-purple-200"
                            >
                                <CreditCard className="w-5 h-5" />
                                Proceed to Payment
                            </button>

                            <button
                                onClick={clearCart}
                                disabled={cartItems.length === 0}
                                className="w-full py-3 border-2 border-red-300 text-red-500 rounded-xl font-semibold hover:bg-red-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                <Trash2 className="w-4 h-4" />
                                Clear Cart
                            </button>
                        </div>
                        {cartItems.length > 0 && customerPhone.replace(/\D/g, '').length < 10 && (
                            <p className="text-center text-xs text-amber-600 mt-1">Enter customer phone number to proceed</p>
                        )}

                    </div>
                </div>
            </div>

            {/* Apply Offer Dialog */}
            {showOfferDialog && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="flex items-center gap-2 text-lg font-bold text-gray-900">
                                <Tag className="w-5 h-5 text-[#550c72]" />
                                Apply Offer
                            </h3>
                            <button
                                onClick={() => setShowOfferDialog(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Item breakdown */}
                        <div className="bg-gray-50 rounded-xl p-4 mb-5">
                            <div className="space-y-2">
                                {cartItems.map(({ product, quantity }) => (
                                    <div key={product.id} className="flex justify-between text-sm">
                                        <span className="text-gray-600 truncate flex-1 mr-3">
                                            {product.name}
                                            {quantity > 1 && <span className="text-gray-400"> ×{quantity}</span>}
                                        </span>
                                        <span className="text-gray-900 font-medium flex-shrink-0">
                                            {fmt(getEffectivePrice(product) * quantity)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                            {cartItems.length > 1 && (
                                <div className="flex justify-between items-center pt-3 mt-3 border-t border-gray-200">
                                    <span className="text-sm font-semibold text-gray-700">
                                        Total ({itemCount} items)
                                    </span>
                                    <span className="text-base font-bold text-gray-900">{fmt(grandTotal)}</span>
                                </div>
                            )}
                        </div>

                        {/* Discount input with ₹ / % toggle */}
                        <div className="mb-5">
                            <label className="block text-xs font-semibold text-gray-600 uppercase mb-2">
                                Discount
                            </label>
                            <div className="flex gap-2">
                                <div className="flex rounded-lg border-2 border-gray-200 overflow-hidden flex-shrink-0">
                                    {(['AMT', 'PCT'] as DiscountMode[]).map(mode => (
                                        <button
                                            key={mode}
                                            type="button"
                                            onClick={() => setDiscountMode(mode)}
                                            className={`px-4 py-2 text-sm font-bold transition-colors ${
                                                discountMode === mode
                                                    ? 'bg-[#550c72] text-white'
                                                    : 'bg-white text-gray-500 hover:bg-gray-50'
                                            }`}
                                        >
                                            {mode === 'AMT' ? '₹' : '%'}
                                        </button>
                                    ))}
                                </div>
                                <input
                                    type="number"
                                    min="0"
                                    max={discountMode === 'PCT' ? 100 : grandTotal}
                                    step={discountMode === 'PCT' ? 0.5 : 1}
                                    value={discountValue}
                                    onChange={e => setDiscountValue(e.target.value)}
                                    placeholder={discountMode === 'PCT' ? 'e.g. 10' : 'e.g. 2000'}
                                    className="flex-1 px-3 py-2 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#550c72] transition-colors"
                                />
                            </div>
                            {draftSavings > 0 && (
                                <p className="mt-2 text-xs text-green-700 font-medium">
                                    Customer saves {fmt(draftSavings)}
                                    {grandTotal > 0 && ` (${((draftSavings / grandTotal) * 100).toFixed(1)}%)`}
                                </p>
                            )}
                        </div>

                        {/* Final amount — editable, with override latch */}
                        <div className="mb-6">
                            <label className="flex items-center justify-between text-xs font-semibold text-gray-600 uppercase mb-2">
                                <span>Final Amount</span>
                                {isAmountOverridden && (
                                    <span className="text-[10px] font-medium text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded normal-case">
                                        Manual override
                                    </span>
                                )}
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="number"
                                    min="0"
                                    max={grandTotal}
                                    step="1"
                                    value={finalAmount}
                                    onChange={e => {
                                        setFinalAmount(e.target.value);
                                        setIsAmountOverridden(true);
                                    }}
                                    className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-lg text-lg font-bold text-[#550c72] focus:outline-none focus:border-[#550c72] transition-colors"
                                />
                                {isAmountOverridden && (
                                    <button
                                        type="button"
                                        onClick={() => setIsAmountOverridden(false)}
                                        className="flex-shrink-0 flex items-center gap-1.5 px-3 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-300 rounded-lg hover:bg-amber-100 whitespace-nowrap"
                                    >
                                        <RotateCcw className="w-3.5 h-3.5" />
                                        Reset to calculated
                                    </button>
                                )}
                            </div>
                            <p className="mt-2 text-xs text-gray-400">
                                Cannot exceed {fmt(grandTotal)}
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowOfferDialog(false)}
                                className="flex-1 py-3 border-2 border-gray-200 text-gray-600 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmOffer}
                                className="flex-[2] py-3 bg-[#550c72] hover:bg-[#8430AB] text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-colors"
                            >
                                <CheckCircle2 className="w-4 h-4" />
                                Confirm — {fmt(draftFinal)}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Payment Modal */}
            {showPaymentModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6">
                        {isProcessing && (
                            <div className="absolute inset-0 bg-white/80 rounded-2xl flex flex-col items-center justify-center gap-3 z-10">
                                <Loader2 className="w-10 h-10 animate-spin text-[#550c72]" />
                                <p className="text-sm font-semibold text-gray-700">Processing sale...</p>
                            </div>
                        )}
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="text-lg font-bold text-gray-900">Select Payment Method</h3>
                            <button
                                onClick={() => setShowPaymentModal(false)}
                                disabled={isProcessing}
                                className="text-gray-400 hover:text-gray-600 disabled:opacity-40"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Total summary */}
                        <div className="bg-gray-50 rounded-xl p-4 mb-5">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600 font-medium">Amount to Collect</span>
                                <span className="text-2xl font-bold text-[#550c72]">{fmt(payableTotal)}</span>
                            </div>
                            {appliedDiscount > 0 && (
                                <div className="flex justify-between items-center mt-1.5 text-xs">
                                    <span className="text-green-700 font-medium">Offer applied</span>
                                    <span className="text-green-700 font-semibold">
                                        − {fmt(appliedDiscount)} off {fmt(grandTotal)}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Payment options */}
                        <div className="grid grid-cols-3 gap-3 mb-6">
                            {PAYMENT_OPTIONS.map(({ method, label, icon }) => (
                                <button
                                    key={method}
                                    onClick={() => setSelectedPayment(method)}
                                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all font-semibold text-sm ${
                                        selectedPayment === method
                                            ? 'border-[#550c72] bg-purple-50 text-[#550c72]'
                                            : 'border-gray-200 text-gray-600 hover:border-gray-300'
                                    }`}
                                >
                                    {icon}
                                    {label}
                                    {selectedPayment === method && (
                                        <CheckCircle2 className="w-4 h-4 text-[#550c72]" />
                                    )}
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={() => setShowOrderConfirm(true)}
                            disabled={isProcessing}
                            className="w-full py-4 bg-[#550c72] hover:bg-[#8430AB] disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-xl font-bold text-base flex items-center justify-center gap-2 transition-colors"
                        >
                            {isProcessing ? (
                                <><Loader2 className="w-5 h-5 animate-spin" />Processing...</>
                            ) : (
                                <><CheckCircle2 className="w-5 h-5" />Confirm {selectedPayment} — {fmt(payableTotal)}</>
                            )}
                        </button>
                    </div>
                </div>
            )}

            <ConfirmDialog
                isOpen={showOrderConfirm}
                onClose={() => setShowOrderConfirm(false)}
                onConfirm={() => { setShowOrderConfirm(false); handleConfirmPayment(); }}
                title="Confirm Sale"
                message={
                    appliedDiscount > 0
                        ? `Finalise ${selectedPayment} payment of ${fmt(payableTotal)} for ${customerName || 'this customer'}? A discount of ${fmt(appliedDiscount)} has been applied to ${fmt(grandTotal)}.`
                        : `Finalise ${selectedPayment} payment of ${fmt(payableTotal)} for ${customerName || 'this customer'}?`
                }
                confirmText="Yes, Complete Sale"
                cancelText="Go Back"
                variant="warning"
            />
        </>
    );
}
