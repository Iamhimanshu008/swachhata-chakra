/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                sw: {
                    'dark': '#0F3D1A',
                    'mid': '#1A6B2F',
                    'bright': '#4CAF50',
                    'orange': '#F5A623',
                    'blue': '#1A3C8F',
                    'gold': '#F5C842',
                    'light': '#E8F5E9',
                    'bg': '#F0F7F0',
                    'white': '#FFFFFF',
                    'text': '#0F3D1A',
                    'text-secondary': '#1A3C8F',
                    'danger': '#E63946',
                    'warning': '#F5A623',
                    'success': '#1A6B2F',
                },
            },
            fontFamily: {
                sans: ['Inter', 'Plus Jakarta Sans', 'system-ui', '-apple-system', 'Noto Sans Devanagari', 'sans-serif'],
                display: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
                mono: ['IBM Plex Mono', 'JetBrains Mono', 'monospace'],
            },
            fontVariantNumeric: {
                'tabular': 'tabular-nums',
            },
            animation: {
                'fade-in': 'fadeIn 0.3s ease-out',
                'slide-up': 'slideUp 0.3s ease-out',
                'slide-down': 'slideDown 0.3s ease-out',
                'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
                'shimmer': 'shimmer 1.5s ease-in-out infinite',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { opacity: '0', transform: 'translateY(10px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                slideDown: {
                    '0%': { opacity: '0', transform: 'translateY(-10px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                pulseSoft: {
                    '0%, 100%': { opacity: '1' },
                    '50%': { opacity: '0.7' },
                },
                shimmer: {
                    '0%': { backgroundPosition: '-200% 0' },
                    '100%': { backgroundPosition: '200% 0' },
                },
            },
        },
    },
    plugins: [],
};
