/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {}
	},
	plugins: [require('daisyui')],
	daisyui: {
		themes: [
			{
				hydrotracker: {
					"primary": "#10b981",
					"secondary": "#3b82f6",
					"accent": "#f59e0b",
					"neutral": "#374151",
					"base-100": "#ffffff",
					"base-200": "#f3f4f6",
					"base-300": "#e5e7eb",
					"info": "#3b82f6",
					"success": "#10b981",
					"warning": "#f59e0b",
					"error": "#ef4444",
				},
			},
			"light",
			"dark",
			"cupcake",
			"garden",
		],
	},
};
