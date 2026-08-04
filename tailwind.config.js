/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#101828",
        charcoal: "#1F2937",
        paper: "#F7F1E8",
        bone: "#FAFAF7",
        clay: "#B95C50",
        amber: "#D99A2B",
        trust: "#3B6EA8",
        border: "#D8D6D0",
      },
      fontFamily: {
        serif: ["IBM Plex Serif", "Georgia", "serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["IBM Plex Mono", "monospace"],
      },
      boxShadow: {
        soft: "0 18px 50px rgba(16, 24, 40, 0.08)",
      },
    },
  },
  plugins: [],
};
