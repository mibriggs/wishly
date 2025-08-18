import { db } from '..';
import { sharedWishlistTable, wishlistItemTable, wishlistTable, type Wishlist } from '../schema';
import { and, desc, eq, inArray, isNull, not, sql } from 'drizzle-orm';
import { UserService } from './user.service';
import { getSingleObjectOrNull } from '$lib';

export class WishlistService {
	constructor() {}

	static async findByUserId(userId: string): Promise<Wishlist[]> {
		return await db
			.select()
			.from(wishlistTable)
			.where(and(eq(wishlistTable.userId, userId), not(wishlistTable.isDeleted)))
			.orderBy(desc(wishlistTable.createdAt));
	}

	static async findByWishlistAndUserId(
		wishlistId: string,
		userId: string
	): Promise<Wishlist | null> {
		const wishilists = await db
			.select()
			.from(wishlistTable)
			.where(
				and(
					eq(wishlistTable.id, wishlistId),
					eq(wishlistTable.userId, userId),
					not(wishlistTable.isDeleted)
				)
			);

		return getSingleObjectOrNull<Wishlist>(wishilists);
	}

	static async findWithItems(wishlistId: string, userId: string) {
		const query = await db
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
		return query;
	}

	static async createWishlist(userId: string): Promise<Wishlist | null> {
		const user = await UserService.findById(userId);

		if (!user) return null;
		if (user.isGuest) {
			const madeWishlists = await this.findByUserId(userId);
			if (madeWishlists.length !== 0) return null;
		}

		const wishlistName = `My Wishlist: ${Date.now()}`;
		const wishlists: Wishlist[] = await db
			.insert(wishlistTable)
			.values({
				userId: userId,
				name: wishlistName
			})
			.returning();

		return getSingleObjectOrNull<Wishlist>(wishlists);
	}

	static async deleteWishlist(wishlistId: string, userId: string): Promise<Wishlist | null> {
		return await db.transaction(async (transaction) => {
			const query = transaction
				.select({ wishlistId: wishlistTable.id })
				.from(wishlistTable)
				.where(eq(wishlistTable.userId, userId));

			await transaction
				.update(wishlistItemTable)
				.set({ isDeleted: true, deletedAt: sql`NOW()`, updatedAt: sql`NOW()` })
				.where(
					and(
						eq(wishlistItemTable.wishlistId, wishlistId),
						inArray(wishlistItemTable.wishlistId, query)
					)
				);

			await transaction
				.update(sharedWishlistTable)
				.set({ deletedAt: sql`NOW()`, updatedAt: sql`NOW()` })
				.where(eq(sharedWishlistTable.wishlistId, wishlistId));

			const wishlists: Wishlist[] = await transaction
				.update(wishlistTable)
				.set({ isDeleted: true, deletedAt: sql`NOW()`, updatedAt: sql`NOW()` })
				.where(and(eq(wishlistTable.id, wishlistId), eq(wishlistTable.userId, userId)))
				.returning();

			return getSingleObjectOrNull<Wishlist>(wishlists);
		});
	}

	static async updateWishlistLock(wishlistId: string, userId: string, oldLockState: boolean) {
		const wishlists: Wishlist[] = await db
			.update(wishlistTable)
			.set({ isLocked: !oldLockState, updatedAt: sql`NOW()` })
			.where(and(eq(wishlistTable.id, wishlistId), eq(wishlistTable.userId, userId)))
			.returning();

		return getSingleObjectOrNull<Wishlist>(wishlists);
	}

	static async updateWishlistName(
		wishlistId: string,
		userId: string,
		newName: string
	): Promise<Wishlist | null> {
		const wishlists: Wishlist[] = await db
			.update(wishlistTable)
			.set({ name: newName, updatedAt: sql`NOW()` })
			.where(and(eq(wishlistTable.id, wishlistId), eq(wishlistTable.userId, userId)))
			.returning();

		return getSingleObjectOrNull<Wishlist>(wishlists);
	}

	static async getWithShareLink(sharedId: string) {
		const wishilists = await db
			.select()
			.from(wishlistTable)
			.innerJoin(wishlistItemTable, eq(wishlistItemTable.wishlistId, wishlistTable.id))
			.innerJoin(sharedWishlistTable, eq(sharedWishlistTable.wishlistId, wishlistTable.id))
			.where(
				and(
					eq(sharedWishlistTable.id, sharedId),
					not(wishlistTable.isDeleted),
					not(wishlistItemTable.isDeleted),
					isNull(sharedWishlistTable.deletedAt)
				)
			);
		return wishilists;
	}
}
