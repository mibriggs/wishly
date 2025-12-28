import { error, fail, redirect } from '@sveltejs/kit';
import { WishlistService } from '$lib/server/db/services/wishlist.service';
import type { Actions, PageServerLoad } from './$types';
import { SharedWishlistService } from '$lib/server/db/services/shared.service';
import { uuidToShortId } from '$lib/server';
import type { ShareDuration } from '$lib';
import { WishlistNotFoundError } from '$lib/server/errors/wishlist-not-found';
import { WishlistNotCreatedError } from '$lib/server/errors/wishlist-not-created';
import { UserNotFoundError } from '$lib/server/errors/user-not-found';
import { WishlistLockedError } from '$lib/server/errors/locked-error';

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
			return { wishlist: newWishlist };
		} catch (e: unknown) {
			if (e instanceof UserNotFoundError) {
				return fail(404, { errorCause: e.message });
			} else if (e instanceof WishlistNotCreatedError) {
				return fail(422, { errorCause: e.message });
			}
			console.error('Error in form action:', e);
			return error(500);
		}
	},

	deleteWishlist: async ({ request, locals }) => {
		const formData = await request.formData();
		const wishlistId = formData.get('wishlistId');

		if (wishlistId) {
			try {
				return {
					wishlist: await WishlistService.deleteWishlist(wishlistId.toString(), locals.user.id)
				};
			} catch (e: unknown) {
				if (e instanceof WishlistNotFoundError) {
					return fail(404, { errorCause: e.message });
				} else if (e instanceof WishlistLockedError) {
					return fail(423, { errorCause: e.message });
				}
				return error(500);
			}
		}
		return fail(400, { errorCause: 'Wishlist ID is null' });
	},

	lockWishlist: async ({ request, locals }) => {
		const formData = await request.formData();
		const wishlistId = formData.get('wishlistId');

		if (wishlistId && wishlistId.toString().trim().length > 0) {
			try {
				return {
					wishlist: await WishlistService.updateWishlistLock(wishlistId.toString(), locals.user.id)
				};
			} catch (e: unknown) {
				if (e instanceof WishlistNotFoundError) {
					return fail(404, { errorCause: e.message });
				}
				return error(500);
			}
		}
		return fail(400, { errorCause: 'Wishlist ID is null' });
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
		} catch (e: unknown) {
			console.error('Error in form action:', e);
			return error(400);
		}
	}
} satisfies Actions;
