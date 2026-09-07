import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@pratyagra/auth/context";
import { Toaster } from "react-hot-toast";

// The `variable:` declarations are load-bearing: the shared Tailwind preset
// maps font-playfair -> var(--font-playfair) and font-sans -> var(--font-inter).
// Drop them and every admin screen silently renders in system-ui, with no
// warning anywhere.
//
// display:'swap' rather than the storefront's 'optional' — admin has no LCP
// budget to protect and the brand font should actually land.
const playfair = Playfair_Display({
    subsets: ["latin"],
    variable: "--font-playfair",
    display: "swap",
});

const inter = Inter({
    subsets: ["latin"],
    variable: "--font-inter",
    display: "swap",
});

export const metadata: Metadata = {
    title: "Pratyagra Silks — Admin",
    robots: { index: false, follow: false },
    icons: {
        icon: [
            { url: "/logo.svg", type: "image/svg+xml" },
            { url: "/favicon.svg", type: "image/svg+xml" },
        ],
        shortcut: "/favicon.svg",
    },
};

// Deliberately minimal compared to the storefront root layout: no Cart or
// Wishlist providers, no GA/GTM/Clarity/Meta Pixel/Vercel Analytics, no
// Header/Footer/InstagramReels/CartSidebar/OrganizationSchema. None of it
// belongs on a private back office, and leaving it out is most of the bundle
// win from splitting the apps.
export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className={`${playfair.variable} ${inter.variable}`}>
            <body className="antialiased">
                <AuthProvider>{children}</AuthProvider>
                <Toaster position="top-right" />
            </body>
        </html>
    );
}
