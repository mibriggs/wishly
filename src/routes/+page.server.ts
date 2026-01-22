import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = ({ locals }) => {
	// check if there's a user
	// if user, load all user's wishlists
	if (!locals.user) {
		throw redirect(303, '/auth/sign-up');
	}
};
