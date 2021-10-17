module.exports = {
	purge: [
		"./src/pages/**/*.{js,ts,jsx,tsx}",
		"./src/components/**/*.{js,ts,jsx,tsx}",
	],
	darkMode: false, // or 'media' or 'class'
	theme: {
		extend: {
			colors: {
				primary: {
					DEFAULT: "#0D1117",
					dark: "#0B0E13",
					light: "#0F141B",
				},
				secondary: "#010409",
				cta: {
					DEFAULT: "#059669",
					complementary: "#b82856",
				},
			},
		},
	},
	variants: {
		extend: {},
	},
	plugins: [],
};