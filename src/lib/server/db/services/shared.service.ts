import { getSingleObjectOrNull, type ShareDuration } from '$lib';
import { and, eq, gt, isNull, or, sql } from 'drizzle-orm';
import { db } from '..';
import { type SharedWishlist, sharedWishlistTable } from '../schema';

export class SharedWishlistService {
	constructor() {}

	/**
	 * Creates a new share link for a wishlist.
	 *
	 * @param wishlistId - The ID of the wishlist to share
	 * @param expiresAt - The expiration date for the share link
	 * @param durationType - The duration type for the share link (e.g., 'THIRTY_DAYS', 'NEVER')
	 * @returns The created share link object, or null if creation fails
	 */
	static async createSharedLink(wishlistId: string, expiresAt: Date, durationType: ShareDuration) {
		const links = await db
			.insert(sharedWishlistTable)
			.values({ wishlistId, expiresAt, durationType })
			.returning();

		return getSingleObjectOrNull<SharedWishlist>(links);
	}

	/**
	 * Finds a share link by its ID, only returning non-expired links.
	 *
	 * @param id - The ID of the share link to find
	 * @returns The share link object if found and not expired, or null otherwise
	 */
	static async findById(id: string) {
		const links = await db
			.select()
			.from(sharedWishlistTable)
			.where(
				and(
					eq(sharedWishlistTable.id, id),
					or(gt(sharedWishlistTable.expiresAt, sql`NOW()`), isNull(sharedWishlistTable.expiresAt))
				)
			);

		return getSingleObjectOrNull<SharedWishlist>(links);
	}

	/**
	 * Finds a share link by wishlist ID, only returning non-expired links.
	 *
	 * @param wishlistId - The ID of the wishlist to find share links for
	 * @returns The share link object if found and not expired, or null otherwise
	 */
	static async findByWishlistId(wishlistId: string) {
		const links = await db
			.select()
			.from(sharedWishlistTable)
			.where(
				and(
					eq(sharedWishlistTable.wishlistId, wishlistId),
					or(gt(sharedWishlistTable.expiresAt, sql`NOW()`), isNull(sharedWishlistTable.expiresAt))
				)
			);

		return getSingleObjectOrNull<SharedWishlist>(links);
	}

	/**
	 * Updates the expiration date and duration type of a share link.
	 *
	 * @param id - The ID of the share link to update
	 * @param newExpiresAt - The new expiration date, or null for no expiration
	 * @param durationType - The new duration type
	 * @returns The updated share link object, or null if the share link was not found
	 */
	static async updateExpiration(
		id: string,
		newExpiresAt: Date | null,
		durationType: ShareDuration
	) {
		console.log('Updating...');
		console.log(id, newExpiresAt, durationType);
		const links = await db
			.update(sharedWishlistTable)
			.set({ updatedAt: sql`NOW()`, expiresAt: newExpiresAt, durationType })
			.where(eq(sharedWishlistTable.id, id))
			.returning();

		return getSingleObjectOrNull<SharedWishlist>(links);
	}

	/**
	 * Deletes a share link.
	 * This is an idempotent operation - returns null if the share link doesn't exist.
	 *
	 * @param id - The ID of the share link to delete
	 * @returns The deleted share link object, or null if the share link was not found
	 */
	static async deleteShared(id: string) {
		const links = await db
			.delete(sharedWishlistTable)
			.where(eq(sharedWishlistTable.id, id))
			.returning();

		return getSingleObjectOrNull<SharedWishlist>(links);
	}
}
