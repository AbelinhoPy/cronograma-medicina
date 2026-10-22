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
        background: "#f3f5fa",
        foreground: "#202b43",
        "muted-foreground": "#64718a",
        border: "#dfe5ef",
        hero: "#18263e",
        subject: {
          anatomia: "#2776db",
          histologia: "#8651cf",
          biologia: "#169477",
          biofisica: "#d18a13",
          bioestadistica: "#64718a",
        },
        exam: {
          badge: "#fff0d6",
          text: "#825207",
          border: "#e4a134",
        },
      },
    },
  },
  plugins: [],
};
export default config;
