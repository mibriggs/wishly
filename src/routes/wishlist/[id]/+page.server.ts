import { fail, redirect, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import type { Wishlist, WishlistItem } from '$lib/server/db/schema';
import { WishlistService } from '$lib/server/db/wishlist.service';
import { WishlistItemsService } from '$lib/server/db/items.service';
import { newItemSchema, uuidSchema } from '$lib/schema';

export const load: PageServerLoad = async ({ locals, params }) => {
	if (!locals.user) {
		throw redirect(303, '/auth/sign-up');
	}

	const maybeUuid = uuidSchema.safeParse(params.id);
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
	createNewItem: async ({ request, url, locals }) => {
		const path = url.pathname.split('/');
		const formData = await request.formData();
		const wishlistId = path[path.length - 1];
		console.log(Object.fromEntries(formData.entries()));
		const maybeItem = newItemSchema.safeParse(Object.fromEntries(formData.entries()));

		if (maybeItem.success) {
			const item = maybeItem.data;
			const newItem = await WishlistItemsService.createNewItem(
				item.itemName,
				item.itemUrl,
				item.itemQuantity,
				item.itemCost.toString(),
				wishlistId,
				locals.user.id
			);
			if (newItem.length === 0) {
				return fail(400, { message: 'Failed to create item' });
			}
			return { success: true };
		} else {
			return fail(400, maybeItem.error.flatten().fieldErrors);
		}
	}
} satisfies Actions;
