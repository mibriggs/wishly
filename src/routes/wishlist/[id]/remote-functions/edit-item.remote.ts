import { form, getRequestEvent } from '$app/server';
import { shortIdToUuid } from '$lib';
import { WishlistItemNotFoundError } from '$lib/errors/item/item-not-found';
import { WishlistLockedError } from '$lib/errors/wishlist/locked-error';
import { WishlistNotFoundError } from '$lib/errors/wishlist/wishlist-not-found';
import { updateItemSchema } from '$lib/schema';
import { WishlistItemsService } from '$lib/server/db/services/items.service';
import { error } from '@sveltejs/kit';

export const editItemForm = form(
	updateItemSchema.omit({ wishlistId: true }),
	async ({ itemId, itemName, itemUrl, itemQuantity, itemCost }) => {
		console.log('before get request event');

		const { locals, params } = getRequestEvent();

		console.log('in edit item remote function');
		if (!params.id) return;

		try {
			return await WishlistItemsService.updateItem(
				itemId,
				shortIdToUuid(params.id),
				locals.user.id,
				itemName,
				itemUrl,
				itemQuantity,
				itemCost.toString()
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
			} else if (e instanceof WishlistItemNotFoundError) {
				errorCode = 423;
				errorMessage = e.message;
			}

			console.error(e);
			error(errorCode, { message: errorMessage });
		}
	}
);
