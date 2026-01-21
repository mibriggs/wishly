import { command, getRequestEvent } from '$app/server';
import { WishlistLockedError } from '$lib/errors/wishlist/locked-error';
import { WishlistNotFoundError } from '$lib/errors/wishlist/wishlist-not-found';
import { WishlistService } from '$lib/server/db/services/wishlist.service';
import { error } from '@sveltejs/kit';
import { z } from 'zod/v4';

export const renameWishlistCommand = command(
	z.object({ newName: z.string(), wishlistId: z.string() }),
	async ({ newName, wishlistId }) => {
		const { locals } = getRequestEvent();
		try {
			return await WishlistService.updateWishlistName(wishlistId, locals.user.id, newName);
		} catch (e: unknown) {
			let errorCode: number = 500;
			let errorMessage: string = 'Something went wrong';

			if (e instanceof WishlistNotFoundError) {
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
