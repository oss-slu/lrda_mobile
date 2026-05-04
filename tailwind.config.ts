import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  presets: [require("nativewind/preset")],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        inter: ["Inter"],
      },
      colors: {
        accent: "var(--color-accent)",
        light: {
          primary: "#F5F9FE",
          secondary: "#DCDFE4",
          tertiary: "#B3B9C4",
          surface: "#F7F8F9",
          text: "#161A1D",
        },
        dark: {
          primary: "#161A1D",
          secondary: "#22272B",
          tertiary: "#282E33",
          surface: "#161A1D",
          text: "#F7F8F9",
        },
        brand: {
          blue: "#0B1D47",
          gray: "#D9DDE3",
        },
      },
      borderRadius: {
        sm: "8px",
        md: "12px",
        lg: "20px",
        xl: "25px",
        full: "9999px",
      },
      spacing: {
        xs: "4px",
        sm: "8px",
        md: "16px",
        lg: "24px",
        xl: "32px",
      },
    },
  },
  plugins: [],
} satisfies Config;
