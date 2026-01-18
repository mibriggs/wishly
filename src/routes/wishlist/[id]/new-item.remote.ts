import { form, getRequestEvent } from '$app/server';
import { shortIdToUuid } from '$lib';
import { WishlistItemNotCreatedError } from '$lib/errors/item/item-not-created';
import { WishlistLockedError } from '$lib/errors/wishlist/locked-error';
import { WishlistNotFoundError } from '$lib/errors/wishlist/wishlist-not-found';
import { newItemSchema } from '$lib/schema';
import { WishlistItemsService } from '$lib/server/db/services/items.service';
import { error } from '@sveltejs/kit';

export const createItemForm = form(
	newItemSchema.omit({ wishlistId: true }),
	async ({ itemName, itemUrl, itemQuantity, itemCost }) => {
		const { locals, params } = getRequestEvent();

		console.log('Hello from server');
		if (!params.id) return;

		try {
			return await WishlistItemsService.createNewItem(
				locals.user.id,
				itemName,
				itemUrl,
				itemQuantity,
				itemCost.toString(),
				shortIdToUuid(params.id)
			);
		} catch (e: unknown) {
			let errorCode: number = 500;
			let errorMessage: string = 'Something went wrong';

			if (e instanceof WishlistNotFoundError) {
				errorCode = 404;
				errorMessage = e.message;
			} else if (e instanceof WishlistLockedError) {
				errorCode = 423;
				errorMessage = e.message;
			} else if (e instanceof WishlistItemNotCreatedError) {
				errorCode = 423;
				errorMessage = e.message;
			}

			error(errorCode, { message: errorMessage });
		}
	}
);
