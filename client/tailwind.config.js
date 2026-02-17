/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                brand: {
                    text: '#2C3E50',
                    green: '#1e4a63',    /* User specified logo background */
                    btn: '#1e4a63',      /* User specified logo background */
                    bg: '#F5F5F0',       /* Warm Off-white/Cream */
                    brown: '#C9CAC2',    /* Light Grey/Sand from Logo */
                    dark: '#1e4a63',     /* User specified logo background */
                    light: '#F3F4F6'
                },
                fontFamily: {
                    sans: ['Jost', 'sans-serif'],
                    serif: ['Playfair Display', 'serif'], /* Added for luxury feel if imported */
                }
            }
        },
    },
    plugins: [],
}
