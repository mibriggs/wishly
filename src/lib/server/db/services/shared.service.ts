import { getSingleObjectOrNull, type ShareDuration } from '$lib';
import { and, eq, gt, isNull, or, sql } from 'drizzle-orm';
import { db } from '..';
import { type SharedWishlist, sharedWishlistTable } from '../schema';

export class SharedWishlistService {
	constructor() {}

	static async createSharedLink(wishlistId: string, expiresAt: Date, durationType: ShareDuration) {
		const links = await db
			.insert(sharedWishlistTable)
			.values({ wishlistId, expiresAt, durationType })
			.returning();

		return getSingleObjectOrNull<SharedWishlist>(links);
	}

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

	static async deleteShared(id: string) {
		const links = await db
			.delete(sharedWishlistTable)
			.where(eq(sharedWishlistTable.id, id))
			.returning();

		return getSingleObjectOrNull<SharedWishlist>(links);
	}
}
