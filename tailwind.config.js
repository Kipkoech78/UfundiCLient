/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        yard: {
          950: "#12181F", // deep charcoal-navy, near-black steel
          900: "#1B232D",
          800: "#242E3A",
          700: "#374453",
          600: "#4E5D6E",
          400: "#8C97A3",
          200: "#D7DCE1",
          100: "#EDEFF1",
          50: "#F6F5F1", // warm off-white, "site paper"
        },
        amber: {
          600: "#C97B12",
          500: "#E89417", // primary hi-vis accent
          400: "#F5A926",
          300: "#FAC969",
        },
        signal: {
          green: "#2F8F5B", // available / verified
          red: "#C0463C", // busy / unavailable
        },
      },
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        body: ["'Inter'", "sans-serif"],
        mono: ["'IBM Plex Mono'", "monospace"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(18,24,31,0.06), 0 8px 24px -12px rgba(18,24,31,0.15)",
      },
      keyframes: {
        radar: {
          "0%": { transform: "scale(0.6)", opacity: "0.7" },
          "100%": { transform: "scale(2.2)", opacity: "0" },
        },
      },
      animation: {
        radar: "radar 2.2s cubic-bezier(0.2,0.6,0.4,1) infinite",
      },
    },
  },
  plugins: [],
};
