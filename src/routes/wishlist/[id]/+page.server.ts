import { error, fail, isHttpError, redirect, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import type { Wishlist, WishlistItem } from '$lib/server/db/schema';
import { WishlistService } from '$lib/server/db/services/wishlist.service';
import { WishlistItemsService } from '$lib/server/db/services/items.service';
import { deleteItemSchema, newItemSchema, updateItemSchema, uuidSchema } from '$lib/schema';
import { shortIdToUuid } from '$lib';

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

export const actions = {
	createWishlistItem: async ({ request, locals }) => {
		const formData = await request.formData();
		const maybeItem = newItemSchema.safeParse(Object.fromEntries(formData.entries()));

		if (maybeItem.success) {
			const item = maybeItem.data;
			const wishlistToUpdate = await WishlistService.findByWishlistAndUserId(
				item.wishlistId,
				locals.user.id
			);
			let newItem: WishlistItem | null = null;

			if (wishlistToUpdate) {
				newItem = await WishlistItemsService.createNewItem(
					item.itemName,
					item.itemUrl,
					item.itemQuantity,
					item.itemCost.toString(),
					item.wishlistId
				);
			}

			if (!newItem) {
				return fail(400, { errorCause: 'Failed to create item', success: false });
			}
			return { created: newItem };
		} else {
			return fail(400, maybeItem.error.flatten().fieldErrors);
		}
	},

	updateWishlistItem: async ({ request, locals }) => {
		const formData = await request.formData();
		const maybeItem = updateItemSchema.safeParse(Object.fromEntries(formData.entries()));

		if (maybeItem.success) {
			const item = maybeItem.data;
			const wishlistToUpdate = await WishlistService.findByWishlistAndUserId(
				item.wishlistId,
				locals.user.id
			);

			if (!wishlistToUpdate) {
				return fail(400, { errorCause: 'Wishlist not found', success: false });
			}

			const updatedItems = await WishlistItemsService.updateItem(
				item.itemId,
				item.wishlistId,
				locals.user.id,
				item.itemName,
				item.itemUrl,
				item.itemQuantity,
				item.itemCost.toString()
			);

			if (updatedItems.length === 0) {
				return fail(400, { errorCause: 'Failed to update item', success: false });
			}

			return { updated: updatedItems[0] };
		} else {
			return fail(400, maybeItem.error.flatten().fieldErrors);
		}
	},

	deleteWishlistItem: async ({ request, locals }) => {
		const formData = await request.formData();
		const maybeItem = deleteItemSchema.safeParse(Object.fromEntries(formData.entries()));
		if (maybeItem.success) {
			const item = maybeItem.data;
			const deletedItem = await WishlistItemsService.deleteItem(
				item.itemId,
				item.wishlistId,
				locals.user.id
			);
			if (deletedItem.length === 0) {
				return fail(400, { errorCause: 'Failed to delete item', success: false });
			}
			return { deleted: deletedItem[0] };
		} else {
			console.error(maybeItem.error.flatten().fieldErrors);
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

			const updatedWishlist = await WishlistService.updateWishlistName(
				wishlistId.toString(),
				locals.user.id,
				newName.toString()
			);
			if (!updatedWishlist) {
				return fail(400, { errorCause: 'Failed to update name', success: false });
			}
		} else {
			return fail(400, { errorCause: 'Failed to update name', success: false });
		}
	}
} satisfies Actions;
