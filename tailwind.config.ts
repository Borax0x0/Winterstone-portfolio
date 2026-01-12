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
        forest: { DEFAULT: '#2C4A3E', light: '#3D6354', dark: '#1F3529' },
        stone: { DEFAULT: '#5D6B6A', dark: '#2B2B2B', 100: '#E8E8E8' },
        cream: { DEFAULT: '#F5F1E8', dim: '#EBE5D9' },
        saffron: { DEFAULT: '#D47A3F', hover: '#C26A2F' },
      },
      fontFamily: {
        serif: ['var(--font-playfair)', 'serif'],
        sans: ['var(--font-inter)', 'sans-serif'],
        josefin: ['var(--font-nunito)', 'sans-serif'], 
      },
    },
  },
  plugins: [],
};
export default config;