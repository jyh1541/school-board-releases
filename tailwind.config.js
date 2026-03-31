/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Pretendard Variable"', 'Pretendard', 'system-ui', 'sans-serif'],
        body: ['"Pretendard Variable"', 'Pretendard', 'system-ui', 'sans-serif'],
      },
      colors: {
        sakura: { 50: '#fff5f9', 100: '#ffe8f0', 200: '#ffd6e5', 300: '#ffb3cc', 400: '#f4a0b5', 500: '#e87a94', 600: '#d45a78' },
        spring: { 50: '#f0fdf4', 100: '#dcfce7', 200: '#bbf7d0', 300: '#86efac', 400: '#4ade80' },
      },
      animation: {
        'marquee': 'marquee 35s linear infinite',
        'fade-in': 'fadeIn 1s ease-out forwards',
        'slide-up': 'slideUp 0.8s ease-out forwards',
        'slide-up-d1': 'slideUp 0.8s ease-out 0.15s forwards',
        'slide-up-d2': 'slideUp 0.8s ease-out 0.3s forwards',
        'float-petal': 'floatPetal 12s ease-in-out infinite',
        'float-petal2': 'floatPetal2 15s ease-in-out infinite',
        'float-petal3': 'floatPetal3 10s ease-in-out infinite',
        'drift': 'drift 20s linear infinite',
      },
    }
  },
  plugins: [],
}
