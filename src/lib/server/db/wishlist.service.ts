import { db } from '.';
import { wishlistItemTable, wishlistTable, type Wishlist } from './schema';
import { and, desc, eq, not, sql } from 'drizzle-orm';
import { UserService } from './user.service';

export class WishlistService {
	constructor() {}

	static async findByUserId(userId: string) {
		return await db
			.select()
			.from(wishlistTable)
			.where(and(eq(wishlistTable.userId, userId), not(wishlistTable.isDeleted)))
			.orderBy(desc(wishlistTable.createdAt));
	}

	static async findByWishlistId(wishlistId: string) {
		return await db.select().from(wishlistTable).where(eq(wishlistTable.id, wishlistId));
	}

	static async findByWishlistAndUserId(wishlistId: string, userId: string) {
		return await db
			.select()
			.from(wishlistTable)
			.where(
				and(
					eq(wishlistTable.id, wishlistId),
					eq(wishlistTable.userId, userId),
					not(wishlistTable.isDeleted)
				)
			)
			.orderBy(desc(wishlistTable.name));
	}

	static async findWithItems(wishlistId: string, userId: string) {
		return await db
			.select()
			.from(wishlistTable)
			.leftJoin(wishlistItemTable, eq(wishlistItemTable.wishlistId, wishlistTable.id))
			.where(
				and(
					eq(wishlistTable.id, wishlistId),
					eq(wishlistTable.userId, userId),
					not(wishlistTable.isDeleted)
				)
			)
			.orderBy(desc(wishlistTable.name));
	}

	static async createWishlist(wishlistOwner: string) {
		const user = await UserService.findById(wishlistOwner);
		if (user) {
			const madeWishlists = await this.findByUserId(wishlistOwner);
			if (user.isGuest && madeWishlists.length > 0) {
				return [];
			}

			const wishlistName = `My Wishlist: ${Date.now()}`;
			const wishlist: Wishlist[] = await db
				.insert(wishlistTable)
				.values({
					userId: wishlistOwner,
					name: wishlistName
				})
				.returning();
			return wishlist;
		}
		return [];
	}

	static async deleteWishlist(wishlistId: string, userId: string) {
		const wishlist: Wishlist[] = await db
			.update(wishlistTable)
			.set({ isDeleted: true, deletedAt: sql`NOW()`, updatedAt: sql`NOW()` })
			.where(and(eq(wishlistTable.id, wishlistId), eq(wishlistTable.userId, userId)))
			.returning();
		return wishlist;
	}

	static async updateWishlistLock(wishlistId: string, userId: string, oldLockState: boolean) {
		const wishlist: Wishlist[] = await db
			.update(wishlistTable)
			.set({ isLocked: !oldLockState, updatedAt: sql`NOW()` })
			.where(and(eq(wishlistTable.id, wishlistId), eq(wishlistTable.userId, userId)))
			.returning();
		return wishlist;
	}

	static async updateWishlistName(wishlistId: string, userId: string, newName: string) {
		const wishlist: Wishlist[] = await db
			.update(wishlistTable)
			.set({ name: newName, updatedAt: sql`NOW()` })
			.where(and(eq(wishlistTable.id, wishlistId), eq(wishlistTable.userId, userId)))
			.returning();
		return wishlist;
	}
}
