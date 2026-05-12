/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
          colors: {
            gold: '#C89B3C',
            'gold-accent': '#D9B65A',
            'gold-hover': '#B8860B',

            ivory: '#111111',
            'luxury-black': '#FFFFFF',
            'luxury-card': '#FFFFFF',
            'luxury-gray': '#555555',
  },
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
      },
      animation: {
        'fade-in': 'fadeIn 1s ease forwards',
        'fade-in-up': 'fadeInUp 0.8s ease forwards',
        'slide-up': 'slideUp 0.3s ease forwards',
        'marquee': 'marquee 30s linear infinite',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 8px rgba(212,175,55,0.15)' },
          '50%': { boxShadow: '0 0 20px rgba(212,175,55,0.3)' },
        },
      },
      boxShadow: {
        'gold': '0 0 15px rgba(212,175,55,0.15)',
        'gold-lg': '0 0 30px rgba(212,175,55,0.2)',
        'card': '0 4px 24px rgba(0,0,0,0.4)',
        'card-hover': '0 8px 40px rgba(0,0,0,0.5), 0 0 15px rgba(212,175,55,0.1)',
      },
    },
  },
  plugins: [],
};
