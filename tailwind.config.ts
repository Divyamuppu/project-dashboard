import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        paper: "#F4F6F5",
        ink: "#15191C",
        line: "#DDE2E0",
        muted: "#5B6560",
        sidebar: "#12211E",
        accent: { DEFAULT: "#1F5A52", soft: "#E4EEEC" },
        live: "#1F7A4D",
        draft: "#8A8F8C",
        danger: "#B3311F",
        cat: {
          social: "#2563A6",
          campaigns: "#1F5A52",
          corporate: "#7C4FC9",
          events: "#C98A22",
          bts: "#B5257E",
        },
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
