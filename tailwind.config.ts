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
                // ── Original brand purple scale ───────────────────────────────
                primary: "#550c72",          // Brand purple — buttons, logo, footer bg
                "primary-light": "#8430AB",  // Hover state (was primary2)
                "primary-dark": "#720C5C",   // Active/pressed; price text (was primaryAnalogue)
                "primary-50": "#F5EEF8",     // Subtlest purple tint — hover backgrounds
                "primary-100": "#E8D5F0",    // Input focus rings, light fills
                "primary-200": "#D0AADF",    // Disabled borders
                "primary-300": "#B07DC9",    // Dividers, decorative stripes
                "primary-900": "#2A0639",    // Hero overlays, near-black sections

                // ── Amber accent ──────────────────────────────────────────────
                accent: "#D97706",           // Amber-600: CTAs, price highlights, "View All"
                "accent-hover": "#B45309",   // Amber-700: hover on accent elements
                "accent-light": "#FFFBEB",   // Amber-50: subtle hover bg
                "accent-300": "#FCD34D",     // Amber-300: badge borders, shimmer
                "accent-700": "#92400E",     // Amber-800: body-size text (meets 4.5:1)

                // ── Neutral / Silk backdrop ───────────────────────────────────
                secondary: "#FDE3C9",        // Peach — card hover, btn text on primary (original)
                background: "var(--background)",
                foreground: "var(--foreground)",
                textPrimary: "#221D10",      // Unchanged
                textSecondary: "#101522",    // Original cool dark

                // ── Utility neutrals ──────────────────────────────────────────
                slate: "#E1EDE7",            // Original cool grey-green
            },
            fontFamily: {
                // Must reference the next/font CSS variables (set on <html> in
                // app/layout.tsx) — literal family names never match the hashed
                // families next/font registers, silently falling back to system fonts.
                playfair: ['var(--font-playfair)', 'serif'],
                sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
            },
            keyframes: {
                // Transform-only line-mask reveal — never gates LCP paint on opacity
                'hero-rise': {
                    from: { transform: 'translateY(110%)' },
                    to: { transform: 'translateY(0)' },
                },
                'fade-up': {
                    from: { opacity: '0', transform: 'translateY(12px)' },
                    to: { opacity: '1', transform: 'translateY(0)' },
                },
                'hero-zoom': {
                    from: { transform: 'scale(1.06)' },
                    to: { transform: 'scale(1)' },
                },
                shimmer: {
                    from: { transform: 'translateX(-100%)' },
                    to: { transform: 'translateX(100%)' },
                },
                // Track contains the list twice; -50% loops seamlessly
                marquee: {
                    from: { transform: 'translateX(0)' },
                    to: { transform: 'translateX(-50%)' },
                },
                sheen: {
                    from: { transform: 'translateX(-150%) rotate(25deg)' },
                    to: { transform: 'translateX(250%) rotate(25deg)' },
                },
            },
            animation: {
                'hero-rise': 'hero-rise 0.9s cubic-bezier(0.22,1,0.36,1) both',
                'fade-up': 'fade-up 0.6s ease-out both',
                'hero-zoom': 'hero-zoom 1.6s ease-out both',
                shimmer: 'shimmer 1.8s ease-in-out infinite',
                marquee: 'marquee 30s linear infinite',
                sheen: 'sheen 8s linear infinite',
            },
        },
    },
    plugins: [],
};

export default config;
