import { getSingleObjectOrNull } from '$lib';
import { and, eq, isNull, sql } from 'drizzle-orm';
import { db } from '..';
import { type SharedWishlist, sharedWishlistTable } from '../schema';

export class SharedWishlistService {
	constructor() {}

	static async createSharedLink(wishlistId: string) {
		const links = await db
			.insert(sharedWishlistTable)
			.values({ wishlistId: wishlistId })
			.returning();

		return getSingleObjectOrNull<SharedWishlist>(links);
	}

	static async findById(id: string) {
		const links = await db
			.select()
			.from(sharedWishlistTable)
			.where(and(eq(sharedWishlistTable.id, id), isNull(sharedWishlistTable.deletedAt)));

		return getSingleObjectOrNull<SharedWishlist>(links);
	}

	static async findByWishlistId(wishlistId: string) {
		const links = await db
			.select()
			.from(sharedWishlistTable)
			.where(
				and(eq(sharedWishlistTable.wishlistId, wishlistId), isNull(sharedWishlistTable.deletedAt))
			);

		return getSingleObjectOrNull<SharedWishlist>(links);
	}

	static async updateShared(id: string) {
		const links = await db
			.update(sharedWishlistTable)
			.set({ updatedAt: sql`NOW()` })
			.where(eq(sharedWishlistTable.id, id))
			.returning();

		return getSingleObjectOrNull<SharedWishlist>(links);
	}

	static async deleteShared(id: string) {
		const links = await db
			.update(sharedWishlistTable)
			.set({ deletedAt: sql`NOW()` })
			.where(eq(sharedWishlistTable.id, id))
			.returning();

		return getSingleObjectOrNull<SharedWishlist>(links);
	}
}
