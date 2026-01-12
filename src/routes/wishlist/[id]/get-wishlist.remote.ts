import { getRequestEvent, query } from '$app/server';
import { shortIdToUuid } from '$lib';
import { uuidSchema } from '$lib/schema';
import type { WishlistItem } from '$lib/server/db/schema';
import { WishlistService } from '$lib/server/db/services/wishlist.service';
import { error, isHttpError } from '@sveltejs/kit';

export const getWishlist = query(async () => {
	const { params, locals } = getRequestEvent();

	if (!params.id) return { found: false, redirectTo: '/', message: 'Invalid wishlist ID' };
	console.log('params exist');
	const maybeUuid = uuidSchema.safeParse(shortIdToUuid(params.id));

	if (!maybeUuid.success) return { found: false, redirectTo: '/', message: 'Invalid wishlist ID' };
	console.log('is uuid');
	try {
		const wishlistWithItems = await WishlistService.findWithItems(maybeUuid.data, locals.user.id);

		if (wishlistWithItems.length === 0) {
			console.log('No data found');
			return { found: false, redirectTo: '/', message: 'Invalid wishlist ID' };
		}

		return {
			wishlist: wishlistWithItems[0].wishlists,
			items: wishlistWithItems
				.map((wishlist) => wishlist.wishlist_items)
				.filter((item): item is WishlistItem => item !== null)
		};
	} catch (err: unknown) {
		if (isHttpError(err)) throw err;

		console.log('In catch block');
		console.error('Database error:', err);
		return error(500, 'Failed to load wishlist');
	}
});
