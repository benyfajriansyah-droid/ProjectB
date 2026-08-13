import type { Config } from "tailwindcss";

/**
 * Chrome colours live here as theme tokens; identity and chart colours live as
 * hex in lib/constants.ts and are applied inline. Keeping the two apart means no
 * colour class is ever built from a string Tailwind can't see.
 */
const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        plane: "#f7f7f5",
        surface: "#ffffff",
        raised: "#fbfbfa",
        ink: {
          DEFAULT: "#12120f",
          secondary: "#5c5b55",
          muted: "#8a8880",
          faint: "#b4b2a9",
        },
        hairline: "rgba(11,11,11,0.09)",
        rule: "rgba(11,11,11,0.055)",
        good: "#0ca30c",
        warn: "#fab219",
        critical: "#d03b3b",
      },
      fontFamily: {
        sans: ['system-ui', '-apple-system', '"Segoe UI"', 'sans-serif'],
      },
      letterSpacing: {
        tightish: "-0.011em",
      },
      boxShadow: {
        card: "0 1px 2px rgba(11,11,11,0.04)",
        pop: "0 8px 24px -8px rgba(11,11,11,0.16)",
      },
    },
  },
  plugins: [],
};

export default config;
