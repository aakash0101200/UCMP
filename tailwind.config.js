export default {
  
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  
  theme: {
    extend: {
      colors: {
        aliceblue: '#f0f8ff',
        'login-bg': 'var(--login-bg)',
        'login-panel': 'var(--login-panel)',
        'login-panel-fg': 'var(--login-panel-fg)',
        'login-panel-muted': 'var(--login-panel-muted)',
        'login-fg': 'var(--login-fg)',
        'login-muted': 'var(--login-muted)',
        'login-border': 'var(--login-border)',
        'login-input': 'var(--login-input)',
        'login-icon': 'var(--login-icon)',
        'login-accent': 'var(--login-accent)',
        'login-accent-hover': 'var(--login-accent-hover)',
      },
      animation: {
        'fade-in': 'fadeIn 200ms ease-out forwards'
      },
     keyframes: {
        fadeIn: {
          '0%': { opacity: 0, transform: 'translateY(4px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' }
        }
      }
    }
  },
  plugins: [
     require('@tailwindcss/forms'),
     require('@tailwindcss/typography'),
     require('@tailwindcss/aspect-ratio'),
     require('tailwind-scrollbar-hide')
  ],
 

};
