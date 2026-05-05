import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  presets: [require("nativewind/preset")],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        inter: ["Inter"],
      },
      colors: {
        accent: "var(--color-accent)",
        primary: "var(--color-primary)",
        secondary: "var(--color-secondary)",
        tertiary: "var(--color-tertiary)",
        surface: "var(--color-surface)",
        foreground: "var(--color-foreground)",
        scroller: "var(--color-scroller)",
        logout: {
          DEFAULT: "var(--color-logout-bg)",
          text: "var(--color-logout-text)",
        },
        brand: {
          blue: "#0B1D47",
          gray: "#D9DDE3",
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
