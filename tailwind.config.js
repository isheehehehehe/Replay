/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        abyss: "#04131C",
        deep: "#071F2A",
        card: "#0D2C3A",
        cyan: { glow: "#4DEAFF" },
      },
      fontFamily: {
        logo: ["'Press Start 2P'", "cursive"],
        ui: ["'Space Grotesk'", "sans-serif"],
      },
      backdropBlur: { xs: "2px" },
      boxShadow: {
        glow: "0 0 24px rgba(77,234,255,0.25)",
        "glow-lg": "0 0 48px rgba(77,234,255,0.18)",
      },
      keyframes: {
        rise: {
          "0%": { transform: "translateY(0) translateX(0)", opacity: "0" },
          "10%": { opacity: "0.6" },
          "90%": { opacity: "0.4" },
          "100%": { transform: "translateY(-110vh) translateX(20px)", opacity: "0" },
        },
        sway: {
          "0%,100%": { transform: "translateX(0)" },
          "50%": { transform: "translateX(12px)" },
        },
        pulseGlow: {
          "0%,100%": { opacity: "0.5" },
          "50%": { opacity: "1" },
        },
      },
      animation: {
        rise: "rise linear infinite",
        sway: "sway 6s ease-in-out infinite",
        pulseGlow: "pulseGlow 2.4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
