import type { Metadata } from "next";
import { Suspense } from "react";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import ConditionalHeader from "@/components/ui/ConditionalHeader";
import ConditionalFooter from "@/components/ui/ConditionalFooter";
import ConditionalReels from "@/components/ui/ConditionalReels";
import InstagramReels from "@/components/home/InstagramReels";
import { CartProvider } from "@/lib/context/CartContext";
import { AuthProvider } from "@/lib/context/AuthContext";
import { WishlistProvider } from "@/lib/context/WishlistContext";
import CartSidebar from "@/components/Cart/CartSidebar";
import { Analytics } from "@vercel/analytics/react";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import GoogleTagManager from "@/components/GoogleTagManager";
import MetaPixel from "@/components/MetaPixel";
import { Toaster } from "react-hot-toast";
import OrganizationSchema from "@/components/seo/OrganizationSchema";
import { siteMetadata } from "@/lib/seo/config";
import FloatingButtons from "@/components/ui/FloatingButtons";

// Font configurations — display:optional keeps text painting instantly in
// the metric-matched fallback; the webfont applies when cached (repeat
// visits) or when it arrives within the grace period. Clean LCP/CLS.
const playfair = Playfair_Display({
    subsets: ["latin"],
    variable: "--font-playfair",
    display: "optional",
});

const inter = Inter({
    subsets: ["latin"],
    variable: "--font-inter",
    display: "optional",
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
        "Pratyagra Silks",
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
        other: {
            "p:domain_verify": "d71a5f24c0280eaaae286631f0425917",
        },
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
            <head>
                <GoogleTagManager />
            </head>
            <body className="antialiased"> {/* fixed: vertical scroll restored — removed hide-scrollbar from body */}
                <noscript>
                    <iframe
                        src="https://www.googletagmanager.com/ns.html?id=GTM-KZVJ66DS"
                        height="0"
                        width="0"
                        style={{ display: 'none', visibility: 'hidden' }}
                    />
                </noscript>
                <OrganizationSchema />

                <AuthProvider>
                    <WishlistProvider>
                        <CartProvider>
                            <ConditionalHeader />
                            <main className="min-h-screen">{children}</main>
                            {/* Instagram reels — every page above the footer, except
                                admin and the homepage (which has its own placement
                                below the Silk Showcase). Suspense streams it in so
                                no page waits on the Instagram API. */}
                            <ConditionalReels>
                                <Suspense fallback={null}>
                                    <InstagramReels />
                                </Suspense>
                            </ConditionalReels>
                            <ConditionalFooter />
                            <CartSidebar />
                        </CartProvider>
                    </WishlistProvider>
                    <FloatingButtons />
                </AuthProvider>
                <GoogleAnalytics />
                <MetaPixel />
                <Analytics />
                <Toaster position="top-right" />
            </body>
        </html>
    );
}

