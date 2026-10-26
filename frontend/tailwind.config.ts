import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./modules/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        aviation: {
          yellow: "#F5C400",
          yellowBright: "#FFD21F",
          yellowDeep: "#D9A900",
          black: "#0B0B0B",
          charcoal: "#171717",
          softBlack: "#222222",
          white: "#FFFFFF",
          offWhite: "#F7F7F4",
          lightGray: "#F1F1EE",
          border: "#E5E5E0",
          muted: "#707070",
        },
      },
      fontFamily: {
        sans: ["var(--font-plus-jakarta)", "var(--font-inter)", "Inter", "Plus Jakarta Sans", "system-ui", "-apple-system", "sans-serif"],
        heading: ["var(--font-plus-jakarta)", "var(--font-inter)", "sans-serif"],
        display: ["var(--font-plus-jakarta)", "sans-serif"],
        inter: ["var(--font-inter)", "sans-serif"],
      },
      boxShadow: {
        subtle: "0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)",
        card: "0 4px 20px -2px rgba(11, 11, 11, 0.05)",
        cardHover: "0 10px 30px -4px rgba(11, 11, 11, 0.1)",
        elevated: "0 20px 40px -8px rgba(11, 11, 11, 0.12)",
        glowYellow: "0 0 25px -5px rgba(245, 196, 0, 0.35)",
      },
      maxWidth: {
        container: "1360px",
      },
      keyframes: {
        ticker: {
          "0%":   { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      animation: {
        ticker: "ticker 28s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
