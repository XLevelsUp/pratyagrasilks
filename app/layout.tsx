import type { Metadata } from "next";
import { Playfair_Display, Inter, Jost } from "next/font/google";
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
import { BRAND_URL } from "@/lib/constants/brand";
import { generateOrganizationSchema, generateWebSiteSchema } from "@/lib/seo-config";
import WhatsAppButton from "@/components/ui/WhatsAppButton";

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

const jost = Jost({
    subsets: ["latin"],
    variable: "--font-jost",
    display: "swap",
});

export const metadata: Metadata = {
    title: "Kandangi Sarees — Handpicked Sarees, Rooted in Tradition",
    description: "Discover authentic handloom sarees — Kanjivaram, Gadwal, Chettinad, and more — curated directly from weavers across India. Shop silks and cottons at Kandangi Sarees.",
    keywords: [
        "handloom sarees",
        "handpicked sarees",
        "Kandangi Sarees",
        "Kanjivaram sarees",
        "Gadwal sarees",
        "Chettinad cotton sarees",
        "buy sarees online",
        "authentic sarees from weavers",
        "silk sarees India",
        "cotton sarees online",
        "Venkatagiri sarees",
        "Mangalgiri sarees",
        "Rajkot Patola silk",
        "traditional sarees",
        "weaver-direct sarees",
    ],
    authors: [{ name: "Kandangi Sarees" }],
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
        title: "Kandangi Sarees — Handpicked for You, Rooted in Tradition.",
        description: "Your trusted guide to authentic handloom sarees. Curated from the loom, delivered to your wardrobe.",
        url: BRAND_URL,
        siteName: "Kandangi Sarees",
        locale: "en_IN",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Kandangi Sarees — Handpicked Sarees, Rooted in Tradition",
        description: "Authentic handloom sarees — curated from weavers across India.",
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
    alternates: {
        canonical: BRAND_URL,
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className={`${playfair.variable} ${inter.variable} ${jost.variable}`}>
            <body className="antialiased hide-scrollbar">
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(generateOrganizationSchema()) }}
                />
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(generateWebSiteSchema()) }}
                />

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
                <WhatsAppButton />
            </body>
        </html>
    );
}
