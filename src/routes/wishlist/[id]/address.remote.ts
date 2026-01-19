import { command, getRequestEvent } from '$app/server';
import { shortIdToUuid } from '$lib';
import { WishlistLockedError } from '$lib/errors/wishlist/locked-error';
import { WishlistNotFoundError } from '$lib/errors/wishlist/wishlist-not-found';
import { WishlistService } from '$lib/server/db/services/wishlist.service';
import { error } from '@sveltejs/kit';
import { z } from 'zod/v4';

export const saveAddressCommand = command(
	z.object({
		streetAddress: z.string(),
		addressLine2: z.string(),
		city: z.string(),
		state: z.string(),
		zipCode: z.string()
	}),
	async ({ streetAddress, addressLine2, city, state, zipCode }) => {
		const { locals, params } = getRequestEvent();

		if (!params.id) return;

		const wishlistId = shortIdToUuid(params.id);

		try {
			return await WishlistService.saveWishlistAddress(wishlistId, locals.user.id, {
				streetAddress,
				addressLine2,
				city,
				state,
				zipCode
			});
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

			error(errorCode, { message: errorMessage });
		}
	}
);
