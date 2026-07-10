'use client';

import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { isSupabaseImage } from '@/lib/utils/image';
import { Search, Trash2, CreditCard, X, ShoppingCart, Banknote, Smartphone, CheckCircle2, Loader2, User } from 'lucide-react';
import { Product } from '@/lib/types';
import { useQrScanner } from '@/hooks/useQrScanner';
import { processOfflineSale, PosActionItem } from '@/lib/actions/pos.actions';
import { lookupOrCreateCustomer, getCustomerByPhone, PosCustomer } from '@/lib/actions/crm.actions';
import PosReceipt, { PosReceiptData } from '@/components/admin/PosReceipt';
import TestBillPrint from '@/components/admin/TestBillPrint';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

interface PosCartItem {
    product: Product;
    quantity: number;
}

type PaymentMethod = 'CASH' | 'UPI' | 'CARD';

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
    }, []);

    const removeFromCart = useCallback((productId: string) => {
        setCartItems(prev => prev.filter(item => item.product.id !== productId));
    }, []);

    const clearCart = useCallback(() => setCartItems([]), []);

    const resetForNewSale = useCallback(() => {
        setCartItems([]);
        setCustomerPhone('');
        setCustomerName('');
        setCustomer(null);
        setSelectedPayment('CASH');
        setReceiptData(null);
        setSearchQuery('');
        setSearchResults([]);
    }, []);

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

    useQrScanner({ onScan: handleQrScan, enabled: !showPaymentModal });

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
    const grandTotal = useMemo(
        () => cartItems.reduce((s, i) => s + i.product.price * i.quantity, 0),
        [cartItems]
    );
    const taxableValue = useMemo(
        () => Math.round((grandTotal / 1.05) * 100) / 100,
        [grandTotal]
    );
    const totalGst = useMemo(() => grandTotal - taxableValue, [grandTotal, taxableValue]);
    const cgst = useMemo(() => Math.round((totalGst / 2) * 100) / 100, [totalGst]);
    const sgst = useMemo(() => Math.round((totalGst / 2) * 100) / 100, [totalGst]);
    const itemCount = useMemo(() => cartItems.reduce((s, i) => s + i.quantity, 0), [cartItems]);

    // ── Payment Flow ─────────────────────────────────────────────────────────
    const handleConfirmPayment = async () => {
        setIsProcessing(true);
        try {
            const actionItems: PosActionItem[] = cartItems.map(i => ({
                productId: i.product.id,
                name: i.product.name,
                sku: i.product.sku,
                quantity: i.quantity,
                unitPrice: i.product.price,
            }));

            const result = await processOfflineSale(actionItems, selectedPayment, customer?.id);

            if (!result.success || !result.orderNumber) {
                toast.error(result.error || 'Sale failed. Please try again.');
                return;
            }

            const receipt: PosReceiptData = {
                orderNumber: result.orderNumber,
                orderId: result.orderId!,
                invoiceNumber: result.invoiceNumber,
                items: actionItems,
                grandTotal,
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
                                            <span className="text-sm font-bold text-[#550c72] flex-shrink-0">{fmt(product.price)}</span>
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
                                            <p className="text-sm font-bold text-[#550c72] mt-1">{fmt(product.price)}</p>
                                        </div>
                                        <div className="flex items-center gap-3 flex-shrink-0">
                                            <span className="bg-[#550c72] text-white text-sm font-bold rounded-full w-8 h-8 flex items-center justify-center">
                                                {quantity}
                                            </span>
                                            <span className="text-sm font-semibold text-gray-700 w-20 text-right">
                                                {fmt(product.price * quantity)}
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
                            <h2 className="text-lg font-bold text-gray-900 mb-5">Order Summary</h2>

                            <div className="space-y-3 border-b border-gray-100 pb-4 mb-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">
                                        Total MRP
                                        <span className="ml-2 text-xs text-gray-400">({itemCount} item{itemCount !== 1 ? 's' : ''})</span>
                                    </span>
                                    <span className="font-semibold text-gray-900">{fmt(grandTotal)}</span>
                                </div>
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
                                <span className="text-2xl font-bold text-[#550c72]">{fmt(grandTotal)}</span>
                            </div>

                            {cartItems.length > 0 && (
                                <div className="pt-4 border-t border-gray-100 space-y-1.5">
                                    {cartItems.map(({ product, quantity }) => (
                                        <div key={product.id} className="flex justify-between text-xs text-gray-500">
                                            <span className="truncate flex-1 mr-2">{product.name} ×{quantity}</span>
                                            <span className="flex-shrink-0">{fmt(product.price * quantity)}</span>
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
                        <div className="bg-gray-50 rounded-xl p-4 mb-5 flex justify-between items-center">
                            <span className="text-gray-600 font-medium">Amount to Collect</span>
                            <span className="text-2xl font-bold text-[#550c72]">{fmt(grandTotal)}</span>
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
                                <><CheckCircle2 className="w-5 h-5" />Confirm {selectedPayment} — {fmt(grandTotal)}</>
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
                message={`Finalise ${selectedPayment} payment of ${fmt(grandTotal)} for ${customerName || 'this customer'}?`}
                confirmText="Yes, Complete Sale"
                cancelText="Go Back"
                variant="warning"
            />
        </>
    );
}
