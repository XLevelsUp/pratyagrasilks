import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/ui/Header";
import ConditionalFooter from "@/components/ui/ConditionalFooter";
import { CartProvider } from "@/lib/context/CartContext";
import { AuthProvider } from "@/lib/context/AuthContext";
import { WishlistProvider } from "@/lib/context/WishlistContext";
import CartSidebar from "@/components/Cart/CartSidebar";
import { Analytics } from "@vercel/analytics/react";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import { Toaster } from "react-hot-toast";
import OrganizationSchema from "@/components/seo/OrganizationSchema";
import { siteMetadata } from "@/lib/seo/config";
import WhatsAppFAB from "@/components/ui/WhatsAppFAB";

// Font configurations
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
    title: siteMetadata.title,
    description: siteMetadata.description,
    keywords: [
        "silk sarees",
        "handloom sarees",
        "luxury sarees",
        "Indian sarees",
        "traditional sarees",
        "PratyagraSilks",
        "buy silk sarees online",
        "authentic silk sarees",
        "kanjivaram silk sarees",
        "banarasi silk sarees",
        "tussar silk",
        "mysore silk",
        "handwoven sarees India",
        "premium silk sarees",
        "wedding sarees",
        "designer silk sarees",
    ],
    authors: [{ name: "PratyagraSilks" }],
    icons: {
        icon: [
            { url: "/logo.svg", type: "image/svg+xml" },
            { url: "/logo.png", type: "image/png", sizes: "512x512" },
            { url: "/favicon.svg", type: "image/svg+xml" },
        ],
        apple: [
            { url: "/logo.png", sizes: "512x512", type: "image/png" },
        ],
        shortcut: "/favicon.svg",
    },
    openGraph: {
        title: siteMetadata.title,
        description: siteMetadata.description,
        url: siteMetadata.baseUrl,
        siteName: siteMetadata.siteName,
        locale: "en_IN",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: siteMetadata.title,
        description: siteMetadata.description,
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1,
        },
    },
    verification: {
        google: "your-google-verification-code",
    },
    alternates: {
        canonical: siteMetadata.baseUrl,
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className={`${playfair.variable} ${inter.variable}`}>
            <body className="antialiased hide-scrollbar">
                <OrganizationSchema />

                <AuthProvider>
                    <WishlistProvider>
                        <CartProvider>
                            <Header />
                            <main className="min-h-screen">{children}</main>
                            <ConditionalFooter />
                            <CartSidebar />
                        </CartProvider>
                    </WishlistProvider>
                </AuthProvider>
                <GoogleAnalytics />
                <Analytics />
                <Toaster position="top-right" />
                <WhatsAppFAB />
            </body>
        </html>
    );
}

