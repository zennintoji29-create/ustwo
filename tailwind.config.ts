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
          pink: "#F472B6",
          "pink-deep": "#E0537A",
          blush: "#F7B8D0",
          lavender: "#E8DDFB",
          "lavender-light": "#F7F3FF",
          "lavender-dark": "#9C6ADE",
          peach: "#FFDCCB",
          "peach-dark": "#F98D65",
          sky: "#D9ECFF",
          "sky-dark": "#4A90E2",
          mint: "#D9F2E5",
          "mint-dark": "#2E9E67",
          card: "#FFFFFF",
          text: "#514454",
          "text-muted": "#887B8D",
          border: "#FCE7F3",
        },
      },
      fontFamily: {
        heading: ["var(--font-heading)", "Fredoka", "Comfortaa", "sans-serif"],
        body: ["var(--font-body)", "Nunito", "Quicksand", "sans-serif"],
      },
      borderRadius: {
        "3xl": "1.5rem",
        "4xl": "2rem",
        "5xl": "2.5rem",
      },
      boxShadow: {
        kawaii: "0 10px 30px -4px rgba(244, 114, 182, 0.18), 0 4px 12px rgba(232, 221, 251, 0.25)",
        "kawaii-sm": "0 4px 16px -2px rgba(244, 114, 182, 0.12)",
        "kawaii-hover": "0 14px 38px -4px rgba(244, 114, 182, 0.28), 0 6px 18px rgba(232, 221, 251, 0.35)",
        "kawaii-lavender": "0 10px 28px -4px rgba(156, 106, 222, 0.2)",
        clay: "0 12px 28px -4px rgba(244, 114, 182, 0.16), 0 4px 10px -2px rgba(81, 68, 84, 0.05), inset 0 2px 4px 0 rgba(255, 255, 255, 0.8)",
        "clay-btn": "0 6px 18px -2px rgba(244, 114, 182, 0.32), inset 0 1px 2px 0 rgba(255, 255, 255, 0.6)",
      },
      animation: {
        "float-slow": "float 5s ease-in-out infinite",
        "float-reverse": "floatReverse 6s ease-in-out infinite",
        "pulse-subtle": "pulseSubtle 3s ease-in-out infinite",
        "bounce-gentle": "bounceGentle 2s ease-in-out infinite",
        "shimmer": "shimmer 2.5s infinite",
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
          "50%": { opacity: "0.85" },
        },
        bounceGentle: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-4px)" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
