import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0B0F14",
        surface: "#131A22",
        surfaceHover: "#1A232D",
        border: "#232E3A",
        primary: "#3FA9F5",
        profit: "#22C55E",
        loss: "#EF4444",
        warning: "#F59E0B",
        textPrimary: "#E7EDF3",
        textSecondary: "#8A99A8",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
