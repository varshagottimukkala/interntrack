/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        canvas: '#F8FAFC',
        ink: '#0F172A',
        mute: '#64748B',
        brand: {
          50: '#F0FDFA',
          100: '#CCFBF1',
          200: '#99F6E4',
          500: '#14B8A6',
          600: '#0D9488',
          700: '#0F766E',
          800: '#115E59',
        },
      },
      fontFamily: {
        sans: ['"DM Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['"Fraunces"', 'Georgia', 'serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(15, 23, 42, 0.04), 0 12px 32px -12px rgba(15, 23, 42, 0.12)',
        glow: '0 0 0 4px rgba(13, 148, 136, 0.12)',
      },
      backgroundImage: {
        mesh: 'radial-gradient(1200px 500px at 10% -10%, rgba(20, 184, 166, 0.16), transparent), radial-gradient(900px 400px at 100% 0%, rgba(99, 102, 241, 0.12), transparent)',
      },
    },
  },
  plugins: [],
};
