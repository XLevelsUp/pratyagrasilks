"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useAuth } from "@/lib/context/AuthContext";
import { useRouter } from "next/navigation";
import CartBadge from "@/components/Cart/CartBadge";
import WishlistBadge from "@/components/Wishlist/WishlistBadge";
import { User, LogOut, Package, Heart, ChevronDown } from "lucide-react";
import { silkCategories } from "@/lib/seo-config";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import useScrolled from "@/hooks/useScrolled";

interface HeaderProps {
    /** 'overlay' = transparent over the home hero, solidifies on scroll */
    variant?: 'solid' | 'overlay';
}

export default function Header({ variant = 'solid' }: HeaderProps) {
    const { user, signOut } = useAuth();
    const router = useRouter();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [isSilkTypesMenuOpen, setIsSilkTypesMenuOpen] = useState(false);
    const [isSignOutDialogOpen, setIsSignOutDialogOpen] = useState(false);
    const scrolled = useScrolled(24);
    const overlayActive = variant === 'overlay' && !scrolled && !isMobileMenuOpen;
    const navLinkClass = overlayActive
        ? 'text-white/90 hover:text-secondary'
        : 'hover:text-primary';
    const badgeTone = overlayActive ? 'light' : 'dark';

    const openSignOutDialog = () => {
        setIsUserMenuOpen(false);
        setIsMobileMenuOpen(false);
        setIsSignOutDialogOpen(true);
    };

    const handleSignOut = async () => {
        await signOut();
        router.push('/');
    };

    return (
        <header
            className={`${variant === 'overlay' ? 'fixed top-0 inset-x-0' : 'sticky top-0'} z-50 transition-colors duration-300 ${overlayActive
                ? 'bg-gradient-to-b from-black/30 to-transparent text-white'
                : 'bg-white shadow-md'
                }`}
        >
            <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16 md:h-20">
                    {/* Logo/Brand */}
                    <Link href="/" className="flex items-center">
                        {/* <span className="font-playfair text-2xl md:text-3xl font-bold text-primary">
                            Pratyagra Silks
                        </span> */}

                        <Image
                            src={overlayActive ? "/Pratyagra_Silks_Logo_White.svg" : "/Pratyagra_Silks_Logo.svg"}
                            alt="Pratyagra Silks Logo"
                            width={200}
                            height={36}
                            className="object-contain"
                        />

                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden lg:flex items-center space-x-8">
                        <Link
                            href="/collection"
                            className={`${navLinkClass} transition-colors font-medium`}
                        >
                            Collection
                        </Link>

                        {/* Silk Types Dropdown */}
                        <div className="relative hidden lg:block">
                            <button
                                onClick={() => setIsSilkTypesMenuOpen(!isSilkTypesMenuOpen)}
                                onMouseEnter={() => setIsSilkTypesMenuOpen(true)}
                                className={`flex items-center gap-1 ${navLinkClass} transition-colors font-medium`}
                            >
                                Shop by Silk Type
                                <ChevronDown className="w-4 h-4" />
                            </button>

                            {isSilkTypesMenuOpen && (
                                <div
                                    className="absolute left-0 mt-2 w-64 bg-white rounded-lg shadow-xl py-2 border border-gray-200 z-50"
                                    onMouseLeave={() => setIsSilkTypesMenuOpen(false)}
                                >
                                    <div className="grid grid-cols-1 max-h-96 overflow-y-auto">
                                        {silkCategories.map((category) => (
                                            <Link
                                                key={category.slug}
                                                href={`/silk/${category.slug}`}
                                                className="px-4 py-2 hover:bg-accent-light transition-colors text-sm"
                                                onClick={() => setIsSilkTypesMenuOpen(false)}
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
                            className={`${navLinkClass} transition-colors font-medium`}
                        >
                            About
                        </Link>
                        <Link
                            href="/contact"
                            className={`${navLinkClass} transition-colors font-medium`}
                        >
                            Contact
                        </Link>

                        {/* Wishlist & Cart Icons */}
                        <WishlistBadge tone={badgeTone} />
                        <CartBadge tone={badgeTone} />

                        {/* Auth Buttons / User Menu */}
                        {user ? (
                            <div className="relative">
                                <button
                                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${overlayActive ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
                                >
                                    <User className="w-5 h-5" />
                                    <span className="font-medium hidden xl:block">{user.user_metadata?.full_name || 'Account'}</span>
                                </button>

                                {/* Dropdown Menu */}
                                {isUserMenuOpen && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white text-textPrimary rounded-lg shadow-lg py-2 border border-gray-200">
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
                                            onClick={openSignOutDialog}
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
                                    className={`${overlayActive ? 'text-white/90 hover:text-secondary' : 'text-gray-700 hover:text-primary'} transition-colors font-medium`}
                                >
                                    Login
                                </Link>
                                <Link
                                    href="/auth/signup"
                                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${overlayActive ? 'bg-secondary text-primary hover:bg-secondary/90' : 'bg-primary text-white hover:bg-primary-light'}`}
                                >
                                    Sign Up
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu Button & Cart */}
                    <div className="flex lg:hidden items-center space-x-4">
                        {/* Mobile Wishlist & Cart Icons */}
                        <WishlistBadge tone={badgeTone} />
                        <CartBadge tone={badgeTone} />

                        {/* Hamburger Menu Button */}
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className={`focus:outline-none focus:ring-2 rounded-md p-2 ${overlayActive ? 'hover:text-secondary focus:ring-white' : 'hover:text-primary focus:ring-primary'}`}
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

                {/* Mobile Menu Drawer */}
                {isMobileMenuOpen && (
                    <div className="lg:hidden py-4 border-t border-gray-200">
                        <div className="flex flex-col space-y-4">
                            <Link
                                href="/collection"
                                className="hover:text-primary transition-colors font-medium px-2 py-2"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                Collection
                            </Link>

                            {/* Mobile Silk Types */}
                            <div className="px-2 py-2">
                                <div className="font-medium mb-2">Shop by Silk Type</div>
                                <div className="pl-4 space-y-2 grid grid-cols-2">
                                    {silkCategories.slice(0, 6).map((category) => (
                                        <Link
                                            key={category.slug}
                                            href={`/silk/${category.slug}`}
                                            className="block text-sm text-textSecondary hover:text-primary transition-colors py-1 !m-0"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                        >
                                            {category.name}
                                        </Link>
                                    ))}
                                    <Link
                                        href="/collection"
                                        className="block text-sm text-accent-700 hover:text-accent-hover transition-colors py-1 font-medium"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        View All →
                                    </Link>
                                </div>
                            </div>

                            <Link
                                href="/about"
                                className="hover:text-primary transition-colors font-medium px-2 py-2"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                About
                            </Link>
                            <Link
                                href="/contact"
                                className="hover:text-primary transition-colors font-medium px-2 py-2"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                Contact
                            </Link>

                            {user ? (
                                <>
                                    <Link
                                        href="/profile"
                                        className="hover:text-primary transition-colors font-medium px-2 py-2"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        Profile
                                    </Link>
                                    <Link
                                        href="/orders"
                                        className="hover:text-primary transition-colors font-medium px-2 py-2"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        Orders
                                    </Link>
                                    <Link
                                        href="/wishlist"
                                        className="hover:text-primary transition-colors font-medium px-2 py-2"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        Wishlist
                                    </Link>
                                    <button
                                        onClick={openSignOutDialog}
                                        className="text-left text-red-600 hover:text-red-700 transition-colors font-medium px-2 py-2"
                                    >
                                        Sign Out
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link
                                        href="/auth/login"
                                        className="hover:text-primary transition-colors font-medium px-2 py-2"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        Login
                                    </Link>
                                    <Link
                                        href="/auth/signup"
                                        className="bg-primary text-white text-center py-2 rounded-lg font-medium hover:bg-primary-light transition-colors"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        Sign Up
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </nav>

            <ConfirmDialog
                isOpen={isSignOutDialogOpen}
                onClose={() => setIsSignOutDialogOpen(false)}
                onConfirm={handleSignOut}
                title="Sign Out?"
                message="Are you sure you want to sign out?"
                confirmText="Sign Out"
                cancelText="Cancel"
                variant="danger"
            />
        </header>
    );
}
