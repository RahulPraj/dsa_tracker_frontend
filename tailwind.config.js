/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['"DM Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        surface: {
          0: '#080b0f',
          1: '#0d1117',
          2: '#161b22',
          3: '#1c2330',
          4: '#21262d',
          5: '#30363d',
        },
        lime: {
          400: '#b5f23d',
          500: '#a3e635',
          600: '#84cc16',
        },
        ink: {
          muted: '#7d8590',
          base:  '#e6edf3',
          dim:   '#adbac7',
        },
      },
      animation: {
        'fade-up'  : 'fadeUp 0.35s ease forwards',
        'fade-in'  : 'fadeIn 0.25s ease forwards',
        'slide-in' : 'slideIn 0.3s cubic-bezier(0.16,1,0.3,1) forwards',
        'pulse-dot': 'pulseDot 2s ease-in-out infinite',
      },
      keyframes: {
        fadeUp  : { from: { opacity:0, transform:'translateY(10px)' }, to: { opacity:1, transform:'translateY(0)' } },
        fadeIn  : { from: { opacity:0 }, to: { opacity:1 } },
        slideIn : { from: { opacity:0, transform:'translateX(-8px)' }, to: { opacity:1, transform:'translateX(0)' } },
        pulseDot: { '0%,100%': { opacity:1 }, '50%': { opacity:0.3 } },
      },
      boxShadow: {
        'glow-lime': '0 0 20px rgba(181,242,61,0.15)',
        'glow-sm'  : '0 0 10px rgba(181,242,61,0.1)',
        'card'     : '0 1px 3px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.3)',
      },
    },
  },
  plugins: [],
}
