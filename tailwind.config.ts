import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        kawaii: {
          cream: "#FFF7EF",
          "cream-light": "#FFFDF9",
          pink: "#FF6B95",
          "pink-light": "#FFD6E7",
          "pink-deep": "#E0537A",
          blush: "#F7B8D0",
          lavender: "#E8DDFB",
          "lavender-light": "#F4EFFF",
          "lavender-dark": "#9C6ADE",
          peach: "#FFDCCB",
          "peach-dark": "#F98D65",
          sky: "#D9ECFF",
          "sky-dark": "#4A90E2",
          mint: "#D2F4E2",
          "mint-dark": "#2E9E67",
          card: "#FFFFFF",
          text: "#514454",
          muted: "#8E7E91",
          border: "#FCE7F3",
        },
      },
      borderRadius: {
        "3xl": "1.5rem",
        "4xl": "2rem",
        "5xl": "2.5rem",
      },
      boxShadow: {
        kawaii: "0 8px 30px -4px rgba(255, 107, 149, 0.15), 0 4px 12px rgba(232, 221, 251, 0.25)",
        "kawaii-sm": "0 4px 16px -2px rgba(255, 107, 149, 0.12)",
        "kawaii-hover": "0 12px 36px -4px rgba(255, 107, 149, 0.25), 0 6px 16px rgba(232, 221, 251, 0.35)",
        "kawaii-lavender": "0 8px 28px -4px rgba(156, 106, 222, 0.18)",
      },
      animation: {
        "float-slow": "float 5s ease-in-out infinite",
        "float-reverse": "floatReverse 6s ease-in-out infinite",
        "pulse-subtle": "pulseSubtle 3s ease-in-out infinite",
        "bounce-gentle": "bounceGentle 2s ease-in-out infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
        floatReverse: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(8px)" },
        },
        pulseSubtle: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.8" },
        },
        bounceGentle: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-4px)" },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
