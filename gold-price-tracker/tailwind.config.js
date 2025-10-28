/** @type {import('tailwindcss').Config} */
module.exports = {
	darkMode: ['class'],
	content: [
		'./pages/**/*.{ts,tsx}',
		'./components/**/*.{ts,tsx}',
		'./app/**/*.{ts,tsx}',
		'./src/**/*.{ts,tsx}',
	],
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1200px',
			},
		},
		extend: {
			colors: {
				// Swiss Design Color System
				primary: {
					DEFAULT: '#DC143C', // Crimson red
					500: '#DC143C',
					700: '#A01028',
				},
				secondary: {
					DEFAULT: '#0057B7', // International Klein Blue
					500: '#0057B7',
					700: '#003D82',
				},
				neutral: {
					50: '#FFFFFF',
					100: '#F5F5F5',
					200: '#E5E5E5',
					300: '#CCCCCC',
					400: '#999999',
					500: '#666666',
					700: '#333333',
					800: '#1A1A1A',
					900: '#000000',
				},
				// Semantic colors
				success: '#DC143C',
				decline: '#0057B7',
			},
			fontFamily: {
				sans: ['Helvetica Neue', 'Helvetica', 'Arial', 'sans-serif'],
			},
			fontSize: {
				'display': '64px',
				'headline': '40px',
				'subhead': '28px',
				'large-number': '48px',
				'body-large': '20px',
				'body': '16px',
				'small': '14px',
				'caption': '12px',
			},
			spacing: {
				'xs': '8px',
				'sm': '16px',
				'md': '24px',
				'lg': '32px',
				'xl': '48px',
				'2xl': '64px',
				'3xl': '96px',
			},
			borderRadius: {
				'none': '0px',
				'subtle': '2px',
			},
			borderWidth: {
				'thin': '1px',
				'medium': '2px',
				'thick': '3px',
			},
			transitionDuration: {
				'fast': '150ms',
				'normal': '200ms',
			},
		},
	},
	plugins: [require('tailwindcss-animate')],
}
