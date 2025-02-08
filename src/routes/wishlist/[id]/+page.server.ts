import { redirect, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import type { Wishlist, WishlistItem } from '$lib/server/db/schema';
import { WishlistService } from '$lib/server/db/wishlist.service';
import { WishlistItemsService } from '$lib/server/db/items.service';

export const load: PageServerLoad = async ({ locals, params }) => {
	if (!locals.user) {
		throw redirect(303, '/auth/sign-up');
	}

	let wishlist: { wishlists: Wishlist; wishlist_items: WishlistItem | null }[] = [];
	try {
		wishlist = await WishlistService.findWithItems(params.id, locals.user.id);
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

//TODO server and client side validation of this + better form UI
export const actions = {
	createNewItem: async (event) => {
		const formData = await event.request.formData();
        const path = event.url.pathname.split('/')
		const name = formData.get('itemName')?.toString() || "";
		const url = formData.get('itemUrl')?.toString() || "";
		const count = formData.get('itemQuantity')?.toString() || "";
		const price = formData.get('itemCost')?.toString() || "";
		const id = path[path.length - 1];

        const newItem = await WishlistItemsService.createNewItem(name, url, parseInt(count), price, id);
        return {
            items: newItem
        }
	}
} satisfies Actions;
