/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: 'var(--primary)',
        accent: 'var(--accent)',
        'bg-body': 'var(--bg-body)',
        'bg-surface': 'var(--bg-surface)',
        'bg-card': 'var(--bg-card)',
        'text-main': 'var(--text-main)',
        'text-muted': 'var(--text-muted)',
        'border-color': 'var(--border-color)',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'sans-serif'],
        space: ['Space Grotesk', 'sans-serif'],
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.2, 0.8, 0.2, 1)',
        'elastic': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },
      animation: {
        'drift': 'drift 20s infinite alternate ease-in-out',
        'float': 'float 8s infinite ease-in-out',
        'float-reverse': 'float 10s infinite ease-in-out reverse',
      },
      keyframes: {
        drift: {
          '0%': { transform: 'translate(0,0) scale(1)' },
          '100%': { transform: 'translate(30px, 40px) scale(1.05)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0) rotate(var(--r, 0deg))' },
          '50%': { transform: 'translateY(-15px) rotate(calc(var(--r, 0deg) + 8deg))' },
        },
      },
    },
  },
  plugins: [],
}
