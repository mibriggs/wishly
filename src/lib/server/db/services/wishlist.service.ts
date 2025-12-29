import { db } from '..';
import { sharedWishlistTable, wishlistItemTable, wishlistTable, type Wishlist } from '../schema';
import { and, desc, eq, inArray, not, sql } from 'drizzle-orm';
import { UserService } from './user.service';
import { ensureWishlistUnlocked } from '$lib/server';
import { WishlistNotFoundError } from '$lib/server/errors/wishlist/wishlist-not-found';
import { WishlistNotCreatedError } from '$lib/server/errors/wishlist/wishlist-not-created';

export class WishlistService {
	constructor() {}

	/**
	 * Finds all non-deleted wishlists for a specific user.
	 *
	 * @param userId - The ID of the user whose wishlists to retrieve
	 * @returns An array of wishlist objects owned by the user, ordered by most recently updated
	 */
	static async findByUserId(userId: string): Promise<Wishlist[]> {
		return await db
			.select()
			.from(wishlistTable)
			.where(and(eq(wishlistTable.userId, userId), not(wishlistTable.isDeleted)))
			.orderBy(desc(wishlistTable.updatedAt));
	}

	/**
	 * Finds a wishlist by wishlist ID and user ID.
	 *
	 * @param wishlistId - The ID of the wishlist to find
	 * @param userId - The ID of the user who owns the wishlist
	 * @returns The wishlist object
	 * @throws {WishlistLockedError} If the wishlist is locked
	 * @throws {WishlistNotFoundError} If the wishlist is not found or doesn't belong to the user
	 */
	static async findByWishlistAndUserId(wishlistId: string, userId: string): Promise<Wishlist> {
		await ensureWishlistUnlocked(wishlistId);

		const wishlists = await db
			.select()
			.from(wishlistTable)
			.where(
				and(
					eq(wishlistTable.id, wishlistId),
					eq(wishlistTable.userId, userId),
					not(wishlistTable.isDeleted)
				)
			);

		if (wishlists.length === 0) {
			throw new WishlistNotFoundError(wishlistId);
		}

		return wishlists[0];
	}

