import { getRequestEvent, query } from '$app/server';
import { shortIdToUuid } from '$lib';
import { uuidSchema } from '$lib/schema';
import type { WishlistItem } from '$lib/server/db/schema';
import { WishlistService } from '$lib/server/db/services/wishlist.service';
import { error, isHttpError } from '@sveltejs/kit';

export const getWishlistQuery = query(async () => {
	const { params, locals } = getRequestEvent();

	if (!params.id) error(400, 'No id present');
	const maybeUuid = uuidSchema.safeParse(shortIdToUuid(params.id));

	if (!maybeUuid.success) error(404, 'Wishlist Not Found');
	try {
		const wishlistWithItems = await WishlistService.findWithItems(maybeUuid.data, locals.user.id);

		if (wishlistWithItems.length === 0) {
			error(404, 'Wishlist Not Found');
		}

		return {
			wishlist: wishlistWithItems[0].wishlists,
			items: wishlistWithItems
				.map((wishlist) => wishlist.wishlist_items)
				.filter((item): item is WishlistItem => item !== null)
		};
	} catch (err: unknown) {
		if (isHttpError(err)) throw err;
		console.error('Database error:', err);
		error(500, 'Failed to load wishlist');
	}
});
