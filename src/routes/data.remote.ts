import { command, getRequestEvent, query } from '$app/server';
import { UserNotFoundError } from '$lib/errors/user/user-not-found';
import { WishlistLockedError } from '$lib/errors/wishlist/locked-error';
import { WishlistNotCreatedError } from '$lib/errors/wishlist/wishlist-not-created';
import { WishlistNotFoundError } from '$lib/errors/wishlist/wishlist-not-found';
import { WishlistService } from '$lib/server/db/services/wishlist.service';
import { error, isHttpError } from '@sveltejs/kit';
import { z } from 'zod/v4';

export const getWishlistsQuery = query(async () => {
	const { locals } = getRequestEvent();

	try {
		const wishlists = await WishlistService.findByUserId(locals.user.id);
		return {
			wishlists,
			isGuestUser: locals.user.isGuest
		};
	} catch (e: unknown) {
		if (isHttpError(e)) throw e;
		console.error('Database error:', e);
		error(500, 'Failed to load wishlists');
	}
});

export const createWishlistCommand = command(async () => {
	const { locals } = getRequestEvent();

	try {
		await WishlistService.createWishlist(locals.user.id);
		getWishlistsQuery().refresh();
	} catch (e: unknown) {
		let errorCode: number = 500;
		let errorMessage: string = 'Something went wrong';

		if (e instanceof UserNotFoundError) {
			errorCode = 404;
			errorMessage = e.message;
		} else if (e instanceof WishlistNotCreatedError) {
			errorCode = 422;
			errorMessage = e.message;
		}

		console.error(e);
		error(errorCode, { message: errorMessage });
	}
});

export const deleteWishlistCommand = command(z.uuid(), async (wishlistId) => {
	const { locals } = getRequestEvent();

	try {
		return await WishlistService.deleteWishlist(wishlistId, locals.user.id);
	} catch (e: unknown) {
		let errorCode: number = 500;
		let errorMessage: string = 'Something went wrong';

		if (e instanceof WishlistNotFoundError) {
			errorCode = 404;
			errorMessage = e.message;
		} else if (e instanceof WishlistLockedError) {
			errorCode = 422;
			errorMessage = e.message;
		}

		console.error(e);
		error(errorCode, { message: errorMessage });
	}
});

export const updateLockCommand = command(z.uuid(), async (wishlistId) => {
	const { locals } = getRequestEvent();

	try {
		return await WishlistService.updateWishlistLock(wishlistId, locals.user.id);
	} catch (e: unknown) {
		let errorCode: number = 500;
		let errorMessage: string = 'Something went wrong';

		if (e instanceof WishlistNotFoundError) {
			errorCode = 404;
			errorMessage = e.message;
		}

		console.error(e);
		error(errorCode, { message: errorMessage });
	}
});
