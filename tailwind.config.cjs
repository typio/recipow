/** @type {import('tailwindcss').Config} */
module.exports = {
	darkMode: 'class',
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		fontFamily: {
			sans: ['Inter', 'sans-serif'],
			serif: ['serif'],
			display: ['Inter', 'serif'],
			body: ['Inter', 'serif']
		},
		fontSize: {
			tiny: '.625rem',
			xs: '.75rem',
			sm: '.875rem',
			base: '1rem',
			lg: '1.125rem',
			xl: '1.25rem',
			'2xl': '1.5rem',
			'3xl': '1.875rem',
			'4xl': '2.25rem',
			'5xl': '3rem',
			'6xl': '4rem',
			'7xl': '5rem'
		},

		extend: {}
	},
	plugins: []
}
