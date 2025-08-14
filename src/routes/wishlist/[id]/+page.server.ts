import { fail, redirect, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import type { Wishlist, WishlistItem } from '$lib/server/db/schema';
import { WishlistService } from '$lib/server/db/services/wishlist.service';
import { WishlistItemsService } from '$lib/server/db/services/items.service';
import { deleteItemSchema, newItemSchema, uuidSchema } from '$lib/schema';
import { shortIdToUuid } from '$lib';

export const load: PageServerLoad = async ({ locals, params }) => {
	if (!locals.user) {
		throw redirect(303, '/auth/sign-up');
	}

	const maybeUuid = uuidSchema.safeParse(shortIdToUuid(params.id));
	if (!maybeUuid.success) {
		throw redirect(303, '/');
	}

	const wishlistId = maybeUuid.data;
	let wishlist: { wishlists: Wishlist; wishlist_items: WishlistItem | null }[] = [];
	try {
		wishlist = await WishlistService.findWithItems(wishlistId, locals.user.id);
	} catch (err) {
		throw redirect(303, '/');
	}

	if (wishlist.length === 0) {
		throw redirect(303, '/');
	}

	const loadedWishlist: Wishlist = wishlist[0].wishlists;
	const items: WishlistItem[] = [];
	wishlist.forEach((wishlistWithItem) => {
		if (wishlistWithItem.wishlist_items !== null) {
			items.push(wishlistWithItem.wishlist_items);
		}
	});

	return {
		wishlist: loadedWishlist,
		items: items
	};
};

export const actions = {
	createWishlistItem: async ({ request, locals }) => {
		const formData = await request.formData();
		const maybeItem = newItemSchema.safeParse(Object.fromEntries(formData.entries()));

		if (maybeItem.success) {
			const item = maybeItem.data;
			const newItem = await WishlistItemsService.createNewItem(
				item.itemName,
				item.itemUrl,
				item.itemQuantity,
				item.itemCost.toString(),
				item.wishlistId,
				locals.user.id
			);
			if (newItem.length === 0) {
				return fail(400, { message: 'Failed to create item' });
			}
			return { success: true };
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
				return fail(400, { message: 'Failed to delete item' });
			}
			return { success: true };
		} else {
			console.error(maybeItem.error.flatten().fieldErrors);
			return fail(400, maybeItem.error.flatten().fieldErrors);
		}
	},

	updateWishlistName: async ({ request, locals }) => {
		const formData = await request.formData();
		console.log(Object.fromEntries(formData.entries()));
		const newName = formData.get('newName');
		const oldName = formData.get('oldName');
		const wishlistId = formData.get('wishlistId');

		if (newName !== null && oldName !== null && wishlistId !== null) {
			if (newName.toString().trim().length == 0 || newName.toString() === oldName.toString()) {
				return fail(400, { message: 'Name must be empty and cannot match old name' });
			}

			const updatedWishlist = await WishlistService.updateWishlistName(
				wishlistId.toString(),
				locals.user.id,
				newName.toString()
			);
			if (updatedWishlist.length === 0) {
				return fail(400, { message: 'Failed to update name' });
			}
		} else {
			return fail(400, { message: 'Failed to update name' });
		}
	}
} satisfies Actions;
