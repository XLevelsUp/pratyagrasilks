import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                // ── Kandangi Sarees brand palette ────────────────────────────────────
                primary: "#5F1300",          // Deep Brown — nav, footer bg, headings
                "primary-light": "#7A2B1A",  // Hover state on primary
                "primary-dark": "#3D0D00",   // Active/pressed state
                "primary-50": "#FDF6E3",     // Warm off-white — hover backgrounds
                "primary-100": "#F5E8CC",    // Input focus rings, light fills
                "primary-200": "#EBCC99",    // Disabled borders
                "primary-300": "#D4B366",    // Dividers, decorative stripes
                "primary-900": "#1A0A00",    // Near-black warm — hero overlays

                // ── Gold accent (primary CTA) ────────────────────────────────────────────
                accent: "#E8AB16",           // Gold — CTAs, price highlights
                "accent-hover": "#D4961C",   // Darker gold hover
                "accent-light": "#FDF6E3",   // Warm off-white subtle bg
                "accent-300": "#F0BE44",     // Light gold — badges, shimmer
                "accent-700": "#B8860B",     // Meets 4.5:1 on white — body-size text

                // ── Brand accent colors ─────────────────────────────────────────────
                secondary: "#F0BE44",        // Light gold — secondary buttons
                green: "#104210",            // Forest Green — in stock, badges, success
                "red-light": "#D13120",      // Light Red — sale tags, alerts
                "red-dark": "#6B1910",       // Dark Red — borders, secondary headings
                background: "var(--background)",
                foreground: "var(--foreground)",
                textPrimary: "#1A0A00",      // Near-black warm — primary body text
                textSecondary: "#5F1300",    // Deep brown — secondary text

                // ── Muted tone ────────────────────────────────────────────────
                muted: "#8C5A3C",            // Muted terracotta — labels, subtitles
            },
            fontFamily: {
                playfair: ['"Playfair Display"', 'serif'],
                sans: ['Inter', 'system-ui', 'sans-serif'],
                jost: ['Jost', 'system-ui', 'sans-serif'],
            },
        },
    },
    plugins: [],
};

export default config;
