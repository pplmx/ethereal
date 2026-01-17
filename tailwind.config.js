/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      // 自定义颜色
      colors: {
        ethereal: {
          primary: '#6366f1', // 紫色
          secondary: '#ec4899', // 粉色
          accent: '#14b8a6', // 青色
          dark: '#0f172a',
          light: '#f8fafc',
        },
      },

      // 自定义动画
      animation: {
        float: 'float 3s ease-in-out infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 3s linear infinite',
        'fade-in': 'fadeIn 0.3s ease-in',
        'slide-up': 'slideUp 0.3s ease-out',
      },

      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },

      // 自定义阴影
      boxShadow: {
        ethereal: '0 8px 32px rgba(99, 102, 241, 0.3)',
        'ethereal-lg': '0 12px 48px rgba(99, 102, 241, 0.4)',
      },

      // 自定义背景
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-ethereal': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      },

      // 自定义字体
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['Fira Code', 'monospace'],
      },
    },
  },
  plugins: [],
};
