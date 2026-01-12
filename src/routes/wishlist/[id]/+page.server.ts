import { error, fail, isHttpError, redirect, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import type { Wishlist, WishlistItem } from '$lib/server/db/schema';
import { WishlistService } from '$lib/server/db/services/wishlist.service';
import { WishlistItemsService } from '$lib/server/db/services/items.service';
import { newItemSchema, updateItemSchema, uuidSchema } from '$lib/schema';
import { shortIdToUuid } from '$lib';
import { WishlistNotFoundError } from '$lib/errors/wishlist/wishlist-not-found';
import { WishlistLockedError } from '$lib/errors/wishlist/locked-error';
import { WishlistItemNotCreatedError } from '$lib/errors/item/item-not-created';
import { WishlistItemNotFoundError } from '$lib/errors/item/item-not-found';

export const load: PageServerLoad = async ({ locals, params }) => {
	if (!locals.user) {
		throw redirect(303, '/auth/sign-up');
	}

	const maybeUuid = uuidSchema.safeParse(shortIdToUuid(params.id));
	if (!maybeUuid.success) {
		throw error(404, 'Invalid wishlist ID');
	}

	const wishlistId = maybeUuid.data;
	return {
		streamed: loadWishlistItems(wishlistId, locals.user.id)
	};
};

const loadWishlistItems = async (
	wishlistId: string,
	userId: string
): Promise<{ wishlist: Wishlist; items: WishlistItem[] }> => {
	try {
		const wishlistWithItems = await WishlistService.findWithItems(wishlistId, userId);
		if (wishlistWithItems.length === 0) {
			throw error(404, 'Wishlist not found');
		}

		return {
			wishlist: wishlistWithItems[0].wishlists,
			items: wishlistWithItems
				.map((wishlist) => wishlist.wishlist_items)
				.filter((item): item is WishlistItem => item !== null)
		};
	} catch (err) {
		if (isHttpError(err)) throw err;
		console.error('Database error:', err);
		throw error(500, 'Failed to load wishlist');
	}
};

// TODO: Should check if user owns this wishlist
export const actions = {
	createWishlistItem: async ({ request, locals }) => {
		const formData = await request.formData();
		const maybeItem = newItemSchema.safeParse(Object.fromEntries(formData.entries()));

		if (maybeItem.success) {
			const item = maybeItem.data;

			try {
				const newItem = await WishlistItemsService.createNewItem(
					locals.user.id,
					item.itemName,
					item.itemUrl,
					item.itemQuantity,
					item.itemCost.toString(),
					item.wishlistId
				);
				return { created: newItem };
			} catch (e: unknown) {
				if (e instanceof WishlistNotFoundError) {
					return fail(404, { errorCause: e.message });
				} else if (e instanceof WishlistLockedError) {
					return fail(423, { errorCause: e.message });
				} else if (e instanceof WishlistItemNotCreatedError) {
					return fail(422, { errorCause: e.message });
				}
				return error(500);
			}
		} else {
			return fail(400, maybeItem.error.flatten().fieldErrors);
		}
	},

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
	},

	updateWishlistName: async ({ request, locals }) => {
		const formData = await request.formData();
		const newName = formData.get('newName');
		const oldName = formData.get('oldName');
		const wishlistId = formData.get('wishlistId');

		if (newName !== null && oldName !== null && wishlistId !== null) {
			if (newName.toString().trim().length == 0 || newName.toString() === oldName.toString()) {
				return fail(400, { errorCause: 'Must be new non-empty name', success: false });
			}

			try {
				await WishlistService.updateWishlistName(
					wishlistId.toString(),
					locals.user.id,
					newName.toString()
				);
			} catch (e: unknown) {
				if (e instanceof WishlistNotFoundError) {
					return fail(404, { errorCause: e.message });
				} else if (e instanceof WishlistLockedError) {
					return fail(423, { errorCause: e.message });
				}
				return error(500);
			}
		} else {
			return fail(400, { errorCause: 'Failed to update name', success: false });
		}
	}
} satisfies Actions;
