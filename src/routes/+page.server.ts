import { error, fail, redirect } from '@sveltejs/kit';
import { WishlistService } from '$lib/server/db/services/wishlist.service';
import type { Actions, PageServerLoad } from './$types';
import { SharedWishlistService } from '$lib/server/db/services/shared.service';
import { uuidToShortId } from '$lib/server';
import type { ShareDuration } from '$lib';

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
	createWishlist: async ({ locals }) => {
		try {
			const newWishlist = await WishlistService.createWishlist(locals.user.id);
			if (newWishlist) return { wishlist: newWishlist };
			return fail(400);
		} catch (e) {
			return error(400);
		}
	},

	deleteWishlist: async ({ request, locals }) => {
		const formData = await request.formData();
		const wishlistId = formData.get('wishlistId');

		if (wishlistId) {
			const deletedWishlist = await WishlistService.deleteWishlist(
				wishlistId.toString(),
				locals.user.id
			);
			const succeeded = deletedWishlist === null ? false : true;
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

	lockWishlist: async ({ request, locals }) => {
		const formData = await request.formData();
		const wishlistId = formData.get('wishlistId');
		const isLocked = formData.get('isLocked');

		if (wishlistId && wishlistId.toString().trim().length > 0 && isLocked !== null) {
			const lockedWishlist = await WishlistService.updateWishlistLock(
				wishlistId.toString(),
				locals.user.id,
				isLocked === 'true'
			);
			if (!lockedWishlist) {
				return fail(400, { message: 'Failed to update wishlist' });
			}
			return {
				wishlist: lockedWishlist
			};
		}
		return fail(400, { message: 'Failed to update wishlist' });
	},

	shareWishlist: async ({ request }) => {
		const formData = await request.formData();
		const wishlistId = formData.get('wishlistId');
		const THIRTY_DAYS = 1000 * 60 * 60 * 24 * 30;

		if (!wishlistId) {
			return fail(400, { message: 'Failed to share wishlist' });
		}

		if (typeof wishlistId !== 'string') return error(400);

		try {
			const now = new Date();
			let newShareLink: string | null = null;
			let durationType: ShareDuration = 'THIRTY_DAYS';

			const shareLink = await SharedWishlistService.findByWishlistId(wishlistId);

			if (shareLink && shareLink.expiresAt && shareLink.expiresAt < now) {
				const deletedLink = await SharedWishlistService.deleteShared(shareLink.id);
				if (deletedLink) {
					const newLink = await SharedWishlistService.createSharedLink(
						wishlistId,
						new Date(now.getTime() + THIRTY_DAYS),
						'THIRTY_DAYS'
					);
					if (newLink) {
						newShareLink = newLink.id;
					} else {
						newShareLink = null;
					}
				} else {
					newShareLink = null;
				}
			} else if (shareLink) {
				newShareLink = shareLink.id;
				durationType = shareLink.durationType;
			} else {
				const newLink = await SharedWishlistService.createSharedLink(
					wishlistId,
					new Date(now.getTime() + THIRTY_DAYS),
					'THIRTY_DAYS'
				);
				if (newLink) {
					newShareLink = newLink.id;
				} else {
					newShareLink = null;
				}
			}

			if (newShareLink) {
				return {
					link: uuidToShortId(newShareLink),
					currentDuration: durationType,
					shareId: newShareLink
				};
			}
			return error(400);
		} catch (e) {
			return error(400);
		}
	}
} satisfies Actions;
