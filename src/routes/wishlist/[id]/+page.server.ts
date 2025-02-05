import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import type { Wishlist } from '$lib/server/db/schema';
import { WishlistService } from '$lib/server/db/wishlist.service';

export const load: PageServerLoad = async ({ locals, params }) => {
	if (!locals.user) {
		throw redirect(303, '/auth/sign-up');
	}

	let wishlist: Wishlist[] = [];
	try {
		wishlist = await WishlistService.findByWishlistAndUserId(params.id, locals.user.id);
	} catch (err) {
		throw redirect(303, '/');
	}

	if (wishlist.length === 0) {
		throw redirect(303, '/');
	}

	return {
		wishlist: wishlist[0]
	};
};
