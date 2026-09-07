import type { Config } from "tailwindcss";

// Same design tokens as the storefront, via the shared preset.
const config: Config = {
    presets: [require("@pratyagra/config/tailwind-preset")],
    content: [
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
        // Real relative path, NOT ./node_modules/@pratyagra/ui/** — pnpm links
        // workspace packages as symlinks and Tailwind 3's fast-glob does not
        // follow them. Getting this wrong renders the shared components
        // completely unstyled, with no error anywhere.
        "../../packages/ui/src/**/*.{js,ts,jsx,tsx}",
    ],
};

export default config;
