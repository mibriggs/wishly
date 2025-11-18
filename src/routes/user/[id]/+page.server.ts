import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
	if (!locals.user) {
		throw redirect(303, '/auth/sign-up');
	}

	// Verify user is accessing their own settings
	if (locals.user.id !== params.id) {
		throw redirect(303, '/');
	}

	return {
		user: locals.user
	};
};
