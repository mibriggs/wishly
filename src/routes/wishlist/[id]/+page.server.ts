import { error, fail, redirect, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { WishlistItemsService } from '$lib/server/db/services/items.service';
import { newItemSchema, updateItemSchema } from '$lib/schema';
import { WishlistNotFoundError } from '$lib/errors/wishlist/wishlist-not-found';
import { WishlistLockedError } from '$lib/errors/wishlist/locked-error';
import { WishlistItemNotCreatedError } from '$lib/errors/item/item-not-created';
import { WishlistItemNotFoundError } from '$lib/errors/item/item-not-found';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		throw redirect(303, '/auth/sign-up');
	}
};

// TODO: Should check if user owns this wishlist
export const actions = {
	updateWishlistItem: async ({ request, locals }) => {
		const formData = await request.formData();
		const maybeItem = updateItemSchema.safeParse(Object.fromEntries(formData.entries()));

		if (maybeItem.success) {
			const item = maybeItem.data;

			try {
				return {
					updated: await WishlistItemsService.updateItem(
						item.itemId,
						item.wishlistId,
						locals.user.id,
						item.itemName,
						item.itemUrl,
						item.itemQuantity,
						item.itemCost.toString()
					)
				};
			} catch (e: unknown) {
				if (e instanceof WishlistNotFoundError || e instanceof WishlistItemNotFoundError) {
					return fail(404, { errorCause: e.message });
				} else if (e instanceof WishlistLockedError) {
					return fail(423, { errorCause: e.message });
				}
				return error(500);
			}
		} else {
			return fail(400, maybeItem.error.flatten().fieldErrors);
		}
	}
} satisfies Actions;
