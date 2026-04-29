import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        cairo: ["Cairo", "sans-serif"],
      },
      colors: {
        background: "#FFF8F5",
        foreground: "#2A1518",
        card: "#FFFFFF",
        primary: "#C9385E",
        "primary-fg": "#FFFFFF",
        secondary: "#FBE9EE",
        muted: "#F5E7EA",
        "muted-fg": "#8A6B73",
        accent: "#D4AF7A",
        border: "#F0DDE2",
        "rose-light": "#F8D7DF",
        "rose-dark": "#7A2B40",
        gold: "#D4AF7A",
        cream: "#FFF8F5",
      },
      borderRadius: {
        DEFAULT: "16px",
      },
    },
  },
  plugins: [],
} satisfies Config;
