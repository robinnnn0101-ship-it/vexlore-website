/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: '#0b090c',
        'bg-2': '#121014',
        panel: '#161318',
        'panel-dark': '#100d11',
        ink: '#f3eee8',
        muted: '#9a938c',
        line: 'rgba(255,255,255,0.08)',
        red: {
          brand: '#e23a32',
          hover: '#c92f28',
          accent: '#ff6a5a',
          glow: 'rgba(226,58,50,0.18)',
        },
      },
      fontFamily: {
        sans: ['"Instrument Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
      keyframes: {
        coalPulse: {
          '0%, 100%': { opacity: '0.7', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.06)' },
        },
        wallLick: {
          '0%, 100%': { transform: 'scaleY(1) scaleX(1) rotate(-4deg)', opacity: '0.62' },
          '40%': { transform: 'scaleY(1.16) scaleX(0.86) rotate(3deg)', opacity: '1' },
          '70%': { transform: 'scaleY(0.9) scaleX(1.1) rotate(-2deg)', opacity: '0.74' },
        },
        wallSpark: {
          '0%': { transform: 'translateY(0) translateX(0) scale(1)', opacity: '0' },
          '12%': { opacity: '0.9' },
          '100%': { transform: 'translateY(-72vh) translateX(18px) scale(0.2)', opacity: '0' },
        },
        hearth: {
          '0%, 100%': { opacity: '0.75', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.03)' },
        },
        lick: {
          '0%, 100%': { transform: 'scaleY(1) scaleX(1) rotate(-3deg)', opacity: '0.7' },
          '45%': { transform: 'scaleY(1.18) scaleX(0.88) rotate(3deg)', opacity: '1' },
          '72%': { transform: 'scaleY(0.92) scaleX(1.08) rotate(-1deg)', opacity: '0.78' },
        },
        sidePulse: {
          '0%, 100%': { opacity: '0.35' },
          '50%': { opacity: '0.7' },
        },
        ember: {
          '0%': { transform: 'translateY(0) scale(1)', opacity: '0' },
          '14%': { opacity: '0.85' },
          '100%': { transform: 'translateY(-150px) scale(0.25)', opacity: '0' },
        },
        scanGlow: {
          '0%, 100%': { borderColor: 'rgba(226,58,50,0.35)', boxShadow: '0 0 15px rgba(226,58,50,0.1)' },
          '50%': { borderColor: 'rgba(255,106,90,0.7)', boxShadow: '0 0 25px rgba(226,58,50,0.25)' },
        },
      },
      animation: {
        coalPulse: 'coalPulse 3.4s ease-in-out infinite',
        wallLick: 'wallLick 1.35s ease-in-out infinite',
        hearth: 'hearth 2.6s ease-in-out infinite',
        lick: 'lick 1.2s ease-in-out infinite',
        sidePulse: 'sidePulse 2.2s ease-in-out infinite',
        scanGlow: 'scanGlow 2.5s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
