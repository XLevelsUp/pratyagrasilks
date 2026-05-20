"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import CartBadge from "@/components/Cart/CartBadge";
import WishlistBadge from "@/components/Wishlist/WishlistBadge";
import { User, LogOut, Package, Heart, ChevronDown, X } from "lucide-react";
import { silkCategories } from "@/lib/seo-config";
import { BRAND_NAME, BRAND_TAGLINE } from "@/lib/constants/brand";

export default function Header() {
    const { user, signOut } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [isWeaveMenuOpen, setIsWeaveMenuOpen] = useState(false);

    // Lock body scroll when mobile drawer is open
    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.classList.add('drawer-open');
        } else {
            document.body.classList.remove('drawer-open');
        }
        return () => document.body.classList.remove('drawer-open');
    }, [isMobileMenuOpen]);

    const handleSignOut = async () => {
        await signOut();
        setIsUserMenuOpen(false);
        router.push('/');
    };

    const isActive = (href: string) =>
        pathname === href ? "text-primary font-semibold" : "hover:text-primary transition-colors font-medium";

    return (
        <header className="sticky top-0 z-50 bg-white shadow-md">
            <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16 md:h-20">
                    {/* Logo/Brand — text fallback until logo asset is provided */}
                    <Link href="/" className="flex items-center">
                        <span className="font-playfair text-xl sm:text-3xl font-bold text-primary tracking-tight">
                            {BRAND_NAME}
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden lg:flex items-center space-x-8">
                        <Link
                            href="/collection"
                            className={isActive("/collection")}
                        >
                            Collection
                        </Link>

                        {/* Shop by Weave Dropdown */}
                        <div className="relative hidden lg:block">
                            <button
                                onClick={() => setIsWeaveMenuOpen(!isWeaveMenuOpen)}
                                onMouseEnter={() => setIsWeaveMenuOpen(true)}
                                className="flex items-center gap-1 hover:text-primary transition-colors font-medium"
                            >
                                Shop by Weave
                                <ChevronDown className="w-4 h-4" />
                            </button>

                            {isWeaveMenuOpen && (
                                <div
                                    className="absolute left-0 mt-2 w-72 bg-white rounded-lg shadow-xl py-2 border border-gray-200 z-50"
                                    onMouseLeave={() => setIsWeaveMenuOpen(false)}
                                >
                                    <div className="grid grid-cols-1 max-h-96 overflow-y-auto">
                                        {silkCategories.map((category) => (
                                            <Link
                                                key={category.slug}
                                                href={`/collection/${category.slug}`}
                                                className="px-4 py-2 hover:bg-accent-light transition-colors text-sm"
                                                onClick={() => setIsWeaveMenuOpen(false)}
                                            >
                                                <div className="font-medium text-gray-900">{category.name}</div>
                                                <div className="text-xs text-gray-500 truncate">{category.origin}</div>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <Link
                            href="/about"
                            className={isActive("/about")}
                        >
                            About
                        </Link>
                        <Link
                            href="/contact"
                            className={isActive("/contact")}
                        >
                            Contact
                        </Link>

                        {/* Wishlist & Cart Icons */}
                        <WishlistBadge />
                        <CartBadge />

                        {/* Auth Buttons / User Menu */}
                        {user ? (
                            <div className="relative">
                                <button
                                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                    className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                    <User className="w-5 h-5" />
                                    <span className="font-medium">{user.user_metadata?.full_name || 'Account'}</span>
                                </button>

                                {/* Dropdown Menu */}
                                {isUserMenuOpen && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 border border-gray-200">
                                        <Link
                                            href="/profile"
                                            className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 transition-colors"
                                            onClick={() => setIsUserMenuOpen(false)}
                                        >
                                            <User className="w-4 h-4" />
                                            Profile
                                        </Link>
                                        <Link
                                            href="/orders"
                                            className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 transition-colors"
                                            onClick={() => setIsUserMenuOpen(false)}
                                        >
                                            <Package className="w-4 h-4" />
                                            Orders
                                        </Link>
                                        <Link
                                            href="/wishlist"
                                            className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 transition-colors"
                                            onClick={() => setIsUserMenuOpen(false)}
                                        >
                                            <Heart className="w-4 h-4" />
                                            Wishlist
                                        </Link>
                                        <button
                                            onClick={handleSignOut}
                                            className="w-full flex items-center gap-2 px-4 py-2 hover:bg-red-50 text-red-600 transition-colors"
                                        >
                                            <LogOut className="w-4 h-4" />
                                            Sign Out
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center gap-4">
                                <Link
                                    href="/auth/login"
                                    className="text-gray-700 hover:text-primary transition-colors font-medium"
                                >
                                    Login
                                </Link>
                                <Link
                                    href="/auth/signup"
                                    className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary-light transition-colors"
                                >
                                    Sign Up
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu Button & Cart */}
                    <div className="flex lg:hidden items-center space-x-4">
                        {/* Mobile Wishlist & Cart Icons */}
                        <WishlistBadge />
                        <CartBadge />

                        {/* Hamburger Menu Button */}
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary rounded-md p-2"
                            aria-label="Toggle mobile menu"
                        >
                            {isMobileMenuOpen ? (
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-6 w-6"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            ) : (
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-6 w-6"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M4 6h16M4 12h16M4 18h16"
                                    />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>

            </nav>

            {/* ── Mobile slide-in drawer ──────────────────────────────── */}
            {isMobileMenuOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="lg:hidden fixed inset-0 bg-black/40 z-40"
                        onClick={() => setIsMobileMenuOpen(false)}
                        aria-hidden="true"
                    />

                    {/* Drawer */}
                    <div
                        className="lg:hidden fixed top-0 left-0 h-full w-72 bg-white z-50 animate-slide-in-left overflow-y-auto flex flex-col shadow-2xl"
                    >
                        {/* Drawer header */}
                        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100" style={{ backgroundColor: '#5F1300' }}>
                            <span className="font-playfair text-xl font-bold text-white">
                                {BRAND_NAME}
                            </span>
                            <button
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="p-2 rounded-md text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                                aria-label="Close menu"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Nav links */}
                        <nav className="flex flex-col flex-1 px-4 py-4 space-y-1">
                            <Link href="/collection" className="px-3 py-3 rounded-lg font-medium text-[#1A0A00] hover:bg-primary/5 hover:text-primary transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                                Collection
                            </Link>

                            {/* Shop by Weave */}
                            <div className="pt-2">
                                <p className="px-3 py-1 text-xs font-bold uppercase tracking-widest" style={{ color: '#8C5A3C' }}>
                                    Shop by Weave
                                </p>
                                <div className="grid grid-cols-2 gap-x-2 mt-1">
                                    {silkCategories.map((category) => (
                                        <Link
                                            key={category.slug}
                                            href={`/collection/${category.slug}`}
                                            className="px-3 py-2.5 rounded-lg text-sm text-[#1A0A00] hover:bg-primary/5 hover:text-primary transition-colors"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                        >
                                            {category.name}
                                        </Link>
                                    ))}
                                    <Link
                                        href="/collection"
                                        className="col-span-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors"
                                        style={{ color: '#E8AB16' }}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        View All Weaves →
                                    </Link>
                                </div>
                            </div>

                            <div className="border-t border-gray-100 pt-2 mt-2 space-y-1">
                                <Link href="/about" className="block px-3 py-3 rounded-lg font-medium text-[#1A0A00] hover:bg-primary/5 hover:text-primary transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                                    About
                                </Link>
                                <Link href="/contact" className="block px-3 py-3 rounded-lg font-medium text-[#1A0A00] hover:bg-primary/5 hover:text-primary transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                                    Contact
                                </Link>
                            </div>

                            {/* Auth links */}
                            <div className="border-t border-gray-100 pt-2 mt-2 space-y-1">
                                {user ? (
                                    <>
                                        <Link href="/profile" className="flex items-center gap-2 px-3 py-3 rounded-lg font-medium text-[#1A0A00] hover:bg-primary/5 transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                                            <User className="w-4 h-4" /> Profile
                                        </Link>
                                        <Link href="/orders" className="flex items-center gap-2 px-3 py-3 rounded-lg font-medium text-[#1A0A00] hover:bg-primary/5 transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                                            <Package className="w-4 h-4" /> Orders
                                        </Link>
                                        <Link href="/wishlist" className="flex items-center gap-2 px-3 py-3 rounded-lg font-medium text-[#1A0A00] hover:bg-primary/5 transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                                            <Heart className="w-4 h-4" /> Wishlist
                                        </Link>
                                        <button onClick={handleSignOut} className="w-full flex items-center gap-2 px-3 py-3 rounded-lg font-medium text-red-600 hover:bg-red-50 transition-colors">
                                            <LogOut className="w-4 h-4" /> Sign Out
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <Link href="/auth/login" className="block px-3 py-3 rounded-lg font-medium text-[#1A0A00] hover:bg-primary/5 hover:text-primary transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                                            Login
                                        </Link>
                                        <Link href="/auth/signup" className="block px-3 py-3 rounded-lg text-center font-semibold text-white transition-colors" style={{ backgroundColor: '#5F1300' }} onClick={() => setIsMobileMenuOpen(false)}>
                                            Sign Up
                                        </Link>
                                    </>
                                )}
                            </div>
                        </nav>
                    </div>
                </>
            )}
        </header>
    );
}
