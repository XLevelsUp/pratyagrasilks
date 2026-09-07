/**
 * Shared Tailwind preset — the Pratyagra Silks design tokens.
 *
 * Consumed by both apps via `presets: [require('@pratyagra/config/tailwind-preset')]`.
 * Each app still supplies its own `content` globs, since those are path-relative.
 *
 * Deliberately CommonJS .js rather than .ts: Tailwind's config loader handles
 * require() here without the ESM/CJS ambiguity of a `require()` call inside a
 * .ts config file.
 *
 * NOTE: `background` and `foreground` resolve to CSS custom properties that are
 * defined in each app's globals.css `:root`. An app whose globals.css omits
 * them gets `bg-background` computing to transparent, with no build error — so
 * globals.css must be copied, not trimmed, when adding an app.
 * Likewise `fontFamily` maps to --font-playfair / --font-inter, which are set
 * by next/font in each app's root layout; omit the `variable:` declarations
 * there and everything silently renders in system-ui.
 */

/** @type {Omit<import('tailwindcss').Config, 'content'>} */
module.exports = {
    theme: {
        extend: {
            colors: {
                primary: '#550c72',
                'primary-light': '#8430AB',
                'primary-dark': '#720C5C',
                'primary-50': '#F5EEF8',
                'primary-100': '#E8D5F0',
                'primary-200': '#D0AADF',
                'primary-300': '#B07DC9',
                'primary-900': '#2A0639',
                accent: '#D97706',
                'accent-hover': '#B45309',
                'accent-light': '#FFFBEB',
                'accent-300': '#FCD34D',
                'accent-700': '#92400E',
                secondary: '#FDE3C9',
                background: 'var(--background)',
                foreground: 'var(--foreground)',
                textPrimary: '#221D10',
                textSecondary: '#101522',
                slate: '#E1EDE7',
            },
            fontFamily: {
                playfair: ['var(--font-playfair)', 'serif'],
                sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
            },
            keyframes: {
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
    plugins: [require('@tailwindcss/typography')],
};
