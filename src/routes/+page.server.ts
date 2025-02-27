import { fail, redirect } from '@sveltejs/kit';
import { WishlistService } from '$lib/server/db/wishlist.service';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = ({ locals }) => {
	// check if there's a user
	// if user, load all user's wishlists
	if (!locals.user) {
		throw redirect(303, '/auth/sign-up');
	}

	return {
		wishlists: WishlistService.findByUserId(locals.user.id),
		isGuestUser: locals.user.isGuest
	};
};

export const actions = {
	createWishlist: async (event) => {
		const newWishlist = await WishlistService.createWishlist(event.locals.user.id);
		const succeeded = newWishlist.length === 0 ? false : true;
		return {
			success: succeeded,
			wishlist: newWishlist
		};
	},

	deleteWishlist: async (event) => {
		const formData = await event.request.formData();
		const wishlistId = formData.get('wishlistId');

		if (wishlistId !== null) {
			const deletedWishlist = await WishlistService.deleteWishlist(
				wishlistId.toString(),
				event.locals.user.id
			);
			const succeeded = deletedWishlist.length === 0 ? false : true;
			return {
				success: succeeded,
				wishlist: deletedWishlist
			};
		}
		return {
			success: false,
			wishlist: []
		};
	},

	lockWishlist: async (event) => {
		const formData = await event.request.formData();
		const wishlistId = formData.get('wishlistId');
		const isLocked = formData.get('isLocked');

		if (wishlistId !== null && wishlistId.toString().trim().length > 0 && isLocked !== null) {
			const lockedWishlist = await WishlistService.updateWishlistLock(
				wishlistId.toString(),
				event.locals.user.id,
				isLocked === 'true'
			);
			if (lockedWishlist.length === 0) {
				return fail(400, { message: 'Failed to update wishlist' });
			}
			return {
				wishlist: lockedWishlist
			};
		}
		return fail(400, { message: 'Failed to update wishlist' });
	}
} satisfies Actions;
