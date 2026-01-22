import { command, getRequestEvent, query } from '$app/server';
import { type ShareDuration } from '$lib';
import { UserNotFoundError } from '$lib/errors/user/user-not-found';
import { WishlistLockedError } from '$lib/errors/wishlist/locked-error';
import { WishlistNotCreatedError } from '$lib/errors/wishlist/wishlist-not-created';
import { WishlistNotFoundError } from '$lib/errors/wishlist/wishlist-not-found';
import { uuidToShortId } from '$lib/server';
import { SharedWishlistService } from '$lib/server/db/services/shared.service';
import { WishlistService } from '$lib/server/db/services/wishlist.service';
import { error, isHttpError } from '@sveltejs/kit';
import { z } from 'zod/v4';

function calculateExpiry(duration: ShareDuration): Date | null {
	const ms: number | null = {
		ONE_HOUR: 1000 * 60 * 60,
		ONE_DAY: 1000 * 60 * 60 * 24,
		SEVEN_DAYS: 1000 * 60 * 60 * 24 * 7,
		FOURTEEN_DAYS: 1000 * 60 * 60 * 24 * 14,
		THIRTY_DAYS: 1000 * 60 * 60 * 24 * 30,
		NINETY_DAYS: 1000 * 60 * 60 * 24 * 90,
		NEVER: null
	}[duration];

	if (ms !== null) {
		return new Date(Date.now() + ms);
	}
	return null;
}

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

export const shareWishlistCommand = command(z.uuid(), async (wishlistId) => {
	const THIRTY_DAYS = 1000 * 60 * 60 * 24 * 30;

	try {
		const now = new Date();
		let newShareLink: string | null = null;
		let durationType: ShareDuration = 'THIRTY_DAYS';

		const shareLink = await SharedWishlistService.findByWishlistId(wishlistId);
		if (shareLink && shareLink.expiresAt && shareLink.expiresAt < now) {
			const deletedLink = await SharedWishlistService.deleteShared(shareLink.id);
			if (deletedLink) {
				const newLink = await SharedWishlistService.createSharedLink(
					wishlistId,
					new Date(now.getTime() + THIRTY_DAYS),
					'THIRTY_DAYS'
				);
				if (newLink) {
					newShareLink = newLink.id;
				}
			}
		} else if (shareLink) {
			newShareLink = shareLink.id;
			durationType = shareLink.durationType;
		} else {
			const newLink = await SharedWishlistService.createSharedLink(
				wishlistId,
				new Date(now.getTime() + THIRTY_DAYS),
				'THIRTY_DAYS'
			);
			if (newLink) {
				newShareLink = newLink.id;
			}
		}

		if (newShareLink) {
			return {
				link: uuidToShortId(newShareLink),
				currentDuration: durationType,
				shareId: newShareLink
			};
		}
		error(500, { message: 'Something went wrong' });
	} catch (e: unknown) {
		console.error('Error in shareWishlistCommand:', e);
		error(500, { message: 'Something went wrong' });
	}
});

export const updateShareDurationCommand = command(
	z.object({
		shareId: z.string(),
		duration: z.enum([
			'ONE_HOUR',
			'ONE_DAY',
			'SEVEN_DAYS',
			'FOURTEEN_DAYS',
			'THIRTY_DAYS',
			'NINETY_DAYS',
			'NEVER'
		])
	}),
	async ({ shareId, duration }) => {
		const newDate = calculateExpiry(duration);
		const updatedShared = await SharedWishlistService.updateExpiration(shareId, newDate, duration);

		if (updatedShared === null) {
			error(500, { message: 'Something went wrong ' });
		}
	}
);
