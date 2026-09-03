import type { Config } from "tailwindcss";

// Design tokens live in the shared preset so both apps stay on one palette.
// `content` stays here because the globs are path-relative to this app.
const config: Config = {
    presets: [require("@pratyagra/config/tailwind-preset")],
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
};

export default config;
