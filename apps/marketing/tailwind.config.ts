import type { Config } from "tailwindcss";

// Design tokens live in the shared preset so both apps stay on one palette.
// `content` stays here because the globs are path-relative to this app.
const config: Config = {
    presets: [require("@pratyagra/config/tailwind-preset")],
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
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
