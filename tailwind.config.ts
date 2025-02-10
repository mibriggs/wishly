import type { Config } from 'tailwindcss';

export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],

	theme: {
		extend: {
			transitionTimingFunction: {
				custom: 'cubic-bezier(0.25, 1.5, 0.5, 1)'
			}
		}
	},

	plugins: []
} satisfies Config;
