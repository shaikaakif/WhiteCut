import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          50: "#FAF7F2",
          100: "#F4EFE6",
          200: "#EDE7DC",
          300: "#E4DCce",
          400: "#D5C9B8",
          DEFAULT: "#F4EFE6",
        },
        terracotta: {
          DEFAULT: "#E06D53",
          light: "#E8856E",
          dark: "#B84A32",
        },
        charcoal: {
          DEFAULT: "#18181B",
          50: "#27272A",
          100: "#18181B",
          200: "#0F0F11",
        },
        archive: {
          gold: "#E6B800",
          amber: "#D97706",
          badge: "#FEF3C7",
          border: "#D97706",
        },
        blueprint: {
          slate: "#2C3E50",
          grid: "rgba(44, 62, 80, 0.12)",
        },
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Playfair Display", "Georgia", "serif"],
        mono: ["var(--font-mono)", "JetBrains Mono", "Courier New", "monospace"],
        sans: ["var(--font-sans)", "Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        tactile: "0 12px 28px -6px rgba(0, 0, 0, 0.2), 0 8px 12px -4px rgba(0, 0, 0, 0.1)",
        "card-floating": "0 20px 40px -15px rgba(0, 0, 0, 0.15)",
        sticker: "0 8px 16px rgba(0, 0, 0, 0.35)",
        "retro-inset": "inset 0 2px 4px rgba(0, 0, 0, 0.08)",
      },
      dropShadow: {
        sticker: ["0 8px 16px rgba(0,0,0,0.3)", "0 2px 4px rgba(0,0,0,0.15)"],
        "sticker-red": "0 8px 16px rgba(224, 109, 83, 0.35)",
      },
      minHeight: {
        touch: "48px",
      },
      minWidth: {
        touch: "48px",
      },
    },
  },
  plugins: [],
};

export default config;
