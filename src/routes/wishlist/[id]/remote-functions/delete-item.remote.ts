import { command, getRequestEvent } from '$app/server';
import { WishlistItemNotFoundError } from '$lib/errors/item/item-not-found';
import { WishlistLockedError } from '$lib/errors/wishlist/locked-error';
import { WishlistNotFoundError } from '$lib/errors/wishlist/wishlist-not-found';
import { WishlistItemsService } from '$lib/server/db/services/items.service';
import { error } from '@sveltejs/kit';
import { z } from 'zod/v4';

export const deleteItemCommand = command(
	z.object({ itemId: z.string(), wishlistId: z.string() }),
	async ({ itemId, wishlistId }) => {
		const { locals } = getRequestEvent();
		try {
			return await WishlistItemsService.deleteItem(itemId, wishlistId, locals.user.id);
		} catch (e: unknown) {
			let errorCode: number = 500;
			let errorMessage: string = 'Something went wrong';

			if (e instanceof WishlistNotFoundError || e instanceof WishlistItemNotFoundError) {
				errorCode = 404;
				errorMessage = e.message;
			} else if (e instanceof WishlistLockedError) {
				errorCode = 423;
				errorMessage = e.message;
			}

			console.error(e);
			error(errorCode, { message: errorMessage });
		}
	}
);
