'use client';

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

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { role, loading } = useAdmin();
    const { signOut } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

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

    return (
        <div className="min-h-screen bg-gray-100">

            {/* ── Sidebar ─────────────────────────────────────────────────── */}
            <div className="fixed inset-y-0 left-0 w-64 bg-gray-900">
                <div className="flex flex-col h-full">

                    {/* Logo / panel label */}
                    <div className="flex items-center justify-center h-16 bg-gray-800 gap-2">
                        <h1 className="text-xl font-bold text-white">{panelLabel}</h1>
                        {role === 'CASHIER' && (
                            <span className="text-xs bg-amber-500 text-white font-semibold px-1.5 py-0.5 rounded">
                                POS
                            </span>
                        )}
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-4 py-6 space-y-2">
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
                                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                                        isActive
                                            ? 'bg-amber-600 text-white'
                                            : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                                    }`}
                                >
                                    <Icon className="w-5 h-5" />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Footer */}
                    <div className="p-4 border-t border-gray-800">
                        {role === 'ADMIN' && (
                            <Link
                                href="/"
                                className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors mb-2"
                            >
                                <Settings className="w-5 h-5" />
                                Back to Store
                            </Link>
                        )}
                        <button
                            onClick={handleSignOut}
                            className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-gray-800 hover:text-red-300 rounded-lg transition-colors"
                        >
                            <LogOut className="w-5 h-5" />
                            Sign Out
                        </button>
                    </div>
                </div>
            </div>

            {/* ── Main Content ─────────────────────────────────────────────── */}
            <div className="ml-64">
                <main className="p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