	/**
	 * Finds a wishlist with all its non-deleted items.
	 * Returns a joined result with wishlist and item data.
	 *
	 * @param wishlistId - The ID of the wishlist to retrieve
	 * @param userId - The ID of the user who owns the wishlist
	 * @returns An array of joined wishlist and item records (empty array if wishlist not found)
	 */
	static async findWithItems(wishlistId: string, userId: string) {
		const query = await db
			.select()
			.from(wishlistTable)
			.leftJoin(
				wishlistItemTable,
				and(eq(wishlistItemTable.wishlistId, wishlistTable.id), not(wishlistItemTable.isDeleted))
			)
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

	/**
	 * Creates a new wishlist for a user. Guest users are limited to one wishlist.
	 *
	 * @param userId - The ID of the user creating the wishlist
	 * @returns The newly created wishlist object
	 * @throws {UserNotFoundError} If the user is not found
	 * @throws {WishlistNotCreatedError} If the wishlist creation fails or if a guest user already has a wishlist
	 */
	static async createWishlist(userId: string): Promise<Wishlist> {
		const wishlistName = `My Wishlist: ${Date.now()}`;
		const user = await UserService.findById(userId);

		if (user.isGuest) {
			const madeWishlists = await this.findByUserId(userId);
			if (madeWishlists.length !== 0) throw new WishlistNotCreatedError(wishlistName);
		}

		const wishlists: Wishlist[] = await db
			.insert(wishlistTable)
			.values({
				userId: userId,
				name: wishlistName
			})
			.returning();

		if (wishlists.length === 0) {
			throw new WishlistNotCreatedError(wishlistName);
		}

		return wishlists[0];
	}

	/**
	 * Soft deletes a wishlist and all its items. Also removes any share links.
	 *
	 * @param wishlistId - The ID of the wishlist to delete
	 * @param userId - The ID of the user who owns the wishlist
	 * @returns The deleted wishlist object
	 * @throws {WishlistLockedError} If the wishlist is locked
	 * @throws {WishlistNotFoundError} If the wishlist is not found or doesn't belong to the user
	 */
	static async deleteWishlist(wishlistId: string, userId: string): Promise<Wishlist> {
		await ensureWishlistUnlocked(wishlistId);

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
				.delete(sharedWishlistTable)
				.where(eq(sharedWishlistTable.wishlistId, wishlistId));

			const wishlists: Wishlist[] = await transaction
				.update(wishlistTable)
				.set({ isDeleted: true, deletedAt: sql`NOW()`, updatedAt: sql`NOW()` })
				.where(and(eq(wishlistTable.id, wishlistId), eq(wishlistTable.userId, userId)))
				.returning();

			if (wishlists.length === 0) {
				throw new WishlistNotFoundError(wishlistId);
			}

			return wishlists[0];
		});
	}

	/**
	 * Toggles the lock state of a wishlist.
	 *
	 * @param wishlistId - The ID of the wishlist to lock/unlock
	 * @param userId - The ID of the user who owns the wishlist
	 * @returns The updated wishlist object
	 * @throws {WishlistNotFoundError} If the wishlist is not found or doesn't belong to the user
	 */
	static async updateWishlistLock(wishlistId: string, userId: string) {
		const wishlists: Wishlist[] = await db
			.update(wishlistTable)
			.set({ isLocked: sql`NOT ${wishlistTable.isLocked}`, updatedAt: sql`NOW()` })
			.where(and(eq(wishlistTable.id, wishlistId), eq(wishlistTable.userId, userId)))
			.returning();

		if (wishlists.length === 0) {
			throw new WishlistNotFoundError(wishlistId);
		}

		return wishlists[0];
	}

	/**
	 * Updates the name of a wishlist.
	 *
	 * @param wishlistId - The ID of the wishlist to update
	 * @param userId - The ID of the user who owns the wishlist
	 * @param newName - The new name for the wishlist
	 * @returns The updated wishlist object
	 * @throws {WishlistLockedError} If the wishlist is locked
	 * @throws {WishlistNotFoundError} If the wishlist is not found or doesn't belong to the user
	 */
	static async updateWishlistName(
		wishlistId: string,
		userId: string,
		newName: string
	): Promise<Wishlist> {
		await ensureWishlistUnlocked(wishlistId);

		const wishlists: Wishlist[] = await db
			.update(wishlistTable)
			.set({ name: newName, updatedAt: sql`NOW()` })
			.where(and(eq(wishlistTable.id, wishlistId), eq(wishlistTable.userId, userId)))
			.returning();

		if (wishlists.length === 0) {
			throw new WishlistNotFoundError(wishlistId);
		}

		return wishlists[0];
	}

	/**
	 * Retrieves a wishlist with its items using a share link ID.
	 * Returns a joined result array - empty if the share link is invalid or wishlist is deleted.
	 *
	 * @param sharedId - The share link ID
	 * @returns An array of joined wishlist, items, and share link records (empty array if not found)
	 */
	static async getWithShareLink(sharedId: string) {
		const wishlists = await db
			.select()
			.from(wishlistTable)
			.leftJoin(
				wishlistItemTable,
				and(eq(wishlistItemTable.wishlistId, wishlistTable.id), not(wishlistItemTable.isDeleted))
			)
			.innerJoin(sharedWishlistTable, eq(sharedWishlistTable.wishlistId, wishlistTable.id))
			.where(and(eq(sharedWishlistTable.id, sharedId), not(wishlistTable.isDeleted)));

		return wishlists;
	}

	/**
	 * Checks if a user owns a specific wishlist.
	 *
	 * @param wishlistId - The ID of the wishlist
	 * @param userId - The ID of the user
	 * @returns True if the user owns the wishlist, false otherwise
	 */
	static async checkUserOwnsWishlist(wishlistId: string, userId: string): Promise<boolean> {
		const wishlists = await db
			.select({ id: wishlistTable.id })
			.from(wishlistTable)
			.where(
				and(
					eq(wishlistTable.id, wishlistId),
					eq(wishlistTable.userId, userId),
					not(wishlistTable.isDeleted)
				)
			)
			.limit(1);

		return wishlists.length > 0;
	}

	/**
	 * Retrieves the lock state and name of a wishlist.
	 *
	 * @param wishlistId - The ID of the wishlist
	 * @returns An object containing the wishlist's lock state and name
	 * @throws {WishlistNotFoundError} If the wishlist is not found
	 */
	static async getIsWishlistLocked(wishlistId: string) {
		const wishlist = await db
			.select({ isLocked: wishlistTable.isLocked, name: wishlistTable.name })
			.from(wishlistTable)
			.where(eq(wishlistTable.id, wishlistId))
			.limit(1);

		if (wishlist.length === 0) {
			throw new WishlistNotFoundError(wishlistId);
		}

		return wishlist[0];
	}
}
