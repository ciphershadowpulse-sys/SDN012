/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        darkBg: "#0B0F19",
        cardBg: "#111827",
        cardBorder: "#1F2937",
        primaryPurple: "#8B5CF6",
        accentBlue: "#3B82F6",
      },
    },
  },
  plugins: [],
}