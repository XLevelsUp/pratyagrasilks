'use client';

import { useState } from 'react';
import { useAdmin } from '@/lib/hooks/useAdmin';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Package,
    ShoppingBag,
    Users,
    Settings,
    LogOut,
    // ShoppingCart, // POS — disabled
    // ReceiptText,  // POS Settlement — disabled
    Building2,
    Menu,
    X,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import type { UserRole } from '@/lib/constants/roles';

type NavItem = {
    name: string;
    href: string;
    icon: React.ElementType;
};

const ADMIN_NAV: NavItem[] = [
    { name: 'Dashboard',  href: '/admin',              icon: LayoutDashboard },
    { name: 'Orders',     href: '/admin/orders',        icon: ShoppingBag    },
    // { name: 'POS',     href: '/admin/pos',           icon: ShoppingCart   }, // disabled
    { name: 'Products',   href: '/admin/products',      icon: Package        },
    { name: 'Vendors',    href: '/admin/vendors',        icon: Building2      },
    { name: 'Customers',  href: '/admin/customers',     icon: Users          },
];

const CASHIER_NAV: NavItem[] = [
    // { name: 'POS',        href: '/admin/pos',            icon: ShoppingCart }, // disabled
    // { name: 'Settlement', href: '/admin/pos/settlement', icon: ReceiptText  }, // disabled
    { name: 'Products',   href: '/admin/products',      icon: Package      },
    { name: 'Vendors',    href: '/admin/vendors',        icon: Building2    },
];

function navForRole(role: UserRole | null): NavItem[] {
    if (role === 'ADMIN')   return ADMIN_NAV;
    if (role === 'CASHIER') return CASHIER_NAV;
    return [];
}

interface NavLinksProps {
    navigation: NavItem[];
    pathname: string;
    onLinkClick?: () => void;
}

function NavLinks({ navigation, pathname, onLinkClick }: NavLinksProps) {
    return (
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {navigation.map((item) => {
                const Icon = item.icon;
                const isActive =
                    item.href === '/admin'
                        ? pathname === '/admin'
                        : pathname.startsWith(item.href);

                return (
                    <Link
                        key={item.name}
                        href={item.href}
                        onClick={onLinkClick}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors min-h-[44px] ${
                            isActive
                                ? 'bg-amber-600 text-white'
                                : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                        }`}
                    >
                        <Icon className="w-5 h-5 flex-shrink-0" />
                        {item.name}
                    </Link>
                );
            })}
        </nav>
    );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { role, loading } = useAdmin();
    const { signOut } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [drawerOpen, setDrawerOpen] = useState(false);

    const handleSignOut = async () => {
        await signOut();
        router.push('/');
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600" />
            </div>
        );
    }

    // role is null only when hook couldn't resolve — hook already redirected
    if (!role) return null;

    const navigation = navForRole(role);
    const panelLabel = role === 'ADMIN' ? 'Admin Panel' : 'Cashier Panel';

    const sidebarFooter = (
        <div className="p-4 border-t border-gray-800 flex-shrink-0">
            {role === 'ADMIN' && (
                <Link
                    href="/"
                    onClick={() => setDrawerOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors mb-2 min-h-[44px]"
                >
                    <Settings className="w-5 h-5 flex-shrink-0" />
                    Back to Store
                </Link>
            )}
            <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-gray-800 hover:text-red-300 rounded-lg transition-colors min-h-[44px]"
            >
                <LogOut className="w-5 h-5 flex-shrink-0" />
                Sign Out
            </button>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-100">

            {/* ── Desktop Sidebar (lg+) ───────────────────────────────────── */}
            <div className="hidden lg:flex fixed inset-y-0 left-0 w-64 bg-gray-900 flex-col">
                <div className="flex items-center justify-center h-16 bg-gray-800 gap-2 flex-shrink-0">
                    <h1 className="text-xl font-bold text-white">{panelLabel}</h1>
                    {role === 'CASHIER' && (
                        <span className="text-xs bg-amber-500 text-white font-semibold px-1.5 py-0.5 rounded">
                            POS
                        </span>
                    )}
                </div>
                <NavLinks navigation={navigation} pathname={pathname} />
                {sidebarFooter}
            </div>

            {/* ── Mobile Top Bar (<lg) ────────────────────────────────────── */}
            <div className="flex lg:hidden fixed top-0 inset-x-0 z-40 h-14 bg-gray-900 items-center px-4 gap-3">
                <button
                    onClick={() => setDrawerOpen(true)}
                    className="flex items-center justify-center min-h-[44px] min-w-[44px] rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
                    aria-label="Open navigation menu"
                >
                    <Menu className="w-6 h-6" />
                </button>
                <span className="flex-1 text-lg font-bold text-white">{panelLabel}</span>
                {role === 'CASHIER' && (
                    <span className="text-xs bg-amber-500 text-white font-semibold px-1.5 py-0.5 rounded">
                        POS
                    </span>
                )}
            </div>

            {/* ── Mobile Drawer (<lg) ─────────────────────────────────────── */}
            {/* Backdrop */}
            <div
                className={`lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
                    drawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                }`}
                onClick={() => setDrawerOpen(false)}
                aria-hidden="true"
            />
            {/* Drawer panel */}
            <div
                className={`lg:hidden fixed inset-y-0 left-0 z-50 w-72 bg-gray-900 flex flex-col transform transition-transform duration-300 ease-in-out ${
                    drawerOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                <div className="flex items-center justify-between h-14 bg-gray-800 px-4 flex-shrink-0">
                    <span className="text-lg font-bold text-white">{panelLabel}</span>
                    {role === 'CASHIER' && (
                        <span className="text-xs bg-amber-500 text-white font-semibold px-1.5 py-0.5 rounded mr-auto ml-2">
                            POS
                        </span>
                    )}
                    <button
                        onClick={() => setDrawerOpen(false)}
                        className="flex items-center justify-center min-h-[44px] min-w-[44px] rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                        aria-label="Close navigation menu"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <NavLinks
                    navigation={navigation}
                    pathname={pathname}
                    onLinkClick={() => setDrawerOpen(false)}
                />
                {sidebarFooter}
            </div>

            {/* ── Main Content ─────────────────────────────────────────────── */}
            <div className="lg:ml-64 pt-14 lg:pt-0">
                <main className="p-4 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
