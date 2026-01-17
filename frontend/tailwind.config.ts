import type { Config } from 'tailwindcss'

const config: Config = {
    darkMode: 'class',
    content: [
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                // Medical trust-inspired palette
                primary: {
                    50: '#e0f2f3',
                    100: '#b3e0e3',
                    200: '#80ccd1',
                    300: '#4db8bf',
                    400: '#26a8b1',
                    500: '#006064', // Deep Teal - Primary
                    600: '#00575a',
                    700: '#004a4d',
                    800: '#003d40',
                    900: '#002a2c',
                },
                secondary: {
                    50: '#fdfcfa',
                    100: '#faf8f3',
                    200: '#f5f1e8', // Warm Sand - Secondary
                    300: '#e8e0d0',
                    400: '#d4c8b0',
                    500: '#bfae90',
                },
                accent: {
                    50: '#fff4ed',
                    100: '#ffe4d1',
                    200: '#ffc7a3',
                    300: '#ffa366',
                    400: '#ff7a33',
                    500: '#cc5500', // Burnt Orange - Alerts
                    600: '#a34400',
                    700: '#7a3300',
                },
                // Status colors
                success: '#10b981',
                warning: '#f59e0b',
                error: '#ef4444',
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
            spacing: {
                '18': '4.5rem',
                '88': '22rem',
            },
        },
    },
    plugins: [],
}

export default config
